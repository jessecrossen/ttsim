import { Vector } from 'matter-js';

import { IBallRouter } from './router';
import { Board } from './board';
import { Part } from 'parts/part';
import { PartType } from 'parts/factory';
import { Ball } from 'parts/ball';
import { SCHEMATIC_STEP as STEP, SCHEMATIC_EXIT as EXIT, BALL_RADIUS, SPACING } from './constants';

type RouteMethod = (part:Part, ball:Ball) => boolean;

export class SchematicBallRouter implements IBallRouter {

  constructor(public readonly board:Board, public readonly backupRouter:IBallRouter) {
    this.balls = this.board.balls;
  }
  public balls:Set<Ball>;

  public onBoardSizeChanged() { }

  public update(speed:number, correction:number):void {
    // route balls in parts we can route without physics
    const unroutable:Set<Ball> = new Set();
    for (const ball of this.balls) {
      if (this.routeBall(ball)) {
        this.board.layoutPart(ball, ball.column, ball.row);
      }
      else {
        unroutable.add(ball);
      }
    }
    // route any unroutable balls using the backup router
    if (unroutable.size > 0) {
      const oldBalls = this.backupRouter.balls;
      this.backupRouter.balls = unroutable;
      this.backupRouter.update(speed, correction);
      this.backupRouter.balls = oldBalls;
    }
  }

  protected routeBall(ball:Ball):boolean {
    const c = ball.column;
    const r = ball.row;
    let method:RouteMethod;
    // get the part on the grid square containing the ball center
    const closest = this.board.getPart(Math.round(c), Math.round(r));
    if (closest) {
      // if the ball is in a drop and has not been released, leave it alone
      if ((closest.type === PartType.DROP) && (c - closest.column < 0.8)) {
        return(false);
      }
      // if the ball has fallen into a turnstile, leave it alone
      else if (closest.type === PartType.TURNSTILE) return(false);
      // if the ball is in an interceptor, we need physics for the stacking
      else if (closest.type == PartType.INTERCEPTOR) return(false);
      // otherwise if the closest part is routable, use it
      if (method = this.routeMethodForPart(closest)) 
        return(method.call(this, closest, ball));
    }
    // find the four neighboring parts around the ball
    const topLeft = this.board.getPart(Math.floor(c), Math.floor(r));
    const topRight = this.board.getPart(Math.ceil(c), Math.floor(r));
    const bottomLeft = this.board.getPart(Math.floor(c), Math.ceil(r));
    const bottomRight = this.board.getPart(Math.ceil(c), Math.ceil(r));
    // bias in favor of parts that are diagonally aligned in the direction 
    //  of travel, with a preference for the lower part
    if (ball.lastDistinctColumn < c) { // traveling right
      if (method = this.routeMethodForPart(bottomRight))
        return(method.call(this, bottomRight, ball));
      // if (method = this.routeMethodForPart(topLeft))
      //   return(method.call(this, topLeft, ball));
      if (method = this.routeMethodForPart(bottomLeft))
        return(method.call(this, bottomLeft, ball));
      // if (method = this.routeMethodForPart(topRight))
      //   return(method.call(this, topRight, ball));
    }
    else { // traveling left (or dropping)
      if (method = this.routeMethodForPart(bottomLeft))
        return(method.call(this, bottomLeft, ball));
      // if (method = this.routeMethodForPart(topRight))
      //   return(method.call(this, topRight, ball));
      if (method = this.routeMethodForPart(bottomRight))
        return(method.call(this, bottomRight, ball));
      // if (method = this.routeMethodForPart(topLeft))
      //   return(method.call(this, topLeft, ball));
    }
    // if we get here, the backup router needs to handle the part
    return(null);
  }

  protected routeMethodForPart(part:Part):RouteMethod {
    if (! part) return(null);
    switch(part.type) {
      case PartType.RAMP: return(this.routeRamp);
      case PartType.CROSSOVER: return(this.routeCrossover);
      case PartType.BIT: return(this.routeBit);
      case PartType.GEARBIT: return(this.routeBit);
      default: return(null);
    }
  }

  protected routeRamp(part:Part, ball:Ball):boolean {
    // if the ball is in the top half of the part, proceed toward the center
    if (ball.row < part.row) this.approachTarget(ball, part.column, part.row);
    // otherwise proceed toward the exit point
    else {
      this.approachTarget(ball, 
        part.column + (part.isFlipped ? -EXIT : EXIT), part.row + EXIT);
    }
    return(true);
  }

  protected routeCrossover(part:Part, ball:Ball):boolean {
    // if the ball is in the top half of the part, proceed toward the center
    if (ball.row < part.row) this.approachTarget(ball, part.column, part.row);
    // in the bottom half, route based on prior direction
    else if (ball.lastDistinctColumn < ball.column) { // traveling right
      this.approachTarget(ball, part.column + EXIT, part.row + EXIT);
    }
    else { // traveling left
      this.approachTarget(ball, part.column - EXIT, part.row + EXIT);
    }
    return(true);
  }

  protected routeBit(part:Part, ball:Ball):boolean {
    // if the ball is in the top half of the part, proceed toward the center,
    //  rotating the bit as we go
    if (ball.row < part.row) {
      this._initialBitValue.set(part, part.bitValue);
      this.approachTarget(ball, part.column, part.row);
    }
    else if (this._initialBitValue.get(part)) {
      this.approachTarget(ball, part.column + EXIT, part.row + EXIT);
    }
    else {
      this.approachTarget(ball, part.column - EXIT, part.row + EXIT);
    }
    // rotate the part as the ball travels through it
    let r = (part.row + 0.5) - ball.row;
    if (! this._initialBitValue.get(part)) r = 1.0 - r;
    part.rotation = r;
    return(true);
  }
  private _initialBitValue:WeakMap<Part,boolean> = new WeakMap();

  // move the ball toward the given location
  protected approachTarget(ball:Ball, c:number, r:number):void {
    let v = Vector.normalise({ x: c - ball.column, y: r - ball.row });
    ball.column += v.x * STEP;
    ball.row += v.y * STEP;
  }

}