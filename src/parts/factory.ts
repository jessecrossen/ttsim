import { Part } from './part';
import { PartLocation, GearLocation } from './location';
import { Ramp } from './ramp';
import { Crossover } from './crossover';
import { Interceptor } from './interceptor';
import { Bit } from './bit';
import { Gear, Gearbit } from './gearbit';
import { Slope, Side } from './fence';
import { Blank } from './blank';
import { Drop } from './drop';
import { Ball } from './ball';
import { Turnstile } from './turnstile';

export const enum PartType {
  BLANK = 0, 
  PARTLOC,
  GEARLOC,
  RAMP,       TOOLBOX_MIN = RAMP,
  CROSSOVER,
  INTERCEPTOR,
  BIT,
  GEARBIT,
  GEAR,
  BALL, 
  DROP,       
  TURNSTILE,  
  SIDE,
  SLOPE, TOOLBOX_MAX = SLOPE
}

type PartConstructor = { new(textures:PIXI.loaders.TextureDictionary):Part };

export class PartFactory {

  constructor(public readonly textures:PIXI.loaders.TextureDictionary) {

  }

  public static constructorForType(type:PartType):PartConstructor {
    switch(type) {
      case PartType.BLANK: return(Blank);
      case PartType.PARTLOC: return(PartLocation);
      case PartType.GEARLOC: return(GearLocation);
      case PartType.RAMP: return(Ramp);
      case PartType.CROSSOVER: return(Crossover);
      case PartType.INTERCEPTOR: return(Interceptor);
      case PartType.BIT: return(Bit);
      case PartType.GEAR: return(Gear);
      case PartType.GEARBIT: return(Gearbit);
      case PartType.BALL: return(Ball);
      case PartType.SIDE: return(Side);
      case PartType.SLOPE: return(Slope);
      case PartType.DROP: return(Drop);
      case PartType.TURNSTILE: return(Turnstile);
      default: return(null);
    }
  }

  // make a new part of the given type
  public make(type:PartType):Part {
    const constructor = PartFactory.constructorForType(type);
    if (! constructor) return(null);
    return(new constructor(this.textures));
  }

  // make a copy of the given part with the same basic state
  public copy(part:Part):Part {
    if (! part) return(null);
    const newPart:Part = this.make(part.type);
    if (newPart) {
      newPart.rotation = part.bitValue ? 1.0 : 0.0;
      newPart.isFlipped = part.isFlipped;
      newPart.isLocked = part.isLocked;
      newPart.hue = part.hue;
    }
    if ((newPart instanceof Ball) && (part instanceof Ball)) {
      newPart.drop = part.drop;
      if (newPart.drop) newPart.drop.balls.add(newPart);
    }
    return(newPart);
  }

}