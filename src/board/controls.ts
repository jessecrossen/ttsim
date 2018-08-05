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