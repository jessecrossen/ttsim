import * as PIXI from 'pixi.js';

import { Engine, Composite, World, Events, Body, Bodies, Vector, Render } from 'matter-js';
import { IBallRouter } from './router';
import { Board } from './board';
import { Renderer } from 'renderer';
import { Part } from 'parts/part';
import { Ball } from 'parts/ball';
import { Colors, Alphas } from 'ui/config';
import { GearBase } from 'parts/gearbit';

import { SPACING } from './constants';

export class PhysicalBallRouter implements IBallRouter {

  constructor(public readonly board:Board) {
    this.engine = Engine.create();
    // make walls to catch stray balls
    this._createWalls();
    // capture initial board state
    this.beforeUpdate();
  }
  public readonly engine:Engine;

  public onBoardSizeChanged():void {
    // update the walls around the board
    this._updateWalls();
    // re-render the wireframe
    this.renderWireframe();
    // capture changes to board state
    this.beforeUpdate();
  }

  // UPDATING *****************************************************************

  public update(correction:number):void {
    this.beforeUpdate();
    Engine.update(this.engine, 1000 / 60, correction);
    this.afterUpdate();
  }

  public beforeUpdate():void {
    this.addNeighborParts(this._boardChangeCounter !== this.board.changeCounter);
    this._boardChangeCounter = this.board.changeCounter;
  }
  private _boardChangeCounter:number = -1;

  public afterUpdate():void {
    // transfer part positions
    for (const part of this._dynamicParts) {
      part.readBody();
      if (part.bodyCanMove) {
        this.board.layoutPart(part, part.column, part.row);
      }
    }
    // re-render the wireframe if there is one
    this.renderWireframe();
    // re-render the whole display if we're managing parts
    if (this._parts.size > 0) Renderer.needsUpdate();
  }

  // STATE MANAGEMENT *********************************************************

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
    const w:number = ((this.board.columnCount + 3) * SPACING);
    const h:number = ((this.board.rowCount + 3) * SPACING);
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

  protected addNeighborParts(force:boolean = false):void {
    // track any balls that may have been removed from the board
    const removedBalls:Set<Ball> = new Set(this._ballNeighbors.keys());
    for (const ball of this.board.balls) {
      const column = Math.round(ball.column);
      const row = Math.round(ball.row);
      // remove balls that drop off the board
      if (Math.round(row) > this.board.rowCount) {
        this.board.removeBall(ball);
        continue;
      }
      removedBalls.delete(ball);
      // don't update for balls in the same locality (unless forced to)
      if ((! force) && (ball.lastColumn === column) && 
                       ((ball.lastRow === row) || 
                        (ball.lastRow === row + 1))) continue;
      if (! this._ballNeighbors.has(ball)) {
        this.addPart(ball);
        this._ballNeighbors.set(ball, new Set());
      }
      const newNeighbors:Set<Part> = new Set();
      const oldNeighbors:Set<Part> = this._ballNeighbors.get(ball);
      for (let c:number = -1; c <= 1; c++) {
        for (let r:number = -1; r <= 1; r++) {
          const part = this.board.getPart(column + c, row + r);
          if (! part) continue;
          newNeighbors.add(part);
          oldNeighbors.delete(part);
        }
      }
      for (const part of newNeighbors) this.addPart(part);
      for (const part of oldNeighbors) this.removePart(part);
      this._ballNeighbors.set(ball, newNeighbors);
      ball.lastColumn = column;
      ball.lastRow = row;
    }
    // remove balls and neighbors for any balls no longer on the board
    for (const ball of removedBalls) {
      this.removePart(ball);
      if (this._ballNeighbors.has(ball)) {
        for (const part of this._ballNeighbors.get(ball)) {
          this.removePart(part);
        }
      }
    }
  }
  protected _ballNeighbors:Map<Ball,Set<Part>> = new Map();

  protected addPart(part:Part):void {
    if (this._parts.has(part)) return; // make it idempotent
    this._parts.add(part);
    const body = part.getBody();
    if (body) {
      World.add(this.engine.world, body);
      if (! body.isStatic) this._dynamicParts.add(part);
    }
    const constraints = part.constraints;
    if (constraints) World.add(this.engine.world, constraints);
  }
  protected removePart(part:Part):void {
    if (! this._parts.has(part)) return; // make it idempotent
    this._parts.delete(part);
    this._dynamicParts.delete(part);
    const body = part.getBody();
    if (body) World.remove(this.engine.world, body);
    const constraints = part.constraints;
    if (constraints) {
      for (const constraint of constraints) {
        World.remove(this.engine.world, constraint);
      }
    }
    this._restoreRestingRotation(part);
  }
  private _parts:Set<Part> = new Set();
  private _dynamicParts:Set<Part> = new Set();

  // restore the rotation of the part if it has one
  protected _restoreRestingRotation(part:Part):void {
    if (part.rotation === part.restingRotation) return;
    // ensure we don't "restore" a gear that's still connected
    //  to a chain that's being simulated
    if (part instanceof GearBase) {
      for (const gear of part.connected) {
        if (this._dynamicParts.has(gear)) return;
      }
    }
    // !!! investigate why these have a different effect
    //part.animateRotation(part.restingRotation, 0.1);
    part.rotation = part.restingRotation;
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
    const scale = this.board.spacing / SPACING;
    // draw all bodies
    var bodies = Composite.allBodies(this.engine.world);
    for (const body of bodies) {
      this._drawBody(g, body, scale);
    }
    Renderer.needsUpdate();
  }
  protected _drawBody(g:PIXI.Graphics, body:Body, scale:number):void {
    if (body.parts.length > 1) {
      // if the body has more than one part, the first is the convex hull, which
      //  we draw in a different color to distinguish it
      this._drawVertices(g, body.vertices, Colors.WIREFRAME_HULL, scale);
      for (let i:number = 1; i < body.parts.length; i++) {
        this._drawBody(g, body.parts[i], scale);
      }
    }
    // otherwise this is a terminal part
    else {
      this._drawVertices(g, body.vertices, Colors.WIREFRAME, scale);
    }
  }
  protected _drawVertices(g:PIXI.Graphics, vertices:Vector[], color:number, scale:number):void {
    g.lineStyle(1, color);
    g.beginFill(color, Alphas.WIREFRAME);
    // draw the vertices of the body
    let first:boolean = true;
    for (const vertex of vertices) {
      if (first) {
        g.moveTo(vertex.x * scale, vertex.y * scale);
        first = false;
      }
      else {
        g.lineTo(vertex.x * scale, vertex.y * scale);
      }
    }
    g.closePath();
    g.endFill();
  }

}