import * as PIXI from 'pixi.js';

import { Engine, Composite, World } from 'matter-js';
import { IBallRouter } from './router';
import { Board, SPACING_FACTOR } from './board';

// the canonical part size the simulator runs at
export const PART_SIZE:number = 64;
// the spacing between simulated parts
export const SPACING:number = PART_SIZE * SPACING_FACTOR;

export class PhysicalBallRouter implements IBallRouter {

  constructor(public readonly board:Board) {
    this.engine = Engine.create();
    // get initial board state
    this.onBoardChanged();
  }
  public readonly engine:Engine;

  public onPartSizeChanged():void {
    // rescale the wireframe to match the board spacing
    if (this._wireframe) {
      const scale = this.board.spacing / SPACING;
      this._wireframe.scale.set(scale, scale);
    }
  }

  public onBoardChanged():void {
    // add balls to the world
    for (const ball of this.board.balls) {
      const body = ball.getBody();
      if (! body.parent) World.addBody(this.engine.world, body);
    }
    this.renderWireframe();
  }

  // WIREFRAME PREVIEW ********************************************************

  public get showWireframe():boolean {
    return(this._wireframe ? true : false);
  }
  public set showWireframe(v:boolean) {
    if ((v) && (! this._wireframe)) {
      this._wireframe = new PIXI.Graphics();
      this.board._layers.addChild(this._wireframe);
    }
    else if ((! v) && (this._wireframe)) {
      this.board._layers.removeChild(this._wireframe);
      this._wireframe = null;
    }
  }
  private _wireframe:PIXI.Graphics;

  public renderWireframe():void {
    if (! this._wireframe) return;
    // setup
    const g = this._wireframe;
    g.clear();
    g.lineStyle(2, 0xFF0000, 0.5);
    // draw all bodies
    var bodies = Composite.allBodies(this.engine.world);
    for (const body of bodies) {
      let first:boolean = false;
      for (const vertex of body.vertices) {
        if (first) {
          g.moveTo(vertex.x, vertex.y);
          first = false;
        }
        else {
          g.lineTo(vertex.x, vertex.y);
        }
      }
      g.lineTo(body.vertices[0].x, body.vertices[0].y);
    }
  }

}