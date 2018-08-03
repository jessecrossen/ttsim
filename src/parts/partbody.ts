import { Body, Bodies, Composite, Constraint, Vector, Vertices, World, IBodyDefinition } from 'matter-js';

import { Part } from './part';
import { PartType, PartFactory } from './factory';
import { getVertexSets, getPinLocations, PinLocation } from './partvertices';
import { SPACING, PART_SIZE, BALL_MASK, BALL_CATEGORY, PART_CATEGORY, 
         PART_MASK, PIN_CATEGORY, PIN_MASK, DAMPER_RADIUS, BALL_DENSITY, 
         COUNTERWEIGHT_STIFFNESS, COUNTERWEIGHT_DAMPING, BIAS_STIFFNESS, 
         BIAS_DAMPING,  PART_DENSITY, BALL_FRICTION, PART_FRICTION,
         BALL_FRICTION_STATIC, PART_FRICTION_STATIC, IDEAL_VX, NUDGE_ACCEL} from 'board/constants';
import { GearBase } from './gearbit';
import { PartBallContact } from 'board/physics';
import { Ball } from './ball';

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
      this._partChangeCounter = NaN;
      this._part = part;
      this.initBodyFromPart();
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
        { density: BALL_DENSITY, friction: BALL_FRICTION, 
          frictionStatic: BALL_FRICTION_STATIC,
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
    // add bodies and constraints to control rotation
    if ((this._part.bodyCanRotate) && (! this._pins)) {
      this._makeRotationConstraints();
    }
    // set restitution
    this._body.restitution = this._part.bodyRestitution;
    // perform a first update of properties from the part
    this.updateBodyFromPart();
  }
  protected _makeRotationConstraints():void {
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
        attachment.x *= -1;
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
    Body.setAngle(this._body, this._part.angleForRotation(this._part.rotation));
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
    if (body) {
      World.add(world, this._composite);
      // try to release any stored energy in the part
      Body.setVelocity(this._body, { x: 0, y: 0 });
      Body.setAngularVelocity(this._body, 0);
    }
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
    const body = Body.create({ parts: parts, 
      friction: PART_FRICTION, frictionStatic: PART_FRICTION_STATIC, 
      density: PART_DENSITY,
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

  // PHYSICS ENGINE CHEATS ****************************************************

  // apply corrections to the body and any balls contacting it
  public cheat(contacts:Set<PartBallContact>):void {
    if ((! this._body) || (! this._part)) return;
    this._controlRotation(contacts);
    if (contacts) {
      for (const contact of contacts) {
        this._nudgeBall(contact);
      }
    }
  }
  // constrain the position and angle of the part to simulate 
  //  an angle-constrained revolute joint
  private _controlRotation(contacts:Set<PartBallContact>):void {
    const positionDelta:Vector = { x: 0, y: 0 };
    let angleDelta:number = 0;
    let moved:boolean = false;
    if (! this._part.bodyCanMove) {
      Vector.sub(this._compositePosition, this._body.position, positionDelta);
      Body.translate(this._body, positionDelta);
      Body.setVelocity(this._body, { x: 0, y: 0 });
      moved = true;
    }
    if (this._part.bodyCanRotate) {
      const r:number = this._part.rotationForAngle(this._body.angle);
      if ((r <= 0.0) || (r >= 1.0)) {
        const target:number = 
          this._part.angleForRotation(Math.min(Math.max(0.0, r), 1.0));
        angleDelta = target - this._body.angle;
        Body.rotate(this._body, angleDelta);
        Body.setAngularVelocity(this._body, 0);
      }
      moved = true;
    }
    // apply the same movements to balls if there are any, otherwise they 
    //  will squash into the part
    if ((moved) && (contacts)) {
      const combined = Vector.rotate(positionDelta, angleDelta);
      for (const contact of contacts) {
        Body.translate(contact.ballPartBody.body, combined);
      }
    }
  }
  // apply a speed limit to the given ball
  private _nudgeBall(contact:PartBallContact) {
    if ((! this._body) || (! contact.ballPartBody.body)) return;
    const ball = contact.ballPartBody.part as Ball;
    const body = contact.ballPartBody.body;
    // get the horizontal direction we want the ball to be going in, and flip 
    //  the contact tangent if needed
    let dir:number = 0;
    // ramps direct in a single direction
    if (this._part.type == PartType.RAMP) {
      if ((this._part.rotation < 0.25) || 
          (this._part.rotation > 0.75)) {
        dir = this._part.isFlipped ? -1 : 1;
      }
    }
    // gearbits are basically like switchable ramps
    else if (this._part.type == PartType.GEARBIT) {
      if (this._part.rotation < 0.25) dir = 1;
      else if (this._part.rotation > 0.75) dir = -1;
    }
    // bits direct the ball according to their state, but the direction is 
    //  opposite for the top and bottom halves
    else if (this._part.type == PartType.BIT) {
      const bottomHalf:boolean = ball.row > this._part.row;
      if (this._part.rotation >= 0.9) dir = bottomHalf ? 1 : -1;
      else if (this._part.rotation <= 0.1) dir = bottomHalf ? -1 : 1;
    }
    // crossovers direct the ball in the same direction it has been going
    else if (this._part.type == PartType.CROSSOVER) {
      if (ball.lastDistinctColumn < ball.lastColumn) dir = 1;
      else if (ball.lastDistinctColumn > ball.lastColumn) dir = -1;
    }
    if (dir == 0) return;
    // only nudge the ball if it's touching a horizontal-ish surface
    let tangent = Vector.clone(contact.tangent);
    const slope = Math.abs(tangent.y) / Math.abs(tangent.x);
    if (slope > 0.3) return;
    // flip the tangent if the direction doesn't match the target direction
    if (((dir < 0) && (tangent.x > 0)) ||
        ((dir > 0) && (tangent.x < 0))) tangent = Vector.mult(tangent, -1);
    // see how much and in which direction we need to correct the horizontal velocity
    const target = IDEAL_VX * dir;
    const current = body.velocity.x;
    let accel:number = 0;
    if (dir > 0) {
      if (current < target) accel = NUDGE_ACCEL;        // too slow => right
      else if (current > target) accel = - NUDGE_ACCEL; // too fast => right
    }
    else {
      if (target < current) accel = NUDGE_ACCEL;        // too slow <= left
      else if (target > current) accel = - NUDGE_ACCEL; // too fast <= left
    }
    if (accel == 0) return;
    // accelerate the ball in the desired direction
    Body.applyForce(body, body.position, 
      Vector.mult(tangent, accel * body.mass));
  }


}

// FACTORY / CACHE ************************************************************

// maintain a cache of PartBody instances
export class PartBodyFactory {

  // make or reuse a part body from the cache
  public make(part:Part):PartBody {
    if (! this._instances.has(part)) {
      this._instances.set(part, new PartBody(part));
    }
    return(this._instances.get(part));
  }
  // cached instances
  private _instances:WeakMap<Part,PartBody> = new WeakMap();

  // mark that a part body is not currently being used
  public release(instance:PartBody):void {
    
  }

}