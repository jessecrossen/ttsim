/// <reference types="pixi.js" />

import { Board } from './board/board';
import { PartFactory } from './parts/factory';
import { Toolbox } from './ui/toolbox';

export class SimulatorApp extends PIXI.Container {

  constructor(public readonly textures:PIXI.loaders.TextureDictionary) {
    super();
    this.partFactory = new PartFactory(textures);
    this.toolbox = new Toolbox(this.partFactory);
    this.toolbox.width = 64;
    this.board = new Board(this.partFactory);
    this.board.setSize(11, 9);
    this.addChild(this.toolbox);
    this.board.view.x = this.toolbox.width;
    this.addChild(this.board.view);
    // hook the toolbox to the board
    this.toolbox.onChange = () => {
      this.board.partPrototype = this.toolbox.partPrototype ?
        this.partFactory.copy(this.toolbox.partPrototype) : null;
      this.board.tool = this.toolbox.tool;
    };
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
  }

}