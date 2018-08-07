import { Part, Layer } from './part';
import { PartType } from './factory';
import { Ball } from './ball';
import { Turnstile } from './turnstile';

export class Drop extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(true); }
  public get type():PartType { return(PartType.DROP); }

  // a set of balls associated with the drop
  public readonly balls:Set<Ball> = new Set();

  // a set of turnstiles associated with the drop
  public readonly turnstiles:Set<Turnstile> = new Set();

  // a flag to set signalling a desire to release a ball, which will be cleared
  //  after a ball is released
  public releaseBall():void {
    // find the ball closest to the bottom right
    let closest:Ball;
    let maxSum:number = - Infinity;
    for (const ball of this.balls) {
      // skip balls we've already released
      if (ball.released) continue;
      // never release a ball that is below the level of the drop,
      //  because it must have been released or dropped there
      if (ball.row > this.row + 0.5) {
        ball.released = true;
        continue;
      }
      let dc = ball.column - this.column;
      if (this.isFlipped) dc *= -1;
      const d = dc + ball.row;
      if (d > maxSum) {
        closest = ball;
        maxSum = d;
      }
    }
    // release the ball closest to the exit if we found one
    if (closest) closest.released = true;
  }

  // show and hide the controls on the front layer
  public get controlsAlpha():number { return(this._controlsAlpha); }
  public set controlsAlpha(v:number) {
    v = Math.min(Math.max(0.0, v), 1.0);
    if (v === this._controlsAlpha) return;
    this._controlsAlpha = v;
    this._updateSprites();
  }
  protected _layerAlpha(layer:Layer):number {
    const alpha = super._layerAlpha(layer);
    if (layer == Layer.FRONT) return(alpha * this._controlsAlpha);
    return(alpha);
  }
  private _controlsAlpha:number = 0.0;

  // the hue of balls in this ball drop
  public get hue():number { return(this._hue); }
  public set hue(v:number) {
    if (isNaN(v)) return;
    while (v < 0) v += 360;
    if (v >= 360) v %= 360;
    if (v === this._hue) return;
    this._hue = v;
    for (const ball of this.balls) {
      ball.hue = this.hue;
    }
    for (const turnstile of this.turnstiles) {
      turnstile.hue = this.hue;
    }
  }
  private _hue:number = 0.0;

}