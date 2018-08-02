import { Part, Layer } from './part';
import { PartType } from './factory';

export abstract class GearBase extends Part {

  // a set of connected gears that should have the same rotation
  public connected:Set<GearBase> = null;
  // a label used in the connection-finding algorithm
  public _connectionLabel:number = -1;

  // transfer rotation to connected elements
  public get rotation():number { return(super.rotation); }
  public set rotation(v:number) {
    if ((! GearBase._settingConnectedRotation) && (this.connected)) {
      GearBase._settingConnectedRotation = this;
      for (const part of this.connected) {
        if (part !== this) part.rotation = v;
      }
      GearBase._settingConnectedRotation = null;
    }
    if ((GearBase._settingConnectedRotation) && 
        (GearBase._settingConnectedRotation !== this)) {
      this.cancelRotationAnimation();
    }
    super.rotation = v;
  }
  private static _settingConnectedRotation:GearBase = null;

}

export class Gearbit extends GearBase {

  public get canRotate():boolean { return(true); }
  public get canMirror():boolean { return(true); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.GEARBIT); }

  // return the bit to whichever side it's closest to, preventing stuck bits
  public get restingRotation():number { return(this.bitValue ? 1.0 : 0.0); }

}

export class Gear extends GearBase {

  public get canRotate():boolean { return(true); }
  public get canMirror():boolean { return(false); } // (the cross is not mirrored)
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.GEAR); }

  public get isOnPartLocation():boolean { return(this._isOnPartLocation); }
  public set isOnPartLocation(v:boolean) {
    if (v === this.isOnPartLocation) return;
    this._isOnPartLocation = v;
    this._updateSprites();
  }
  private _isOnPartLocation:boolean = false;

  // gears don't interact with balls in a rotationally asymmetric way, 
  //  so we can ignore their rotation
  public get bodyCanRotate():boolean { return(false); }
  
  protected _angleForRotation(r:number, layer:Layer):number {
    // gears on a regular-part location need to be rotated by 1/16 turn 
    //  to mesh with neighbors
    if (this.isOnPartLocation) {
      if (layer == Layer.SCHEMATIC) {
        return(super._angleForRotation(r, layer));
      }
      else {
        return(super._angleForRotation(r, layer) + (Math.PI * 0.125));
      }
    }
    // gears rotate in the reverse direction from their gearbits when placed
    //  on a gear-only location, but making them have the same rotation value 
    //  is convenient
    else {
      return(- super._angleForRotation(r, layer));
    }
  }

}