import { Part } from './part';
import { PartType } from './factory';

export class Crossover extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(true); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.CROSSOVER); }

  public get bodyRestitution():number { return(0.5); }

}