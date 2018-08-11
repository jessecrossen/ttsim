import * as PIXI from 'pixi.js';

import { Board } from 'board/board';
import { PartFactory } from 'parts/factory';
import { Toolbar } from 'ui/toolbar';
import { Actionbar } from 'ui/actionbar';
import { Renderer } from 'renderer';
import { Animator } from 'ui/animator';
import { PhysicalBallRouter } from 'board/physics';
import { makeKeyHandler } from 'ui/keyboard';
import { GearBase } from 'parts/gearbit';

export class SimulatorApp extends PIXI.Container {

  constructor(public readonly textures:PIXI.loaders.TextureDictionary) {
    super();
    this.partFactory = new PartFactory(textures);
    this.board = new Board(this.partFactory);
    this.toolbar = new Toolbar(this.board);
    this.actionbar = new Actionbar(this.board);
    this.actionbar.peer = this.toolbar;
    this.toolbar.peer = this.actionbar;
    this.addChild(this.board.view);
    this.addChild(this.toolbar);
    this.addChild(this.actionbar);
    this._layout();
    // add event listeners
    this._addKeyHandlers();
  }
  public readonly partFactory:PartFactory;
  public readonly board:Board;
  public readonly toolbar:Toolbar;
  public readonly actionbar:Actionbar;
  public readonly physicalRouter:PhysicalBallRouter;

  public update(delta:number):void {
    Animator.current.update(delta);
    this.board.update(delta);
    GearBase.update();
    Renderer.render();
  }

  public get width():number { return(this._width); }
  public set width(v:number) {
    if (v === this._width) return;
    this._width = v;
    this._layout();
  }
  private _width:number = 0;

  public get height():number { return(this._height); }
  public set height(v:number) {
    if (v === this._height) return;
    this._height = v;
    this._layout();
  }
  private _height:number = 0;

  protected _layout():void {
    this.toolbar.height = this.height;
    this.actionbar.height = this.height;
    this.actionbar.x = this.width - this.actionbar.width;
    this.board.view.x = this.toolbar.width;
    this.board.width = Math.max(0, 
      this.width - (this.toolbar.width + this.actionbar.width));
    this.board.height = this.height;
    Renderer.needsUpdate();
  }

  protected _addKeyHandlers():void {
    makeKeyHandler('w').press = () => { 
      this.board.physicalRouter.showWireframe = 
        ! this.board.physicalRouter.showWireframe; };
  }

}