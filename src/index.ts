/// <reference types="pixi.js" />

import { SimulatorApp } from './app'

// create the application
const app = new PIXI.Application({
  width: 256,
  height: 256,
  antialias: true,
  backgroundColor: 0xFFFFFF
});
const container = document.getElementById('container');
const view = app.renderer.view;
container.appendChild(app.renderer.view);

// dynamically resize the app to track the size of the browser window
container.style.overflow = 'hidden';
const resizeApp = () => {
  const r = container.getBoundingClientRect();
  app.renderer.autoResize = true;
  app.renderer.resize(r.width, r.height);
}
resizeApp();
window.addEventListener('resize', resizeApp);

// load sprites
const loader = PIXI.loader;
loader.add('images/parts.json').load(() => {

  console.log('loaded');

  const simApp = new SimulatorApp(
    PIXI.loader.resources["images/parts.json"].textures);
  app.stage.addChild(simApp);
});