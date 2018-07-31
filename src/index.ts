import * as PIXI from 'pixi.js';

import { SimulatorApp } from 'app';
import { Renderer } from 'renderer';

const container = document.getElementById('container');
container.appendChild(Renderer.instance.view);

// the simulator, which will be initialized once resources have loaded
let sim:SimulatorApp;

// dynamically resize the app to track the size of the browser window
container.style.overflow = 'hidden';
const resizeApp = () => {
  const r = container.getBoundingClientRect();
  Renderer.instance.resize(r.width, r.height);
  if (sim) {
    sim.width = r.width;
    sim.height = r.height;
  }
}
resizeApp();
window.addEventListener('resize', resizeApp);

Renderer.start();

// load sprites
const loader = PIXI.loader;
loader.add('images/parts.json').load(() => {
  sim = new SimulatorApp(
    PIXI.loader.resources["images/parts.json"].textures);
  sim.width = Renderer.instance.width;
  sim.height = Renderer.instance.height;
  Renderer.stage.addChild(sim);
  // set up the standard board
  sim.initStandardBoard();
  sim.actionbar.zoomToFit();
});