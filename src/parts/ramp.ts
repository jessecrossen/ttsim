import { Part } from './part';
import { PartType } from './factory';

export class Ramp extends Part {

  public get canRotate():boolean { return(true); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(true); }
  public get type():PartType { return(PartType.RAMP); }
  public get texturePrefix():string { return('ramp'); }

}