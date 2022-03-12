Turing Tumble Simulator
=======================

This is a software simulation of the [Turing Tumble](https://www.turingtumble.com/),
an amazing programmable marble-powered computer. It runs entirely in your browser, so 
you can [try it out here](https://jessecrossen.github.io/ttsim/). If you've used 
an actual Turing Tumble, it should be straightforward to get started, but here's
[some documentation about how to use it](https://jessecrossen.github.io/ttsim/usage).
If you got here but haven't used an actual Turing Tumble yet, you may need one in 
your life!

What's Inside?
==============

It uses [pixi.js](http://www.pixijs.com/) for graphics and interaction, and 
[matter.js](http://brm.io/matter-js/) to simulate the physics of balls dropping
through the board. It's written in [TypeScript](https://www.typescriptlang.org/) and
uses [GNU make](https://www.gnu.org/software/make/) as a build system. All the graphics
and the vertices for the physics engine are generated from [InkScape](https://inkscape.org/) 
SVG files.

What's Next?
============

Here are some things I'd like to implement in the near future:

- [ ] Wrap toolbar buttons when the screen height is small
- [ ] Support for touch events
- [ ] Select one or more parts and cut/copy/paste/move them
- [ ] Keyboard shortcuts
- [ ] Undo/redo
- [ ] Allow toggling of whether parts are locked (for setting up challenges)

Reporting Bugs and Requesting Features
======================================

Please file an issue if you find a bug that doesn't have one yet. Or if you have 
the will and the skill and feel like doing something nice, fix it yourself and submit a
pull request. Feature requests are also welcome, and especially so if you can suggest
a way to add the feature with minimal complication of the interface. Note that this is 
a hobby project, so it could take some time for me to respond.

Browser Support
===============

I've developed and tested it on the latest version of Chrome, and the code should be standards-compliant enough that recent versions of Firefox will probably work as well. I'm not that interested in working around any quirks of platform-specific browsers like Safari or Edge, but will merge in basic fixes if anyone cares enough to make a pull request. Also note that the graphics may be slow/jerky if WebGL doesn't work for whatever reason.

Building
========

If you'd like to build the project yourself, you'll need at least the following:

* [GNU make](https://www.gnu.org/software/make/) to run the build
* [node.js](https://nodejs.org/en/download/) to run TypeScript and npm
* [npm](https://www.npmjs.com/) to install dependencies
* [Python 3](https://www.python.org/) for various custom build scripts (tested on 3.8)

To edit and re-build the graphics and physics assets, you'll need:

* [InkScape](https://inkscape.org/) to edit and rasterize SVG files
* [ImageMagick](https://www.imagemagick.org/script/index.php) for some image conversion operations

The build process is very likely to work well on Linux, will probably kind of work on macOS, and 
is very unlikely to work on Windows. Go to the root directory of the project in your console,
and run `make` to build the whole thing. Running `make server` will start a web server that serves 
the application on `localhost:8080`. Running `make watch` will watch TypeScript files for changes
and automatically rebuild. There are also some handy targets if you're working on just one part 
of the project: `make graphics` updates the image assets and `make physics` updates the physics
assets. Note that the physics target actually generates code, so you'll need to rebuild or have 
`make watch` running to see any effects. If things get really messed up, you can always run 
`make clean` to delete all the targets and start over.

License
=======

It's licensed under the terms of [the unlicense](LICENSE), so you can pretty much
do whatever you like with it.
