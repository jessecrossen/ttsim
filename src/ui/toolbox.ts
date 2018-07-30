/// <reference types="pixi.js" />

import { Part } from 'parts/part';
import { Board, ToolType, PartSizes } from 'board/board';
import { PartType } from 'parts/factory';
import { Button, PartButton, SpriteButton } from './button';
import { Delays, Colors } from './config';
import { Renderer } from 'renderer';

export class Toolbox extends PIXI.Container {

  constructor(public readonly board:Board) {
    super();
    this.addChild(this._background);
    this._buttons = [ ];
    // add a button to change the position of parts
    this._handButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['hand']));
    this._buttons.push(this._handButton);
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
    // add a button to toggle schematic view
    this._schematicButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['schematic']));
    this._buttons.push(this._schematicButton);
    // add zoom controls
    this._zoomInButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['zoomin']));
    this._buttons.push(this._zoomInButton);
    this._zoomOutButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['zoomout']));
    this._buttons.push(this._zoomOutButton);
    // do common setup for all buttons
    for (const button of this._buttons) {
      this.addChild(button);
      button.addListener('click', this._onButtonClick.bind(this));
    }
    this._layout();
    this._updateToggled();
  }
  private _background:PIXI.Graphics = new PIXI.Graphics();
  private _buttons:Button[];
  private _eraserButton:PartButton;
  private _handButton:Button;
  private _schematicButton:Button;
  private _zoomInButton:Button;
  private _zoomOutButton:Button;

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
    if (e.target === this._handButton) {
      this.board.tool = ToolType.HAND;
      this.board.partPrototype = null;
    }
    else if (e.target === this._eraserButton) {
      this.board.tool = ToolType.ERASER;
      this.board.partPrototype = null;
    }
    else if (e.target === this._schematicButton) {
      this.board.schematic = ! this.board.schematic;
      this._desiredSchematic = this.board.schematic;
    }
    else if (e.target === this._zoomInButton) { this.zoomIn(); }
    else if (e.target === this._zoomOutButton) { this.zoomOut(); }
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
      if (button === this._handButton) {
        button.isToggled = (this.board.tool === ToolType.HAND);
      }
      else if (button === this._eraserButton) {
        button.isToggled = (this.board.tool === ToolType.ERASER);
        this._eraserButton.schematic = this.board.schematic;
      }
      else if (button === this._schematicButton) {
        button.isEnabled = ! this.forceSchematic;
        button.isToggled = this.board.schematic;
      }
      else if (button == this._zoomInButton) {
        button.isEnabled = this.canZoomIn;
      }
      else if (button == this._zoomOutButton) {
        button.isEnabled = this.canZoomOut;
      }
      else if (button instanceof PartButton) {
        button.isToggled = ((this.board.tool === ToolType.PART) && 
                            (this.board.partPrototype) &&
                            (button.part.type === this.board.partPrototype.type));
        button.schematic = this.board.schematic;
      }
    }
    Renderer.needsUpdate();
  }
  
  // lay out buttons in a vertical strip
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
    this._background.clear();
    this._background.beginFill(Colors.BACKGROUND, 1.0);
    this._background.drawRect(0, 0, this.width, Renderer.instance.height);
    this._background.endFill();
  }

  // ZOOMING ******************************************************************

  // the user's desired shematic setting
  protected _desiredSchematic:boolean = false;
  // force schematic mode when parts are very small
  protected get forceSchematic():boolean {
    return(this.board.spacing <= this.board.partSize);
  }

  public get canZoomIn():boolean {
    return(this.zoomIndex < PartSizes.length - 1);
  }
  public get canZoomOut():boolean {
    return(this.zoomIndex > 0);
  }

  public zoomIn():void {
    if (! this.canZoomIn) return;
    this.board.partSize = PartSizes[this.zoomIndex + 1];
    if (! this.forceSchematic) {
      this.board.schematic = this._desiredSchematic;
    }
  }
  
  public zoomOut():void {
    if (! this.canZoomOut) return;
    this.board.partSize = PartSizes[this.zoomIndex - 1];
    // when the board gets too small to see parts clearly, 
    //  switch to schematic mode
    if (this.forceSchematic) {
      this.board.schematic = true;
    }
  }

  protected get zoomIndex():number {
    return(PartSizes.indexOf(this.board.partSize));
  }

}