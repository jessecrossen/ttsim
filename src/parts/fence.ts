import { Part, Layer } from './part';
import { PartType } from './factory';
import { SPACING_FACTOR } from 'board/board';

export const enum FenceVariant {
  PREVIEW,
  SIDE,
  SLOPE
}

export class Fence extends Part {

  public get canRotate():boolean { return(false); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(true); }
  public get type():PartType { return(PartType.FENCE); }

  // the type of fence segment to display
  public get variant():FenceVariant { return(this._variant); }
  public set variant(v:FenceVariant) {
    if (v === this.variant) return;
    this._variant = v;
    this._updateTexture();
  }
  private _variant:FenceVariant = FenceVariant.PREVIEW;

  public static get maxModulus():number { return(6); }

  // for slopes, the number of part units in the slope
  public get modulus():number { return(this._modulus); }
  public set modulus(v:number) {
    v = Math.min(Math.max(1, Math.round(v)), Fence.maxModulus);
    if (v === this.modulus) return;
    this._modulus = v;
    this._updateTexture();
  }
  private _modulus:number = 1;

  // for slopes, the position of this part in the run of parts,
  //  where 0 is at the highest point and (modulus - 1) is at the lowest
  public get sequence():number { return(this._sequence); }
  public set sequence(v:number) {
    if (v === this.sequence) return;
    this._sequence = v;
    this._updateTexture();
  }
  private _sequence:number = 1;

  protected _updateTexture():void {
    for (let layer:number = Layer.BACK; layer < Layer.COUNT; layer++) {
      const sprite = this.getSpriteForLayer(layer);
      if (! sprite) continue;
      let suffix:string = this.textureSuffix(layer);
      if (this.variant === FenceVariant.SIDE) {
        suffix += 'l';
        this._yOffset = 0.0;
      }
      else if (this.variant === FenceVariant.SLOPE) {
        suffix += 's'+this.modulus;
        this._yOffset = ((this.sequence % this.modulus) / this.modulus) * SPACING_FACTOR;
      }
      else {
        this._yOffset = 0.0;
      }
      const textureName:string = this.texturePrefix+suffix;
      if (textureName in this.textures) {
        sprite.texture = this.textures[textureName];
      }
    }
    this._updateSprites();
  }

}