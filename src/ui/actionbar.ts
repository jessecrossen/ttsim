/// <reference types="pixi.js" />

import { Board, ToolType, PartSizes, SPACING_FACTOR } from 'board/board';
import { Button, PartButton, SpriteButton, ButtonBar } from './button';
import { Renderer } from 'renderer';

export class Actionbar extends ButtonBar {

  constructor(public readonly board:Board) {
    super();
    // add a button to toggle schematic view
    this._schematicButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['schematic']));
    this.addButton(this._schematicButton);
    // add zoom controls
    this._zoomInButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['zoomin']));
    this.addButton(this._zoomInButton);
    this._zoomOutButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['zoomout']));
    this.addButton(this._zoomOutButton);
    this._zoomToFitButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['zoomtofit']));
    this.addButton(this._zoomToFitButton);

    // add more top buttons here...
    
    // add a link to the Turing Tumble website
    this._heartButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['heart']));
    this.addButton(this._heartButton);
    this.bottomCount = 1;
    this._updateToggled();
  }
  private _schematicButton:Button;
  private _zoomInButton:Button;
  private _zoomOutButton:Button;
  private _zoomToFitButton:Button;
  private _heartButton:Button;

  protected onButtonClick(button:Button):void {
    if (button === this._schematicButton) {
      this.board.schematic = ! this.board.schematic;
      this._desiredSchematic = this.board.schematic;
      this._updateToggled();
    }
    else if (button === this._zoomInButton) { this.zoomIn(); }
    else if (button === this._zoomOutButton) { this.zoomOut(); }
    else if (button === this._zoomToFitButton) { this.zoomToFit(); }
    else if (button === this._heartButton) {
      window.open('https://www.turingtumble.com/', '_blank');
    }
  }

  protected _updateToggled():void {
    // update button toggle states
    for (const button of this._buttons) {
      if (button === this._schematicButton) {
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

  // ZOOMING ******************************************************************

  // the user's desired shematic setting
  protected _desiredSchematic:boolean = false;
  // force schematic mode when parts are very small
  protected get forceSchematic():boolean {
    return(this.board.spacing <= this.board.partSize);
  }
  // when the board gets too small to see parts clearly, 
  //  switch to schematic mode
  protected _updateAutoSchematic():void {
    if (this.forceSchematic) {
      this.board.schematic = true;
    }
    else {
      this.board.schematic = this._desiredSchematic;
    }
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
    this._updateAutoSchematic();
    this._updateToggled();
  }
  
  public zoomOut():void {
    if (! this.canZoomOut) return;
    this.board.partSize = PartSizes[this.zoomIndex - 1];
    this._updateAutoSchematic();
    this._updateToggled();
  }

  // zoom to fit the board
  public zoomToFit():void {
    this.board.centerColumn = (this.board.columnCount - 1) / 2;
    this.board.centerRow = (this.board.rowCount - 1) / 2;
    let s:number = PartSizes[0];
    for (let i:number = PartSizes.length - 1; i >= 0; i--) {
      s = PartSizes[i];
      const w:number = this.board.columnCount * Math.floor(s * SPACING_FACTOR);
      const h:number = this.board.rowCount * Math.floor(s * SPACING_FACTOR);
      if ((w <= this.board.width) && (h <= this.board.height)) break;
    }
    this.board.partSize = s;
    this._updateAutoSchematic();
    this._updateToggled();
  }

  protected get zoomIndex():number {
    return(PartSizes.indexOf(this.board.partSize));
  }

}