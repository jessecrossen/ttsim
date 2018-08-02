import { Part } from './part';
import { PartType } from './factory';

export class Bit extends Part {

  public get canRotate():boolean { return(true); }
  public get canMirror():boolean { return(true); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.BIT); }

  // return the bit to whichever side it's closest to, preventing stuck bits
  public get restingRotation():number { return(this.bitValue ? 1.0 : 0.0); }

}