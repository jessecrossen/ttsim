import * as PIXI from 'pixi.js';

import { Board, ToolType, SPACING_FACTOR } from 'board/board';
import { Button, PartButton, SpriteButton, ButtonBar } from './button';
import { Zooms, Speeds, Delays } from './config';
import { Renderer } from 'renderer';
import { URLBoardSerializer } from 'board/serializer';
import { Animator } from './animator';
import { BoardBuilder } from 'board/builder';

export class Actionbar extends ButtonBar {

  constructor(public readonly board:Board) {
    super();
    // add the drawer behind the background
    this._drawer = new BoardDrawer(this.board);
    this._drawer.peer = this;
    this.addChildAt(this._drawer, 0);
    this._drawer.visible = false;
    this._drawer.autowidth = false;
    // add a button to show and hide extra board operations
    this._drawerButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['board-drawer']));
    this.addButton(this._drawerButton);
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
    // add speed controls
    this._fasterButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['faster']));
    this.addButton(this._fasterButton);
    this._slowerButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['slower']));
    this.addButton(this._slowerButton);
    // add a ball return
    this._returnButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['return']));
    this.addButton(this._returnButton);

    // add more top buttons here...
    
    // add a link to documentation
    this._helpButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['help']));
    this.addButton(this._helpButton);
    // add a link to the github repo
    this._githubButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['octocat']));
    this.addButton(this._githubButton);
    // add a link to the Turing Tumble website
    this._heartButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['heart']));
    this.addButton(this._heartButton);
    this.bottomCount = 3;
    this.updateToggled();
    // zoom on wheel events
    document.addEventListener('wheel', (e:WheelEvent) => {
      console.log(e);
      if ((e.deltaY < 0) || (e.deltaX < 0) || (e.deltaZ < 0)) this.zoomIn();
      else if ((e.deltaY > 0) || (e.deltaX > 0) || (e.deltaZ > 0)) this.zoomOut();
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
  private _helpButton:Button;
  private _githubButton:Button;
  private _heartButton:Button;
  private _drawerButton:Button;
  private _drawer:BoardDrawer;

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
    else if (button === this._drawerButton) this.toggleDrawer();
    else if (button === this._helpButton) {
      window.open('usage', '_blank');
    }
    else if (button === this._githubButton) {
      let m = window.location.host.match(new RegExp('^([^.]+)[.]github[.]io'));
      const user = m ? m[1] : 'jessecrossen';
      m = window.location.pathname.match(new RegExp('/*([^/?#]+)'));
      const repo = m ? m[1] : 'ttsim';
      window.open('https://github.com/'+user+'/'+repo+'/', '_blank');
    }
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
      else if (button === this._zoomInButton) {
        button.isEnabled = this.canZoomIn;
      }
      else if (button === this._zoomOutButton) {
        button.isEnabled = this.canZoomOut;
      }
      else if (button === this._fasterButton) {
        button.isEnabled = this.canGoFaster;
      }
      else if (button === this._slowerButton) {
        button.isEnabled = this.canGoSlower;
      }
      else if (button === this._drawerButton) {
        button.isToggled = this._drawer.visible;
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

  // DRAWER *******************************************************************

  protected _layout():void {
    super._layout();
    if (this._drawer) {
      this._drawer.width = this.width;
      this._drawer.height = this.height;
      this._drawer.x = this._drawer.visible ? - this.width : 0;
    }
  }

  public toggleDrawer():void {
    if (! this._drawer.visible) {
      this._drawerButton.scale.x = - Math.abs(this._drawerButton.scale.x);
      this._drawer.visible = true;
      this._drawer.x = 0;
      Animator.current.animate(this._drawer, 'x', 0, -this.width, 
        Delays.SHOW_CONTROL);
      this.updateToggled();
    }
    else {
      this._drawerButton.scale.x = Math.abs(this._drawerButton.scale.x);
      Animator.current.animate(this._drawer, 'x', -this.width, 0,
        Delays.HIDE_CONTROL, () => {
          this._drawer.visible = false;
          this.updateToggled();
        });
    }
  }

}

export class BoardDrawer extends ButtonBar {

  constructor(public readonly board:Board) {
    super();
    // add standard boards in several sizes
    this._smallButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['board-small']));
    this.addButton(this._smallButton);
    this._mediumButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['board-medium']));
    this.addButton(this._mediumButton);
    this._largeButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['board-large']));
    this.addButton(this._largeButton);
    // add clear buttons
    this._clearButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['board-clear']));
    this.addButton(this._clearButton);
    this._clearBallsButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['clear-balls']));
    this.addButton(this._clearBallsButton);
    // add upload download actions
    this._downloadButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['download']));
    this.addButton(this._downloadButton);
    this._uploadButton = new SpriteButton(
      new PIXI.Sprite(board.partFactory.textures['upload']));
    this.addButton(this._uploadButton);
  }
  private _smallButton:Button;
  private _mediumButton:Button;
  private _largeButton:Button;
  private _clearButton:Button;
  private _downloadButton:Button;
  private _uploadButton:Button;
  private _clearBallsButton:Button;

  protected onButtonClick(button:Button):void {
    if (button === this._smallButton) {
      BoardBuilder.initStandardBoard(this.board, 5, 11);
      this.zoomToFit();
    }
    else if (button === this._mediumButton) {
      BoardBuilder.initStandardBoard(this.board, 7, 15);
      this.zoomToFit();
    }
    else if (button === this._largeButton) {
      BoardBuilder.initStandardBoard(this.board, 9, 19);
      this.zoomToFit();
    }
    else if (button === this._clearButton) {
      this.board.clear();
      this.zoomToFit();
    }
    else if (button === this._clearBallsButton) {
      this.board.clearBalls();
    }
    else if (button === this._downloadButton) {
      if (this.board.serializer instanceof URLBoardSerializer) {
        this.board.serializer.download();
      }
    }
    else if (button === this._uploadButton) {
      if (this.board.serializer instanceof URLBoardSerializer) {
        this.board.serializer.upload((restored:boolean) => {
          if (restored) this.zoomToFit();
        });
      }
    }
  }

  protected zoomToFit():void {
    if (this.peer instanceof Actionbar) this.peer.zoomToFit();
  }

  public updateToggled():void { }

}