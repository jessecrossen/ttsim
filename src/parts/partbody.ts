import { Body, Bodies, Constraint, Vector, Vertices, World } from 'matter-js';

import { Part } from './part';
import { PartType, PartFactory } from './factory';
import { getVertexSets } from './partvertices';
import { SPACING, PART_SIZE } from 'board/constants';

// this composes a part with a matter.js body which simulates it
export class PartBody {

  constructor(partOrType:Part|PartType) {
    if (partOrType instanceof Part) {
      this.type = partOrType.type;
      this.part = partOrType;
    }
    else this.type = partOrType;
  }
  public readonly type:PartType;

  public get part():Part { return(this._part); }
  public set part(part:Part) {
    if (part === this._part) return;
    this._partChangeCounter = NaN;
    if (part) {
      if (part.type !== this.type) throw('Part type must match PartBody type');
      this._part = part;
      this.initBodyFromPart();
    }
    else this._part = null;
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
        { density: .005, friction: 0 });
      }
      // construct other parts from stored vertices
      else {
        this._body = this._bodyFromVertexSets(getVertexSets(constructor.name));
      }
      this.initBodyFromPart();
    }
    return(this._body);
  };
  protected _body:Body = undefined;

  // get constraints to apply to the body
  public get constraints():Constraint[] { return(this._constraints); }
  private _constraints:Constraint[] = null;

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
    if ((this._part.bodyCanRotate) && (! this._rotationConstraint)) {
      this._rotationConstraint = Constraint.create({
        bodyA: this._body,
        pointB: { x:0, y:0 },
        length: 0,
        stiffness: 0.7
      });
      if (! this._constraints) this._constraints = [ ];
      this._constraints.push(this._rotationConstraint);
    }
    // perform a first update of properties from the part
    this.updateBodyFromPart();
  }
  private _rotationConstraint:Constraint;

  // transfer relevant properties to the body
  public updateBodyFromPart():void {
    // skip the update if the part hasn't changed
    if ((! this._body) || (! this._part) || 
        (this._part.changeCounter === this._partChangeCounter)) return;
    // update mirroring
    if (this._bodyFlipped !== this._part.isFlipped) {
      Body.scale(this._body, -1, 1);
      this._bodyOffset.x *= -1;
      this._bodyFlipped = this._part.isFlipped;
    }
    // update position
    const x:number = (this._part.column * SPACING) + this._bodyOffset.x;
    const y:number = (this._part.row * SPACING) + this._bodyOffset.y;
    Body.setPosition(this._body, { x: x, y: y });
    if (this._rotationConstraint) {
      this._rotationConstraint.pointB = { x: x, y: y };
    }
    // update rotation
    Body.setAngle(this._body, 
      this._part.angleForRotation(this._part.rotation));
    // record that we've synced with the part
    this._partChangeCounter = this._part.changeCounter;
  }
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
      // TODO: use constraints instead
      if ((r < 0) || (r > 1)) {
        Body.setAngularVelocity(this._body, 0.0);
        Body.setAngle(this._body, 
          this._part.angleForRotation(this._part.rotation));
      }
    }
    // record that we've synced with the part
    this._partChangeCounter = this._part.changeCounter;
  }

  // add the body to the given world, creating the body if needed
  public addToWorld(world:World):void {
    const body = this.body;
    if (body) {
      World.add(world, body);
    }
    if (this._constraints) World.add(world, this._constraints);
  }

  // remove the body from the given world
  public removeFromWorld(world:World):void {
    if (this._body) World.remove(world, this._body);
    if (this._constraints) {
      for (const constraint of this._constraints) {
        World.remove(world, constraint);
      }
    }
  }

  // construct a body from a set of vertex lists
  protected _bodyFromVertexSets(vertexSets:Vector[][]):Body {
    if (! vertexSets) return(null);
    const parts:Body[] = [ ];
    for (const vertices of vertexSets) {
      const center = Vertices.centre(vertices);
      parts.push(Body.create({ position: center, vertices: vertices }));
    }
    const body = Body.create({ parts: parts, friction: 0 });
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
export class PartBodyPool {

  // make or fetch a part body of the given type from the pool
  public make(partOrType:PartType|Part):PartBody {
    const part = (partOrType instanceof Part) ? partOrType : null;
    const type = (partOrType instanceof Part) ? part.type : partOrType;
    if (! this._unused.has(type)) {
      this._unused.set(type, [ ]);
    }
    const available = this._unused.get(type);
    let instance:PartBody = (available.length > 0) ? 
      available.pop() : new PartBody(type);
    this._used.add(instance);
    if (part) instance.part = part;
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
    this._unused.get(instance.type).push(instance);
  }

}