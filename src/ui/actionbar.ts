import * as PIXI from 'pixi.js';

import { Board, ToolType, SPACING_FACTOR } from 'board/board';
import { Button, PartButton, SpriteButton, ButtonBar } from './button';
import { Zooms, Speeds } from './config';
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
    this._fasterButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['faster']));
    this.addButton(this._fasterButton);
    this._slowerButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['slower']));
    this.addButton(this._slowerButton);
    this._returnButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['return']));
    this.addButton(this._returnButton);

    // add more top buttons here...
    
    // add a link to the Turing Tumble website
    this._heartButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['heart']));
    this.addButton(this._heartButton);
    this.bottomCount = 1;
    this.updateToggled();
    // zoom on wheel events
    document.addEventListener('wheel', (e:WheelEvent) => {
      if (e.wheelDelta > 0) this.zoomIn();
      else if (e.wheelDelta < 0) this.zoomOut();
      e.preventDefault();
    });
  }
  private _schematicButton:Button;
  private _zoomInButton:Button;
  private _zoomOutButton:Button;
  private _zoomToFitButton:Button;
  private _fasterButton:Button;
  private _slowerButton:Button;
  private _returnButton:Button;
  private _heartButton:Button;

  protected onButtonClick(button:Button):void {
    if (button === this._schematicButton) {
      this.board.schematic = ! this.board.schematicView;
      this.updateToggled();
      if (this.peer) this.peer.updateToggled();
    }
    else if (button === this._zoomInButton) {
      this.zoomIn();
      if (this.peer) this.peer.updateToggled();
    }
    else if (button === this._zoomOutButton) {
      this.zoomOut();
      if (this.peer) this.peer.updateToggled();
    }
    else if (button === this._zoomToFitButton) {
      this.zoomToFit();
      if (this.peer) this.peer.updateToggled();
    }
    else if (button === this._fasterButton) { this.goFaster(); }
    else if (button === this._slowerButton) { this.goSlower(); }
    else if (button === this._returnButton) { this.board.returnBalls(); }
    else if (button === this._heartButton) {
      window.open('https://www.turingtumble.com/', '_blank');
    }
  }

  public updateToggled():void {
    // update button toggle states
    for (const button of this._buttons) {
      if (button === this._schematicButton) {
        button.isToggled = this.board.schematic;
      }
      else if (button == this._zoomInButton) {
        button.isEnabled = this.canZoomIn;
      }
      else if (button == this._zoomOutButton) {
        button.isEnabled = this.canZoomOut;
      }
      else if (button == this._fasterButton) {
        button.isEnabled = this.canGoFaster;
      }
      else if (button == this._slowerButton) {
        button.isEnabled = this.canGoSlower;
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

  // SPEED CONTROL ************************************************************

  public get canGoFaster():boolean {
    return(this.speedIndex < Speeds.length - 1);
  }
  public get canGoSlower():boolean {
    return(this.speedIndex > 0);
  }

  public goFaster():void {
    this.speedIndex++;
  }

  public goSlower():void {
    this.speedIndex--;
  }

  protected get speedIndex():number {
    return(Speeds.indexOf(this.board.speed));
  }
  protected set speedIndex(i:number) {
    if ((i >= 0) && (i < Speeds.length)) this.board.speed = Speeds[i];
    this.updateToggled();
  }

  // ZOOMING ******************************************************************

  public get canZoomIn():boolean {
    return(this.zoomIndex < Zooms.length - 1);
  }
  public get canZoomOut():boolean {
    return(this.zoomIndex > 0);
  }

  public zoomIn():void {
    if (! this.canZoomIn) return;
    this.board.partSize = Zooms[this.zoomIndex + 1];
    this.updateToggled();
  }
  
  public zoomOut():void {
    if (! this.canZoomOut) return;
    this.board.partSize = Zooms[this.zoomIndex - 1];
    this.updateToggled();
  }

  // zoom to fit the board
  public zoomToFit():void {
    this.board.centerColumn = (this.board.columnCount - 1) / 2;
    this.board.centerRow = (this.board.rowCount - 1) / 2;
    let s:number = Zooms[0];
    for (let i:number = Zooms.length - 1; i >= 0; i--) {
      s = Zooms[i];
      const w:number = this.board.columnCount * Math.floor(s * SPACING_FACTOR);
      const h:number = this.board.rowCount * Math.floor(s * SPACING_FACTOR);
      if ((w <= this.board.width) && (h <= this.board.height)) break;
    }
    this.board.partSize = s;
    this.updateToggled();
  }

  protected get zoomIndex():number {
    return(Zooms.indexOf(this.board.partSize));
  }

}