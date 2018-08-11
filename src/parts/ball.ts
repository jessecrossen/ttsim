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

  // when the ball goes below its drop, reset the released flag
  public get row():number { return(super.row); }
  public set row(r:number) {
    super.row = r;
    if ((this.released) && (this.drop) && (r > this.drop.row + 0.5)) {
      this.released = false;
    }
  }

  // track the last column the ball was in to determine travel direction
  public get column():number { return(super.column); }
  public set column(c:number) {
    const oldColumn:number = Math.round(this.column);
    const newColumn:number = Math.round(c);
    super.column = c;
    if (isNaN(this.lastDistinctColumn)) this.lastDistinctColumn = newColumn;
    if (newColumn !== oldColumn) {
      this.lastDistinctColumn = oldColumn;
    }
  }
  public lastDistinctColumn:number = NaN;

  // whether the ball has been released from a drop
  public released:boolean = false;

  // data used by ball routers
  public lastColumn:number;
  public lastRow:number;
  public vx:number = 0;
  public vy:number = 0;
  public minX:number = NaN;
  public maxX:number = NaN;
  public maxY:number = NaN;

  // the hue of the ball in degrees
  public get hue():number { return(this._hue); }
  public set hue(v:number) {
    if (isNaN(v)) return;
    while (v < 0) v += 360;
    if (v >= 360) v %= 360;
    if (v === this._hue) return;
    this._hue = v;
    this._color = this._colorForHue(this._hue);
    this._updateSprites();
  }
  private _hue:number = 220;

  // the color of the ball
  public get color():number { return(this._color); }
  private _color:number = this._colorForHue(this._hue);

  protected _colorForHue(hue:number):number {
    return(colorFromHSL(hue / 360, 1, 0.53));
  }

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
  public get bodyRestitution():number { return(0.05); }

}