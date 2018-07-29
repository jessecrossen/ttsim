/// <reference types="pixi.js" />

import { Part, Layer } from '../parts/part';
import { PartFactory, PartType } from '../parts/factory';
import { GearBase, Gear } from '../parts/gearbit';
import { Alphas, Delays } from '../ui/config';
import { DisjointSet } from '../util/disjoint';

export const enum ToolType {
  NONE,
  PART,
  ERASER,
  FLIPPER
}

type LayerToContainerMap = Map<Layer,PIXI.particles.ParticleContainer>;

export class Board {

  constructor(public readonly partFactory:PartFactory) {
    // initialize layers
    for (let i:number = Layer.BACK; i < Layer.COUNT; i++) {
      const c = new PIXI.particles.ParticleContainer(1500, 
        {
          vertices: true,
          position: true, 
          rotation: true,
          tint: true,
          alpha: true
        });
      this.view.addChild(c);
      this._containers.set(i, c);
    }
    this._bindMouseEvents();
  }
  public readonly view:PIXI.Sprite = new PIXI.Sprite();
  private _containers:LayerToContainerMap = new Map();

  // LAYOUT *******************************************************************

  public get width():number { return(this._width); }
  public set width(v:number) {
    if (v === this._width) return;
    this._width = v;
    this.view.hitArea = new PIXI.Rectangle(0, 0, this._width, this._height);
  }
  private _width:number = 0;

  public get height():number { return(this._height); }
  public set height(v:number) {
    if (v === this._height) return;
    this._height = v;
    this.view.hitArea = new PIXI.Rectangle(0, 0, this._width, this._height);
  }
  private _height:number = 0;

  // GRID MANAGEMENT **********************************************************

  // change the size to draw parts at
  public get partSize():number { return(this._partSize); }
  public set partSize(v:number) {
    if (v === this._partSize) return;
    this._partSize = v;
    this.layoutParts();
  }
  private _partSize:number = 64;

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
  }
  private _grid:Part[][] = [ ];

  // whether a part can be placed at the given row and column
  public canPlacePart(type:PartType, column:number, row:number):boolean {
    if ((column < 0) || (column >= this._columnCount) ||
        (row < 0) || (row >= this._rowCount)) return(false);
    if ((type == PartType.PARTLOC) || (type == PartType.GEARLOC)) return(true);
    else if (type == PartType.GEAR) return((row + column) % 2 != 0);
    else return((row + column) % 2 == 0);
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
    this.view.cursor = (this.tool != ToolType.NONE) ?
      'pointer' : 'auto';
  }
  private _tool:ToolType = ToolType.NONE;

  // set the part used as a prototype for adding parts
  public get partPrototype():Part { return(this._partPrototype); }
  public set partPrototype(p:Part) {
    if (p === this._partPrototype) return;
    if (this._partPrototype) this.removePart(this._partPrototype);
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
  }

  // clear parts from the given coordinates
  public clearPart(column:number, row:number):void {
    this.setPart(this.makeBackgroundPart(column, row), column, row);
  }

  // add a part to the board's layers
  public addPart(part:Part):void {
    for (let i:number = Layer.BACK; i < Layer.COUNT; i++) {
      const sprite = part.getSpriteForLayer(i);
      if (! sprite) continue;
      const container = this._containers.get(i);
      container.addChild(sprite);
    }
  }

  // remove a part from the board's layers
  public removePart(part:Part):void {
    for (let i:number = Layer.BACK; i < Layer.COUNT; i++) {
      const sprite = part.getSpriteForLayer(i);
      if (! sprite) continue;
      const container = this._containers.get(i);
      if (sprite.parent === container) container.removeChild(sprite);
    }
  }

  // do layout for one part at the given location
  public layoutPart(part:Part, column:number, row:number):void {
    part.size = this.partSize;
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
  }

  // get the margin to place the top/left parts at
  protected get margin():number { return(Math.ceil(this.partSize * 0.75)); }
  protected get spacing():number { return(this.partSize * 1.0625); }
  
  // get the column for the given X coordinate
  public columnForX(x:number):number {
    return(Math.round((x - this.margin) / this.spacing));
  }
  // get the row for the given X coordinate
  public rowForY(y:number):number {
    return(Math.round((y - this.margin) / this.spacing));
  }

  // get the X coordinate for the given column index
  public xForColumn(column:number):number {
    return(this.margin + Math.round(column * this.partSize * 1.0625));
  }
  // get the Y coordinate for the given row index
  public yForRow(row:number):number {
    return(this.margin + Math.round(row * this.partSize * 1.0625));
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

  // INTERACTION **************************************************************

  private _bindMouseEvents():void {
    this.view.interactive = true;
    this.view.addListener('mousemove', this._onMouseMove.bind(this));
    this.view.addListener('click', this._onClick.bind(this));
  }

  protected _onMouseMove(e:PIXI.interaction.InteractionEvent):void {
    const p = e.data.getLocalPosition(this.view);
    this._updatePreview(p.x, p.y);
  }

  protected _updatePreview(x:number, y:number):void {
    if (! this.partPrototype) return;
    const column = this.columnForX(x);
    const row = this.rowForY(y);
    if (this.canPlacePart(this.partPrototype.type, column, row)) {
      this.partPrototype.visible = true;
      this.layoutPart(this.partPrototype, column, row);
    }
    else {
      this.partPrototype.visible = false;
    }
  }

  protected _onClick(e:PIXI.interaction.InteractionEvent):void {
    const p = e.data.getLocalPosition(this.view);
    const column = this.columnForX(p.x);
    const row = this.rowForY(p.y);
    if (this.tool == ToolType.PART) {
      if (this.partPrototype) this._placePartPrototype(column, row);
    }
    else if (this.tool == ToolType.ERASER) {
      this.clearPart(column, row);
    }
    else if (this.tool == ToolType.FLIPPER) {
      const part = this.getPart(column, row);
      if (part) part.flip(Delays.FLIP);
    }
  }

  protected _placePartPrototype(column:number, row:number):void {
    if (! this.partPrototype) return;
    if (! this.canPlacePart(this.partPrototype.type, column, row)) return;
    const oldPart:Part = this.getPart(column, row);
    if (this.partPrototype.hasSameStateAs(oldPart)) {
      this.clearPart(column, row);
    }
    else {
      this.setPart(this.partFactory.copy(this.partPrototype), column, row);
    }
  }

}