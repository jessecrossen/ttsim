import { Part } from './part';
import { PartType } from './factory';

export class Ramp extends Part {

  public get canRotate():boolean { return(true); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(true); }
  public get type():PartType { return(PartType.RAMP); }

  public get bodyRestitution():number { return(0.0); }

  // simulate the counterweight when doing physics
  public get isCounterWeighted():boolean { return(true); }
  // return ramps to zero (simulating counterweight when not doing physics)
  public get restingRotation():number { return(0.0); }

}