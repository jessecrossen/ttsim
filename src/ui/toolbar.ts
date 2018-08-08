import * as PIXI from 'pixi.js';

import { Part } from 'parts/part';
import { Board, ToolType } from 'board/board';
import { PartType } from 'parts/factory';
import { Button, PartButton, SpriteButton, ButtonBar } from './button';
import { Delays } from './config';
import { Renderer } from 'renderer';

export class Toolbar extends ButtonBar {

  constructor(public readonly board:Board) {
    super();
    // add a button to change the position of parts
    this._handButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['hand']));
    this.addButton(this._handButton);
    // add a button to remove parts
    this._eraserButton = new PartButton(
      this.board.partFactory.make(PartType.PARTLOC));
    this.addButton(this._eraserButton);
    // add buttons for parts
    for (let i:number = PartType.TOOLBOX_MIN; i <= PartType.TOOLBOX_MAX; i++) {
      const part = board.partFactory.make(i);
      if (! part) continue;
      const button = new PartButton(part);
      this.addButton(button);
    }
    this.updateToggled();
  }
  private _eraserButton:PartButton;
  private _handButton:Button;

  protected onButtonClick(button:Button):void {
    if (button === this._handButton) {
      this.board.tool = ToolType.HAND;
      this.board.partPrototype = null;
    }
    else if (button === this._eraserButton) {
      this.board.tool = ToolType.ERASER;
      this.board.partPrototype = null;
    }
    else if (button instanceof PartButton) {
      const newPart:Part = button.part;
      if ((this.board.partPrototype) &&
          (newPart.type === this.board.partPrototype.type)) {
        // toggle direction if the selected part is clicked again
        newPart.flip(Delays.FLIP);
      }
      this.board.tool = ToolType.PART;
      this.board.partPrototype = this.board.partFactory.copy(newPart);
    }
    this.updateToggled();
  }

  public updateToggled():void {
    // update button toggle states
    for (const button of this._buttons) {
      if (button === this._handButton) {
        button.isToggled = (this.board.tool === ToolType.HAND);
      }
      else if (button === this._eraserButton) {
        button.isToggled = (this.board.tool === ToolType.ERASER);
        this._eraserButton.schematic = this.board.schematicView;
      }
      else if (button instanceof PartButton) {
        button.isToggled = ((this.board.tool === ToolType.PART) && 
                            (this.board.partPrototype) &&
                            (button.part.type === this.board.partPrototype.type));
        button.schematic = this.board.schematicView;
      }
    }
    Renderer.needsUpdate();
  }

}