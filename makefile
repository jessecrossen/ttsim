default: dist

watch: dist
	node_modules/typescript/bin/tsc --watch

dist: physics app graphics

server:
	python -m webbrowser "http://localhost:8080/"
	cd docs && python -m SimpleHTTPServer 8080

# APP

app: dependencies docs/index.html docs/app.js

docs/index.html: src/index.html
	mkdir -p docs
	cp src/index.html docs/index.html

docs/app.js: node_modules $(shell find src -name '*.ts')
	mkdir -p docs
	node_modules/typescript/bin/tsc

# DEPENDENCIES

dependencies: docs/system.js docs/pixi.min.js docs/pixi-filters.js \
							docs/matter.min.js

docs/system.js: node_modules
	mkdir -p docs
	cp node_modules/systemjs/dist/system.js docs/

docs/pixi-filters.js: node_modules
	mkdir -p docs
	cp node_modules/pixi-filters/dist/pixi-filters.js docs/

docs/pixi.min.js: node_modules
	mkdir -p docs
	cp node_modules/pixi.js/dist/pixi.min.js docs/

docs/matter.min.js: node_modules
	mkdir -p docs
	cp node_modules/matter-js/build/matter.min.js docs/

node_modules: package.json
	npm install
	npm update

# PHYSICS BODIES

physics: src/parts/partvertices.ts

src/parts/partvertices.ts: src/svg/parts.svg \
										 			 src/svg/physics.py src/svg/parser.py
	src/svg/physics.py src/svg/parts.svg src/parts/partvertices.ts

# GRAPHICS

# NOTE: you'll need Inkscape and ImageMagick to rebuild the graphics
graphics: docs/images/parts.png docs/images/parts.json docs/images/loading.gif \
					docs/images/icon.png

docs/images/parts.png: src/svg/parts.svg
	mkdir -p docs/images
	inkscape --export-id=parts --export-id-only --export-area-page \
					 --export-png=docs/images/parts.png src/svg/parts.svg

docs/images/parts.json: src/svg/parts.svg \
												src/svg/spritesheet.py src/svg/parser.py
	mkdir -p docs/images
	src/svg/spritesheet.py src/svg/parts.svg docs/images/parts.json

docs/images/loading.gif: src/svg/gear.svg
	mkdir -p docs/images
	mkdir -p /tmp/ttsim
	inkscape --export-area-page --export-png=/tmp/ttsim/gear.png src/svg/gear.svg
	convert -loop 0 -dispose Background \
		/tmp/ttsim/gear.png -crop 84x84 +repage \
		docs/images/loading.gif

docs/images/icon.png: src/svg/icon.svg
	mkdir -p docs/images
	inkscape --export-area-page --export-png=docs/images/icon.png \
		src/svg/icon.svg

# CLEANUP

clean:
	-rm -rf node_modules
	-rm -rf docs/*
	-rm -rf build