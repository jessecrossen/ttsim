import * as PIXI from 'pixi.js';
import { Renderer } from 'renderer';

export class ColorWheel extends PIXI.Sprite {

  constructor(public readonly textures:PIXI.loaders.TextureDictionary) {
    super();
    this._wheel = new PIXI.Sprite(textures['ColorWheel-m']);
    this._wheel.anchor.set(0.5, 0.5);
    this.addChild(this._wheel);
    this._pointer = new PIXI.Sprite(textures['ColorWheel-f']);
    this._pointer.anchor.set(0.5, 0.5);
    this.addChild(this._pointer);
    this.anchor.set(0.5, 0.5);
  }
  private _wheel:PIXI.Sprite;
  private _pointer:PIXI.Sprite;

  // the size of the control
  public get size():number { return(this._wheel.width); }
  public set size(v:number) {
    if (v === this.size) return;
    this._wheel.width = this._wheel.height = v;
    this._pointer.width = this._pointer.height = v;
    Renderer.needsUpdate();
  }

  // the hue in degrees
  public get hue():number { return(this._hue); }
  public set hue(v:number) {
    if (isNaN(v)) return;
    while (v < 0) v += 360;
    if (v >= 360) v %= 360;
    if (v === this.hue) return;
    this._hue = v;
    this._wheel.rotation = (this._hue / 180) * Math.PI;
    Renderer.needsUpdate();
  }
  private _hue:number = 0.0;

}

class SpriteWithSize extends PIXI.Sprite {
  // the size of the control
  public get size():number { return(this.width); }
  public set size(v:number) {
    if (v === this.size) return;
    this.width = this.height = v;
    Renderer.needsUpdate();
  }
}

export class DropButton extends SpriteWithSize {

  constructor(public readonly textures:PIXI.loaders.TextureDictionary) {
    super(textures['DropButton-f']);
    this.anchor.set(0.5, 0.5);
  }

}

export class TurnButton extends SpriteWithSize {

  constructor(public readonly textures:PIXI.loaders.TextureDictionary) {
    super(textures['TurnButton-f']);
    this.anchor.set(0.5, 0.5);
  }

  public get flipped():boolean { return(this.scale.x < 0); }
  public set flipped(v:boolean) {
    if (v === this.flipped) return;
    this.scale.x = Math.abs(this.scale.x) * (v ? -1 : 1);
    Renderer.needsUpdate();
  }

}