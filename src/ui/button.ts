import * as PIXI from 'pixi.js';

import { Part, Layer } from 'parts/part';
import { Colors, Alphas, ButtonSizes } from './config';
import { Renderer } from 'renderer';
import { PartType } from 'parts/factory';

export abstract class Button extends PIXI.Sprite {

  constructor() {
    super();
    this.cursor = 'pointer';
    this.interactive = true;
    this.anchor.set(0.5, 0.5);
    this._background = new PIXI.Graphics();
    this.addChild(this._background);
    this._updateState();
    this.onSizeChanged();
    this._bindHover();
  }
  protected _background:PIXI.Graphics;
  
  public get size():number { return(this._size); }
  public set size(v:number) {
    if (v === this._size) return;
    this._size = v;
    this.onSizeChanged();
    Renderer.needsUpdate();
  }
  private _size:number = 96;

  public get isToggled():boolean { return(this._isToggled); }
  public set isToggled(v:boolean) {
    if (v === this._isToggled) return;
    this._isToggled = v;
    this._drawDecorations();
    this._updateState();
  }
  private _isToggled:boolean = false;

  public get isEnabled():boolean { return(this._isEnabled); }
  public set isEnabled(v:boolean) {
    if (v === this._isEnabled) return;
    this._isEnabled = v;
    this.interactive = v;
    this.cursor = v ? 'pointer' : 'auto';
    this._updateState();
  }
  private _isEnabled:boolean = true;

  protected onSizeChanged():void {
    this._drawDecorations();
  }

  protected _bindHover():void {
    this.addListener('mouseover', (e) => {
      this._mouseOver = true;
      this._updateState();
    });
    this.addListener('mouseout', (e) => {
      this._mouseOver = false;
      this._updateState();
    });
    this.addListener('mousedown', (e) => {
      this._mouseDown = true;
      this._updateState();
    });
    this.addListener('mouseup', (e) => {
      this._mouseDown = false;
      this._updateState();
    });
  }

  protected _updateState():void {
    let alpha:number = Alphas.BUTTON_NORMAL;
    if (this.isEnabled) {
      if ((this._mouseOver) && (this._mouseDown)) {
        alpha = Alphas.BUTTON_DOWN;
      }
      else if (this._mouseOver) {
        alpha = Alphas.BUTTON_OVER;
      }
      else alpha = Alphas.BUTTON_NORMAL;
      if (this.isToggled) alpha = Math.min(alpha * 2, 1.0);
    }
    this._background.alpha = alpha;
    this.alpha = this.isEnabled ? 1.0 : Alphas.BUTTON_DISABLED;
    Renderer.needsUpdate();
  }
  private _mouseOver:boolean = false;
  private _mouseDown:boolean = false;

  protected _drawDecorations():void {
    const radius = 8; // pixels
    const s = this.size;
    const hs = Math.round(s * 0.5);
    if (this._background) {
      this._background.clear();
      if (this.isToggled) {
        this._background.lineStyle(2, Colors.HIGHLIGHT);
      }
      this._background.beginFill(
        this.isToggled ? Colors.HIGHLIGHT : Colors.BUTTON_BACK);
      this._background.drawRoundedRect(- hs, - hs, s, s, radius);
      this._background.endFill();
    }
    Renderer.needsUpdate();
  }

}

export class PartButton extends Button {

  constructor(public readonly part:Part) {
    super();
    this._schematicView = part.getSpriteForLayer(Layer.SCHEMATIC);
    if (! this._schematicView) {
      this._schematicView = part.getSpriteForLayer(Layer.SCHEMATIC_BACK);
    }
    this._normalView = new PIXI.Container();
    this.addChild(this._normalView);
    const toolSprite = part.getSpriteForLayer(Layer.TOOL);
    if (toolSprite) this._normalView.addChild(toolSprite);
    else {
      for (let i:number = Layer.BACK; i <= Layer.FRONT; i++) {
        const sprite = part.getSpriteForLayer(i);
        if (sprite) this._normalView.addChild(sprite);
      }
    }
    this.onSizeChanged();
  }
  private _normalView:PIXI.Container;
  private _schematicView:PIXI.Sprite;

  public get schematic():boolean { return(this._schematic); }
  public set schematic(v:boolean) {
    if (v === this._schematic) return;
    this._schematic = v;
    if ((v) && (this.part.type <= PartType.BALL)) {
      this.removeChild(this._normalView);
      this.addChild(this._schematicView);
    }
    else {
      this.addChild(this._normalView);
      this.removeChild(this._schematicView);
    }
    Renderer.needsUpdate();
  }
  private _schematic:boolean = false;

  protected onSizeChanged():void {
    super.onSizeChanged();
    if (this.part) this.part.size = Math.floor(this.size * 0.75);
  }

}

export class SpriteButton extends Button {

  constructor(public readonly sprite:PIXI.Sprite) {
    super();
    if (sprite) {
      sprite.anchor.set(0.5, 0.5);
      this.addChild(sprite);
    }
    this.onSizeChanged();
  }

  protected onSizeChanged():void {
    super.onSizeChanged();
    if (this.sprite) {
      this.sprite.width = 
        this.sprite.height = 
          Math.floor(this.size * 0.75);
    }
  }

}

export abstract class ButtonBar extends PIXI.Container {

  constructor() {
    super();
    this.addChild(this._background);
    this._layout();
  }
  private _background:PIXI.Graphics = new PIXI.Graphics();
  protected _buttons:Button[] = [ ];

  // another button bar to keep in sync with this one
  public peer:ButtonBar;

  // the number of buttons to push to the bottom of the bar
  public get bottomCount():number { return(this._bottomCount); }
  public set bottomCount(v:number) {
    if (v === this.bottomCount) return;
    this._bottomCount = v;
    this._layout();
  }
  private _bottomCount:number = 0;

  public get width():number { return(this._width); }
  public set width(v:number) {
    if (v === this._width) return;
    this._width = v;
    for (const button of this._buttons) {
      button.size = this.width;
    }
    this._layout();
  }
  private _width:number = 96;

  public get height():number { return(this._height); }
  public set height(v:number) {
    if (v === this._height) return;
    this._height = v;
    this._layout();
    // if the height doesn't allow some buttons to show, make buttons smaller
    if (this.autowidth) {
      let safeSize:number = ButtonSizes[0];
      let s:number;
      for (s of ButtonSizes) {
        if (this._contentHeightForWidth(s + (2 * this.margin)) <= this.height) {
          safeSize = s;
        }
      }
      this.width = safeSize + (2 * this.margin);
    }
  }
  private _height:number = 96;

  // whether to automatically adjust the width to match the height
  public autowidth:boolean = true;

  public get margin():number { return(this._margin); }
  public set margin(v:number) {
    if (v === this._margin) return;
    this._margin = v;
    this._layout();
  }
  private _margin:number = 4;

  public addButton(button:Button):void {
    this._buttons.push(button);
    this.addChild(button);
    button.addListener('click', this._onButtonClick.bind(this));
    this._layout();
  }

  // handle buttons being clicked
  private _onButtonClick(e:PIXI.interaction.InteractionEvent):void {
    if (! (e.target instanceof Button)) return;
    this.onButtonClick(e.target);
  }
  protected abstract onButtonClick(button:Button):void;

  // update the toggled state of buttons
  public abstract updateToggled():void;

  // lay out buttons in a vertical strip
  protected _layout():void {
    const m:number = this.margin;
    const w:number = this.width - (2 * m);
    const hw:number = Math.floor(w / 2);
    const x:number = m + hw;
    let y:number = m + hw;
    // lay out top buttons
    for (let i:number = 0; i < this._buttons.length - this.bottomCount; i++) {
      const button = this._buttons[i];
      button.size = w;
      button.x = x;
      button.y = y;
      y += w + m;
    }
    // lay out bottom buttons
    y = this.height - (m + hw);
    for (let i:number = 0; i < this.bottomCount; i++) {
      const button = this._buttons[(this._buttons.length - 1) - i];
      button.size = w;
      button.x = x;
      button.y = y;
      y -= w + m;
    }
    this._background.clear();
    this._background.beginFill(Colors.BACKGROUND, 1.0);
    this._background.drawRect(0, 0, this.width, this.height);
    this._background.endFill();
    Renderer.needsUpdate();
  }

  // get the height taken up by all the buttons at the given width
  protected _contentHeightForWidth(w:number):number {
    const m = this.margin;
    return(m + ((w - m) * this._buttons.length));
  }

}