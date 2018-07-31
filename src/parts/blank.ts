import { Part } from './part';
import { PartType } from './factory';

export class Blank extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.BLANK); }

}