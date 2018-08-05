import { Body, Bodies } from 'matter-js';

import { Part, Layer } from './part';
import { PartType } from './factory';
import { colorFromHSL } from 'ui/config';
import { Drop } from './drop';

export class Ball extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.BALL); }

  // the drop associated with the ball
  public drop:Drop;

  // data used by ball routers
  public lastColumn:number;
  public lastRow:number;
  public lastDistinctColumn:number = NaN;

  // the hue of the ball in degrees
  public get hue():number { return(this._hue); }
  public set hue(v:number) {
    if (isNaN(v)) return;
    while (v < 0) v += 360;
    if (v >= 360) v %= 360;
    if (v === this._hue) return;
    this._hue = v;
    this._color = colorFromHSL(this._hue / 360, 1, 0.53);
    this._updateSprites();
  }
  private _hue:number = 155;

  // the color of the ball
  public get color():number { return(this._color); }
  private _color:number = 0x0E63FF;

  // update the given sprite to track the part's state
  protected _updateSprite(layer:Layer):void {
    super._updateSprite(layer);
    // we use the front layer for a specular highlight, so don't tint it
    if (layer !== Layer.FRONT) {
      const sprite = this.getSpriteForLayer(layer);
      if (! sprite) return;
      sprite.tint = this.color;
    }
  }

  public get bodyCanMove():boolean { return(true); }
  public get bodyRestitution():number { return(0.1); }

}