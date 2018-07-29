/// <reference types="pixi.js" />

import { app } from '../index';
import { PartType } from './factory';

export const enum Layer {
  BACK = 0, // keep this at the start to allow iteration through all layers
  MID,
  FRONT,
  COUNT // keep this at the end to allow iteration through all layers
};

type LayerToSpriteMap = Map<Layer,PIXI.Sprite>;

// base class for all parts
export abstract class Part {

  public constructor(public readonly textures:PIXI.loaders.TextureDictionary) {

  }

  // whether the part can rotate
  public abstract get canRotate():boolean;
  // whether the part is left-right symmetrical
  public abstract get canMirror():boolean;
  // whether the part has left and right variants
  public abstract get canFlip():boolean;
  // the type of the part, for constructing a new one from the factory
  public abstract get type():PartType;

  // the unit-size of the part
  public get size():number { return(this._size); }
  public set size(s:number) {
    if (s === this._size) return;
    this._size = s;
    this._updateSprites();
  }
  private _size:number = 64;

  // the left/right rotation of the part (from 0.0 to 1.0)
  public get rotation():number { return(this._rotation); }
  public set rotation(r:number) {
    if (! this.canRotate) return;
    r = Math.min(Math.max(0.0, r), 1.0);
    if (r === this._rotation) return;
    this._rotation = r;
    this._updateSprites();
  }
  private _rotation:number = 0.0;

  // whether the part is pointing right (or will be when animations finish)
  public get bitValue():boolean {
    // handle animation
    if (this._rv !== 0.0) return(this._rv > 0);
    // handle static position
    return(this.rotation >= 0.5);
  }

  // whether the part is flipped to its left/right variant
  public get isFlipped():boolean { return(this._isFlipped); }
  public set isFlipped(v:boolean) {
    if ((! this.canFlip) || (v === this._isFlipped)) return;
    this._isFlipped = v;
    this._updateSprites();
  }
  private _isFlipped:boolean = false;

  // flip the part if it can be flipped
  public flip(time:number=0.0):void {
    if (this.canFlip) this.isFlipped = ! this.isFlipped;
    else if (this.canRotate) {
      this.animateRotation((this.bitValue) ? 0.0 : 1.0, time);
    }
  }

  // the part's horizontal position in the parent
  public get x():number { return(this._x); }
  public set x(v:number) {
    if (v === this._x) return;
    this._x = v;
    this._updateSprites();
  }
  private _x:number = 0;

  // the part's vertical position in the parent
  public get y():number { return(this._y); }
  public set y(v:number) {
    if (v === this._y) return;
    this._y = v;
    this._updateSprites();
  }
  private _y:number = 0;

  // the part's opacity
  public get alpha():number { return(this._alpha); }
  public set alpha(v:number) {
    if (v === this._alpha) return;
    this._alpha = v;
    this._updateSprites();
  }
  private _alpha:number = 1;

  // whether to show the part
  public get visible():boolean { return(this._visible); }
  public set visible(v:boolean) {
    if (v === this._visible) return;
    this._visible = v;
    this._updateSprites();
  }
  private _visible:boolean = true;

  // return whether the part has the same state as the given part
  public hasSameStateAs(part:Part):boolean {
    return((part) &&
           (this.type === part.type) &&
           (this.isFlipped === part.isFlipped) &&
           (this.bitValue === part.bitValue));
  }

  // ANIMATION ****************************************************************

  public animateRotation(target:number, time:number):void {
    if (time == 0.0) {
      this.rotation = target;
      return;
    }
    this._rv = (target - this.rotation) / (time * 60.0);
    PIXI.ticker.shared.add(this.tickRotation);
  }
  private _rv:number = 0.0;
  public cancelRotationAnimation():void {
    if (this._rv !== 0) {
      this._rv = 0.0;
      PIXI.ticker.shared.remove(this.tickRotation);
    }
  }
  protected _tickRotation(delta:number):void {
    if (this._rv == 0.0) {
      this.cancelRotationAnimation();
      return;
    }
    this.rotation += this._rv * delta;
    if (((this._rv > 0) && (this.rotation >= 1.0)) ||
        ((this._rv < 0) && (this.rotation <= 0))) {
      this.cancelRotationAnimation();
    }
  }
  protected tickRotation = this._tickRotation.bind(this);

  // SPRITES ******************************************************************

  // the prefix to append before texture names for this part
  public abstract get texturePrefix():string;
  // get texture names for the various layers
  public getTextureNameForLayer(layer:Layer):string {
    if (layer === Layer.BACK) return(this.texturePrefix+'-back');
    if (layer === Layer.MID) return(this.texturePrefix+'-mid');
    if (layer === Layer.FRONT) return(this.texturePrefix+'-front');
    return('');
  }
  
  // return a sprite for the given layer, or null if there is none
  public getSpriteForLayer(layer:Layer):PIXI.Sprite {
    if (! this._sprites.has(layer)) {
      const textureName = this.getTextureNameForLayer(layer);
      if ((textureName) && (textureName in this.textures)) {
        const sprite = new PIXI.Sprite(this.textures[textureName]);
        this._sprites.set(layer, sprite);
        this._initSprite(layer);
        this._updateSprite(layer);
      }
      else {
        this._sprites.set(layer, null);
      }
    }
    return(this._sprites.get(layer));
  }
  private _sprites:LayerToSpriteMap = new Map();

  // set initial properties for a newly-created sprite
  protected _initSprite(layer:Layer):void {
    const sprite = this._sprites.get(layer);
    if (! sprite) return;
    // always position sprites from the center
    sprite.anchor.set(0.5, 0.5);
  }

  // update all sprites to track the part's state
  protected _updateSprites():void {
    for (let i:number = Layer.BACK; i < Layer.COUNT; i++) {
      if (this._sprites.has(i)) this._updateSprite(i);
    }
  }
  // update the given sprite to track the part's state
  protected _updateSprite(layer:Layer):void {
    const sprite = this._sprites.get(layer);
    if (! sprite) return;
    // apply size
    const size:number = this.size * 1.5;
    sprite.width = size;
    sprite.height = size;
    // apply flipping
    let xScale:number = this.isFlipped ? 
      - Math.abs(sprite.scale.x) : Math.abs(sprite.scale.x);
    // apply rotation on all layers but the background
    if (layer != Layer.BACK) {
      // if we can, flip the sprite when it rotates past the center so there's
      //  less distortion from the rotation transform
      if ((this.canMirror) && (this.rotation > 0.5)) {
        xScale = -xScale;
        sprite.rotation = this._angleForRotation(this.rotation - 1.0);
      }
      else {
        sprite.rotation = this._angleForRotation(this.rotation);
      }
    }
    // apply any scale changes
    sprite.scale.x = xScale;
    // position the part
    sprite.position.set(this.x, this.y);
    // apply opacity and visibility
    sprite.visible = this.visible;
    sprite.alpha = sprite.visible ? this.alpha : 0;
  }

  // get the angle for the given rotation value
  protected _angleForRotation(r:number):number {
    return(r * (Math.PI / 2));
  }

}