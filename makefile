default: dist

watch: dist
	node_modules/typescript/bin/tsc --watch

dist: app graphics

server:
	python -m webbrowser "http://localhost:8080/"
	cd docs && python -m SimpleHTTPServer 8080

# APP

app: docs/pixi.min.js docs/pixi-filters.js docs/matter.min.js \
		 docs/index.html docs/system.js docs/app.js

docs/index.html: src/index.html
	mkdir -p docs
	cp src/index.html docs/index.html

docs/app.js: node_modules $(shell find src -name '*.ts')
	mkdir -p docs
	node_modules/typescript/bin/tsc

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

# DEPENDENCIES

node_modules: package.json
	npm install
	npm update

# GRAPHICS

graphics: docs/images/parts.png docs/images/parts.json

docs/images/parts.png: src/svg/parts.svg
	mkdir -p docs/images
	inkscape --export-png=docs/images/parts.png \
					 --export-area-page src/svg/parts.svg

docs/images/parts.json: src/svg/parts.svg src/svg/spritesheet.py
	mkdir -p docs/images
	src/svg/spritesheet.py src/svg/parts.svg docs/images/parts.json

# CLEANUP

clean:
	-rm -rf node_modules
	-rm -rf docs/*
	-rm -rf build