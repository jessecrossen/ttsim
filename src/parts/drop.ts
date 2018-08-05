import { Part } from './part';
import { PartType } from './factory';

export class Drop extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(true); }
  public get type():PartType { return(PartType.DROP); }

  // add a ball to be managed by the drop
  

  // the hue of balls in this ball drop
  public get hue():number { return(this._hue); }
  public set hue(v:number) {
    if (isNaN(v)) return;
    while (v < 0) v += 360;
    if (v >= 360) v %= 360;
    if (v === this._hue) return;
    this._hue = v;
  }
  private _hue:number = 0.0;

  

}