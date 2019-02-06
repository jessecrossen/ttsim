import * as sound from 'pixi-sound';
import { Part } from 'parts/part';

const DEBOUNCE_MILLISECONDS:number = 50;

export class SoundEffects {

  constructor() {
    // TODO
  }

  // called when a ball impacts a part
  public ballHitPart(part:Part):void {
    if (this._debounce(this._lastHitTime, part)) return;
    // TODO
    console.log('hit', part.constructor.name);
  }
  private _lastHitTime:WeakMap<Part,number> = new WeakMap();

  // called when a ramp snaps back to its resting position
  public rotationStopped(part:Part):void {
    if (this._debounce(this._lastRotationStopTime, part)) return;
    // TODO
    console.log('stopped', part.constructor.name);
  }
  private _lastRotationStopTime:WeakMap<Part,number> = new WeakMap();

  // debounce repeated collisions of the same part
  protected _debounce(map:WeakMap<Part,number>, part:Part):boolean {
    const lastHitTime:number = map.has(part) ? map.get(part) : 0;
    const now:number = new Date().getTime();
    map.set(part, now);
    return(now - lastHitTime < DEBOUNCE_MILLISECONDS);
  }

  // sets whether a ball is currently rolling on a slope
  public get isRolling():boolean { return(this._isRolling); }
  public set isRolling(v:boolean) {
    // debounce this, because the ball will often break contact 
    //  with the slope while still rolling
    if (v) {
      if (! isNaN(this._rollingDebounce)) {
        clearTimeout(this._rollingDebounce);
        this._rollingDebounce = NaN;
      }
      this.startRolling();
    }
    else if (isNaN(this._rollingDebounce)) {
      this._rollingDebounce = 
        setTimeout(this.stopRolling.bind(this), DEBOUNCE_MILLISECONDS);
    }
  }
  private _rollingDebounce:number = NaN;

  protected startRolling():void {
    if (this._isRolling) return;
    this._isRolling = true;
    // TODO
    console.log('start rolling');
  }
  protected stopRolling():void {
    if (! this._isRolling) return;
    this._isRolling = false;
    this._rollingDebounce = NaN;
    // TODO
    console.log('stop rolling');
  }
  private _isRolling:boolean = false;

}