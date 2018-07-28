/// <reference types="pixi.js" />

export class SimulatorApp extends PIXI.Container {

  constructor(public readonly textures:PIXI.loaders.TextureDictionary) {
    super();

    this.width = 300;
    this.height = 300;

    const s = new PIXI.Sprite(textures['ramp-mid']);
    this.addChild(s);
  }

}