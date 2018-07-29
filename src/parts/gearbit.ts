import { Part } from './part';
import { PartType } from './factory';

export class Gearbit extends Part {

  public get canRotate():boolean { return(true); }
  public get canMirror():boolean { return(true); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.GEARBIT); }
  public get texturePrefix():string { return('gearbit'); }

}

export class Gear extends Part {

  public get canRotate():boolean { return(true); }
  public get canMirror():boolean { return(true); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.GEAR); }
  public get texturePrefix():string { return('gear'); }

  // gears rotate in the reverse direction from their gearbits, but making
  //  them have the same rotation value is convenient
  public get rotation():number { return(1.0 - super.rotation); }
  public set rotation(v:number) {
    super.rotation = 1.0 - Math.min(Math.max(0.0, v), 1.0);
  }

}