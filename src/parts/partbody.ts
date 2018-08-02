import { Body, Bodies, Composite, Constraint, Vector, Vertices, World, IBodyDefinition } from 'matter-js';

import { Part } from './part';
import { PartType, PartFactory } from './factory';
import { getVertexSets, getPinLocations, PinLocation } from './partvertices';
import { SPACING, PART_SIZE, BALL_MASK, BALL_CATEGORY, PART_CATEGORY, 
         PART_MASK, PIN_CATEGORY, PIN_MASK, DAMPER_RADIUS, BALL_DENSITY, 
         COUNTERWEIGHT_STIFFNESS, COUNTERWEIGHT_DAMPING, BIAS_STIFFNESS, 
         BIAS_DAMPING } from 'board/constants';

// this composes a part with a matter.js body which simulates it
export class PartBody {

  constructor(part:Part) {
    this.type = part.type;
    this.part = part;
  }
  public readonly type:PartType;

  public get part():Part { return(this._part); }
  public set part(part:Part) {
    if (part === this._part) return;
    if (part) {
      if (part.type !== this.type) throw('Part type must match PartBody type');
      this._part = part;
      this.initBodyFromPart();
    }
    else {
      this.resetBody();
      this._part = null;
      this._partChangeCounter = NaN;
    }
  }
  private _part:Part;

  // a body representing the physical form of the part
  public get body():Body {
    // if there are no stored vertices, the body will be set to null,
    //  and we shouldn't keep trying to construct it
    if (this._body === undefined) {
      const constructor = PartFactory.constructorForType(this.type);
      // construct the ball as a circle
      if (this.type == PartType.BALL) {
        this._body = Bodies.circle(0, 0, (5 * PART_SIZE) / 32,
        { density: BALL_DENSITY, friction: 0.05,
          collisionFilter: { category: BALL_CATEGORY, mask: BALL_MASK, group: 0 } });
      }
      // construct other parts from stored vertices
      else {
        this._body = this._bodyFromVertexSets(getVertexSets(constructor.name));
      }
      if (this._body) {
        Body.setPosition(this._body, { x: 0.0, y: 0.0 });
        Composite.add(this._composite, this._body);
      }
      this.initBodyFromPart();
    }
    return(this._body);
  };
  protected _body:Body = undefined;

  // a composite representing the body and related constraints, etc.
  public get composite():Composite { return(this._composite); }
  private _composite:Composite = Composite.create();

  // initialize the body after creation
  protected initBodyFromPart():void {
    if ((! this._body) || (! this._part)) return;
    // parts that can't rotate can be static
    if ((! this._part.bodyCanRotate) && (! this._part.bodyCanMove)) {
      Body.setStatic(this._body, true);
    }
    else {
      Body.setStatic(this._body, false);
    }
    // parts that can rotate need to be placed in a composite 
    //  to simulate the pin joint attaching them to the board
    if ((this._part.bodyCanRotate) && (! this._pivot)) {
      this._makeRotationConstraints();
    }
    // set restitution
    this._body.restitution = this._part.bodyRestitution;
    // perform a first update of properties from the part
    this.updateBodyFromPart();
  }
  protected _makeRotationConstraints():void {
    if (this._pivot) return; // don't do this twice
    // make a location around which the body will rotate
    this._pivot = { x: 0, y: 0 };
    Composite.add(this._composite, Constraint.create({
      bodyA: this._body,
      pointB: this._pivot,
      length: 0,
      stiffness: 1.0
    }));
    // make constraints that bias parts and keep them from bouncing at the 
    //  ends of their range
    if (this._part.isCounterWeighted) {
      this._counterweightDamper = this._makeDamper(false, true, 
        COUNTERWEIGHT_STIFFNESS, COUNTERWEIGHT_DAMPING);
    }
    else {
      this._biasDamper = this._makeDamper(false, false,
        BIAS_STIFFNESS, BIAS_DAMPING);
    }
    // make stops to confine the body's rotation
    const constructor = PartFactory.constructorForType(this.type);
    this._pinLocations = getPinLocations(constructor.name);
    if (this._pinLocations) {
      this._pins = [ ];
      const options = { isStatic: true, restitution: 0,
        collisionFilter: { category: PIN_CATEGORY, mask: PIN_MASK, group: 0 } };
      for (const pinLocation of this._pinLocations) {
        const pin = Bodies.circle(pinLocation.x, pinLocation.y, pinLocation.r, options);
        this._pins.push(pin);
        Composite.add(this._composite, pin);
      }
    }
  }
  private _makeDamper(flipped:boolean, counterweighted:boolean, 
                      stiffness:number, damping:number):Constraint {
    const constraint = Constraint.create({
      bodyA: this._body,
      pointA: this._damperAttachmentVector(flipped),
      pointB: this._damperAnchorVector(flipped, counterweighted),
      stiffness: stiffness,
      damping: damping
    });
    Composite.add(this._composite, constraint);
    return(constraint);
  }
  private _damperAttachmentVector(flipped:boolean):Vector {
    return({ x: flipped ? DAMPER_RADIUS : - DAMPER_RADIUS, 
             y: - DAMPER_RADIUS });
  }
  private _damperAnchorVector(flipped:boolean, counterweighted:boolean):Vector {
    return(counterweighted ?
      { x: flipped ? DAMPER_RADIUS : - DAMPER_RADIUS, y: 0 } : 
      { x: 0, y: DAMPER_RADIUS });
  }
  private _pivot:Vector;
  private _pinLocations:PinLocation[];
  private _pins:Body[];
  private _counterweightDamper:Constraint;
  private _biasDamper:Constraint;

  // transfer relevant properties to the body
  public updateBodyFromPart():void {
    // skip the update if the part hasn't changed
    if ((! this._body) || (! this._part) || 
        (this._part.changeCounter === this._partChangeCounter)) return;
    // update mirroring
    if (this._bodyFlipped !== this._part.isFlipped) {
      Composite.scale(this._composite, -1, 1, this._body.position, true);
      this._bodyOffset.x *= -1;
      if (this._counterweightDamper) {
        const attachment = this._counterweightDamper.pointA;
        attachment.x =  this._body.position.x - attachment.x;
      }
      this._bodyFlipped = this._part.isFlipped;
    }
    // update position
    const position = { x: (this._part.column * SPACING) + this._bodyOffset.x,
                       y: (this._part.row * SPACING) + this._bodyOffset.y };
    const positionDelta = Vector.sub(position, this._compositePosition);
    Composite.translate(this._composite, positionDelta, true);
    this._compositePosition = position;
    Body.setVelocity(this._body, { x: 0, y: 0 });
    // update the pivot location
    if (this._pivot) {
      this._pivot.x = position.x;
      this._pivot.y = position.y;
      // move damper anchor points
      if (this._counterweightDamper) {
        Vector.add(this._body.position, 
          this._damperAnchorVector(this._part.isFlipped, true), 
          this._counterweightDamper.pointB);
      }
      if (this._biasDamper) {
        Vector.add(this._body.position, 
          this._damperAnchorVector(this._part.isFlipped, false), 
          this._biasDamper.pointB);
      }
    }
    // update rotation
    Body.setAngle(this._body, this._part.angleForRotation(this._part.rotation));
    Body.setAngularVelocity(this._body, 0);
    // record that we've synced with the part
    this._partChangeCounter = this._part.changeCounter;
  }
  protected _compositePosition:Vector = { x: 0.0, y: 0.0 };
  protected _bodyOffset:Vector = { x: 0.0, y: 0.0 };
  private _bodyFlipped:boolean = false;
  private _partChangeCounter:number = NaN;

  // tranfer relevant properties from the body
  public updatePartFromBody():void {
    if ((! this._body) || (! this._part) || (this._body.isStatic)) return;
    if (this._part.bodyCanMove) {
      this._part.column = this._body.position.x / SPACING;
      this._part.row = this._body.position.y / SPACING;
    }
    if (this._part.bodyCanRotate) {
      const r:number = this._part.rotationForAngle(this._body.angle);
      this._part.rotation = r;
    }
    // record that we've synced with the part
    this._partChangeCounter = this._part.changeCounter;
  }

  // reset the body to remove energy from it
  public resetBody():void {
    if (! this._body) return;
    // reposition to the origin
    Composite.translate(this._composite, 
      Vector.mult(this._compositePosition, -1), true);
    this._compositePosition = { x: 0, y: 0 };
    // clear rotation
    Body.setAngle(this._body, 0);
    Body.setAngularVelocity(this._body, 0);
  }

  // add the body to the given world, creating the body if needed
  public addToWorld(world:World):void {
    const body = this.body;
    if (body) World.add(world, this._composite);
  }

  // remove the body from the given world
  public removeFromWorld(world:World):void {
    World.remove(world, this._composite);
  }

  // construct a body from a set of vertex lists
  protected _bodyFromVertexSets(vertexSets:Vector[][]):Body {
    if (! vertexSets) return(null);
    const parts:Body[] = [ ];
    for (const vertices of vertexSets) {
      const center = Vertices.centre(vertices);
      parts.push(Body.create({ position: center, vertices: vertices }));
    }
    const body = Body.create({ parts: parts, friction: 0.05,
      collisionFilter: { category: PART_CATEGORY, mask: PART_MASK, group: 0 } });
    // this is a hack to prevent matter.js from placing the body's center 
    //  of mass over the origin, which complicates our ability to precisely
    //  position parts of an arbitrary shape
    body.position.x = 0;
    body.position.y = 0;
    (body as any).positionPrev.x = 0;
    (body as any).positionPrev.y = 0;
    return(body);
  }

}

// maintain a pool of PartBody instances grouped by type to avoid 
//  creation/destruction penalties
export class PartBodyFactory {

  // temporarily turning this off as there's too much physical state
  //  in the body instances
  public reuse:boolean = false;

  // make or reuse a part body from the pool
  public make(part:Part):PartBody {
    if (! this._unused.has(part.type)) {
      this._unused.set(part.type, [ ]);
    }
    const available = this._unused.get(part.type);
    let instance:PartBody = ((available.length > 0) && (this.reuse)) ? 
      available.pop() : new PartBody(part);
    this._used.add(instance);
    instance.part = part;
    return(instance);
  }
  // instances that are available for use
  private _unused:Map<PartType,PartBody[]> = new Map();
  // instances that have been made but not released
  private _used:Set<PartBody> = new Set();

  public release(instance:PartBody):void {
    // don't allow double-releases
    if (! this._used.has(instance)) return;
    // detach the body from its part
    instance.part = null;
    // remove it from the used set
    this._used.delete(instance)
    // add it to the unused set
    if (! this._unused.has(instance.type)) {
      this._unused.set(instance.type, [ ]);
    }
    if (this.reuse) this._unused.get(instance.type).push(instance);
  }

}