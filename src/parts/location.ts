import { Part } from './part';
import { PartType } from './factory';

export class PartLocation extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(true); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.PARTLOC); }
  public get texturePrefix():string { return('partloc'); }

}

export class GearLocation extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(true); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.GEARLOC); }
  public get texturePrefix():string { return('gearloc'); }

}