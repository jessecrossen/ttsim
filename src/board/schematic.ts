import { Vector } from 'matter-js';

import { IBallRouter } from './router';
import { Board } from './board';
import { Part } from 'parts/part';
import { PartType } from 'parts/factory';
import { Ball } from 'parts/ball';
import { PART_SIZE, BALL_RADIUS, SPACING } from './constants';
import { Slope, Side } from 'parts/fence';

type RouteMethod = (part:Part, ball:Ball) => boolean;

// compute the ball radius and diameter in grid units
const RAD = BALL_RADIUS / SPACING;
const DIAM = 2 * RAD;
// square the diameter for fast distance tests
const DIAM_2 = DIAM * DIAM;
// the thickness of fences in grid units
const FENCE = 0.125;

// the speed at which a ball should move through schematic parts
const STEP:number = 8 / PART_SIZE;
// the offset the schematic router should move toward when routing a ball,
//  which must be over 0.5 to allow the next part to capture the ball
const EXIT:number = 0.51 + RAD;

export class SchematicBallRouter implements IBallRouter {

  constructor(public readonly board:Board) {
    this.balls = this.board.balls;
  }
  public balls:Set<Ball>;

  public onBoardSizeChanged() { }

  public update(speed:number, correction:number):void {
    for (const ball of this.balls) {
      if (this.routeBall(ball)) {
        this.board.layoutPart(ball, ball.column, ball.row);
      }
      else {
        this.board.removeBall(ball);
      }
    }
    this.stackBalls();
  }

  protected routeBall(ball:Ball):boolean {
    let part:Part;
    let method:RouteMethod;
    // get the part containing the ball's center
    part = this.board.getPart(Math.round(ball.column), Math.round(ball.row));
    if ((part) && (method = this.routeMethodForPart(part)) &&
        (method.call(this, part, ball))) return(true);
    // get the leading corner of the ball's location if 
    //  we know it's moving horizontally
    if (ball.lastColumn !== ball.column) {
      const sign = ball.lastColumn < ball.column ? 1 : -1;
      const c = ball.column + (RAD * sign);
      const r = ball.row + RAD;
      // get the part on the grid square containing the leading corner
      part = this.board.getPart(Math.round(c), Math.round(r));
      if ((part) && (method = this.routeMethodForPart(part)) &&
          (method.call(this, part, ball))) return(true);
    }
    // if we get here, the ball was not moved, so let it fall
    this.routeFreefall(ball);
    if (ball.row > this.board.rowCount + 0.5) return(false);
    return(true);
  }

  protected routeMethodForPart(part:Part):RouteMethod {
    if (! part) return(null);
    switch(part.type) {
      case PartType.RAMP: return(this.routeRamp);
      case PartType.CROSSOVER: return(this.routeCrossover);
      case PartType.BIT:     // fall-through
      case PartType.GEARBIT: return(this.routeBit);
      case PartType.SIDE: return(this.routeSide);
      case PartType.SLOPE: return(this.routeSlope);
      case PartType.DROP: return(this.routeDrop);
      case PartType.TURNSTILE: return(this.routeTurnstile);
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
    else if (! this._initialBitValue.get(part)) {
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

  protected routeSide(part:Part, ball:Ball):boolean {
    // if the ball is contacting the side, push it inward
    if (part.isFlipped) { // right side
      ball.column = Math.min(ball.column, part.column + 0.5 - RAD);
    }
    else { // left side
      ball.column = Math.max(ball.column, part.column - 0.5 + RAD);
    }
    return(this.routeFreefall(ball));
  }

  protected routeSlope(part:Part, ball:Ball):boolean {
    if (! (part instanceof Slope)) return(false);
    // get the ball's row and column as a percentage of the part area
    const r = ball.row - (part.row - 0.5);
    let c = ball.column - (part.column - 0.5);
    if (part.isFlipped) c = 1 - c;
    // get the level the ball center should be at at that column
    const m = part.modulus;
    const s = part.sequence;
    const level = ((c + s - FENCE) / m) - RAD;
    // if the ball is above the slope, allow it to drop
    if (r + STEP <= level) return(this.routeFreefall(ball));
    // if the ball is well below the slope, allow it to drop
    if (r > level + DIAM) return(this.routeFreefall(ball));
    // the ball is near the fence, so put it on top of the fence
    ball.row = (part.row - 0.5) + level;
    // get the target column to aim for
    const sign = part.isFlipped ? -1 : 1;
    let target = sign * EXIT;
    // stop if there's a side at the bottom of the slope
    const next = this.board.getPart(part.column + sign, part.row);
    if ((next instanceof Side) && (next.isFlipped == part.isFlipped)) {
      target = sign * (0.5 - RAD - (FENCE / 2));
    }
    // roll toward the exit
    this.approachTarget(ball, part.column + target, 
      part.row - 0.5 + ((0.5 + (target * sign) + s - FENCE) / m) - RAD);
    return(true);
  }

  protected routeDrop(part:Part, ball:Ball):boolean {
    if (ball.released) {
      const sign = part.isFlipped ? -1 : 1;
      this.approachTarget(ball, part.column + (sign * EXIT), 
                                part.row + 0.5 - RAD);
    }
    else {
      const offset = RAD + (FENCE / 3);
      ball.column = Math.min(Math.max(part.column - 0.5 + offset, ball.column),
        part.column + 0.5 - offset);
      this.routeFreefall(ball);
      ball.row = Math.min(ball.row, part.row + 0.5 - offset);
    }
    return(true);
  }

  protected routeTurnstile(part:Part, ball:Ball):boolean {
    // convert to direction and position neutral coordinates for simplicity
    const sign = part.isFlipped ? -1 : 1;
    let r = ball.row - part.row;
    let tc = NaN;
    let tr = NaN;
    // lots of magic numbers here because the shape is complicated
    const pocketR = -0.35;
    const pocketC = 0.13;
    if (r < pocketR) {
      tc = pocketC;
      tr = pocketR;
    }
    else if ((part.rotation < 1.0) && (r < pocketC)) {
      part.rotation += 0.1;
      const v = Vector.rotate({ x: pocketC, y: pocketR }, 
        part.angleForRotation(part.rotation) * sign);
      tc = v.x;
      tr = v.y;
    }
    else {
      part.rotation = 0.0;
      tr = 0.28;
      tc = EXIT;
    }
    // if there is a target, convert back into real coordinates and route
    if ((! isNaN(tc)) && (! isNaN(tr))) {
      this.approachTarget(ball, part.column + (tc * sign), part.row + tr);
    }
    return(true);
  }

  protected routeFreefall(ball:Ball):boolean {
    ball.row += STEP;
    return(true);
  }

  // move the ball toward the given location
  protected approachTarget(ball:Ball, c:number, r:number):void {
    let v = Vector.normalise({ x: c - ball.column, y: r - ball.row });
    ball.column += v.x * STEP;
    ball.row += v.y * STEP;
    // don't allow the ball to go past the target
    if (v.x > 0) ball.column = Math.min(ball.column, c);
    else ball.column = Math.max(c, ball.column);
    if (v.y > 0) ball.row = Math.min(ball.row, r);
    else ball.row = Math.max(r, ball.row);
  }

  // BALL STACKING ************************************************************

  protected stackBalls():void {
    // group balls into columns containing balls that are halfway on either side
    const columns:Ball[][] = [ ];
    const add = (ball:Ball, c:number) => {
      if ((c < 0) || (c >= this.board.rowCount)) return;
      if (columns[c] === undefined) columns[c] = [ ];
      columns[c].push(ball);
    };
    for (const ball of this.balls) {
      const left = Math.floor(ball.column);
      const center = Math.round(ball.column);
      const right = Math.floor(ball.column);
      add(ball, center);
      if (left !== center) add(ball, left);
      if (right !== center) add(ball, right);
    }
    // sort the balls in each column from bottom to top
    for (const c in columns) {
      const column = columns[c];
      if (! column) continue;
      column.sort((a, b) => a.row > b.row ? -1 : a.row < b.row ? 1 : 0);
      this.stackColumn(parseInt(c), column);
    }
  }
  protected stackColumn(column:number, balls:Ball[]):void {
    let ball:Ball;
    let r:number, c:number, i:number, j:number, dc:number, dr:number;
    const collisions:Set<Ball> = new Set();
    for (i = 0; i < balls.length; i++) {
      ball = balls[i];
      // don't move balls from other columns, they'll be taken care of there
      if (Math.round(ball.column) !== column) continue;
      // iterate over balls below this one to find collisions
      collisions.clear();
      r = ball.row;
      c = ball.column;
      for (j = i - 1; j >= 0; j--) {
        dc = balls[j].column - c;
        dr = balls[j].row - r;
        // if we find a ball more than a diameter below this one, 
        //  the rest must be lower
        if (dr > DIAM) break;
        if ((dr * dr) + (dc * dc) < DIAM_2) {
          collisions.add(balls[j]);
        }
      }
      // if there are no collisions, there's nothing to do
      if (collisions.size == 0) continue;
      // move away from each other ball
      for (const b of collisions) {
        const v = { x: ball.column - b.column, y: ball.row - b.row };
        const d = Vector.magnitude(v);
        const m = Math.max(0, DIAM - d);
        ball.column += (v.x / d) * m;
        ball.row += (v.y / d) * m;
      }
    }
  }

}