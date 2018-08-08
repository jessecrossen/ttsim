import * as PIXI from 'pixi.js';
import { Renderer } from 'renderer';
import { Drop } from 'parts/drop';
import { Colors, htmlColor } from 'ui/config';

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
  // whether to flip the control horizontally
  public get isFlipped():boolean { return(this.scale.x < 0); }
  public set isFlipped(v:boolean) {
    if (v === this.isFlipped) return;
    this.scale.x = Math.abs(this.scale.x) * (v ? -1 : 1);
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

}

export class BallCounter extends PIXI.Sprite {

  constructor() {
    super();
    this._text = new PIXI.Text('0',
      { fontFamily : 'sans-serif', fontWeight: 'bold', align: 'center', 
        fontSize: 24, fill: htmlColor(Colors.BALL_COUNT),
        stroke: '#000000', strokeThickness: 4 });
    this._text.anchor.set(0.5, 0.5);
    this.addChild(this._text);
  }
  private _text:PIXI.Text;

  public drop:Drop;

  public get count():number {
    if (! this.drop) return(0);
    let count:number = 0;
    for (const ball of this.drop.balls) {
      if ((ball.released) || (ball.row > this.drop.row + 0.5)) continue;
      count++;
    }
    return(count);
  }

  public update():void {
    const oldText:string = this._text.text;
    this._text.text = this.count.toString();
    if (this._text.text !== oldText) Renderer.needsUpdate();
  }

}