import * as filter from 'pixi-filters';

import { Part, Layer } from 'parts/part';
import { Fence, FenceVariant } from 'parts/fence';
import { PartFactory, PartType } from 'parts/factory';
import { GearBase, Gear } from 'parts/gearbit';
import { Alphas, Delays, Sizes } from 'ui/config';
import { DisjointSet } from 'util/disjoint';
import { Renderer } from 'renderer';
import { Ball } from 'parts/ball';
import { IBallRouter } from './router';
import { BALL_RADIUS, SPACING } from './constants';

export const enum ToolType {
  NONE,
  PART,
  ERASER,
  HAND
}

export const enum ActionType {
  PAN,
  PLACE_PART,
  PLACE_BALL,
  CLEAR_PART,
  FLIP_PART,
  DRAG_PART
}

export const PartSizes:number[] = [ 2, 4, 6, 8, 12, 16, 24, 32, 48, 64 ];
export const SPACING_FACTOR:number = 1.0625;

type LayerToContainerMap = Map<Layer,PIXI.Container>;

export class Board {

  constructor(public readonly partFactory:PartFactory) {
    this._bindMouseEvents();
    this.view.addChild(this._layers);
    this._initContainers();
    this._updateDropShadows();
  }
  public readonly view:PIXI.Sprite = new PIXI.Sprite();
  public readonly _layers:PIXI.Container = new PIXI.Container();

  // the set of balls currently on the board
  public readonly balls:Set<Ball> = new Set();
  // a router to manage the positions of the balls
  public router:IBallRouter;

  // a counter that increments whenever the board changes
  public get changeCounter():number { return(this._changeCounter); }
  public onChange():void {
    this._changeCounter++;
  }
  private _changeCounter:number = 0;
  
  // whether to show parts in schematic form
  public get schematic():boolean { return(this._schematic); }
  public set schematic(v:boolean) {
    if (v === this._schematic) return;
    this._schematic = v;
    this._updateLayerVisibility();
  }
  protected _schematic:boolean = false;

  // LAYERS *******************************************************************

  protected _initContainers():void {
    this._setContainer(Layer.BACK, false);
    this._setContainer(Layer.MID, false);
    this._setContainer(Layer.FRONT, false);
    this._setContainer(Layer.SCHEMATIC_BACK, true);
    this._setContainer(Layer.SCHEMATIC, true);
    this._setContainer(Layer.SCHEMATIC_4, true);
    this._setContainer(Layer.SCHEMATIC_2, true);
    this._updateLayerVisibility();
  }
  private _containers:LayerToContainerMap = new Map();

  protected _setContainer(layer:Layer, highPerformance:boolean = false):void {
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
    if (highPerformance) return(new PIXI.particles.ParticleContainer(1500, 
      {
        vertices: true,
        position: true, 
        rotation: true,
        tint: true,
        alpha: true
      }, 100, true));
    else return(new PIXI.Container());
  }

  protected _updateDropShadows():void {
    this._containers.get(Layer.BACK).filters = [
      this._makeShadow(this.partSize / 32.0) ];
    this._containers.get(Layer.MID).filters = [
      this._makeShadow(this.partSize / 16.0) ];
    this._containers.get(Layer.FRONT).filters = [
      this._makeShadow(this.partSize / 8.0) ];
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
    showContainer(Layer.BACK, ! this.schematic);
    showContainer(Layer.MID, ! this.schematic);
    showContainer(Layer.FRONT, ! this.schematic);
    showContainer(Layer.SCHEMATIC_BACK, this.schematic && (this.partSize >= 12));
    showContainer(Layer.SCHEMATIC, this.schematic);
    showContainer(Layer.SCHEMATIC_4, this.schematic && (this.partSize == 4));
    showContainer(Layer.SCHEMATIC_2, this.schematic && (this.partSize == 2));
    Renderer.needsUpdate();
  }

  // LAYOUT *******************************************************************

  // change the size to draw parts at
  public get partSize():number { return(this._partSize); }
  public set partSize(v:number) {
    if (v === this._partSize) return;
    this._partSize = v;
    this.layoutParts();
    this._updateDropShadows();
    this._updateLayerVisibility();
    this._updatePan();
    if (this.router) this.router.onBoardSizeChanged();
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
    v = Math.min(Math.max(0, v), this.columnCount - 1);
    if (v === this.centerColumn) return;
    this._centerColumn = v;
    this._updatePan();
  }
  private _centerColumn:number = 0.0;
  public get centerRow():number { return(this._centerRow); }
  public set centerRow(v:number) {
    v = Math.min(Math.max(0, v), this.rowCount - 1);
    if (v === this.centerRow) return;
    this._centerRow = v;
    this._updatePan();
  }
  private _centerRow:number = 0.0;

  protected _updatePan():void {
    this._layers.x = 
      Math.round((this.width / 2) - this.xForColumn(this.centerColumn));
    this._layers.y = 
      Math.round((this.height / 2) - this.yForRow(this.centerRow));
    this._updateFilterAreas();
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

  // update the part grid
  public setSize(columnCount:number, rowCount:number):void {
    let r:number, c:number, p:Part;
    // contract rows
    if (rowCount < this._rowCount) {
      for (r = rowCount; r < this._rowCount; r++) {
        for (p of this._grid[r]) this.removePart(p);
      }
      this._grid.splice(rowCount, this._rowCount - rowCount);
      this._rowCount = rowCount;
    }
    // expand columns
    if ((columnCount > this._columnCount) && (this._rowCount > 0)) {
      r = 0;
      for (const row of this._grid) {
        for (c = this._columnCount; c < columnCount; c++) {
          p = this.makeBackgroundPart(c, r);
          row.push(p);
          this.addPart(p);
          this.layoutPart(p, c, r);
        }
        r++;
      }
    }
    // contract columns
    else if ((columnCount < this._columnCount) && (this._rowCount > 0)) {
      for (const row of this._grid) {
        for (c = columnCount; c < this._columnCount; c++) {
          this.removePart(row[c]);
        }
        row.splice(columnCount, this._columnCount - columnCount);
      }
    }
    this._columnCount = columnCount;
    // expand rows
    if (rowCount > this._rowCount) {
      for (r = this._rowCount; r < rowCount; r++) {
        const row:Part[] = [ ];
        for (c = 0; c < columnCount; c++) {
          p = this.makeBackgroundPart(c, r);
          row.push(p);
          this.addPart(p);
          this.layoutPart(p, c, r);
        }
        this._grid.push(row);
      }
    }
    this._rowCount = rowCount;
    if (this.router) this.router.onBoardSizeChanged();
  }
  private _grid:Part[][] = [ ];

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
             (type == PartType.GEAR) || (type == PartType.FENCE)) return(true);
    else return((row + column) % 2 == 0);
  }

  // whether the part at the given location can be flipped
  public canFlipPart(column:number, row:number):boolean {
    const part = this.getPart(column, row);
    return((part) && (part.canFlip || part.canRotate));
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
    if (v === this._tool) return;
    this._tool = v;
  }
  private _tool:ToolType = ToolType.NONE;

  // set the part used as a prototype for adding parts
  public get partPrototype():Part { return(this._partPrototype); }
  public set partPrototype(p:Part) {
    if (p === this._partPrototype) return;
    if (this._partPrototype) {
      this.removePart(this._partPrototype);
      this._partPrototype.alpha = 1.0;
      this._partPrototype.visible = true;
    }
    this._partPrototype = p;
    if (this._partPrototype) {
      this._partPrototype.alpha = Alphas.PREVIEW_ALPHA;
      this._partPrototype.visible = false;
      this.addPart(this._partPrototype);
    }
  }
  private _partPrototype:Part = null;

  // get the part at the given coordinates
  public getPart(column:number, row:number):Part {
    if ((column < 0) || (column >= this._columnCount) ||
        (row < 0) || (row >= this._rowCount)) return(null);
    return(this._grid[row][column]);
  }

  // set the part at the given coordinates
  public setPart(newPart:Part, column:number, row:number):void {
    if ((column < 0) || (column >= this._columnCount) ||
        (row < 0) || (row >= this._rowCount)) return;
    const oldPart = this.getPart(column, row);
    if (oldPart === newPart) return;
    if (oldPart) this.removePart(oldPart);
    if (newPart) this.addPart(newPart);
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
      this._connectGears();
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
    if ((oldPart instanceof Fence) || (newPart instanceof Fence)) {
      this._updateFences();
    }
    this.onChange();
  }
  
  // flip the part at the given coordinates
  public flipPart(column:number, row:number):void {
    const part = this.getPart(column, row);
    if (part instanceof Fence) {
      this._flipFence(column, row);
    }
    else if (part) part.flip(Delays.FLIP);
  }

  // clear parts from the given coordinates
  public clearPart(column:number, row:number):void {
    this.setPart(this.makeBackgroundPart(column, row), column, row);
  }

  // add a ball to the board
  public addBall(ball:Ball, x:number, y:number) {
    if (! this.balls.has(ball)) {
      this.balls.add(ball);
      this.layoutPart(ball, this.columnForX(x), this.rowForY(y));
      this.addPart(ball);
      this.onChange();
    }
  }

  // remove a ball from the board
  public removeBall(ball:Ball) {
    if (this.balls.has(ball)) {
      this.balls.delete(ball);
      this.removePart(ball);
      Renderer.needsUpdate();
      this.onChange();
    }
  }

  // get the ball under the given point in fractional column/row units
  public ballUnder(column:number, row:number):Ball {
    const radius = BALL_RADIUS / SPACING;
    for (const ball of this.balls) {
      const dx:number = Math.abs(column - ball.column);
      const dy:number = Math.abs(row - ball.row);
      if ((dx > radius) || (dy > radius)) continue;
      if (Math.sqrt((dx * dx) + (dy * dy)) <= radius) return(ball);
    }
    return(null);
  }

  // add a part to the board's layers
  public addPart(part:Part):void {
    for (let layer of this._containers.keys()) {
      const sprite = part.getSpriteForLayer(layer);
      if (! sprite) continue;
      // add balls behind other parts to prevent ball highlights from
      //  displaying on top of gears, etc.
      if (part instanceof Ball) {
        this._containers.get(layer).addChildAt(sprite, 0);
      }
      else {
        this._containers.get(layer).addChild(sprite);
      }
    }
  }

  // remove a part from the board's layers
  public removePart(part:Part):void {
    for (let layer of this._containers.keys()) {
      const sprite = part.getSpriteForLayer(layer);
      if (! sprite) continue;
      const container = this._containers.get(layer);
      if (sprite.parent === container) container.removeChild(sprite);
    }
    part.destroySprites();
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

  // configure fences
  protected _updateFences():void {
    let slopeParts:Fence[] = [ ];
    let northPart:Part;
    let leftNorthFence:Fence;
    let rightNorthFence:Fence;
    let r:number = 0;
    let c:number;
    for (const row of this._grid) {
      c = 0;
      for (const part of row) {
        if (part instanceof Fence) {
          northPart = this.getPart(c, r - 1);
          // track the parts above the ends of the slope
          if ((northPart instanceof Fence) && 
              (northPart.variant == FenceVariant.SIDE)) {
            if (slopeParts.length == 0) leftNorthFence = northPart;
            else rightNorthFence = northPart;
          }
          else {
            rightNorthFence = null;
          }
          if ((slopeParts.length > 0) && 
              (slopeParts[0].isFlipped !== part.isFlipped)) {
            this._makeSlope(slopeParts, leftNorthFence, rightNorthFence);
            leftNorthFence = rightNorthFence = null;
          }
          slopeParts.push(part);
        }
        else if (slopeParts.length > 0) {
          this._makeSlope(slopeParts, leftNorthFence, rightNorthFence);
          leftNorthFence = rightNorthFence = null;
        }
        c++;
      }
      if (slopeParts.length > 0) {
        this._makeSlope(slopeParts, leftNorthFence, rightNorthFence);
        leftNorthFence = rightNorthFence = null;
      }
      r++;
    }
  }
  // configure a horizontal run of fence parts
  protected _makeSlope(fences:Fence[], leftNorthFence:Fence, rightNorthFence:Fence):void {
    if (! (fences.length > 0)) return;
    // allow for acute angles with a side at the lower end of a slope
    //  by converting slope ends to sides if the flip direction matches
    if ((fences[0].isFlipped) && (leftNorthFence) && 
        (leftNorthFence.isFlipped)) {
      const side = fences.shift();
      side.variant = FenceVariant.SIDE;
    }
    else if ((! fences[0].isFlipped) && (rightNorthFence) &&
             (! rightNorthFence.isFlipped)) {
      const side = fences.pop();
      side.variant = FenceVariant.SIDE;
    }
    if (fences.length == 1) fences[0].variant = FenceVariant.SIDE;
    else {
      for (let i:number = 0; i < fences.length; i++) {
        fences[i].variant = FenceVariant.SLOPE;
        fences[i].modulus = fences.length;
        fences[i].sequence = fences[i].isFlipped ? 
          ((fences.length - 1) - i) : i;
      }
    }
    fences.splice(0, fences.length);
  }
  // flip a fence part
  protected _flipFence(column:number, row:number) {
    const fence:Part = this.getPart(column, row);
    if (! (fence instanceof Fence)) return;
    const wasFlipped:boolean = fence.isFlipped;
    const variant:FenceVariant = fence.variant;
    fence.flip();
    // make a test function to shorten the code below
    const shouldContinue = (part:Part):boolean => {
      if ((part instanceof Fence) && (part.isFlipped == wasFlipped) &&
          (part.variant == variant)) {
        part.flip();
        return(true);
      }
      return(false);
    };
    if (variant == FenceVariant.SLOPE) {
      // go right
      for (let c:number = column + 1; c < this._columnCount; c++) {
        if (! shouldContinue(this.getPart(c, row))) break;
      }
      // go left
      for (let c:number = column - 1; c >= 0; c--) {
        if (! shouldContinue(this.getPart(c, row))) break;
      }
    }
    else if (variant == FenceVariant.SIDE) {
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
    this._updateFences();
  }

  // INTERACTION **************************************************************

  private _bindMouseEvents():void {
    this.view.interactive = true;
    this.view.addListener('mousedown', this._onMouseDown.bind(this));
    this.view.addListener('mousemove', this._onMouseMove.bind(this));
    this.view.addListener('mouseup', this._onMouseUp.bind(this));
    this.view.addListener('click', this._onClick.bind(this));
  }

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
    if ((this._action === ActionType.FLIP_PART) ||
        (this._action === ActionType.DRAG_PART) ||
        (this._action === ActionType.PAN)) {
      const c:number = this.columnForX(this._actionX);
      const r:number = this.rowForY(this._actionY);
      const column:number = Math.round(c);
      const row:number = Math.round(r);
      let part:Part = this.ballUnder(c, r);
      if ((! part) && (! this.isBackgroundPart(column, row))) {
        part = this.getPart(column, row);
      }
      if (part) {
        if (part instanceof Ball) this.removeBall(part);
        else this.clearPart(column, row);
        this.partPrototype = part;
        this._action = ActionType.DRAG_PART;
        this.view.cursor = 'pointer';
        this._partDragStartColumn = this._actionColumn;
        this._partDragStartRow = this._actionRow;
      }
    }
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
  }
  private _dragFlippedParts:Set<Part> = new Set();

  private _onDragFinish():void {
    this._dragFlippedParts.clear();
    if ((this._action === ActionType.DRAG_PART) && (this.partPrototype)) {
      const part = this.partPrototype;
      this.partPrototype = null;
      if (part instanceof Ball) {
        this.partPrototype = null;
        this.addBall(this.partFactory.copy(part) as Ball, 
          this._actionX, this._actionY);
      }
      else if (this.canPlacePart(part.type, this._actionColumn, this._actionRow)) {
        this.setPart(part, this._actionColumn, this._actionRow);
      }
      else {
        this.setPart(part, this._partDragStartColumn, 
                           this._partDragStartRow);
      }
    }
  }

  private _updateAction(e:PIXI.interaction.InteractionEvent):void {
    const p = e.data.getLocalPosition(this._layers);
    this._actionX = p.x;
    this._actionY = p.y;
    const column = this._actionColumn = Math.round(this.columnForX(p.x));
    const row = this._actionRow = Math.round(this.rowForY(p.y));
    if ((this.tool == ToolType.PART) && (this.partPrototype) &&
        (this.canPlacePart(this.partPrototype.type, column, row))) {
      this._action = this.partPrototype.type == PartType.BALL ?
        ActionType.PLACE_BALL : ActionType.PLACE_PART;
      this.view.cursor = 'pointer';
    }
    else if ((this.tool == ToolType.ERASER) && 
             (! this.isBackgroundPart(column, row))) {
      this._action = ActionType.CLEAR_PART;
      this.view.cursor = 'pointer';
    }
    else if ((this.tool == ToolType.HAND) && 
             (this.ballUnder(this.columnForX(p.x), this.rowForY(p.y)))) {
      this._action = ActionType.DRAG_PART;
      this.view.cursor = 'pointer';
    }
    else if ((this.tool == ToolType.HAND) &&
             (this.canFlipPart(column, row))) {
      this._action = ActionType.FLIP_PART;
      this.view.cursor = 'pointer';
    }
    else {
      this._action = ActionType.PAN;
      this.view.cursor = 'move';
    }
    this._updatePreview();
  }
  private _action:ActionType = ActionType.PAN;
  private _actionColumn:number;
  private _actionRow:number;
  private _actionX:number;
  private _actionY:number;

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
      this.addBall(this.partFactory.copy(this.partPrototype) as Ball, 
        this._actionX, this._actionY);
    }
    // clear parts
    else if (this._action === ActionType.CLEAR_PART) {
      this.clearPart(this._actionColumn, this._actionRow);
    }
    // flip parts
    else if (this._action === ActionType.FLIP_PART) {
      this.flipPart(this._actionColumn, this._actionRow);
    }
  }

}