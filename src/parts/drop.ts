import { Part, Layer } from './part';
import { PartType } from './factory';
import { Ball } from './ball';

export class Drop extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(true); }
  public get type():PartType { return(PartType.DROP); }

  // a set of balls associated with the drop
  public readonly balls:Set<Ball> = new Set();

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
  }
  private _hue:number = 0.0;

}