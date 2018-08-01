import * as PIXI from 'pixi.js';

import { Engine, Composite, World, Events, Body, Bodies } from 'matter-js';
import { IBallRouter } from './router';
import { Board, SPACING_FACTOR } from './board';
import { Renderer } from 'renderer';
import { Ball } from 'parts/ball';

// the canonical part size the simulator runs at
export const PART_SIZE:number = 64;
export const SPACING:number = 68;

export class PhysicalBallRouter implements IBallRouter {

  constructor(public readonly board:Board) {
    this.engine = Engine.create();
    this.engine.enabled = false;
    Events.on(this.engine, 'afterUpdate', this.afterUpdate.bind(this));
    Engine.run(this.engine);
    // make walls to catch stray balls
    this._createWalls();
    // get initial board state
    this.onBoardChanged();
  }
  public readonly engine:Engine;

  public onBoardSizeChanged():void {
    // rescale the wireframe to match the board spacing
    if (this._wireframe) {
      const scale = this.board.spacing / SPACING;
      this._wireframe.scale.set(scale, scale);
      this.renderWireframe();
    }
    // update the walls around the board
    this._updateWalls();
  }

  private _createWalls():void {
    const options = { isStatic: true };
    this._top = Bodies.rectangle(0, 0, this._wallWidth, this._wallThickness, options);
    this._bottom = Bodies.rectangle(0, 0, this._wallWidth, this._wallThickness, options);
    this._left = Bodies.rectangle(0, 0, this._wallThickness, this._wallHeight, options);
    this._right = Bodies.rectangle(0, 0, this._wallThickness, this._wallHeight, options);
    World.add(this.engine.world, [ this._top, this._right, this._bottom, this._left ]);
  }
  private _wallWidth:number = 16;
  private _wallHeight:number = 16;
  private _wallThickness:number = 16;

  private _updateWalls():void {
    const w:number = ((this.board.columnCount + 2) * SPACING);
    const h:number = ((this.board.rowCount + 2) * SPACING);
    const hw:number = (w - this._wallThickness) / 2;
    const hh:number = (h + this._wallThickness) / 2;
    const cx:number = ((this.board.columnCount - 1) / 2) * SPACING;
    const cy:number = ((this.board.rowCount - 1) / 2) * SPACING;
    Body.setPosition(this._top, { x: cx, y: cy - hh });
    Body.setPosition(this._bottom, { x: cx, y: cy + hh });
    Body.setPosition(this._left, { x: cx - hw, y: cy });
    Body.setPosition(this._right, { x: cx + hw, y: cy });
    const sx = w / this._wallWidth;
    const sy = h / this._wallHeight;
    if (sx != 1.0) {
      Body.scale(this._top, sx, 1.0);
      Body.scale(this._bottom, sx, 1.0);
    }
    if (sy != 1.0) {
      Body.scale(this._left, 1.0, sy);
      Body.scale(this._right, 1.0, sy);
    }
    this._wallWidth = w;
    this._wallHeight = h;
  }
  private _top:Body;
  private _right:Body;
  private _bottom:Body;
  private _left:Body;

  public onBoardChanged():void {
    // add balls to the world
    for (const ball of this.board.balls) {
      if (! this._balls.has(ball)) {
        this._balls.add(ball);
        World.addBody(this.engine.world, ball.getBody());
      }
    }
    this.renderWireframe();
  }
  private _balls:Set<Ball> = new Set();

  // UPDATING *****************************************************************

  public start():void {
    this.engine.enabled = true;
  }

  public stop():void {
    this.engine.enabled = false;
  }

  public afterUpdate():void {
    // transfer ball positions
    for (const ball of this.board.balls) {
      ball.readBody();
      this.board.layoutPart(ball, ball.column, ball.row);
    }
    // re-render the wireframe if there is one
    this.renderWireframe();
  }

  // WIREFRAME PREVIEW ********************************************************

  public get showWireframe():boolean {
    return(this._wireframe ? true : false);
  }
  public set showWireframe(v:boolean) {
    if ((v) && (! this._wireframe)) {
      this._wireframe = new PIXI.Sprite();
      this._wireframeGraphics = new PIXI.Graphics();
      this._wireframe.addChild(this._wireframeGraphics);
      this.board._layers.addChild(this._wireframe);
      this.onBoardSizeChanged();
      this.renderWireframe();
    }
    else if ((! v) && (this._wireframe)) {
      this.board._layers.removeChild(this._wireframe);
      this._wireframe = null;
      this._wireframeGraphics = null;
      Renderer.needsUpdate();
    }
  }
  private _wireframe:PIXI.Sprite;
  private _wireframeGraphics:PIXI.Graphics;

  public renderWireframe():void {
    if (! this._wireframe) return;
    // setup
    const g = this._wireframeGraphics;
    g.clear();
    g.lineStyle(1 / this._wireframe.scale.x, 0xFF0000, 1);
    // draw all bodies
    var bodies = Composite.allBodies(this.engine.world);
    for (const body of bodies) {
      // draw the vertices of the body
      let first:boolean = true;
      for (const vertex of body.vertices) {
        if (first) {
          g.moveTo(vertex.x, vertex.y);
          first = false;
        }
        else {
          g.lineTo(vertex.x, vertex.y);
        }
      }
      g.closePath();
    }
    Renderer.needsUpdate();
  }

}