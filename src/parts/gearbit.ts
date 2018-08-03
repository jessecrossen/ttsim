import { Part, Layer } from './part';
import { PartType } from './factory';

export abstract class GearBase extends Part {

  // a set of connected gears that should have the same rotation
  public connected:Set<GearBase> = null;
  // a label used in the connection-finding algorithm
  public _connectionLabel:number = -1;

  // transfer rotation to connected elements
  public get rotation():number { return(super.rotation); }
  public set rotation(r:number) {
    // if this is connected to a gear train, register a vote 
    //  to be tallied later
    if ((this.connected) && (this.connected.size > 1) && 
        (! GearBase._updating)) {
      this._rotationVote = r;
      GearBase._rotationElections.add(this.connected);
    }
    else {
      super.rotation = r;
    }
  }
  private _rotationVote:number = NaN;
  private static _rotationElections:Set<Set<GearBase>> = new Set();

  // tally votes and apply rotation
  public static update():void {
    // skip this if there are no votes
    if (! (GearBase._rotationElections.size > 0)) return;
    GearBase._updating = true;
    for (const election of GearBase._rotationElections) {
      let sum:number = 0;
      let count:number = 0;
      for (const voter of election) {
        if (! isNaN(voter._rotationVote)) {
          sum += voter._rotationVote;
          count += 1;
          voter._rotationVote = NaN;
        }
      }
      if (! (count > 0)) continue;
      const mean:number = sum / count;
      for (const voter of election) {
        voter.rotation = mean;
      }
    }
    GearBase._rotationElections.clear();
    GearBase._updating = false;
  }
  private static _updating:boolean = false;

  public isBeingDriven():boolean {
    return(GearBase._rotationElections.has(this.connected) &&
           (isNaN(this._rotationVote)));
  }

}

export class Gearbit extends GearBase {

  public get canRotate():boolean { return(true); }
  public get canMirror():boolean { return(true); }
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.GEARBIT); }

  // return the bit to whichever side it's closest to, preventing stuck bits
  public get restingRotation():number { return(this.bitValue ? 1.0 : 0.0); }

}

export class Gear extends GearBase {

  public get canRotate():boolean { return(true); }
  public get canMirror():boolean { return(false); } // (the cross is not mirrored)
  public get canFlip():boolean { return(false); }
  public get type():PartType { return(PartType.GEAR); }

  public get isOnPartLocation():boolean { return(this._isOnPartLocation); }
  public set isOnPartLocation(v:boolean) {
    if (v === this.isOnPartLocation) return;
    this._isOnPartLocation = v;
    this._updateSprites();
  }
  private _isOnPartLocation:boolean = false;

  // gears don't interact with balls in a rotationally asymmetric way, 
  //  so we can ignore their rotation
  public get bodyCanRotate():boolean { return(false); }
  
  public angleForRotation(r:number, layer:Layer):number {
    // gears on a regular-part location need to be rotated by 1/16 turn 
    //  to mesh with neighbors
    if (this.isOnPartLocation) {
      if (layer == Layer.SCHEMATIC) {
        return(super.angleForRotation(r, layer));
      }
      else {
        return(super.angleForRotation(r, layer) + (Math.PI * 0.125));
      }
    }
    // gears rotate in the reverse direction from their gearbits when placed
    //  on a gear-only location, but making them have the same rotation value 
    //  is convenient
    else {
      return(- super.angleForRotation(r, layer));
    }
  }

}