import { Part } from './part';
import { PartLocation, GearLocation } from './location';
import { Ramp } from './ramp';
import { Crossover } from './crossover';
import { Interceptor } from './interceptor';
import { Bit } from './bit';
import { Gear, Gearbit } from './gearbit';

export const enum PartType {
  NONE = -1,
  PARTLOC = 0, 
  GEARLOC,
  RAMP,       TOOLBOX_MIN = RAMP,
  CROSSOVER,
  INTERCEPTOR,
  BIT,
  GEARBIT,
  GEAR,       TOOLBOX_MAX = GEAR
}

export class PartFactory {

  constructor(public readonly textures:PIXI.loaders.TextureDictionary) {

  }

  // make a new part of the given type
  public make(type:PartType):Part {
    switch(type) {
      case PartType.PARTLOC: return(new PartLocation(this.textures));
      case PartType.GEARLOC: return(new GearLocation(this.textures));
      case PartType.RAMP: return(new Ramp(this.textures));
      case PartType.CROSSOVER: return(new Crossover(this.textures));
      case PartType.INTERCEPTOR: return(new Interceptor(this.textures));
      case PartType.BIT: return(new Bit(this.textures));
      case PartType.GEAR: return(new Gear(this.textures));
      case PartType.GEARBIT: return(new Gearbit(this.textures));
      default: return(null);
    }
  }

  // make a copy of the given part with the same basic state
  public copy(part:Part):Part {
    if (! part) return(null);
    const newPart:Part = this.make(part.type);
    if (newPart) {
      newPart.rotation = part.rotation;
      newPart.isFlipped = part.isFlipped;
    }
    return(newPart);
  }

}