import * as filter from 'pixi-filters';

import { Part, Layer } from 'parts/part';
import { Slope, Side } from 'parts/fence';
import { PartFactory, PartType } from 'parts/factory';
import { GearBase, Gear } from 'parts/gearbit';
import { Alphas, Delays, Sizes, Zooms, Speeds, Colors } from 'ui/config';
import { DisjointSet } from 'util/disjoint';
import { Renderer } from 'renderer';
import { Ball } from 'parts/ball';
import { BALL_RADIUS, SPACING } from './constants';
import { PhysicalBallRouter } from './physics';
import { SchematicBallRouter } from './schematic';
import { IBoardSerializer } from './serializer';
import { Drop } from 'parts/drop';
import { ColorWheel, DropButton, TurnButton, BallCounter } from './controls';
import { Animator } from 'ui/animator';
import { Turnstile } from 'parts/turnstile';
import { makeKeyHandler } from 'ui/keyboard';

export const enum ToolType {
  NONE, MIN = NONE,
  PART,
  ERASER,
  HAND, MAX = HAND
}

export const enum ActionType {
  PAN,
  PLACE_PART,
  PLACE_BALL,
  CLEAR_PART,
  FLIP_PART,
  DRAG_PART,
  COLOR_WHEEL,
  DROP_BALL,
  TURN_TURNSTILE,
  RESIZE_BOARD
}
export const enum ActionSide { LEFT, TOP, RIGHT, BOTTOM }

export const SPACING_FACTOR:number = 1.0625;

type LayerToContainerMap = Map<Layer,PIXI.Container>;

export class Board {

  constructor(public readonly partFactory:PartFactory) {
    this._bindMouseEvents();
    this.view.addChild(this._layers);
    this._initContainers();
    this._updateDropShadows();
    this._makeControls();
    this._bindKeyEvents();
  }
  public readonly view:PIXI.Sprite = new PIXI.Sprite();
  public readonly _layers:PIXI.Container = new PIXI.Container();

  // a serializer for the board state
  public serializer:IBoardSerializer = null;

  // the set of balls currently on the board
  public readonly balls:Set<Ball> = new Set();

  // a counter that increments whenever the board changes
  public get changeCounter():number { return(this._changeCounter); }
  public onChange():void {
    this._changeCounter++;
    this._spriteChangeCounter++;
    if (this.serializer) this.serializer.onBoardStateChanged();
  }
  private _changeCounter:number = 0;
  private _spriteChangeCounter:number = 0;

  // register changes to UI state
  public onUIChange():void {
    if (this.serializer) this.serializer.onUIStateChanged();
  }
  
  // whether to show parts in schematic form
  public get schematicView():boolean {
    return((this._schematic) || (this.spacing <= this.partSize));
  }

  // whether to route parts using the schematic router
  public get schematic():boolean { return(this._schematic); }
  public set schematic(v:boolean) {
    if (v === this._schematic) return;
    this._schematic = v;
    this._updateLayerVisibility();
    // return all balls because their positions will be different in the two
    //  routers and it can cause a lot of jumping and sticking
    this.returnBalls();
    this.onUIChange();
  }
  protected _schematic:boolean = false;

  // the speed to run the simulator at
  public get speed():number { return(this._speed); }
  public set speed(v:number) {
    if ((isNaN(v)) || (v == null)) return;
    v = Math.min(Math.max(Speeds[0], v), Speeds[Speeds.length - 1]);
    if (v === this.speed) return;
    this._speed = v;
    this.onUIChange();
  }
  private _speed:number = 1.0;

  // routers to manage the positions of the balls
  public readonly physicalRouter:PhysicalBallRouter = new PhysicalBallRouter(this);
  public readonly schematicRouter:SchematicBallRouter = 
    new SchematicBallRouter(this);

  // update the board state
  public update(correction:number):void {
    if (this.schematic) this.schematicRouter.update(this.speed, correction);
    else this.physicalRouter.update(this.speed, correction);
    if (++this._counter % 30 == 0) {
      this._areBallsAtRest = this._checkBallMovement();
      if (this.areBallsAtRest) this._checkBitRotations();
      this._counter = 0;
    }
    // update sprite visibility if the board changes
    if (this._spriteChangeCounter !== this._lastSpriteChangeCounter) {
      this._updateSpriteVisibility();
      this._lastSpriteChangeCounter = this._spriteChangeCounter;
  }
  }
  private _counter:number = 0;
  private _lastSpriteChangeCounter:number;

  // whether all balls on the board have been basically motionless for a bit
  public get areBallsAtRest():boolean { return(this._areBallsAtRest); }
  private _areBallsAtRest:boolean = true;

  // LAYERS *******************************************************************

  protected _updateSpriteVisibility():void {
    // get the row/column limits on sprite visibility
    const cx = this.xForColumn(this.centerColumn);
    const cy = this.yForRow(this.centerRow);
    const cMin = Math.floor(this.columnForX(cx - (this.width / 2)));
    const cMax = Math.ceil(this.columnForX(cx + (this.width / 2)));
    const rMin = Math.floor(this.rowForY(cy - (this.height / 2)));
    const rMax = Math.ceil(this.rowForY(cy + (this.height / 2)));
    // clamp to the limits of the actual grid
    const cMinGrid = Math.min(Math.max(0, cMin), this.columnCount);
    const cMaxGrid = Math.min(Math.max(0, cMax), this.columnCount);
    const rMinGrid = Math.min(Math.max(0, rMin), this.rowCount);
    const rMaxGrid = Math.min(Math.max(0, rMax), this.rowCount);
    // make a list of parts we should be showing at this time
    const visible:Set<Part> = new Set();
    // add parts from the grid
    let c:number, r:number, row:Part[], part:Part;
    for (r = rMinGrid; r < rMaxGrid; r++) {
      row = this._grid[r];
      for (c = cMinGrid; c < cMaxGrid; c++) {
        part = row[c];
        if (part) visible.add(part);
      }
    }
    // add balls
    for (const ball of this.balls) {
      if ((ball.column < cMin) || (ball.column > cMax) ||
          (ball.row < rMin) || (ball.row > rMax)) continue;
      visible.add(ball);
    }
    // add the prototype part if there is one
    if (this.partPrototype) visible.add(this.partPrototype);
    // remove sprites for parts that are no longer visible
    const invisible:Set<Part> = new Set();
    for (const part of this._visibleParts) {
      if (! visible.has(part)) invisible.add(part);
    }
    // remove sprites for parts that have become invisible
    for (const part of invisible) {
      this._removeSpritesForPart(part);
      this._visibleParts.delete(part);
    }
    // add sprites for parts that have just become visible
    for (const part of visible) {
      if (! this._visibleParts.has(part)) {
        this._addSpritesForPart(part);
        this._visibleParts.add(part);
      }
    }
  }
  private _visibleParts:Set<Part> = new Set();

  // add a part to the board's layers
  protected _addSpritesForPart(part:Part):void {
    for (let layer of this._containers.keys()) {
      const sprite = part.getSpriteForLayer(layer);
      if (! sprite) continue;
      // in non-schematic mode, add balls behind other parts to prevent ball 
      //  highlights from displaying on top of gears, etc.
      if ((part instanceof Ball) && (layer < Layer.SCHEMATIC)) {
        this._containers.get(layer).addChildAt(sprite, 0);
      }
      else {
        // in schematic mode, place other parts behind balls
        if ((layer >= Layer.SCHEMATIC) && (! (part instanceof Ball))) {
          this._containers.get(layer).addChildAt(sprite, 0);
        }
        else {
          this._containers.get(layer).addChild(sprite);
        }
      }
    }
    Renderer.needsUpdate();
  }

  // remove a part from the board's layers
  protected _removeSpritesForPart(part:Part):void {
    if (! part) return;
    for (let layer of this._containers.keys()) {
      const sprite = part.getSpriteForLayer(layer);
      if (! sprite) continue;
      const container = this._containers.get(layer);
      if (sprite.parent === container) container.removeChild(sprite);
    }
    Renderer.needsUpdate();
  }

  protected _initContainers():void {
    this._setContainer(Layer.BACK, false);
    this._setContainer(Layer.MID, false);
    this._setContainer(Layer.FRONT, false);
    this._setContainer(Layer.SCHEMATIC_BACK, true);
    this._setContainer(Layer.SCHEMATIC, true);
    this._setContainer(Layer.SCHEMATIC_4, true);
    this._setContainer(Layer.SCHEMATIC_2, true);
    this._setContainer(Layer.CONTROL, false);
    this._updateLayerVisibility();
  }
  private _containers:LayerToContainerMap = new Map();

  protected _setContainer(layer:Layer, highPerformance:boolean=false):void {
    const newContainer = this._makeContainer(highPerformance);
    if (this._containers.has(layer)) {
      const oldContainer = this._containers.get(layer);
      this._layers.removeChild(oldContainer);
      for (const child of oldContainer.children) {
        newContainer.addChild(child);
      }
    }
    this._containers.set(layer, newContainer);
    this._layers.addChild(newContainer);
  }

  protected _makeContainer(highPerformance:boolean=false):PIXI.Container {
    if (highPerformance) return(new PIXI.particles.ParticleContainer(16384, 
      {
        vertices: true,
        position: true, 
        rotation: true,
        tint: true,
        alpha: true
      }, 16384, true));
    else return(new PIXI.Container());
  }

  protected _updateDropShadows():void {
    this._containers.get(Layer.BACK).filters = [
      this._makeShadow(this.partSize / 32.0) ];
    this._containers.get(Layer.MID).filters = [
      this._makeShadow(this.partSize / 16.0) ];
    this._containers.get(Layer.FRONT).filters = [
      this._makeShadow(this.partSize / 8.0) ];
    this._containers.get(Layer.CONTROL).filters = [
      this._makeShadow(8.0) ];
  }

  protected _makeShadow(size:number):filter.DropShadowFilter {
    return(new filter.DropShadowFilter({
      alpha: 0.35,
      blur: size * 0.25,
      color: 0x000000,
      distance: size,
      kernels: null,
      pixelSize: 1,
      quality: 3,
      resolution: PIXI.settings.RESOLUTION,
      rotation: 45,
      shadowOnly: false
    }));
  }

  protected _updateFilterAreas():void {
    const tl = this.view.toGlobal(new PIXI.Point(0, 0));
    const br = this.view.toGlobal(
      new PIXI.Point(this.width, this.height));
    const area = new PIXI.Rectangle(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
    this._containers.get(Layer.BACK).filterArea = area;
    this._containers.get(Layer.MID).filterArea = area;
    this._containers.get(Layer.FRONT).filterArea = area;
  }

  protected _updateLayerVisibility():void {
    const showContainer = (layer:Layer, show:boolean) => {
      if (this._containers.has(layer)) this._containers.get(layer).visible = show;
    };
    showContainer(Layer.BACK, ! this.schematicView);
    showContainer(Layer.MID, ! this.schematicView);
    showContainer(Layer.FRONT, ! this.schematicView);
    showContainer(Layer.SCHEMATIC_BACK, this.schematicView && (this.partSize >= 12));
    showContainer(Layer.SCHEMATIC, this.schematicView);
    showContainer(Layer.SCHEMATIC_4, this.schematicView && (this.partSize == 4));
    showContainer(Layer.SCHEMATIC_2, this.schematicView && (this.partSize == 2));
    let showControls:boolean = false;
    for (const control of this._controls) {
      if (control.visible) {
        showControls = true;
        break;
      }
    }
    showContainer(Layer.CONTROL, showControls);
    Renderer.needsUpdate();
  }

  // controls
  protected _makeControls():void {
    this._ballCounter = new BallCounter();
    this._controls.push(this._ballCounter);
    this._dropButton = new DropButton(this.partFactory.textures);
    this._controls.push(this._dropButton);
    this._turnButton = new TurnButton(this.partFactory.textures);
    this._controls.push(this._turnButton);
    this._colorWheel = new ColorWheel(this.partFactory.textures);
    this._controls.push(this._colorWheel);
    this._resizeOverlay = new PIXI.Sprite();
    this._resizeOverlayGraphics = new PIXI.Graphics();
    this._resizeOverlay.addChild(this._resizeOverlayGraphics);
    this._controls.push(this._resizeOverlay);
    const container = this._containers.get(Layer.CONTROL);
    for (const control of this._controls) {
      control.visible = false;
      container.addChild(control);
    }
  }
  protected _showControl(control:PIXI.Sprite):void {
    if (! control.visible) control.alpha = 0.0;
    control.visible = true;
    Animator.current.animate(control, 'alpha', 0, 1, 
      Delays.SHOW_CONTROL);
    this._updateLayerVisibility();
  }
  protected _hideControl(control:PIXI.Sprite):void {
    Animator.current.animate(control, 'alpha', 1, 0, 
      Delays.HIDE_CONTROL, () => {
        control.visible = false;
        this._updateLayerVisibility();
      });
  }
  private _controls:PIXI.Sprite[] = [ ];
  private _colorWheel:ColorWheel;
  private _dropButton:DropButton;
  private _turnButton:TurnButton;
  private _ballCounter:BallCounter;
  private _resizeOverlay:PIXI.Sprite;
  private _resizeOverlayGraphics:PIXI.Graphics;

  protected _updateResizeOverlay(active:boolean, side:ActionSide, delta:number):void {
    const x0 = this.xForColumn(-1 - (side == ActionSide.LEFT ? delta : 0));
    const y0 = this.yForRow(-1 - (side == ActionSide.TOP ? delta : 0));
    const x1 = this.xForColumn(this.columnCount + (side == ActionSide.RIGHT ? delta : 0));
    const y1 = this.yForRow(this.rowCount + (side == ActionSide.BOTTOM ? delta : 0));
    const g = this._resizeOverlayGraphics;
    g.clear();
    g.lineStyle(2, active ? Colors.HIGHLIGHT : Colors.RESIZE_HINT, 0.75);
    if (active) g.beginFill(Colors.HIGHLIGHT, 0.25);
    g.drawRect(x0, y0, x1 - x0, y1 - y0);
    if (active) g.endFill();
    Renderer.needsUpdate();
  }

  // LAYOUT *******************************************************************

  // change the size to draw parts at
  public get partSize():number { return(this._partSize); }
  public set partSize(v:number) {
    if ((isNaN(v)) || (v == null)) return;
    v = Math.min(Math.max(Zooms[0], v), Zooms[Zooms.length - 1]);
    if (v === this._partSize) return;
    this._partSize = v;
    this.layoutParts();
    this._updateDropShadows();
    this._updateLayerVisibility();
    this._updatePan();
    this.physicalRouter.onBoardSizeChanged();
    this.schematicRouter.onBoardSizeChanged();
    this.onUIChange();
  }
  private _partSize:number = 64;

  // the width of the display area
  public get width():number { return(this._width); }
  public set width(v:number) {
    if (v === this._width) return;
    this._width = v;
    this.view.hitArea = new PIXI.Rectangle(0, 0, this._width, this._height);
    this._updatePan();
    this._updateFilterAreas();
  }
  private _width:number = 0;

  // the height of the display area
  public get height():number { return(this._height); }
  public set height(v:number) {
    if (v === this._height) return;
    this._height = v;
    this.view.hitArea = new PIXI.Rectangle(0, 0, this._width, this._height);
    this._updatePan();
    this._updateFilterAreas();
  }
  private _height:number = 0;

  // the fractional column and row to keep in the center
  public get centerColumn():number { return(this._centerColumn); }
  public set centerColumn(v:number) {
    if ((isNaN(v)) || (v == null)) return;
    v = Math.min(Math.max(0, v), this.columnCount - 1);
    if (v === this.centerColumn) return;
    this._centerColumn = v;
    this._updatePan();
    this._spriteChangeCounter++;
    this.onUIChange();
  }
  private _centerColumn:number = 0.0;
  public get centerRow():number { return(this._centerRow); }
  public set centerRow(v:number) {
    if ((isNaN(v)) || (v == null)) return;
    v = Math.min(Math.max(0, v), this.rowCount - 1);
    if (v === this.centerRow) return;
    this._centerRow = v;
    this._updatePan();
    this._spriteChangeCounter++;
    this.onUIChange();
  }
  private _centerRow:number = 0.0;

  protected _updatePan():void {
    this._layers.x = 
      Math.round((this.width / 2) - this.xForColumn(this.centerColumn));
    this._layers.y = 
      Math.round((this.height / 2) - this.yForRow(this.centerRow));
    this._updateFilterAreas();
    this._spriteChangeCounter++;
    Renderer.needsUpdate();
  }

  // do layout for one part at the given location
  public layoutPart(part:Part, column:number, row:number):void {
    if (! part) return;
    part.size = this.partSize;
    part.column = column;
    part.row = row;
    part.x = this.xForColumn(column);
    part.y = this.yForRow(row);
    this._spriteChangeCounter++;
  }

  // do layout for all parts on the grid
  public layoutParts():void {
    let r:number = 0;
    for (const row of this._grid) {
      let c:number = 0;
      for (const part of row) {
        this.layoutPart(part, c, r);
        c++;
      }
      r++;
    }
    for (const ball of this.balls) {
      this.layoutPart(ball, ball.column, ball.row);
    }
  }

  // get the spacing between part centers
  public get spacing():number { return(Math.floor(this.partSize * SPACING_FACTOR)); }
  // get the size of controls overlayed on the parts
  public get controlSize():number {
    return(Math.min(Math.max(16, Math.ceil(this.partSize * 0.75)), 32)); }
  
  // get the column for the given X coordinate
  public columnForX(x:number):number {
    return(x / this.spacing);
  }
  // get the row for the given X coordinate
  public rowForY(y:number):number {
    return(y / this.spacing);
  }

  // get the X coordinate for the given column index
  public xForColumn(column:number):number {
    return(Math.round(column * this.spacing));
  }
  // get the Y coordinate for the given row index
  public yForRow(row:number):number {
    return(Math.round(row * this.spacing));
  }

  // GRID MANAGEMENT **********************************************************

  // get the size of the part grid
  public get columnCount():number { return(this._columnCount); }
  private _columnCount:number = 0;
  public get rowCount():number { return(this._rowCount); }
  private _rowCount:number = 0;

  // storage for the part grid
  private _grid:Part[][] = [ ];

  // suspend expensive operations when updating parts in bulk
  public get bulkUpdate():boolean { return(this._bulkUpdate); }
  public set bulkUpdate(v:boolean) {
    if (v === this._bulkUpdate) return;
    this._bulkUpdate = v;
    // when finishing a bulk update, execute deferred tasks
    if (! v) {
      this._connectSlopes();
      this._connectTurnstiles();
      this._connectGears();
      // average gear rotations in connected sets
      for (const row of this._grid) {
        for (const part of row) {
          if (part instanceof GearBase) {
            part.rotation = part.rotation >= 0.5 ? 1.0 : 0.0;
          }
        }
      }
    }
  }
  private _bulkUpdate:boolean = false;

  public sizeRight(delta:number, addBackground:boolean=true):void {
    delta = Math.max(- this.columnCount, delta);
    if (delta == 0) return;
    const oldBulkUpdate = this.bulkUpdate;
    this.bulkUpdate = true;
    const newColumnCount:number = this.columnCount + delta;
    let c:number, r:number;
    if (delta < 0) {
      r = 0;
      for (const row of this._grid) {
        for (c = newColumnCount; c < this.columnCount; c++) {
          this.setPart(null, c, r);
        }
        row.splice(newColumnCount, - delta);
        r++;
      }
    }
    else {
      r = 0;
      for (const row of this._grid) {
        for (c = this.columnCount; c < newColumnCount; c++) {
          if (addBackground) {
            row.push(this.makeBackgroundPart(c, r));
          }
          else row.push(null);
        }
        r++;
      }
    }
    this._columnCount = newColumnCount;
    this.bulkUpdate = oldBulkUpdate;
    this.layoutParts();
    this.physicalRouter.onBoardSizeChanged();
    this.schematicRouter.onBoardSizeChanged();
    this.onChange();
  }

  public sizeBottom(delta:number, addBackground:boolean=true):void {
    delta = Math.max(- this.rowCount, delta);
    if (delta == 0) return;
    const oldBulkUpdate = this.bulkUpdate;
    this.bulkUpdate = true;
    const newRowCount:number = this.rowCount + delta;
    let c:number, r:number;
    if (delta < 0) {
      for (r = newRowCount; r < this.rowCount; r++) {
        for (c = 0; c < this.columnCount; c++) {
          this.setPart(null, c, r);
        }
      }
      this._grid.splice(newRowCount, - delta);
    }
    else {
      for (r = this.rowCount; r < newRowCount; r++) {
        const row:Part[] = [ ];
        for (c = 0; c < this.columnCount; c++) {
          if (addBackground) {
            row.push(this.makeBackgroundPart(c, r));
          }
          else row.push(null);
        }
        this._grid.push(row);
      }
    }
    this._rowCount = newRowCount;
    this.bulkUpdate = oldBulkUpdate;
    this.layoutParts();
    this.physicalRouter.onBoardSizeChanged();
    this.schematicRouter.onBoardSizeChanged();
    this.onChange();
  }

  public sizeLeft(delta:number, addBackground:boolean=true):void {
    // we must increase/decrease by even numbers to keep part/gear locations
    //  on the same diagonals
    if (delta % 2 !== 0) delta += 1;
    delta = Math.max(- this.columnCount, delta);
    if (delta == 0) return;
    const oldBulkUpdate = this.bulkUpdate;
    this.bulkUpdate = true;
    const newColumnCount:number = this.columnCount + delta;
    let c:number, r:number;
    if (delta < 0) {
      r = 0;
      for (const row of this._grid) {
        for (c = 0; c < Math.abs(delta); c++) {
          this.setPart(null, c, r);
        }
        row.splice(0, Math.abs(delta));
        r++;
      }
    }
    else {
      r = 0;
      for (const row of this._grid) {
        for (c = delta - 1; c >= 0; c--) {
          if (addBackground) {
            row.unshift(this.makeBackgroundPart(c, r));
          }
          else row.unshift(null);
        }
        r++;
      }
    }
    this._columnCount = newColumnCount;
    this.centerColumn += delta;
    this.bulkUpdate = oldBulkUpdate;
    this.layoutParts();
    this.physicalRouter.onBoardSizeChanged();
    this.schematicRouter.onBoardSizeChanged();
    this.onChange();
  }

  public sizeTop(delta:number, addBackground:boolean=true):void {
    // we must increase/decrease by even numbers to keep part/gear locations
    //  on the same diagonals
    if (delta % 2 !== 0) delta += 1;
    delta = Math.max(- this.rowCount, delta);
    if (delta == 0) return;
    const oldBulkUpdate = this.bulkUpdate;
    this.bulkUpdate = true;
    const newRowCount:number = this.rowCount + delta;
    let c:number, r:number, part:Part;
    if (delta < 0) {
      for (r = 0; r < Math.abs(delta); r++) {
        for (c = 0; c < this.columnCount; c++) {
          this.setPart(null, c, r);
        }
      }
      this._grid.splice(0, Math.abs(delta));
    }
    else {
      for (r = delta - 1; r >= 0; r--) {
        const row:Part[] = [ ];
        for (c = 0; c < this.columnCount; c++) {
          if (addBackground) {
            part = this.makeBackgroundPart(c, r);
            this.layoutPart(part, c, r);
            row.push(part);
          }
          else row.push(null);
        }
        this._grid.unshift(row);
      }
    }
    this._rowCount = newRowCount;
    this.centerRow += delta;
    this.bulkUpdate = oldBulkUpdate;
    this.layoutParts();
    this.physicalRouter.onBoardSizeChanged();
    this.schematicRouter.onBoardSizeChanged();
    this.onChange();
  }

  // update the part grid
  public setSize(columnCount:number, rowCount:number, addBackground:boolean=true):void {
    this.sizeRight(columnCount - this.columnCount, addBackground);
    this.sizeBottom(rowCount - this.rowCount, addBackground);
  }

  // remove everything from the board
  public clear(addBackground:boolean=true):void {
    const oldBulkUpdate = this.bulkUpdate;
    this.bulkUpdate = true;
    // remove parts
    let part:Part;
    for (let r:number = 0; r < this.rowCount; r++) {
      for (let c:number = 0; c < this.columnCount; c++) {
        part = addBackground ? this.makeBackgroundPart(c, r) : null;
        this.setPart(part, c, r);
      }
    }
    // remove balls
    this.clearBalls();
    this.bulkUpdate = oldBulkUpdate;
  }

  // remove balls from the board
  public clearBalls():void {
    for (const ball of this.balls) this.removeBall(ball);
  }

  // whether a part can be placed at the given row and column
  public canPlacePart(type:PartType, column:number, row:number):boolean {
    if (type == PartType.BALL) {
      return((row >= 0.0) && (column >= 0.0) &&
             (row < this.rowCount) && (column < this.columnCount));
    }
    if ((column < 0) || (column >= this._columnCount) ||
        (row < 0) || (row >= this._rowCount)) return(false);
    const oldPart = this.getPart(column, row);
    if ((oldPart) && (oldPart.isLocked)) return(false);
    else if ((type == PartType.PARTLOC) || (type == PartType.GEARLOC) ||
             (type == PartType.GEAR) || (type == PartType.SLOPE) ||
             (type == PartType.SIDE)) return(true);
    else return((row + column) % 2 == 0);
  }

  // whether the part at the given location can be flipped
  public canFlipPart(column:number, row:number):boolean {
    const part = this.getPart(column, row);
    return((part) && (part.canFlip || part.canRotate) && (! part.isLocked));
  }

  // whether the part at the given location can be dragged
  public canDragPart(column:number, row:number):boolean {
    const part = this.getPart(column, row);
    return((part) && (part.type !== PartType.GEARLOC) && 
                     (part.type !== PartType.PARTLOC) &&
                     (part.type !== PartType.BLANK) &&
                     (! part.isLocked));
  }

  // whether the part at the given location is a background part
  public isBackgroundPart(column:number, row:number):boolean {
    const part = this.getPart(column, row);
    return((! part) || 
           (part.type === PartType.PARTLOC) ||
           (part.type === PartType.GEARLOC));
  }

  // make a background part for the given row and column position
  public makeBackgroundPart(column:number, row:number):Part {
    return(this.partFactory.make(
      (row + column) % 2 == 0 ?
        PartType.PARTLOC : PartType.GEARLOC));
  }

  // set the tool to use when the user clicks
  public get tool():ToolType { return(this._tool); }
  public set tool(v:ToolType) {
    if (! (v >= 0)) return;
    v = Math.min(Math.max(ToolType.MIN, v), ToolType.MAX);
    if (v === this._tool) return;
    this._tool = v;
    this.onUIChange();
  }
  private _tool:ToolType = ToolType.HAND;

  // set the part used as a prototype for adding parts
  public get partPrototype():Part { return(this._partPrototype); }
  public set partPrototype(p:Part) {
    if (p === this._partPrototype) return;
    if (this._partPrototype) {
      this._partPrototype.alpha = 1.0;
      this._partPrototype.visible = true;
    }
    this._partPrototype = p;
    if (this._partPrototype) {
      // clear the part if the prototype is being pulled off the board
      if (p instanceof Ball) this.removeBall(p);
      else if (this.getPart(p.column, p.row) === p) {
        this.clearPart(p.column, p.row);
      }
      this._partPrototype.alpha = Alphas.PREVIEW_ALPHA;
      this._partPrototype.visible = false;
    }
    this._spriteChangeCounter++;
    this.onUIChange();
  }
  private _partPrototype:Part = null;

  // get the part at the given coordinates
  public getPart(column:number, row:number):Part {
    if ((isNaN(column)) || (isNaN(row)) ||
        (column < 0) || (column >= this._columnCount) ||
        (row < 0) || (row >= this._rowCount)) return(null);
    return(this._grid[row][column]);
  }

  // set the part at the given coordinates
  public setPart(newPart:Part, column:number, row:number):void {
    if ((column < 0) || (column >= this._columnCount) ||
        (row < 0) || (row >= this._rowCount)) return;
    const oldPart = this.getPart(column, row);
    if (oldPart === newPart) return;
    this._grid[row][column] = newPart;
    if (newPart) this.layoutPart(newPart, column, row);
    // tell gears what kind of location they're on
    if (newPart instanceof Gear) {
      newPart.isOnPartLocation = ((column + row) % 2) == 0;
    }
    // update gear connections
    if ((oldPart instanceof GearBase) || (newPart instanceof GearBase)) {
      // disconnect the old part
      if (oldPart instanceof GearBase) oldPart.connected = null;
      // rebuild connections between gears and gearbits
      if (! this.bulkUpdate) this._connectGears();
      // merge the new part's rotation with the connected set
      if ((newPart instanceof GearBase) && (newPart.connected)) {
        let sum:number = 0.0;
        for (const part of newPart.connected) {
          sum += part.rotation;
        }
        newPart.rotation = ((sum / newPart.connected.size) >= 0.5) ? 1.0 : 0.0;
      }
    }
    // update fences
    if ((oldPart instanceof Slope) || (newPart instanceof Slope)) {
      if (! this.bulkUpdate) this._connectSlopes();
    }
    // maintain our set of drops
    if ((oldPart instanceof Drop) && (oldPart !== this.partPrototype)) {
      this.drops.delete(oldPart);
      for (const ball of oldPart.balls) {
        this.removeBall(ball);
      }
    }
    if (newPart instanceof Drop) {
      this.drops.add(newPart);
      newPart.onRelease = () => {
        if ((this._ballCounter.visible) &&
            (this._ballCounter.drop === newPart)) this._ballCounter.update();
      };
    }
    if ((oldPart instanceof Drop) || (newPart instanceof Drop) ||
        (oldPart instanceof Turnstile) || (newPart instanceof Turnstile)) {
      if (! this.bulkUpdate) this._connectTurnstiles();
    }
    // remove and destroy sprites for the old part to avoid memory leaks
    if ((oldPart) && (oldPart !== this.partPrototype)) {
      this._removeSpritesForPart(oldPart);
      oldPart.destroySprites();
    }
    this.onChange();
  }
  
  // flip the part at the given coordinates
  public flipPart(column:number, row:number):void {
    const part = this.getPart(column, row);
    if ((part instanceof Slope) || (part instanceof Side)) {
      this._flipFence(column, row);
    }
    else if (part) part.flip(Delays.FLIP);
    this.onChange();
  }

  // clear parts from the given coordinates
  public clearPart(column:number, row:number):void {
    this.setPart(this.makeBackgroundPart(column, row), column, row);
  }

  // add a ball to the board
  public addBall(ball:Ball, c:number, r:number) {
    if (! this.balls.has(ball)) {
      this.balls.add(ball);
      this.layoutPart(ball, c, r);
      // assign the ball to a drop if it doesn't have one
      if (! ball.drop) {
        let drop = this.catchmentDrop(c, r);
        if (drop) {
          ball.released = false;
        }
        else {
          ball.released = true;
          drop = this.nearestDrop(c, r);
        }
        if (drop) {
          this.drops.add(drop);
          drop.balls.add(ball);
          ball.drop = drop;
          ball.hue = drop.hue;
        }
      }
      // update the ball counter
      if (this._ballCounter.visible) this._ballCounter.update();
      this.onChange();
    }
    this._spriteChangeCounter++;
  }

  // remove a ball from the board
  public removeBall(ball:Ball) {
    if (this.balls.has(ball)) {
      if (ball.drop) ball.drop.balls.delete(ball);
      this.balls.delete(ball);
      // update the ball counter
      if (this._ballCounter.visible) this._ballCounter.update();
      Renderer.needsUpdate();
      this.onChange();
    }
  }

  // add a ball to the given drop without returning all balls to it
  public addBallToDrop(drop:Drop):void {
    // get the highest ball associated with the drop
    let topBall:Ball;
    for (const ball of drop.balls) {
      if ((! topBall) || (ball.row < topBall.row)) {
        topBall = ball;
      }
    }
    // get the fraction of a grid unit a ball's radius takes up
    const radius:number = BALL_RADIUS / SPACING;
    let c:number = drop.column;
    let r:number = drop.row;
    // if the highest ball is on or above the drop, add the new ball above it
    if ((topBall) && (topBall.row <= drop.row + (0.5 - radius))) {
      c = topBall.column;
      r = topBall.row - (2 * radius);
    }
    this.addBall(this.partFactory.make(PartType.BALL) as Ball, c, Math.max(-0.5, r));
  }

  // fill the drop with the given number of balls, adjusting its total count
  public setDropBallCount(drop:Drop, count:number=drop.balls.size) {
    // turn off bulk updating so we can make sure slopes are configured properly
    const oldBulkUpdate = this.bulkUpdate;
    this.bulkUpdate = false;
    // remove all existing balls (we'll create new ones)
    for (const ball of drop.balls) {
      this.removeBall(ball);
    }
    // dividing each grid square into thirds, make a list of all open locations
    const spots:{c:number,r:number}[] = [ ];
    // find all grid locations that drain into the drop
    let part:Part, x:number, y:number, t:PartType;
    for (let r:number = drop.row; r >= -1; r--) {
      for (let c:number = 0; c < this.columnCount; c++) {
        if (this.catchmentDrop(c, r) !== drop) continue;
        // add up to 9 locations for each grid unit
        part = this.getPart(c, r);
        t = part ? part.type : PartType.BLANK;
        if ((t == PartType.BLANK) || (t == PartType.DROP) || 
            (t == PartType.SIDE) || (t == PartType.PARTLOC) || 
            (t == PartType.GEARLOC)) {
          for (x = -1; x <= 1; x++) {
            for (y = -1; y <= 1; y++) {
              // leave room for the pins on part/gear locations
              if ((x == 0) && (y == 0) && (! this.schematic) && 
                  ((t == PartType.GEARLOC) || (t == PartType.PARTLOC))) {
                continue;
              }
              spots.push({ c: c + (x / 3), r: r + (y / 3) });
            }
          }
        }
        // slopes require special handling so that we don't 
        //  place balls below the fence
        else if (part instanceof Slope) {
          const left = part.sequence / part.modulus;
          const right = (part.sequence + 1) / part.modulus;
          const sign = part.isFlipped ? -1 : 1;
          for (x = -1; x <= 1; x++) {
            const bottom = ((right + left) / 2) + 
              ((x / 3) * sign * (right - left)) - 0.5 - (1 / 6);
            for (y = -1; y <= 1; y++) {
              if ((y / 3) > bottom) continue;
              spots.push({ c: c + (x / 3), r: r + (y / 3) });
            }
          }
        }
      }
    }
    // sort all the spots from bottom to top and center to edge
    spots.sort((a, b) => {
      if (a.r > b.r) return(-1);
      if (a.r < b.r) return(1);
      if (Math.abs(a.c - drop.column) < Math.abs(b.c - drop.column)) return(-1);
      if (Math.abs(a.c - drop.column) > Math.abs(b.c - drop.column)) return(1);
      return(0);
    });
    // place balls in the spots
    for (let i:number = 0; i < count; i++) {
      const spot = spots[i % spots.length]; // re-use spots if we run out
      this.addBall(this.partFactory.make(PartType.BALL) as Ball, 
                   spot.c, spot.r);
    }
    this.bulkUpdate = oldBulkUpdate;
  }

  // return all balls to their appropriate drops
  public returnBalls():void {
    for (const drop of this.drops) {
      this.setDropBallCount(drop);
    }
  }

  // get the ball under the given point in fractional column/row units
  public ballUnder(column:number, row:number):Ball {
    const radius = (BALL_RADIUS / SPACING) * 1.2;
    let closest:Ball = null;
    let minDistance:number = Infinity;
    for (const ball of this.balls) {
      const dx:number = Math.abs(column - ball.column);
      const dy:number = Math.abs(row - ball.row);
      if ((dx > radius) || (dy > radius)) continue;
      const d:number = Math.sqrt((dx * dx) + (dy * dy));
      if (d < minDistance) {
        closest = ball;
        minDistance = d;
      }
    }
    return(closest);
  }

  // keep a set of all drops on the board
  public readonly drops:Set<Drop> = new Set();

  // return the drop that would definitely collect a ball dropped at the given
  //  location, or null if it won't definitely reach one
  public catchmentDrop(c:number, r:number):Drop {
    c = Math.round(c);
    r = Math.max(0, Math.round(r));
    let lc:number = c; // the last column the ball was in
    while ((r < this.rowCount) && (c >= 0) && (c < this.columnCount)) {
      const p = this.getPart(c, r);
      // don't go off the board
      if (! p) break;
      // if we hit a drop we're done
      if (p instanceof Drop) return(p);
      // follow deterministic parts
      else if (p.type == PartType.SLOPE) {
        c += p.isFlipped ? -1 : 1;
      }
      else if (p.type == PartType.RAMP) {
        c += p.isFlipped ? -1 : 1;
        r++;
      }
      else if (p.type == PartType.CROSSOVER) {
        if (lc < c) { c++; r++; }
        else if (lc > c) { c--; r++; }
        else break; // a vertical drop onto a crossover is non-deterministic
      }
      // this stops the fall
      else if (p.type == PartType.INTERCEPTOR) break;
      // these are non-deterministic
      else if ((p.type == PartType.BIT) || (p.type == PartType.GEARBIT)) break;
      // in all other cases, assume an uncontrolled fall
      else r++;
      lc = c;
    }
    return(null);
  }

  // return the drop that's closest to the given location
  public nearestDrop(c:number, r:number):Drop {
    let nearest:Drop = null;
    let minDistance:number = Infinity;
    for (const drop of this.drops) {
      const d = Math.pow(c - drop.column, 2) + Math.pow(r - drop.row, 2);
      if (d < minDistance) {
        minDistance = d;
        nearest = drop;
      }
    }
    return(nearest);
  }

  // connect adjacent sets of gears
  //  see: https://en.wikipedia.org/wiki/Connected-component_labeling
  protected _connectGears():void {
    let r:number;
    let c:number;
    let label:number = 0;
    let min:number, max:number;
    let westPart:Part, westLabel:number;
    let northPart:Part, northLabel:number;
    let allGears:Set<GearBase> = new Set();
    for (const row of this._grid) {
      for (const part of row) {
        if (part instanceof GearBase) allGears.add(part);
      }
    }
    let equivalence:DisjointSet = new DisjointSet(allGears.size);
    r = 0;
    for (const row of this._grid) {
      c = 0;
      westPart = null;
      for (const part of row) {
        northPart = r > 0 ? this.getPart(c, r - 1) : null;
        if (part instanceof GearBase) {
          northLabel = (northPart instanceof GearBase) ? 
            northPart._connectionLabel : -1;
          westLabel = (westPart instanceof GearBase) ? 
            westPart._connectionLabel : -1;
          if ((northLabel >= 0) && (westLabel >= 0)) {
            if (northLabel === westLabel) {
              part._connectionLabel = northLabel;
            }
            else {
              min = Math.min(northLabel, westLabel);
              max = Math.max(northLabel, westLabel);
              part._connectionLabel = min;
              equivalence.mergeSets(min, max);
            }
          }
          else if (northLabel >= 0) {
            part._connectionLabel = northLabel;
          }
          else if (westLabel >= 0) {
            part._connectionLabel = westLabel;
          }
          else part._connectionLabel = label++;
        }
        westPart = part;
        c++;
      }
      r++;
    }
    // group labeled gears into sets
    const sets:Map<number,Set<GearBase>> = new Map();
    for (const part of allGears) {
      label = equivalence.getRepr(part._connectionLabel);
      if (! sets.has(label)) sets.set(label, new Set());
      const set = sets.get(label);
      set.add(part);
      part.connected = set;
    }
  }

  // connect turnstiles to their nearest drops
  protected _connectTurnstiles():void {
    for (const row of this._grid) {
      for (const part of row) {
        if (part instanceof Turnstile) {
          part.drop = this.nearestDrop(part.column, part.row);
        }
      }
    }
  }

  // configure slope angles by grouping adjacent ones
  protected _connectSlopes():void {
    let slopes:Slope[] = [ ];
    for (const row of this._grid) {
      for (const part of row) {
        if (part instanceof Slope) {
          if ((slopes.length > 0) && 
              (slopes[0].isFlipped !== part.isFlipped)) {
            this._makeSlope(slopes);
          }
          slopes.push(part);
        }
        else if (slopes.length > 0) {
          this._makeSlope(slopes);
        }
      }
      if (slopes.length > 0) {
        this._makeSlope(slopes);
      }
    }
  }
  // configure a horizontal run of fence parts
  protected _makeSlope(slopes:Slope[]):void {
    if (! (slopes.length > 0)) return;
    for (let i:number = 0; i < slopes.length; i++) {
      slopes[i].modulus = slopes.length;
      slopes[i].sequence = slopes[i].isFlipped ? 
        ((slopes.length - 1) - i) : i;
    }
    slopes.splice(0, slopes.length);
  }
  // flip a fence part
  protected _flipFence(column:number, row:number) {
    const part:Part = this.getPart(column, row);
    if ((! (part instanceof Slope)) && (! (part instanceof Side))) return;
    const wasFlipped:boolean = part.isFlipped;
    const type:PartType = part.type;
    part.flip();
    // make a test function to shorten the code below
    const shouldContinue = (part:Part):boolean => {
      if ((part.isFlipped == wasFlipped) && (part.type == type)) {
        part.flip();
        return(true);
      }
      return(false);
    };
    if (part instanceof Slope) {
      // go right
      for (let c:number = column + 1; c < this._columnCount; c++) {
        if (! shouldContinue(this.getPart(c, row))) break;
      }
      // go left
      for (let c:number = column - 1; c >= 0; c--) {
        if (! shouldContinue(this.getPart(c, row))) break;
      }
    }
    else if (part instanceof Side) {
      // go down
      for (let r:number = row + 1; r < this._rowCount; r++) {
        if (! shouldContinue(this.getPart(column, r))) break;
      }
      // go up
      for (let r:number = row - 1; r >= 0; r--) {
        if (! shouldContinue(this.getPart(column, r))) break;
      }
    }
    // update sequence numbers for slopes
    this._connectSlopes();
  }

  // return whether all balls appear to be at rest since the last check
  protected _checkBallMovement():boolean {
    let atRest:boolean = true;
    let p;
    for (const ball of this.balls) {
      if (! this._ballPositions.has(ball)) {
        atRest = false;
        this._ballPositions.set(ball, { c: ball.column, r: ball.row });
      }
      else {
        p = this._ballPositions.get(ball);
        if ((atRest) &&
            (Math.max(Math.abs(p.c - ball.column), 
                      Math.abs(p.r - ball.row)) > 0.05)) {
          atRest = false;
        }
        p.c = ball.column;
        p.r = ball.row;
      }
    }
    return(atRest);
  }
  private _ballPositions:WeakMap<Part,{c:number,r:number}> = new WeakMap();

  // see if any bits or gearbits have changed their rotation states from 
  //  interaction with balls, and notify if so
  protected _checkBitRotations():void {
    let changed:boolean = false;
    for (const row of this._grid) {
      for (const part of row) {
        if (! part) continue;
        if ((part.type !== PartType.BIT) && 
            (part.type !== PartType.GEARBIT)) continue;
        if (this._bitState.get(part) !== part.bitValue) {
          changed = true;
          this._bitState.set(part, part.bitValue);
        }
      }
    }
    if (changed) this.onChange();
  }
  private _bitState:WeakMap<Part,boolean> = new WeakMap();

  // INTERACTION **************************************************************

  private _bindMouseEvents():void {
    this.view.interactive = true;
    this.view.addListener('mousedown', this._onMouseDown.bind(this));
    this.view.addListener('mousemove', this._onMouseMove.bind(this));
    this.view.addListener('mouseup', this._onMouseUp.bind(this));
    this.view.addListener('click', this._onClick.bind(this));
  }
  private _bindKeyEvents():void {
    const ctrl = makeKeyHandler('Control');
    ctrl.press = () => {
      this._controlKeyDown = true;
      if (! this._dragging) this._updateAction();
    };
    ctrl.release = () => {
      this._controlKeyDown = false;
      if (! this._dragging) this._updateAction();
    };
  }
  private _controlKeyDown:boolean = false;

  private _onMouseDown(e:PIXI.interaction.InteractionEvent):void {
    this._updateAction(e);
    this._isMouseDown = true;
    this._mouseDownPoint = e.data.getLocalPosition(this.view);
  }
  private _isMouseDown:boolean = false;
  private _mouseDownPoint:PIXI.Point;

  private _onMouseMove(e:PIXI.interaction.InteractionEvent):void {
    // start dragging if the mouse moves more than the threshold
    const p = e.data.getLocalPosition(this.view);
    // cancel dragging if the button has been released elsewhere
    if ((this._isMouseDown) && (e.data.buttons === 0)) {
      this._onMouseUp(e);
    }
    if ((this._isMouseDown) && (! this._dragging) && 
        ((Math.abs(p.x - this._mouseDownPoint.x) >= Sizes.DRAG_THRESHOLD) ||
         (Math.abs(p.y - this._mouseDownPoint.y) >= Sizes.DRAG_THRESHOLD))) {
      this._dragging = true;
      this._lastMousePoint = this._mouseDownPoint;
      this._onDragStart(this._mouseDownPoint.x, this._mouseDownPoint.y);
    }
    // handle dragging
    if (this._dragging) {
      this._onDrag(this._mouseDownPoint.x, this._mouseDownPoint.y,
        this._lastMousePoint.x, this._lastMousePoint.y, p.x, p.y);
    }
    // handle hovering
    else this._updateAction(e);
    // store this point for the next time
    this._lastMousePoint = p;
  }
  private _dragging:boolean = false;
  private _lastMousePoint:PIXI.Point;
  
  private _onMouseUp(e:PIXI.interaction.InteractionEvent):void {
    this._isMouseDown = false;
    if (this._dragging) {
      this._dragging = false;
      this._onDragFinish();
      // don't trigger a click
      e.stopPropagation();
    }
    this._updateAction(e);
  }

  private _onDragStart(x:number, y:number):void {
    this._panStartColumn = this.centerColumn;
    this._panStartRow = this.centerRow;
    if ((this._action === ActionType.FLIP_PART) && 
        (this.canDragPart(this._actionColumn, this._actionRow))) {
      this._action = ActionType.DRAG_PART;
    }
    if ((this._action === ActionType.DRAG_PART) && (this._actionPart)) {
      this.partPrototype = this._actionPart;
      this._action = ActionType.DRAG_PART;
      this._partDragStartColumn = this._actionColumn;
      this._partDragStartRow = this._actionRow;
      this.view.cursor = 'grabbing';
    }
    if ((this._action === ActionType.DROP_BALL) && 
        (this._actionPart instanceof Drop)) {
      this._colorWheel.x = this._actionPart.x;
      this._colorWheel.y = this._actionPart.y;
      this._colorWheel.hue = this._actionPart.hue;
      this._actionHue = this._actionPart.hue;
      this._showControl(this._colorWheel);
      this._colorWheel.size = this.controlSize;
      Animator.current.animate(this._colorWheel, 'size', this.controlSize, 64,
        Delays.SHOW_CONTROL);
      this._action = ActionType.COLOR_WHEEL;
      this.view.cursor = 'grabbing';
    }
    if (this.view.cursor === 'grab') this.view.cursor = 'grabbing';
  }
  private _panStartColumn:number;
  private _panStartRow:number;
  private _partDragStartColumn:number;
  private _partDragStartRow:number;

  private _onDrag(startX:number, startY:number, lastX:number, lastY:number, 
                  currentX:number, currentY:number):void {
    const deltaColumn = this.columnForX(currentX) - this.columnForX(startX);
    const deltaRow = this.rowForY(currentY) - this.rowForY(startY);
    const column = Math.round(this._actionColumn + deltaColumn);
    const row = Math.round(this._actionRow + deltaRow);
    if (this._action === ActionType.PAN) {
      this.centerColumn = this._panStartColumn - deltaColumn;
      this.centerRow = this._panStartRow - deltaRow;
    }
    else if ((this._action === ActionType.PLACE_PART) &&
             (this.partPrototype)) {
      if (this.canPlacePart(this.partPrototype.type, column, row)) {
        const oldPart = this.getPart(column, row);
        if ((! (oldPart.hasSameStateAs(this.partPrototype))) &&
            (! ((oldPart.type == PartType.GEARBIT) && 
                (this.partPrototype.type == PartType.GEAR)))) {
          this.setPart(this.partFactory.copy(this.partPrototype), 
              column, row);
        }
      }
    }
    else if (this._action === ActionType.CLEAR_PART) {
      if (! this.isBackgroundPart(column, row)) {
        // don't clear locked parts when dragging, as it's less likely
        //  to be intentional than with a click
        const oldPart = this.getPart(column, row);
        if (! oldPart.isLocked) this.clearPart(column, row);
      }
    }
    else if (this._action === ActionType.FLIP_PART) {
      const part = this.getPart(column, row);
      if ((part) && (! part.isLocked) && 
          (! this._dragFlippedParts.has(part))) {
        this.flipPart(column, row);
        this._dragFlippedParts.add(part);
      }
    }
    else if (this._action === ActionType.DRAG_PART) {
      this._actionX += currentX - lastX;
      this._actionY += currentY - lastY;
      this._actionColumn = Math.round(this.columnForX(this._actionX));
      this._actionRow = Math.round(this.rowForY(this._actionY));
      this._updatePreview();
    }
    else if (this._action === ActionType.COLOR_WHEEL) {
      const dx = Math.abs(currentX - startX);
      const dy = Math.abs(currentY - startY);
      const r = Math.sqrt((dx * dx) + (dy * dy));
      const f = Math.min(r / 20, 1.0);
      const radians = Math.atan2(currentY - startY, currentX - startX);
      this._colorWheel.hue = this._actionHue + 
        (f * (((radians * 180) / Math.PI) - 90));
      if (this._actionPart instanceof Drop) {
        this._actionPart.hue = this._colorWheel.hue;
      }
    }
    else if (this._action === ActionType.RESIZE_BOARD) {
      let delta = 0;
      if (this._actionSide == ActionSide.LEFT) {
        delta = Math.round(this.columnForX(startX - currentX));
        if (delta % 2 != 0) delta += 1;
        delta = Math.max(delta, (- this.columnCount) + 2);
      }
      else if (this._actionSide == ActionSide.TOP) {
        delta = Math.round(this.rowForY(startY - currentY));
        if (delta % 2 != 0) delta += 1;
        delta = Math.max(delta, (- this.rowCount + 2));
      }
      else if (this._actionSide == ActionSide.RIGHT) {
        delta = Math.round(this.columnForX(currentX - startX));
        delta = Math.max(delta, (- this.columnCount) + 2);
      }
      else if (this._actionSide == ActionSide.BOTTOM) {
        delta = Math.round(this.rowForY(currentY - startY));
        delta = Math.max(delta, (- this.rowCount) + 2);
      }
      this._actionResizeDelta = delta;
      this._updateResizeOverlay(true, this._actionSide, delta);
    }
  }
  private _dragFlippedParts:Set<Part> = new Set();

  private _onDragFinish():void {
    this._dragFlippedParts.clear();
    if ((this._action === ActionType.DRAG_PART) && (this.partPrototype)) {
      // don't copy drops since we want to keep their associations
      const part = this.partPrototype instanceof Drop ? this.partPrototype : 
        this.partFactory.copy(this.partPrototype);
      this.partPrototype = null;
      if (part instanceof Ball) {
        this.addBall(part as Ball, 
          this.columnForX(this._actionX), this.rowForY(this._actionY));
      }
      else if (this.canPlacePart(part.type, this._actionColumn, this._actionRow)) {
        this.setPart(part, this._actionColumn, this._actionRow);
      }
      else {
        this.setPart(part, this._partDragStartColumn, this._partDragStartRow);
      }
    }
    if (this._action === ActionType.COLOR_WHEEL) {
      Animator.current.animate(this._colorWheel, 'size', 64, this.controlSize, 
        Delays.HIDE_CONTROL);
      this._hideControl(this._colorWheel);
    }
    if (this._action === ActionType.RESIZE_BOARD) {
      if (this._actionSide == ActionSide.LEFT)
        this.sizeLeft(this._actionResizeDelta, true);
      if (this._actionSide == ActionSide.TOP)
        this.sizeTop(this._actionResizeDelta, true);
      if (this._actionSide == ActionSide.RIGHT)
        this.sizeRight(this._actionResizeDelta, true);
      if (this._actionSide == ActionSide.BOTTOM)
        this.sizeBottom(this._actionResizeDelta, true);
      this._updateResizeOverlay(false, this._actionSide, 0);
    }
  }

  private _updateAction(e?:PIXI.interaction.InteractionEvent):void {
    let cursor = 'auto';
    let c:number, r:number, column:number, row:number;
    if (e) {
      const p = e.data.getLocalPosition(this._layers);
      this._actionX = p.x;
      this._actionY = p.y;
      c = this.columnForX(p.x);
      r = this.rowForY(p.y);
      column = this._actionColumn = Math.round(c);
      row = this._actionRow = Math.round(r);
    }
    else {
      c = this.columnForX(this._actionX);
      r = this.rowForY(this._actionY);
      column = this._actionColumn;
      row = this._actionRow;
    }
    const oldActionPart = this._actionPart;
    this._actionPart = this.getPart(column, row);
    let ball:Ball;
    if (this._controlKeyDown) {
      this._action = ActionType.PAN;
      cursor = 'all-scroll';
    }
    else if ((this.tool == ToolType.PART) && (this.partPrototype) &&
             ((this.canPlacePart(this.partPrototype.type, column, row)) || 
              ((row == -1) && (column >= 0) && (column < this.columnCount)))) {
      this._action = this.partPrototype.type == PartType.BALL ?
        ActionType.PLACE_BALL : ActionType.PLACE_PART;
      cursor = 'pointer';
    }
    else if (this.tool == ToolType.ERASER) {
      this._action = ActionType.CLEAR_PART;
      cursor = 'pointer';
    }
    else if ((this.tool == ToolType.HAND) && 
             (this._actionPart instanceof Drop) &&
             (Math.abs(this._actionX - this._actionPart.x) <= this.controlSize / 2) &&
             (Math.abs(this._actionY - this._actionPart.y) <= this.controlSize / 2)) {
      this._action = ActionType.DROP_BALL;
      cursor = 'pointer';
    }
    else if ((this.tool == ToolType.HAND) && 
             (this._actionPart instanceof Turnstile) &&
             (Math.abs(this._actionX - this._actionPart.x) <= this.controlSize / 2) &&
             (Math.abs(this._actionY - this._actionPart.y) <= this.controlSize / 2)) {
      this._action = ActionType.TURN_TURNSTILE;
      cursor = 'pointer';
    }
    else if ((this.tool == ToolType.HAND) && 
             (ball = this.ballUnder(c, r))) {
      this._action = ActionType.DRAG_PART;
      this._actionPart = ball;
      cursor = 'grab';
    }
    else if ((this.tool == ToolType.HAND) &&
             (this.canFlipPart(column, row))) {
      this._action = ActionType.FLIP_PART;
      cursor = 'pointer';
    }
    else if ((this.tool == ToolType.HAND) && 
             (this.canDragPart(column, row))) {
      this._action = ActionType.DRAG_PART;
      cursor = 'grab';
    }
    // if the cursor is close to the edge of the board, enable resize
    else if ((this.tool == ToolType.HAND) && 
             (this._actionRow >= 0) && (this._actionRow < this.rowCount) && 
        ((Math.abs(this._actionX - this.xForColumn(-1)) < Sizes.RESIZE_THRESHOLD) ||
         (Math.abs(this._actionX - this.xForColumn(this.columnCount)) < Sizes.RESIZE_THRESHOLD))) {
      this._action = ActionType.RESIZE_BOARD;
      this._actionSide = this._actionColumn < (this.columnCount / 2) ? 
        ActionSide.LEFT : ActionSide.RIGHT;
      this._actionResizeDelta = 0;
      cursor = 'ew-resize';
      
    }
    else if ((this.tool == ToolType.HAND) && 
             (this._actionColumn >= 0) && (this._actionColumn < this.columnCount) && 
        ((Math.abs(this._actionY - this.yForRow(-1)) < Sizes.RESIZE_THRESHOLD) ||
         (Math.abs(this._actionY - this.yForRow(this.rowCount)) < Sizes.RESIZE_THRESHOLD))) {
      this._action = ActionType.RESIZE_BOARD;
      this._actionSide = this._actionRow < (this.rowCount / 2) ? 
        ActionSide.TOP : ActionSide.BOTTOM;
      this._actionResizeDelta = 0;
      cursor = 'ns-resize';
    }
    // drag the board if no other action matches
    else {
      this._action = ActionType.PAN;
      this._actionPart = null;
      cursor = 'auto';
    }
    this.view.cursor = cursor;
    // respond to the part under the cursor changing
    if (this._actionPart !== oldActionPart) {
      // show/hide drop controls
      if ((this._actionPart instanceof Drop) && 
          (this.tool == ToolType.HAND)) {
        this._dropButton.x = this._actionPart.x;
        this._dropButton.y = this._actionPart.y;
        this._dropButton.size = this.controlSize;
        this._dropButton.isFlipped = this._actionPart.isFlipped;
        this._showControl(this._dropButton);
      }
      else if (oldActionPart instanceof Drop) {
        this._hideControl(this._dropButton);
        this._hideControl(this._colorWheel);
      }
      // show/hide turnstile controls
      if ((this._actionPart instanceof Turnstile) && 
          (this.tool == ToolType.HAND)) {
        this._turnButton.x = this.xForColumn(this._actionPart.column);
        this._turnButton.y = this.yForRow(this._actionPart.row);
        this._turnButton.isFlipped = this._actionPart.isFlipped;
        this._turnButton.size = this.controlSize;
        this._showControl(this._turnButton);
      }
      else if (oldActionPart instanceof Turnstile) {
        this._hideControl(this._turnButton);
      }
      // show hide the ball counter
      if ((this._action === ActionType.PLACE_BALL) &&
          (this._ballCounter.drop = // intentional assignment
            this.catchmentDrop(this._actionColumn, this._actionRow))) {
        this._ballCounter.x = this._ballCounter.drop.x;
        this._ballCounter.y = this._ballCounter.drop.y;
        this._showControl(this._ballCounter);
        this._ballCounter.update();
      }
      else if (this._ballCounter.visible) {
        this._hideControl(this._ballCounter);
      }
    }
    this._updatePreview();
  }
  private _action:ActionType = ActionType.PAN;
  private _actionColumn:number;
  private _actionRow:number;
  private _actionX:number;
  private _actionY:number;
  private _actionPart:Part;
  private _actionHue:number;
  private _actionSide:number;
  private _actionResizeDelta:number = 0;

  private _updatePreview():void {
    if (this.partPrototype) {
      if (this._action === ActionType.PLACE_PART) {
        this.partPrototype.visible = true;
        this.layoutPart(this.partPrototype, 
          this._actionColumn, this._actionRow);
      }
      else if (this._action == ActionType.DRAG_PART) {
        this.partPrototype.visible = true;
        this.layoutPart(this.partPrototype, 
          this.columnForX(this._actionX), this.rowForY(this._actionY));
      }
      else if (this._action === ActionType.PLACE_BALL) {
        this.partPrototype.visible = true;
        this.partPrototype.x = Math.round(this._actionX);
        this.partPrototype.y = Math.round(this._actionY);
      }
      else {
        this.partPrototype.visible = false;
      }
    }
    if (this._action == ActionType.RESIZE_BOARD) {
      this._showControl(this._resizeOverlay);
      this._updateResizeOverlay(false, this._actionSide, 0);
    }
    else if (this._resizeOverlay.visible) {
      this._hideControl(this._resizeOverlay);
    }
  }

  private _onClick(e:PIXI.interaction.InteractionEvent):void {
    this._updateAction(e);
    // place parts
    if ((this._action === ActionType.PLACE_PART) && 
        (this.partPrototype)) {
      const oldPart:Part = this.getPart(this._actionColumn, this._actionRow);
      if (this.partPrototype.hasSameStateAs(oldPart)) {
        this.clearPart(this._actionColumn, this._actionRow);
      }
      else {
        this.setPart(this.partFactory.copy(this.partPrototype), 
          this._actionColumn, this._actionRow);
      }
    }
    // place a ball
    else if ((this._action === ActionType.PLACE_BALL) &&
             (this.partPrototype)) {
      const ball = this.ballUnder(this.columnForX(this._actionX),
                                  this.rowForY(this._actionY));
      if (ball) {
        this.removeBall(ball);
      }
      else {
        this.addBall(this.partFactory.copy(this.partPrototype) as Ball, 
          this.columnForX(this._actionX), this.rowForY(this._actionY));
      }
    }
    // clear parts
    else if (this._action === ActionType.CLEAR_PART) {
      // clearing a background part makes a blank
      if (this.isBackgroundPart(this._actionColumn, this._actionRow)) {
        this.setPart(this.partFactory.make(PartType.BLANK), 
          this._actionColumn, this._actionRow);
      }
      else {
        this.clearPart(this._actionColumn, this._actionRow);
      }
    }
    // flip parts
    else if (this._action === ActionType.FLIP_PART) {
      this.flipPart(this._actionColumn, this._actionRow);
    }
    // drop balls
    else if ((this._action === ActionType.DROP_BALL) &&
             (this._actionPart instanceof Drop)) {
      this._actionPart.releaseBall();
    }
    // turn turnstiles
    else if ((this._action === ActionType.TURN_TURNSTILE) &&
             (this._actionPart instanceof Turnstile)) {
      const ts = this._actionPart;
      Animator.current.animate(ts, 'rotation', 0, 1, 
        Delays.TURN, () => { ts.rotation = 0.0 });
    }
  }

}