import * as PIXI from 'pixi.js';

import { PartType } from './factory';
import { Renderer } from 'renderer';
import { Animator } from 'ui/animator';

export const enum Layer {
  BACK = 0, // keep this at the start to allow iteration through all layers
  MID,
  FRONT,
  SCHEMATIC_BACK,
  SCHEMATIC,
  SCHEMATIC_2,
  SCHEMATIC_4,
  TOOL,
  CONTROL,
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

  // whether the part can be replaced
  public isLocked:boolean = false;

  // a counter to track changes to non-display properties
  public changeCounter:number = 0;

  // the current position of the ball in grid units
  public get column():number { return(this._column); }
  public set column(v:number) {
    if (v === this._column) return;
    this._column = v;
    this.changeCounter++;
  }
  private _column:number = 0.0;
  public get row():number { return(this._row); }
  public set row(v:number) {
    if (v === this._row) return;
    this._row = v;
    this.changeCounter++;
  }
  private _row:number = 0.0;

  // a placeholder for the hue property of parts that have it
  public get hue():number { return(0); }
  public set hue(v:number) { }

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
    this.changeCounter++;
  }
  private _rotation:number = 0.0;

  // whether the part is pointing right (or will be when animations finish)
  public get bitValue():boolean {
    return(Animator.current.getEndValue(this, 'rotation') >= 0.5);
  }

  // whether the part is flipped to its left/right variant
  public get isFlipped():boolean { return(this._isFlipped); }
  public set isFlipped(v:boolean) {
    if ((! this.canFlip) || (v === this._isFlipped)) return;
    this._isFlipped = v;
    this._updateSprites();
    this.changeCounter++;
  }
  private _isFlipped:boolean = false;

  // flip the part if it can be flipped
  public flip(time:number=0.0):void {
    if (this.canFlip) this.isFlipped = ! this.isFlipped;
    else if (this.canRotate) {
      const bitValue = this.bitValue;
      Animator.current.animate(this, 'rotation',
        bitValue ? 1.0 : 0.0, bitValue ? 0.0 : 1.0, time);
      // cancel rotation animations for connected gear trains
      //  (note that we don't refer to Gearbase to avoid a circular reference)
      if ((this.type == PartType.GEAR) || (this.type == PartType.GEARBIT)) {
        const connected = (this as any).connected as Set<Part>;
        if (connected) {
          for (const gear of connected) {
            if (gear !== this) Animator.current.stopAnimating(gear, 'rotation');
          }
        }
      }
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

  // SPRITES ******************************************************************

  // the prefix to append before texture names for this part
  public get texturePrefix():string { return(this.constructor.name); }
  // the suffix to append to select a specific layer
  public textureSuffix(layer:Layer):string {
    if (layer === Layer.BACK) return('-b');
    if (layer === Layer.MID) return('-m');
    if (layer === Layer.FRONT) return('-f');
    if (layer === Layer.SCHEMATIC_BACK) return('-sb');
    if (layer === Layer.SCHEMATIC) return('-s');
    if (layer === Layer.SCHEMATIC_4) return('-s4');
    if (layer === Layer.SCHEMATIC_2) return('-s2');
    if (layer === Layer.TOOL) return('-t');
    return('');
  }
  // get texture names for the various layers
  public getTextureNameForLayer(layer:Layer):string {
    return(this.texturePrefix+this.textureSuffix(layer));
  }
  
  // return a sprite for the given layer, or null if there is none
  public getSpriteForLayer(layer:Layer):PIXI.Sprite {
    if (! this._sprites.has(layer)) {
      this._sprites.set(layer, this._initSprite(layer));
      this._updateSprite(layer);
    }
    return(this._sprites.get(layer));
  }
  private _sprites:LayerToSpriteMap = new Map();

  // destroy all cached sprites for the part
  public destroySprites():void {
    for (const layer of this._sprites.keys()) {
      const sprite = this._sprites.get(layer);
      if (sprite) sprite.destroy();
    }
    this._sprites.clear();
  }

  // set initial properties for a newly-created sprite
  protected _initSprite(layer:Layer):PIXI.Sprite {
    const textureName = this.getTextureNameForLayer(layer);
    const sprite = new PIXI.Sprite(this.textures[textureName]);
    if ((! textureName) || (! (textureName in this.textures))) return(null);
    if (sprite) {
      // always position sprites from the center
      sprite.anchor.set(0.5, 0.5);
    }
    return(sprite);
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
    if ((! sprite) || (! sprite.transform)) return;
    // apply size
    const size:number = (this.size > 2) ? (this.size * 1.5) : this.size;
    sprite.width = size;
    sprite.height = size;
    // apply flipping
    let xScale:number = (this._flipX && this._shouldFlipLayer(layer)) ? 
      - Math.abs(sprite.scale.x) : Math.abs(sprite.scale.x);
    // apply rotation on all layers but the background
    if (this._shouldRotateLayer(layer)) {
      // if we can, flip the sprite when it rotates past the center so there's
      //  less distortion from the rotation transform
      if ((this.canMirror) && (this.rotation > 0.5)) {
        xScale = -xScale;
        sprite.rotation = this.angleForRotation(this.rotation - 1.0, layer);
      }
      else {
        sprite.rotation = this.angleForRotation(this.rotation, layer);
      }
    }
    // apply any scale changes
    sprite.scale.x = xScale;
    // position the part
    sprite.position.set(this.x + (this._xOffset * this.size), 
                        this.y + (this._yOffset * this.size));
    // apply opacity and visibility
    sprite.visible = this._isLayerVisible(layer);
    sprite.alpha = this._layerAlpha(layer);
    // schedule rendering
    Renderer.needsUpdate();
  }
  // control the rotation of layers
  protected _shouldRotateLayer(layer:Layer):boolean {
    return(layer !== Layer.BACK);
  }
  // control the flipping of layers
  protected _shouldFlipLayer(layer:Layer):boolean {
    return(true);
  }
  // control the visibility of layers
  protected _isLayerVisible(layer:Layer):boolean {
    return(this.visible);
  }
  // control the opacity of layers
  protected _layerAlpha(layer:Layer):number {
    return(this._isLayerVisible(layer) ? this.alpha : 0.0);
  }
  // adjustable offsets for textures (as a fraction of the size)
  protected _xOffset:number = 0.0;
  protected _yOffset:number = 0.0;

  // get the angle for the given rotation value
  public angleForRotation(r:number, layer:Layer=Layer.MID):number {
    return((this.isFlipped ? - r : r) * (Math.PI / 2));
  }
  // get the rotation for the given angle
  public rotationForAngle(a:number):number {
    return((this.isFlipped ? - a : a) / (Math.PI / 2));
  }
  // get whether to flip the x axis
  protected get _flipX():boolean {
    return(this.isFlipped);
  }

  // PHYSICS ******************************************************************

  // whether the body can be moved by the physics simulator
  public get bodyCanMove():boolean { return(false); }
  // whether the body can be rotated by the physics simulator
  public get bodyCanRotate():boolean { return(this.canRotate); }
  // the rotation to return the body to when not active
  public get restingRotation():number { return(this.rotation); }
  // whether the body has a counterweight (like a ramp)
  public get isCounterWeighted():boolean { return(false); }
  // whether to bias the rotation to either side
  public get biasRotation():boolean { return(! this.isCounterWeighted);};
  // the amount the body will bounce in a collision (0.0 - 1.0)
  public get bodyRestitution():number { return(0.1); }

}