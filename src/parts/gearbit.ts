import { Part } from './part';
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
  public get texturePrefix():string { return('gearbit'); }

}

export class Gear extends GearBase {

  public get canRotate():boolean { return(true); }
  public get canMirror():boolean { return(false); } // (the cross is not mirrored)
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.GEAR); }
  public get texturePrefix():string { return('gear'); }

  // gears rotate in the reverse direction from their gearbits, but making
  //  them have the same rotation value is convenient
  protected _angleForRotation(r:number):number {
    return(- super._angleForRotation(r));
  }

}