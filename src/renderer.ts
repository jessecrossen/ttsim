import * as PIXI from 'pixi.js';

import { Colors } from 'ui/config';

export class Renderer {

  public static needsUpdate():void {
    Renderer._needsUpdate = true;
  }
  private static _needsUpdate:boolean = false;

  public static readonly instance = PIXI.autoDetectRenderer({
    antialias: false,
    backgroundColor: Colors.BACKGROUND
  });

  public static readonly stage = new PIXI.Container();

  public static render():void {
    if (Renderer._needsUpdate) {
      Renderer.instance.render(Renderer.stage);
      Renderer._needsUpdate = false;
    }
  }

}