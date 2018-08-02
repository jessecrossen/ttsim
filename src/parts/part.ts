import * as PIXI from 'pixi.js';
import { Body, Vector, Vertices, Constraint } from 'matter-js';

import { PartType } from './factory';
import { Renderer } from 'renderer';
import { SPACING } from 'board/constants';
import { getVertexSets } from './bodies';

export const enum Layer {
  BACK = 0, // keep this at the start to allow iteration through all layers
  MID,
  FRONT,
  SCHEMATIC_BACK,
  SCHEMATIC,
  SCHEMATIC_2,
  SCHEMATIC_4,
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

  // the current position of the ball in grid units
  public get column():number { return(this._column); }
  public set column(v:number) {
    if (v === this._column) return;
    this._column = v;
    this.writeBody();
  }
  private _column:number = 0.0;
  public get row():number { return(this._row); }
  public set row(v:number) {
    if (v === this._row) return;
    this._row = v;
    this.writeBody();
  }
  private _row:number = 0.0;

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
    this.writeBody();
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
    this.writeBody();
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
    this._rv = (target < this.rotation ? - 1.0 : 1.0) / (time * 60.0);
    PIXI.ticker.shared.add(this.tickRotation);
  }
  private _rv:number = 0.0;
  public isAnimatingRotation():boolean {
    return(this._rv !== 0.0);
  }
  public cancelRotationAnimation():void {
    if (this._rv !== 0) {
      this._rv = 0.0;
      PIXI.ticker.shared.remove(this.tickRotation);
    }
  }
  protected _tickRotation(delta:number):void {
    if (this._rv === 0.0) {
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
    return('');
  }
  // get texture names for the various layers
  public getTextureNameForLayer(layer:Layer):string {
    return(this.texturePrefix+this.textureSuffix(layer));
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
    const size:number = (this.size > 2) ? (this.size * 1.5) : this.size;
    sprite.width = size;
    sprite.height = size;
    // apply flipping
    let xScale:number = this._flipX ? 
      - Math.abs(sprite.scale.x) : Math.abs(sprite.scale.x);
    // apply rotation on all layers but the background
    if (layer != Layer.BACK) {
      // if we can, flip the sprite when it rotates past the center so there's
      //  less distortion from the rotation transform
      if ((this.canMirror) && (this.rotation > 0.5)) {
        xScale = -xScale;
        sprite.rotation = this._angleForRotation(this.rotation - 1.0, layer);
      }
      else {
        sprite.rotation = this._angleForRotation(this.rotation, layer);
      }
    }
    // apply any scale changes
    sprite.scale.x = xScale;
    // position the part
    sprite.position.set(this.x + (this._xOffset * this.size), 
                        this.y + (this._yOffset * this.size));
    // apply opacity and visibility
    sprite.visible = this.visible;
    sprite.alpha = sprite.visible ? this.alpha : 0;
    // schedule rendering
    Renderer.needsUpdate();
  }
  // adjustable offsets for textures (as a fraction of the size)
  protected _xOffset:number = 0.0;
  protected _yOffset:number = 0.0;

  // get the angle for the given rotation value
  protected _angleForRotation(r:number, layer:Layer=Layer.MID):number {
    return((this.isFlipped ? - r : r) * (Math.PI / 2));
  }
  // get the rotation for the given angle
  protected _rotationForAngle(a:number):number {
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
  // the amount the body will bounce in a collision (0.0 - 1.0)
  public get bodyRestitution():number { return(0.25); }

  // a body representing the physical form of the part
  public getBody():Body {
    if (this._body === undefined) {
      this._body = this._bodyFromVertexSets(
        getVertexSets(this.constructor.name));
      if (this._body) {
        this.initBody();
        this.writeBody();
      }
    }
    return(this._body);
  };
  protected _body:Body = undefined;

  // get constraints to apply to the body
  public get constraints():Constraint[] { return(this._constraints); }
  private _constraints:Constraint[] = null;

  // initialize the body after creation
  protected initBody():void {
    if (! this._body) return;
    // parts that can't rotate can be static
    if ((! this.bodyCanRotate) && (! this.bodyCanMove)) {
      Body.setStatic(this._body, true);
    }
    // parts that can rotate need to be placed in a composite 
    //  to simulate the pin joint attaching them to the board
    else if (this.bodyCanRotate) {
      this._rotationConstraint = Constraint.create({
        bodyA: this._body,
        pointB: { x:0, y:0 },
        length: 0,
        stiffness: 1
      });
      if (! this._constraints) this._constraints = [ ];
      this._constraints.push(this._rotationConstraint);
    }
    
  }
  private _rotationConstraint:Constraint;

  // transfer relevant properties to the body
  public writeBody():void {
    if ((! this._body) || (this._readingBody)) return;
    if (this._bodyFlipped !== this.isFlipped) {
      Body.scale(this._body, -1, 1);
      this._bodyOffset.x *= -1;
    }
    if ((this._bodyRow !== this.row) || 
        (this._bodyColumn !== this.column) ||
        (this._bodyFlipped !== this.isFlipped)) {
      const x:number = (this.column * SPACING) + this._bodyOffset.x;
      const y:number = (this.row * SPACING) + this._bodyOffset.y;
      Body.setPosition(this._body, { x: x, y: y });
      if (this._rotationConstraint) {
        this._rotationConstraint.pointB = { x: x, y: y };
      }
      this._bodyRow = this.row;
      this._bodyColumn = this.column;
    }
    let desiredAngle:number = this._angleForRotation(this.rotation);
    if (this._bodyAngle != desiredAngle) {
      Body.setAngle(this._body, desiredAngle);
      this._bodyAngle = desiredAngle;
    }
    this._bodyFlipped = this.isFlipped;
  }
  protected _bodyOffset:Vector = { x: 0.0, y: 0.0 };
  private _bodyRow:number;
  private _bodyColumn:number;
  private _bodyFlipped:boolean = false;
  private _bodyAngle:number = 0.0;

  // tranfer relevant properties from the body
  public readBody():void {
    if (! this._body) return;
    this._readingBody = true;
    if (this.bodyCanMove) {
      this.column = this._body.position.x / SPACING;
      this.row = this._body.position.y / SPACING;
    }
    if (this.bodyCanRotate) {
      const r:number = this._rotationForAngle(this._body.angle);
      this.rotation = r;
      if ((r < 0) || (r > 1)) {
        Body.setAngularVelocity(this._body, 0.0);
        Body.setAngle(this._body, 
          this._angleForRotation(this.rotation));
      }
    }
    this._readingBody = false;
  }
  protected _readingBody:boolean = false;

  // construct a body from a set of vertex lists
  protected _bodyFromVertexSets(vertexSets:Vector[][]):Body {
    if (! vertexSets) return(null);
    const parts:Body[] = [ ];
    for (const vertices of vertexSets) {
      const center = Vertices.centre(vertices);
      parts.push(Body.create({ position: center, vertices: vertices }));
    }
    const body = Body.create({ parts: parts, 
      restitution: this.bodyRestitution,
      friction: 0 });
    // this is a hack to prevent matter.js from placing the body's center 
    //  of mass over the origin, which complicates our ability to precisely
    //  position parts of an arbitrary shape
    body.position.x = 0;
    body.position.y = 0;
    (body as any).positionPrev.x = 0;
    (body as any).positionPrev.y = 0;
    return(body);
  }

}