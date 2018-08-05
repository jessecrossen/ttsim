import { Part, Layer } from './part';
import { PartType } from './factory';
import { SPACING_FACTOR } from 'board/board';

export class Side extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(true); }
  public get type():PartType { return(PartType.SIDE); }

}

export class Slope extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(true); }
  public get type():PartType { return(PartType.SLOPE); }

  public static get maxModulus():number { return(6); }

  // for slopes, the number of part units in the slope
  public get modulus():number { return(this._modulus); }
  public set modulus(v:number) {
    v = Math.min(Math.max(0, Math.round(v)), Slope.maxModulus);
    if (v === this.modulus) return;
    this._modulus = v;
    this._updateTexture();
    this.changeCounter++;
  }
  private _modulus:number = 1;

  // for slopes, the position of this part in the run of parts,
  //  where 0 is at the highest point and (modulus - 1) is at the lowest
  public get sequence():number { return(this._sequence); }
  public set sequence(v:number) {
    if (v === this.sequence) return;
    this._sequence = v;
    this._updateTexture();
    this.changeCounter++;
  }
  private _sequence:number = 1;

  // a number that uniquely identifies the fence body type
  public get signature():number {
    return(this.modulus > 0 ? 
      (this.sequence / this.modulus) : -1);
  }
  
  public textureSuffix(layer:Layer):string {
    let suffix = super.textureSuffix(layer);
    if (layer != Layer.TOOL) suffix += this.modulus;
    return(suffix);
  }

  protected _updateTexture():void {
    for (let layer:number = Layer.BACK; layer < Layer.COUNT; layer++) {
      const sprite = this.getSpriteForLayer(layer);
      if (! sprite) continue;
      if (this.modulus > 0) {
        this._yOffset = ((this.sequence % this.modulus) / this.modulus) * SPACING_FACTOR;
      }
      else {
        this._yOffset = 0;
      }
      const textureName:string = this.getTextureNameForLayer(layer);
      if (textureName in this.textures) {
        sprite.texture = this.textures[textureName];
      }
    }
    this._updateSprites();
  }

}