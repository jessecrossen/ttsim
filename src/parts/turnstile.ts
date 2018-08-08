import { Part, Layer } from './part';
import { PartType } from './factory';
import { Ball } from './ball';
import { Drop } from './drop';

export class Turnstile extends Part {

  public get canRotate():boolean { return(true); }
  public get canMirror():boolean { return(false); }
  public get canFlip():boolean { return(true); }
  public get type():PartType { return(PartType.TURNSTILE); }

  // the drop the turnstile is connected to
  public get drop():Drop { return(this._drop); }
  public set drop(newDrop:Drop) {
    if (newDrop === this.drop) return;
    if (this._drop) this._drop.turnstiles.delete(this);
    this._drop = newDrop;
    if (this._drop) {
      this._drop.turnstiles.add(this);
      this.hue = this._drop.hue;
    }
  }
  private _drop:Drop;

  // put a ball in the center to show the color of the associated drop
  protected _initSprite(layer:Layer):PIXI.Sprite {
    if (layer == Layer.SCHEMATIC_BACK) {
      return(this._centerBall.getSpriteForLayer(Layer.SCHEMATIC));
    }
    const sprite = super._initSprite(layer);
    if ((layer == Layer.FRONT) && (! this._ballContainer)) {
      this._ballContainer = new PIXI.Container();
      this._ballContainer.addChild(this._centerBall.getSpriteForLayer(Layer.MID));
      this._ballContainer.addChild(this._centerBall.getSpriteForLayer(Layer.FRONT));
      sprite.addChild(this._ballContainer);
    }
    return(sprite);
  }
  private _centerBall:Ball = new Ball(this.textures);
  private _ballContainer:PIXI.Container;

  // keep the ball the same size as the component
  public get size():number { return(super.size); }
  public set size(s:number) {
    if (s === this.size) return;
    super.size = s;
    this._centerBall.size = s;
  }

  // pass hue through to the center ball
  public get hue():number { return(this._centerBall.hue); }
  public set hue(v:number) {
    this._centerBall.hue = v;
    this._updateSprites();
  }

  // don't rotate or flip the ball or the highlight will look strange
  protected _shouldRotateLayer(layer:Layer):boolean {
    return((layer !== Layer.BACK) && (layer !== Layer.FRONT));
  }
  protected _shouldFlipLayer(layer:Layer):boolean {
    return(layer !== Layer.FRONT);
  }

  // release a ball when the turnstile makes a turn
  public get rotation():number { return(super.rotation); }
  public set rotation(r:number) {
    const oldRotation = this.rotation;
    super.rotation = r;
    if ((this.rotation == 0.0) && (oldRotation > 0.5) && (this.drop)) {
      this.drop.releaseBall();
    }
  }

  // configure for continuous rotation
  public get biasRotation():boolean { return(false); }
  public get restingRotation():number {
    return(Math.round(this.rotation));
  }

}