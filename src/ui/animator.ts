import { Renderer } from "renderer";

export type Animation = {
  subject: any,
  property: string,
  start: number,
  end: number,
  time: number,
  delta: number,
  callback: () => void
};

type MapPropertyToAnimation = Map<string,Animation>;
type MapSubjectToProperty = Map<any,MapPropertyToAnimation>;

// centrally manage animations of properties
export class Animator {
  
  // a singleton instance of the class
  public static get current():Animator {
    if (! Animator._current) Animator._current = new Animator();
    return(Animator._current);
  }
  private static _current:Animator;

  private _subjects:MapSubjectToProperty = new Map();

  // animate the given property of the given subject from its current value
  //  to the given end point, at a speed which would take the given time to 
  //  traverse the range from start to end
  public animate(subject:any, property:string, start:number, end:number, time:number, 
                 callback?:() => void):Animation {
    // handle the edge-cases of zero or negative time
    if (! (time > 0.0)) {
      this.stopAnimating(subject, property);
      subject[property] = end;
      return(null);
    }
    // get all animations for this subject
    if (! this._subjects.has(subject)) this._subjects.set(subject, new Map());
    const properties = this._subjects.get(subject);
    // calculate a delta to traverse the property's entire range in the given time
    const delta:number = (end - start) / (time * 60);
    // update an existing animation
    let animation:Animation = null;
    if (properties.has(property)) {
      animation = properties.get(property);
      animation.start = start;
      animation.end = end;
      animation.time = time;
      animation.delta = delta;
      animation.callback = callback;
    }
    // make a new animation
    else {
      animation = {
        subject: subject,
        property: property,
        start: start,
        end: end,
        time: time,
        delta: delta,
        callback: callback
      };
      properties.set(property, animation);
    }
    return(animation);
  }

  // get the end value for the given property, or the current value if it's
  //  not currently being animated
  public getEndValue(subject:any, property:string):number {
    const current:number = subject[property];
    if (! this._subjects.has(subject)) return(current);
    const properties = this._subjects.get(subject);
    if (! properties.has(property)) return(current);
    return(properties.get(property).end);
  }

  // get whether the given property is being animated
  public isAnimating(subject:any, property:string):boolean {
    const current:number = subject[property];
    if (! this._subjects.has(subject)) return(false);
    const properties = this._subjects.get(subject);
    return (properties.has(property));
  }

  // stop animating the given property, leaving the current value as-is
  public stopAnimating(subject:any, property:string):void {
    if (! this._subjects.has(subject)) return;
    const properties = this._subjects.get(subject);
    properties.delete(property);
    // remove entries for subjects with no animations
    if (properties.size == 0) {
      this._subjects.delete(subject);
    }
  }

  // advance all animations by one tick
  public update(correction:number):void {
    let someAnimations:boolean = false;
    for (const [ subject, properties ] of this._subjects.entries()) {
      for (const [ property, animation ] of properties) {
        someAnimations = true;
        let finished = false;
        let current:number = subject[property] as number;
        current += (animation.delta * Math.abs(correction));
        if (animation.delta > 0) {
          if (current >= animation.end) {
            current = animation.end;
            finished = true;
          }
        }
        else if (animation.delta < 0) {
          if (current <= animation.end) {
            current = animation.end;
            finished = true;
          }
        }
        else {
          current = animation.end;
        }
        subject[property] = current;
        if (finished) {
          this.stopAnimating(subject, property);
          if (animation.callback) animation.callback();
        }
      }
    }
    if (someAnimations) Renderer.needsUpdate();
  }

}