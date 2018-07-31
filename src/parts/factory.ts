import { Part } from './part';
import { PartLocation, GearLocation } from './location';
import { Ramp } from './ramp';
import { Crossover } from './crossover';
import { Interceptor } from './interceptor';
import { Bit } from './bit';
import { Gear, Gearbit } from './gearbit';
import { Fence } from './fence';
import { Blank } from './blank';
import { Drop } from './drop';
import { Ball } from './ball';

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
  FENCE,      TOOLBOX_MAX = FENCE
}

export class PartFactory {

  constructor(public readonly textures:PIXI.loaders.TextureDictionary) {

  }

  // make a new part of the given type
  public make(type:PartType):Part {
    switch(type) {
      case PartType.BLANK: return(new Blank(this.textures));
      case PartType.PARTLOC: return(new PartLocation(this.textures));
      case PartType.GEARLOC: return(new GearLocation(this.textures));
      case PartType.RAMP: return(new Ramp(this.textures));
      case PartType.CROSSOVER: return(new Crossover(this.textures));
      case PartType.INTERCEPTOR: return(new Interceptor(this.textures));
      case PartType.BIT: return(new Bit(this.textures));
      case PartType.GEAR: return(new Gear(this.textures));
      case PartType.GEARBIT: return(new Gearbit(this.textures));
      case PartType.BALL: return(new Ball(this.textures));
      case PartType.DROP: return(new Drop(this.textures));
      case PartType.FENCE: return(new Fence(this.textures));
      default: return(null);
    }
  }

  // make a copy of the given part with the same basic state
  public copy(part:Part):Part {
    if (! part) return(null);
    const newPart:Part = this.make(part.type);
    if (newPart) {
      newPart.rotation = part.bitValue ? 1.0 : 0.0;
      newPart.isFlipped = part.isFlipped;
      newPart.isLocked = part.isLocked;
    }
    return(newPart);
  }

}