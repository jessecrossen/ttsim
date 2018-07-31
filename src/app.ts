/// <reference types="pixi.js" />

import { Board } from 'board/board';
import { PartFactory, PartType } from 'parts/factory';
import { Toolbox } from 'ui/toolbox';
import { Renderer } from 'renderer';
import { Fence } from 'parts/fence';

export class SimulatorApp extends PIXI.Container {

  constructor(public readonly textures:PIXI.loaders.TextureDictionary) {
    super();
    this.partFactory = new PartFactory(textures);
    this.board = new Board(this.partFactory);
    this.toolbox = new Toolbox(this.board);
    this.toolbox.width = 64;
    this.board.view.x = this.toolbox.width;
    this.addChild(this.board.view);
    this.addChild(this.toolbox);
    this.initStandardBoard();
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

  public initStandardBoard(redBlueDistance:number=5, verticalDrop:number=11):void {
    let r:number, c:number, run:number;
    const width:number = (redBlueDistance * 2) + 3;
    const dropLevel:number = (width % 2 == 0) ? 1 : 0;
    const collectLevel:number = dropLevel + verticalDrop;
    const center:number = Math.floor(width / 2);
    const blueColumn:number = center - Math.floor(redBlueDistance / 2);
    const redColumn:number = center + Math.floor(redBlueDistance / 2);
    const steps:number = Math.ceil(center / Fence.maxModulus);
    const maxModulus:number = Math.ceil(center / steps);
    const height:number = collectLevel + steps + 1;
    this.board.setSize(width, height);
    // block out unreachable locations at the top
    const blank = this.partFactory.make(PartType.BLANK);
    blank.isLocked = true;
    for (r = 0; r < height; r++) {
      for (c = 0; c < width; c++) {
        const blueCantReach:boolean = 
          ((r + c) < (blueColumn + dropLevel)) || 
          ((c - r) > (blueColumn - dropLevel));
        const redCantReach:boolean = 
          ((r + c) < (redColumn + dropLevel)) || 
          ((c - r) > (redColumn - dropLevel));
        if (blueCantReach && redCantReach) {
          this.board.setPart(this.partFactory.copy(blank), c, r);
        }
      }
    }
    // add fences on the sides
    const fence = this.partFactory.make(PartType.FENCE);
    fence.isLocked = true;
    const flippedFence = this.partFactory.copy(fence);
    flippedFence.flip();
    for (r = dropLevel; r < collectLevel; r++) {
      this.board.setPart(this.partFactory.copy(fence), 0, r);
      this.board.setPart(this.partFactory.copy(flippedFence), width - 1, r);
    }
    // add collection fences at the bottom
    r = collectLevel;
    run = 0;
    for (c = 0; c < center; c++, run++) {
      if (run >= maxModulus) { r++; run = 0; }
      this.board.setPart(this.partFactory.copy(fence), c, r);
    }
    r = collectLevel;
    run = 0;
    for (c = width - 1; c > center; c--, run++) {
      if (run >= maxModulus) { r++; run = 0; }
      this.board.setPart(this.partFactory.copy(flippedFence), c, r);
    }
    // block out the unreachable locations at the bottom
    for (r = collectLevel; r < height; r++) {
      for (c = 0; c < width; c++) {
        if (this.board.getPart(c, r) instanceof Fence) break;
        this.board.setPart(this.partFactory.copy(blank), c, r);
      }
      for (c = width - 1; c >= 0; c--) {
        if (this.board.getPart(c, r) instanceof Fence) break;
        this.board.setPart(this.partFactory.copy(blank), c, r);
      }
    }
    // center the board in the display
    this.board.centerColumn = Math.floor(width / 2);
    this.board.centerRow = Math.floor(height / 2);
  }

}