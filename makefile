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

physics: src/parts/bodies.ts

src/parts/bodies.ts: src/svg/parts.svg \
										 src/svg/physics.py src/svg/parser.py
	src/svg/physics.py src/svg/parts.svg src/parts/bodies.ts

# GRAPHICS

graphics: docs/images/parts.png docs/images/parts.json

docs/images/parts.png: src/svg/parts.svg
	mkdir -p docs/images
	inkscape --export-png=docs/images/parts.png \
					 --export-area-page src/svg/parts.svg

docs/images/parts.json: src/svg/parts.svg \
												src/svg/spritesheet.py src/svg/parser.py
	mkdir -p docs/images
	src/svg/spritesheet.py src/svg/parts.svg docs/images/parts.json

# CLEANUP

clean:
	-rm -rf node_modules
	-rm -rf docs/*
	-rm -rf build