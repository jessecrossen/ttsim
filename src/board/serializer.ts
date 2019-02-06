import { Board } from './board';
import { Delays } from 'ui/config';
import { Part } from 'parts/part';
import { PartType } from 'parts/factory';
import { Drop } from 'parts/drop';

export interface IBoardSerializer {
  onBoardStateChanged():void;
  onUIStateChanged():void;
  save():void;
  restore(callback:(restored:boolean) => void):void;
}

export class URLBoardSerializer implements IBoardSerializer {

  constructor(public readonly board:Board) {
    
  }

  private _uiState:string = null;
  private _boardState:string = null;
  private _historyState:any = { 'source': 'URLBoardSerializer' };

  public get dataUrl():string { return(this._boardState); }

  public onBoardStateChanged():void {
    this._uiState = null;
    this._boardState = null;
    this.onChange();
  }
  public onUIStateChanged():void {
    this._uiState = null;
    this.onChange();
  }

  protected onChange():void {
    if (! isNaN(this._trySaveInterval)) clearInterval(this._trySaveInterval);
    this._trySaveInterval = setInterval(this.save.bind(this), 
      Delays.UPDATE_URL * 1000);
  }
  private _trySaveInterval:number = NaN;

  public save():void {
    // don't save if we're in the process of a restore operation,
    //  the interval will call back again later and restore may be finished
    if (this._restoring) return;
    // stop trying to save
    if (! isNaN(this._trySaveInterval)) {
      clearInterval(this._trySaveInterval);
      this._trySaveInterval = NaN;
    }
    // regenerate any invalid state
    if (this._uiState === null) this._uiState = this._writeUIState();
    if (this._boardState === null) this._boardState = this._writeBoardState();
    // if we can't update the URL, exit now
    if ((! window.history) || (! window.history.replaceState) ||
        (! window.history.pushState)) return;
    // compose a hash to use to save state
    const hash:string = '#'+this._uiState+'&b='+this._boardState;
    // if no hash is set, we need to push state first
    if (window.location.hash.length == 0) {
      window.history.pushState(this._historyState, '', hash);
    }
    else {
       window.history.replaceState(this._historyState, '', hash);
    }
  }

  public restore(callback:(restored:boolean) => void):void {
    // if there is no hash, there's nothing to restore
    const hash = window.location.hash.substr(1);
    if (hash.length == 0) {
      callback(false);
      return;
    }
    try {
      this._restoring = true;
      const [ ui, board ] = hash.split('&b=', 2);
      this._readUIState(ui);
      this._readBoardState(board, callback);
    }
    catch (e) {
      console.warn(e);
      callback(false);
    }
    finally {
      this._restoring = false;
    }
  }
  private _restoring:boolean = false;

  public download():boolean {
    const url = this.dataUrl;
    if (! (url.length > 0)) return(false);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ttsim.png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return(true);
  }

  public upload(callback:(restored:boolean) => void):boolean {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/png');
    input.onchange = () => {
      if (! (input.files.length > 0)) return;
      const file = input.files[0];
      var reader = new FileReader();
      reader.onload = (e) => {
        this._restoring = true;
        try {
          this._readBoardState((e.target as any).result, callback);
        }
        finally {
          this._restoring = false;
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
    return(false);
  }

  protected _writeUIState():string {
    let s:string = '';
    s += 's='+this.board.columnCount+','+this.board.rowCount;
    s += '&z='+this.board.partSize;
    s += '&cc='+Math.round(this.board.centerColumn * 2) / 2;
    s += '&cr='+Math.round(this.board.centerRow * 2) / 2;
    s += '&t='+this.board.tool;
    if (this.board.partPrototype) {
      s += '&pt='+this.board.partPrototype.type;
    }
    s += '&sp='+this.board.speed;
    s += '&sc='+(this.board.schematic ? '1' : '0');
    return(s);
  }
  protected _readUIState(s:string):void {
    // split the hash into variables and parse them
    for (const kv of s.split('&')) {
      const [ key, value ] = kv.split('=', 2);
      if (key == 't') this.board.tool = parseInt(value);
      else if (key == 'pt') {
        this.board.partPrototype = this.board.partFactory.make(parseInt(value));
      }
      else if (key == 'z') this.board.partSize = parseInt(value);
      else if (key == 's') {
        const [ c, r ] = value.split(',');
        this.board.setSize(parseInt(c), parseInt(r), false);
      }
      else if (key == 'cc') this.board.centerColumn = parseFloat(value);
      else if (key == 'cr') this.board.centerRow = parseFloat(value);
      else if (key == 'sp') this.board.speed = parseFloat(value);
      else if (key == 'sc') this.board.schematic = (parseInt(value) === 1);
    }
  }

  protected _writeMetadata():string {
    let items:string[] = [ ];
    // add metadata about drops
    for (const drop of this._getSortedDrops()) {
      items.push('d '+drop.hue+' '+drop.balls.size);
    }
    return(items.join(' '));
  }
  protected _readMetadata(s:string) {
    const drops = this._getSortedDrops();
    // tokenize the string
    const tokens:string[]= s.split(' ');
    let token:string, type:string, params:number[];
    while (tokens.length > 0) {
      token = tokens.shift();
      if (parseFloat(token).toString() != token) {
        type = token;
        params = [ ];
      }
      else {
        params.push(parseFloat(token));
      }
      // read drop metadata
      if ((type == 'd') && (params.length == 2)) {
        const drop = drops.shift();
        if (drop) {
          drop.hue = Math.round(params[0]);
          this.board.setDropBallCount(drop, Math.floor(params[1]));
        }
      }
    }
  }
  protected _getSortedDrops():Drop[] {
    const drops:Drop[] = [ ];
    let part:Part;
    for (let c:number = 0; c < this.board.columnCount; c++) {
      for (let r:number = 0; r < this.board.rowCount; r++) {
        part = this.board.getPart(c, r);
        if (part instanceof Drop) drops.push(part);
      }
    }
    return(drops);
  }

  protected _writeBoardState():string {
    // compose metadata to include with the image
    let metadata = this._writeMetadata();
    const metadataBytesPerRow = (this.board.columnCount - 1) * 3;
    const metadataRows:number = Math.ceil(metadata.length / metadataBytesPerRow);
    // make a canvas where grid location on the board is a pixel
    const canvas = document.createElement('canvas');
    canvas.width = this.board.columnCount;
    canvas.height = this.board.rowCount + metadataRows;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const rw = canvas.width * 4;
    // draw pixels representing the parts
    for (let c:number = 0; c < this.board.columnCount; c++) {
      for (let r:number = 0; r < this.board.rowCount; r++) {
        const part = this.board.getPart(c, r);
        this.partToColor(part, imageData.data, (r * rw) + (c * 4));
      }
    }
    // write metadata
    for (let r:number = this.board.rowCount; r < canvas.height; r++) {
      if (! (metadata.length > 0)) break;
      metadata = this.writeMetadataRow(imageData.data, 
        (r * rw), canvas.width, metadata);
    }
    ctx.putImageData(imageData, 0, 0);
    return(canvas.toDataURL());
  }

  protected _readBoardState(url:string, callback:(restored:boolean) => void):void {
    const expectedPrefix = 'data:image/png;base64,';
    const prefix = url.substr(0, expectedPrefix.length);
    if (prefix !== expectedPrefix) {
      console.warn('Unexpected data url prefix: '+prefix);
      callback(false);
      return;
    }
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = img.width;
      const h = img.height;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let s:string, metadata:string = '';
      // read parts and metadata from the image's pixels
      this.board.bulkUpdate = true;
      this.board.setSize(w, 0, false);
      let r = 0;
      for (let y:number = 0; y < h; y++) {
        // read metadata row
        s = this.readMetadataRow(imageData.data, (y * w * 4), w);
        if (s !== null) {
          metadata += s;
          continue;
        }
        // read part row
        this.board.sizeBottom(1, false);
        for (let c:number = 0; c < this.board.columnCount; c++) {
          const part = this.colorToPart(imageData.data, (y * w * 4) + (c * 4));
          if (part) this.board.setPart(part, c, r);
          else this.board.clearPart(c, r);
        }
        r++;
      }
      this._readMetadata(metadata);
      this.board.bulkUpdate = false;
      callback(true);
    };
    img.onerror = () => {
      callback(false);
    };
    img.src = url;
  }

  protected partToColor(part:Part, data:Uint8ClampedArray, i:number):void {
    let r = 0xFF, g = 0xFF, b = 0xFF, a = 0xFF;
    let flip:boolean = (part) && ((part.canFlip && part.isFlipped) ||
                                  (part.canRotate && part.bitValue));
    // select a color for the part
    if (part) switch(part.type) {
      // leave both types of locations white so we don't get a checker pattern 
      //  in the image, which makes editing harder
      case PartType.PARTLOC: // fall-through
      case PartType.GEARLOC: break;
      // handle parts
      case PartType.RAMP:        r = 0x00; g = 0xFF; b = 0x00; break; // green
      case PartType.CROSSOVER:   r = 0xFF; g = 0x80; b = 0x00; break; // orange
      case PartType.INTERCEPTOR: r = 0x00; g = 0x00; b = 0x00; break; // black
      case PartType.BIT:         r = 0x00; g = 0xFF; b = 0xFF; break; // cyan
      case PartType.GEARBIT:     r = 0x80; g = 0x00; b = 0xFF; break; // purple
      case PartType.GEAR:        r = 0xFF; g = 0x00; b = 0x00; break; // red
      case PartType.DROP:        r = 0xFF; g = 0xFF; b = 0x00; break; // yellow
      case PartType.TURNSTILE:   r = 0xFF; g = 0x00; b = 0xFF; break; // magenta
      case PartType.SIDE:        
        if (! flip)            { r = 0xC0; g = 0xC0; b = 0xC0; }      // light gray
        else                   { r = 0xA0; g = 0xA0; b = 0xA0; }
        flip = false; break;
      case PartType.SLOPE:
        if (! flip)            { r = 0x80; g = 0x80; b = 0x80; }      // middle gray
        else                   { r = 0x60; g = 0x60; b = 0x60; }
        flip = false; break;
      // leave blank spots and unknown parts a very dark gray
      case PartType.BLANK: // fall-through
      default: r = g = b = 0x20; break;
    }
    // if a part is flipped or rotated, make the color less bright
    if (flip) {
      r = (r >> 2) * 3;
      g = (g >> 2) * 3;
      b = (b >> 2) * 3;
    }
    // if a part is locked, reduce opacity very slightly
    if ((part) && (part.isLocked)) a = 0xFE;
    // write the color
    data[i++] = r;
    data[i++] = g;
    data[i++] = b;
    data[i++] = a;
  }
  protected colorToPart(data:Uint8ClampedArray, i:number):Part {
    // read the color
    let r = data[i++];
    let g = data[i++];
    let b = data[i++];
    const a = data[i++];
    const max = Math.max(r, g, b);
    // define fudge factors for color recognition so the image can be edited,
    //  and slightly different colors will still be recognized 
    const isLow = (n:number) => n <= 0.25;
    const isMid = (n:number) => (n > 0.25) && (n < 0.75);
    const isHigh = (n:number) => n >= 0.75;
    // get the part type
    let type:PartType = -1;
    let flipped:boolean = false;
    if (max == 0) type = PartType.INTERCEPTOR; // black
    else {
      r /= max; g /= max; b /= max;
      // gray
      if ((isHigh(r)) && (isHigh(g)) && (isHigh(b))) {
        if (max >= 0xD0) { } // whiteish, clear the location
        else if (max >= 0x90) { // light gray
          type = PartType.SIDE;
          flipped = (max < 0xB0); // distinguish between 0xC0 and 0xA0
        }
        else if (max >= 0x40) { // dark gray
          type = PartType.SLOPE; 
          flipped = (max < 0x70); // distinguish between 0x60 and 0x80
        }
        else { // very dark gray, consider blank
          type = PartType.BLANK; 
        }
      }
      else {
        // colors
             if ((isLow(r)) && (isHigh(g)) && (isLow(b))) type = PartType.RAMP;       // green
        else if ((isHigh(r)) && (isMid(g)) && (isLow(b))) type = PartType.CROSSOVER;  // orange
        else if ((isLow(r)) && (isHigh(g)) && (isHigh(b))) type = PartType.BIT;       // cyan
        else if ((isMid(r)) && (isLow(g)) && (isHigh(b))) type = PartType.GEARBIT;    // purple
        else if ((isHigh(r)) && (isLow(g)) && (isLow(b))) type = PartType.GEAR;       // red
        else if ((isHigh(r)) && (isHigh(g)) && (isLow(b))) type = PartType.DROP;      // yellow
        else if ((isHigh(r)) && (isLow(g)) && (isHigh(b))) type = PartType.TURNSTILE; // magenta
        flipped = (max < 0xDE);
      }
    }
    if (type >= 0) {
      const part = this.board.partFactory.make(type);
      if (a < 0xFF) part.isLocked = true;
      if (flipped) {
        if (part.canFlip) part.isFlipped = true;
        else if (part.canRotate) part.rotation = 1;
      }
      return(part);
    }
    return(null);
  }

  protected writeMetadataRow(data:Uint8ClampedArray, i:number, w:number, s:string):string {
    const end = i + (w * 4);
    // write a blue pixel to indicate a metadata row
    data[i++] = 0x00; data[i++] = 0x00; data[i++] = 0xFF;
    let c:number = 0;
    for (; i < end; i++) {
      if (i % 4 == 3) { // skip alpha
        data[i] = 0xFF;
      }
      else if (c >= s.length) { // null termination
        data[i] = 0;
      }
      else {
        data[i] = s.charCodeAt(c++);
      }
    }
    // return the unwritten string
    return(s.substr(c));
  }
  protected readMetadataRow(data:Uint8ClampedArray, i:number, w:number):string {
    const end = i + (w * 4);
    // a blue pixel at the start represents a metadata row, skip if there isn't one
    if ((data[i++] != 0x00) || (data[i++] != 0x00) || (data[i++] != 0xFF)) 
      return(null);
    // build a string from the data in the row
    let s:string = '';
    let c:number;
    for (; i < end; i++) {
      if (i % 4 == 3) continue; // skip alpha
      c = data[i];
      if (c == 0) return(s); // null termination
      s += String.fromCharCode(c);
    }
    return(s);
  }

}