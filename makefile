default: dist

watch: dist
	node_modules/typescript/bin/tsc --watch

dist: app graphics

server:
	python -m webbrowser "http://localhost:8080/"
	cd dist && python -m SimpleHTTPServer 8080

# APP

app: dist/index.html dist/pixi.min.js dist/system.js \
		 dist/app.js

dist/index.html: src/index.html
	mkdir -p dist
	cp src/index.html dist/index.html

dist/app.js: node_modules $(shell find src -name '*.ts')
	mkdir -p dist
	node_modules/typescript/bin/tsc

dist/system.js: node_modules
	mkdir -p dist
	cp node_modules/systemjs/dist/system.js dist/

dist/pixi.min.js: node_modules
	mkdir -p dist
	cp node_modules/pixi.js/dist/pixi.min.js dist/

# DEPENDENCIES

node_modules: package.json
	npm install
	npm update

# GRAPHICS

graphics: dist/images/parts.png dist/images/parts.json

dist/images/parts.png: src/svg/parts.svg
	mkdir -p dist/images
	inkscape --export-png=dist/images/parts.png \
					 --export-area-page src/svg/parts.svg

dist/images/parts.json: src/svg/parts.svg src/svg/spritesheet.py
	mkdir -p dist/images
	src/svg/spritesheet.py src/svg/parts.svg dist/images/parts.json

# CLEANUP

clean:
	-rm -rf node_modules
	-rm -rf dist
	-rm -rf build