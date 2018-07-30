/// <reference types="pixi.js" />

import { Board } from 'board/board';
import { PartFactory } from 'parts/factory';
import { Toolbox } from 'ui/toolbox';
import { Renderer } from 'renderer';

export class SimulatorApp extends PIXI.Container {

  constructor(public readonly textures:PIXI.loaders.TextureDictionary) {
    super();
    this.partFactory = new PartFactory(textures);
    this.board = new Board(this.partFactory);
    this.toolbox = new Toolbox(this.board);
    this.toolbox.width = 64;
    this.board.setSize(11, 11);
    this.board.centerColumn = 5;
    this.board.centerRow = 5;
    this.board.view.x = this.toolbox.width;
    this.addChild(this.board.view);
    this.addChild(this.toolbox);
  }
  public readonly partFactory:PartFactory;
  public readonly board:Board;
  public readonly toolbox:Toolbox;

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
    this.board.width = Math.max(0, this.width - this.toolbox.width);
    this.board.height = this.height;
    Renderer.needsUpdate();
  }

}