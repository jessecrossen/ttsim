import { Part } from './part';
import { PartType } from './factory';

export class Drop extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(true); }
  public get type():PartType { return(PartType.DROP); }

}