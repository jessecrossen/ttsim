/// <reference types="pixi.js" />

import { Part } from '../parts/part';
import { Board, ToolType } from '../board/board';
import { PartType } from '../parts/factory';
import { Button, PartButton, SpriteButton } from './button';
import { Delays } from './config';

export class Toolbox extends PIXI.Container {

  constructor(public readonly board:Board) {
    super();
    this._buttons = [ ];
    // add a button to change the position of parts
    this._flipperButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['flipper']));
    this._buttons.push(this._flipperButton);
    // add a button to remove parts
    this._eraserButton = new PartButton(
      this.board.partFactory.make(PartType.PARTLOC));
    this._buttons.push(this._eraserButton);
    // add buttons for parts
    for (let i:number = PartType.TOOLBOX_MIN; i <= PartType.TOOLBOX_MAX; i++) {
      const part = board.partFactory.make(i);
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

  protected _onButtonClick(e:PIXI.interaction.InteractionEvent):void {
    if (e.target === this._flipperButton) {
      this.board.tool = ToolType.FLIPPER;
      this.board.partPrototype = null;
    }
    else if (e.target === this._eraserButton) {
      this.board.tool = ToolType.ERASER;
      this.board.partPrototype = null;
    }
    else if (e.target instanceof PartButton) {
      const newPart:Part = e.target.part;
      if ((this.board.partPrototype) &&
          (newPart.type === this.board.partPrototype.type)) {
        // toggle direction if the selected part is clicked again
        newPart.flip(Delays.FLIP);
      }
      this.board.tool = ToolType.PART;
      this.board.partPrototype = this.board.partFactory.copy(newPart);
    }
    this._updateToggled();
  }

  protected _updateToggled():void {
    // update button toggle states
    for (const button of this._buttons) {
      if (button === this._flipperButton) {
        button.isToggled = (this.board.tool === ToolType.FLIPPER);
      }
      else if (button === this._eraserButton) {
        button.isToggled = (this.board.tool === ToolType.ERASER);
      }
      else if (button instanceof PartButton) {
        button.isToggled = ((this.board.tool === ToolType.PART) && 
                            (this.board.partPrototype) &&
                            (button.part.type === this.board.partPrototype.type));
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