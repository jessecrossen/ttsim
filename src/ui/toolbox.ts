/// <reference types="pixi.js" />

import { Part } from '../parts/part';
import { ToolType } from '../board/board';
import { PartFactory, PartType } from '../parts/factory';
import { Button, PartButton, SpriteButton } from './button';

export class Toolbox extends PIXI.Container {

  constructor(public readonly partFactory:PartFactory) {
    super();
    this._buttons = [ ];
    // add a button to change the position of parts
    this._flipperButton = new SpriteButton(
      new PIXI.Sprite(partFactory.textures['flipper']));
    this._buttons.push(this._flipperButton);
    // add a button to remove parts
    this._eraserButton = new SpriteButton(
      new PIXI.Sprite(partFactory.textures['partloc-back']));
    this._buttons.push(this._eraserButton);
    // add buttons for parts
    for (let i:number = PartType.TOOLBOX_MIN; i <= PartType.TOOLBOX_MAX; i++) {
      const part = partFactory.make(i);
      if (! part) continue;
      const button = new PartButton(part);
      this._buttons.push(button);
    }
    for (const button of this._buttons) {
      this.addChild(button);
      button.addListener('click', this._onButtonClick.bind(this));
    }
    this._layout();
  }
  private _buttons:Button[];
  private _eraserButton:Button;
  private _flipperButton:Button;

  public onChange:() => void;

  public get tool():ToolType { return(this._tool); }
  public set tool(v:ToolType) {
    if (v === this._tool) return;
    this._tool = v;
    if (this.tool !== ToolType.PART) this._partPrototype = null;
    this._updateToggled();
    if (this.onChange) this.onChange();
  }
  private _tool:ToolType = ToolType.NONE;

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

  public get margin():number { return(this._margin); }
  public set margin(v:number) {
    if (v === this._margin) return;
    this._margin = v;
    this._layout();
  }
  private _margin:number = 4;

  public get height():number {
    return((this.width * this._buttons.length) +
           (this.margin * (this._buttons.length + 1)));
  }

  // the current part type to add
  public get partPrototype():Part { return(this._partPrototype); }
  private _partPrototype:Part = null;

  protected _onButtonClick(e:PIXI.interaction.InteractionEvent):void {
    if (e.target === this._flipperButton) {
      this.tool = ToolType.FLIPPER;
    }
    else if (e.target === this._eraserButton) {
      this.tool = ToolType.ERASER;
    }
    else if (e.target instanceof PartButton) {
      const newPart:Part = e.target.part;
      if (newPart === this._partPrototype) {
        // toggle direction if the selected part is clicked again
        this._partPrototype.flip();
      }
      else {
        this._partPrototype = newPart;
      }
      this.tool = ToolType.PART;
      this._updateToggled();
      if (this.onChange) this.onChange();
    }
  }

  protected _updateToggled():void {
    // update button toggle states
    for (const button of this._buttons) {
      if (button === this._flipperButton) {
        button.isToggled = (this.tool === ToolType.FLIPPER);
      }
      else if (button === this._eraserButton) {
        button.isToggled = (this.tool === ToolType.ERASER);
      }
      if (button instanceof PartButton) {
        button.isToggled = ((this.tool === ToolType.PART) && 
                            (button.part.type === this.partPrototype.type));
      }
    }
  }

  protected _layout():void {
    const m:number = this.margin;
    const w:number = this.width - (2 * m);
    const hw:number = Math.floor(w / 2);
    const x:number = m + hw;
    let y:number = m + hw;
    for (const button of this._buttons) {
      button.size = w;
      button.x = x;
      button.y = y;
      y += w + m;
    }
  }

}