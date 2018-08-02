import { Part } from './part';
import { PartType } from './factory';

export class PartLocation extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(true); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.PARTLOC); }

  // make the pins bouncy so it's more fun when the ball goes off track
  public get bodyRestitution():number { return(0.5); }

}

export class GearLocation extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(true); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.GEARLOC); }

  // make the pins bouncy so it's more fun when the ball goes off track
  public get bodyRestitution():number { return(0.5); }

}