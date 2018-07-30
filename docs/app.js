System.register("parts/location", ["parts/part"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var part_1, PartLocation, GearLocation;
    return {
        setters: [
            function (part_1_1) {
                part_1 = part_1_1;
            }
        ],
        execute: function () {
            PartLocation = class PartLocation extends part_1.Part {
                get canRotate() { return (false); }
                get canMirror() { return (true); }
                get canFlip() { return (false); }
                get type() { return (0 /* PARTLOC */); }
                get texturePrefix() { return ('partloc'); }
            };
            exports_1("PartLocation", PartLocation);
            GearLocation = class GearLocation extends part_1.Part {
                get canRotate() { return (false); }
                get canMirror() { return (true); }
                get canFlip() { return (false); }
                get type() { return (1 /* GEARLOC */); }
                get texturePrefix() { return ('gearloc'); }
            };
            exports_1("GearLocation", GearLocation);
        }
    };
});
System.register("parts/ramp", ["parts/part"], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var part_2, Ramp;
    return {
        setters: [
            function (part_2_1) {
                part_2 = part_2_1;
            }
        ],
        execute: function () {
            Ramp = class Ramp extends part_2.Part {
                get canRotate() { return (true); }
                get canMirror() { return (false); }
                get canFlip() { return (true); }
                get type() { return (2 /* RAMP */); }
                get texturePrefix() { return ('ramp'); }
            };
            exports_2("Ramp", Ramp);
        }
    };
});
System.register("parts/crossover", ["parts/part"], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var part_3, Crossover;
    return {
        setters: [
            function (part_3_1) {
                part_3 = part_3_1;
            }
        ],
        execute: function () {
            Crossover = class Crossover extends part_3.Part {
                get canRotate() { return (false); }
                get canMirror() { return (true); }
                get canFlip() { return (false); }
                get type() { return (3 /* CROSSOVER */); }
                get texturePrefix() { return ('cross'); }
            };
            exports_3("Crossover", Crossover);
        }
    };
});
System.register("parts/interceptor", ["parts/part"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var part_4, Interceptor;
    return {
        setters: [
            function (part_4_1) {
                part_4 = part_4_1;
            }
        ],
        execute: function () {
            Interceptor = class Interceptor extends part_4.Part {
                get canRotate() { return (false); }
                get canMirror() { return (true); }
                get canFlip() { return (false); }
                get type() { return (4 /* INTERCEPTOR */); }
                get texturePrefix() { return ('intercept'); }
            };
            exports_4("Interceptor", Interceptor);
        }
    };
});
System.register("parts/bit", ["parts/part"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var part_5, Bit;
    return {
        setters: [
            function (part_5_1) {
                part_5 = part_5_1;
            }
        ],
        execute: function () {
            Bit = class Bit extends part_5.Part {
                get canRotate() { return (true); }
                get canMirror() { return (true); }
                get canFlip() { return (false); }
                get type() { return (5 /* BIT */); }
                get texturePrefix() { return ('bit'); }
            };
            exports_5("Bit", Bit);
        }
    };
});
System.register("parts/gearbit", ["parts/part"], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var part_6, GearBase, Gearbit, Gear;
    return {
        setters: [
            function (part_6_1) {
                part_6 = part_6_1;
            }
        ],
        execute: function () {
            GearBase = class GearBase extends part_6.Part {
                constructor() {
                    super(...arguments);
                    // a set of connected gears that should have the same rotation
                    this.connected = null;
                    // a label used in the connection-finding algorithm
                    this._connectionLabel = -1;
                }
                // transfer rotation to connected elements
                get rotation() { return (super.rotation); }
                set rotation(v) {
                    if ((!GearBase._settingConnectedRotation) && (this.connected)) {
                        GearBase._settingConnectedRotation = this;
                        for (const part of this.connected) {
                            if (part !== this)
                                part.rotation = v;
                        }
                        GearBase._settingConnectedRotation = null;
                    }
                    if ((GearBase._settingConnectedRotation) &&
                        (GearBase._settingConnectedRotation !== this)) {
                        this.cancelRotationAnimation();
                    }
                    super.rotation = v;
                }
            };
            GearBase._settingConnectedRotation = null;
            exports_6("GearBase", GearBase);
            Gearbit = class Gearbit extends GearBase {
                get canRotate() { return (true); }
                get canMirror() { return (true); }
                get canFlip() { return (false); }
                get type() { return (6 /* GEARBIT */); }
                get texturePrefix() { return ('gearbit'); }
            };
            exports_6("Gearbit", Gearbit);
            Gear = class Gear extends GearBase {
                get canRotate() { return (true); }
                get canMirror() { return (false); } // (the cross is not mirrored)
                get canFlip() { return (false); }
                get type() { return (7 /* GEAR */); }
                get texturePrefix() { return ('gear'); }
                // gears rotate in the reverse direction from their gearbits, but making
                //  them have the same rotation value is convenient
                _angleForRotation(r) {
                    return (-super._angleForRotation(r));
                }
            };
            exports_6("Gear", Gear);
        }
    };
});
System.register("parts/factory", ["parts/location", "parts/ramp", "parts/crossover", "parts/interceptor", "parts/bit", "parts/gearbit"], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var location_1, ramp_1, crossover_1, interceptor_1, bit_1, gearbit_1, PartFactory;
    return {
        setters: [
            function (location_1_1) {
                location_1 = location_1_1;
            },
            function (ramp_1_1) {
                ramp_1 = ramp_1_1;
            },
            function (crossover_1_1) {
                crossover_1 = crossover_1_1;
            },
            function (interceptor_1_1) {
                interceptor_1 = interceptor_1_1;
            },
            function (bit_1_1) {
                bit_1 = bit_1_1;
            },
            function (gearbit_1_1) {
                gearbit_1 = gearbit_1_1;
            }
        ],
        execute: function () {
            PartFactory = class PartFactory {
                constructor(textures) {
                    this.textures = textures;
                }
                // make a new part of the given type
                make(type) {
                    switch (type) {
                        case 0 /* PARTLOC */: return (new location_1.PartLocation(this.textures));
                        case 1 /* GEARLOC */: return (new location_1.GearLocation(this.textures));
                        case 2 /* RAMP */: return (new ramp_1.Ramp(this.textures));
                        case 3 /* CROSSOVER */: return (new crossover_1.Crossover(this.textures));
                        case 4 /* INTERCEPTOR */: return (new interceptor_1.Interceptor(this.textures));
                        case 5 /* BIT */: return (new bit_1.Bit(this.textures));
                        case 7 /* GEAR */: return (new gearbit_1.Gear(this.textures));
                        case 6 /* GEARBIT */: return (new gearbit_1.Gearbit(this.textures));
                        default: return (null);
                    }
                }
                // make a copy of the given part with the same basic state
                copy(part) {
                    if (!part)
                        return (null);
                    const newPart = this.make(part.type);
                    if (newPart) {
                        newPart.rotation = part.bitValue ? 1.0 : 0.0;
                        newPart.isFlipped = part.isFlipped;
                    }
                    return (newPart);
                }
            };
            exports_7("PartFactory", PartFactory);
        }
    };
});
/// <reference types="pixi.js" />
System.register("renderer", [], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    var Renderer;
    return {
        setters: [],
        execute: function () {
            Renderer = class Renderer {
                static needsUpdate() {
                    Renderer._needsUpdate = true;
                }
                static start() {
                    PIXI.ticker.shared.add(Renderer.render, Renderer, PIXI.UPDATE_PRIORITY.LOW);
                }
                static render() {
                    if (Renderer._needsUpdate) {
                        Renderer.instance.render(Renderer.stage);
                        Renderer._needsUpdate = false;
                    }
                }
            };
            Renderer._needsUpdate = false;
            Renderer.instance = PIXI.autoDetectRenderer({
                antialias: false,
                backgroundColor: 0xFFFFFF,
                roundPixels: true
            });
            Renderer.stage = new PIXI.Container();
            exports_8("Renderer", Renderer);
        }
    };
});
/// <reference types="pixi.js" />
System.register("parts/part", ["renderer"], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    var renderer_1, Part;
    return {
        setters: [
            function (renderer_1_1) {
                renderer_1 = renderer_1_1;
            }
        ],
        execute: function () {
            ;
            // base class for all parts
            Part = class Part {
                constructor(textures) {
                    this.textures = textures;
                    this._size = 64;
                    this._rotation = 0.0;
                    this._isFlipped = false;
                    this._x = 0;
                    this._y = 0;
                    this._alpha = 1;
                    this._visible = true;
                    this._rv = 0.0;
                    this.tickRotation = this._tickRotation.bind(this);
                    this._sprites = new Map();
                }
                // the unit-size of the part
                get size() { return (this._size); }
                set size(s) {
                    if (s === this._size)
                        return;
                    this._size = s;
                    this._updateSprites();
                }
                // the left/right rotation of the part (from 0.0 to 1.0)
                get rotation() { return (this._rotation); }
                set rotation(r) {
                    if (!this.canRotate)
                        return;
                    r = Math.min(Math.max(0.0, r), 1.0);
                    if (r === this._rotation)
                        return;
                    this._rotation = r;
                    this._updateSprites();
                }
                // whether the part is pointing right (or will be when animations finish)
                get bitValue() {
                    // handle animation
                    if (this._rv !== 0.0)
                        return (this._rv > 0);
                    // handle static position
                    return (this.rotation >= 0.5);
                }
                // whether the part is flipped to its left/right variant
                get isFlipped() { return (this._isFlipped); }
                set isFlipped(v) {
                    if ((!this.canFlip) || (v === this._isFlipped))
                        return;
                    this._isFlipped = v;
                    this._updateSprites();
                }
                // flip the part if it can be flipped
                flip(time = 0.0) {
                    if (this.canFlip)
                        this.isFlipped = !this.isFlipped;
                    else if (this.canRotate) {
                        this.animateRotation((this.bitValue) ? 0.0 : 1.0, time);
                    }
                }
                // the part's horizontal position in the parent
                get x() { return (this._x); }
                set x(v) {
                    if (v === this._x)
                        return;
                    this._x = v;
                    this._updateSprites();
                }
                // the part's vertical position in the parent
                get y() { return (this._y); }
                set y(v) {
                    if (v === this._y)
                        return;
                    this._y = v;
                    this._updateSprites();
                }
                // the part's opacity
                get alpha() { return (this._alpha); }
                set alpha(v) {
                    if (v === this._alpha)
                        return;
                    this._alpha = v;
                    this._updateSprites();
                }
                // whether to show the part
                get visible() { return (this._visible); }
                set visible(v) {
                    if (v === this._visible)
                        return;
                    this._visible = v;
                    this._updateSprites();
                }
                // return whether the part has the same state as the given part
                hasSameStateAs(part) {
                    return ((part) &&
                        (this.type === part.type) &&
                        (this.isFlipped === part.isFlipped) &&
                        (this.bitValue === part.bitValue));
                }
                // ANIMATION ****************************************************************
                animateRotation(target, time) {
                    if (time == 0.0) {
                        this.rotation = target;
                        return;
                    }
                    this._rv = (target - this.rotation) / (time * 60.0);
                    PIXI.ticker.shared.add(this.tickRotation);
                }
                cancelRotationAnimation() {
                    if (this._rv !== 0) {
                        this._rv = 0.0;
                        PIXI.ticker.shared.remove(this.tickRotation);
                    }
                }
                _tickRotation(delta) {
                    if (this._rv == 0.0) {
                        this.cancelRotationAnimation();
                        return;
                    }
                    this.rotation += this._rv * delta;
                    if (((this._rv > 0) && (this.rotation >= 1.0)) ||
                        ((this._rv < 0) && (this.rotation <= 0))) {
                        this.cancelRotationAnimation();
                    }
                }
                // get texture names for the various layers
                getTextureNameForLayer(layer) {
                    if (layer === 0 /* BACK */)
                        return (this.texturePrefix + '-back');
                    if (layer === 1 /* MID */)
                        return (this.texturePrefix + '-mid');
                    if (layer === 2 /* FRONT */)
                        return (this.texturePrefix + '-front');
                    return ('');
                }
                // return a sprite for the given layer, or null if there is none
                getSpriteForLayer(layer) {
                    if (!this._sprites.has(layer)) {
                        const textureName = this.getTextureNameForLayer(layer);
                        if ((textureName) && (textureName in this.textures)) {
                            const sprite = new PIXI.Sprite(this.textures[textureName]);
                            this._sprites.set(layer, sprite);
                            this._initSprite(layer);
                            this._updateSprite(layer);
                        }
                        else {
                            this._sprites.set(layer, null);
                        }
                    }
                    return (this._sprites.get(layer));
                }
                // set initial properties for a newly-created sprite
                _initSprite(layer) {
                    const sprite = this._sprites.get(layer);
                    if (!sprite)
                        return;
                    // always position sprites from the center
                    sprite.anchor.set(0.5, 0.5);
                }
                // update all sprites to track the part's state
                _updateSprites() {
                    for (let i = 0 /* BACK */; i < 3 /* COUNT */; i++) {
                        if (this._sprites.has(i))
                            this._updateSprite(i);
                    }
                }
                // update the given sprite to track the part's state
                _updateSprite(layer) {
                    const sprite = this._sprites.get(layer);
                    if (!sprite)
                        return;
                    // apply size
                    const size = this.size * 1.5;
                    sprite.width = size;
                    sprite.height = size;
                    // apply flipping
                    let xScale = this.isFlipped ?
                        -Math.abs(sprite.scale.x) : Math.abs(sprite.scale.x);
                    // apply rotation on all layers but the background
                    if (layer != 0 /* BACK */) {
                        // if we can, flip the sprite when it rotates past the center so there's
                        //  less distortion from the rotation transform
                        if ((this.canMirror) && (this.rotation > 0.5)) {
                            xScale = -xScale;
                            sprite.rotation = this._angleForRotation(this.rotation - 1.0);
                        }
                        else {
                            sprite.rotation = this._angleForRotation(this.rotation);
                        }
                    }
                    // apply any scale changes
                    sprite.scale.x = xScale;
                    // position the part
                    sprite.position.set(this.x, this.y);
                    // apply opacity and visibility
                    sprite.visible = this.visible;
                    sprite.alpha = sprite.visible ? this.alpha : 0;
                    // schedule rendering
                    renderer_1.Renderer.needsUpdate();
                }
                // get the angle for the given rotation value
                _angleForRotation(r) {
                    return (r * (Math.PI / 2));
                }
            };
            exports_9("Part", Part);
        }
    };
});
System.register("ui/config", [], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
/*
 * Disjoint-set data structure - Library (TypeScript)
 *
 * Copyright (c) 2018 Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/disjoint-set-data-structure
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */
System.register("util/disjoint", [], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    var DisjointSet;
    return {
        setters: [],
        execute: function () {
            /*
             * Represents a set of disjoint sets. Also known as the union-find data structure.
             * Main operations are querying if two elements are in the same set, and merging two sets together.
             * Useful for testing graph connectivity, and is used in Kruskal's algorithm.
             */
            DisjointSet = class DisjointSet {
                // Constructs a new set containing the given number of singleton sets.
                // For example, new DisjointSet(3) --> {{0}, {1}, {2}}.
                constructor(numElems) {
                    // Per-node property arrays. This representation is more space-efficient than creating one node object per element.
                    this.parents = []; // The index of the parent element. An element is a representative iff its parent is itself.
                    this.ranks = []; // Always in the range [0, floor(log2(numElems))].
                    this.sizes = []; // Positive number if the element is a representative, otherwise zero.
                    if (numElems < 0)
                        throw "Number of elements must be non-negative";
                    this.numSets = numElems;
                    for (let i = 0; i < numElems; i++) {
                        this.parents.push(i);
                        this.ranks.push(0);
                        this.sizes.push(1);
                    }
                }
                // Returns the number of elements among the set of disjoint sets; this was the number passed
                // into the constructor and is constant for the lifetime of the object. All the other methods
                // require the argument elemIndex to satisfy 0 <= elemIndex < getNumberOfElements().
                getNumberOfElements() {
                    return this.parents.length;
                }
                // Returns the number of disjoint sets overall. This number decreases monotonically as time progresses;
                // each call to mergeSets() either decrements the number by one or leaves it unchanged. 0 <= result <= getNumberOfElements().
                getNumberOfSets() {
                    return this.numSets;
                }
                // Returns the size of the set that the given element is a member of. 1 <= result <= getNumberOfElements().
                getSizeOfSet(elemIndex) {
                    return this.sizes[this.getRepr(elemIndex)];
                }
                // Tests whether the given two elements are members of the same set. Note that the arguments are orderless.
                areInSameSet(elemIndex0, elemIndex1) {
                    return this.getRepr(elemIndex0) == this.getRepr(elemIndex1);
                }
                // Merges together the sets that the given two elements belong to. This method is also known as "union" in the literature.
                // If the two elements belong to different sets, then the two sets are merged and the method returns true.
                // Otherwise they belong in the same set, nothing is changed and the method returns false. Note that the arguments are orderless.
                mergeSets(elemIndex0, elemIndex1) {
                    // Get representatives
                    let repr0 = this.getRepr(elemIndex0);
                    let repr1 = this.getRepr(elemIndex1);
                    if (repr0 == repr1)
                        return false;
                    // Compare ranks
                    let cmp = this.ranks[repr0] - this.ranks[repr1];
                    if (cmp == 0)
                        this.ranks[repr0]++;
                    else if (cmp < 0) {
                        let temp = repr0;
                        repr0 = repr1;
                        repr1 = temp;
                    }
                    // Graft repr1's subtree onto node repr0
                    this.parents[repr1] = repr0;
                    this.sizes[repr0] += this.sizes[repr1];
                    this.sizes[repr1] = 0;
                    this.numSets--;
                    return true;
                }
                // Returns the representative element for the set containing the given element. This method is also
                // known as "find" in the literature. Also performs path compression, which alters the internal state to
                // improve the speed of future queries, but has no externally visible effect on the values returned.
                getRepr(elemIndex) {
                    if (elemIndex < 0 || elemIndex >= this.parents.length)
                        throw "Element index out of bounds";
                    // Follow parent pointers until we reach a representative
                    let parent = this.parents[elemIndex];
                    if (parent == elemIndex)
                        return elemIndex;
                    while (true) {
                        let grandparent = this.parents[parent];
                        if (grandparent == parent)
                            return parent;
                        this.parents[elemIndex] = grandparent; // Partial path compression
                        elemIndex = parent;
                        parent = grandparent;
                    }
                }
            };
            exports_11("DisjointSet", DisjointSet);
        }
    };
});
/// <reference types="pixi.js" />
/// <reference types="pixi-filters" />
System.register("board/board", ["parts/gearbit", "util/disjoint"], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    var gearbit_2, disjoint_1, Board;
    return {
        setters: [
            function (gearbit_2_1) {
                gearbit_2 = gearbit_2_1;
            },
            function (disjoint_1_1) {
                disjoint_1 = disjoint_1_1;
            }
        ],
        execute: function () {
            Board = class Board {
                constructor(partFactory) {
                    this.partFactory = partFactory;
                    this.view = new PIXI.Sprite();
                    this._layers = new PIXI.Container();
                    this._containers = new Map();
                    this._width = 0;
                    this._height = 0;
                    this._partSize = 64;
                    this._columnCount = 0;
                    this._rowCount = 0;
                    this._grid = [];
                    this._tool = 0 /* NONE */;
                    this._partPrototype = null;
                    this._bindMouseEvents();
                    this.view.addChild(this._layers);
                    this._initContainers();
                    this._updateDropShadows();
                }
                // LAYERS *******************************************************************
                _initContainers() {
                    this._setContainer(0 /* BACK */, false);
                    this._setContainer(1 /* MID */, false);
                    this._setContainer(2 /* FRONT */, false);
                }
                _setContainer(layer, highPerformance = false) {
                    const newContainer = this._makeContainer(highPerformance);
                    if (this._containers.has(layer)) {
                        const oldContainer = this._containers.get(layer);
                        this._layers.removeChild(oldContainer);
                        for (const child of oldContainer.children) {
                            newContainer.addChild(child);
                        }
                    }
                    this._containers.set(layer, newContainer);
                    this._layers.addChild(newContainer);
                }
                _makeContainer(highPerformance = false) {
                    if (highPerformance)
                        return (new PIXI.particles.ParticleContainer(1500, {
                            vertices: true,
                            position: true,
                            rotation: true,
                            tint: true,
                            alpha: true
                        }, 100, true));
                    else
                        return (new PIXI.Container());
                }
                _updateDropShadows() {
                    this._containers.get(0 /* BACK */).filters = [
                        this._makeShadow(this.partSize / 32.0)
                    ];
                    this._containers.get(1 /* MID */).filters = [
                        this._makeShadow(this.partSize / 16.0)
                    ];
                    this._containers.get(2 /* FRONT */).filters = [
                        this._makeShadow(this.partSize / 8.0)
                    ];
                }
                _makeShadow(size) {
                    return (new PIXI.filters.DropShadowFilter({
                        alpha: 0.35,
                        blur: size * 0.25,
                        color: 0x000000,
                        distance: size,
                        kernels: null,
                        pixelSize: 1,
                        quality: 3,
                        resolution: PIXI.settings.RESOLUTION,
                        rotation: 45,
                        shadowOnly: false
                    }));
                }
                _updateFilterAreas() {
                    const area = new PIXI.Rectangle(0, 0, this.width, this.height);
                    this._containers.get(0 /* BACK */).filterArea = area;
                    this._containers.get(1 /* MID */).filterArea = area;
                    this._containers.get(2 /* FRONT */).filterArea = area;
                }
                // LAYOUT *******************************************************************
                get width() { return (this._width); }
                set width(v) {
                    if (v === this._width)
                        return;
                    this._width = v;
                    this.view.hitArea = new PIXI.Rectangle(0, 0, this._width, this._height);
                    this._updateFilterAreas();
                }
                get height() { return (this._height); }
                set height(v) {
                    if (v === this._height)
                        return;
                    this._height = v;
                    this.view.hitArea = new PIXI.Rectangle(0, 0, this._width, this._height);
                    this._updateFilterAreas();
                }
                // GRID MANAGEMENT **********************************************************
                // change the size to draw parts at
                get partSize() { return (this._partSize); }
                set partSize(v) {
                    if (v === this._partSize)
                        return;
                    this._partSize = v;
                    this.layoutParts();
                    this._updateDropShadows();
                }
                // get the size of the part grid
                get columnCount() { return (this._columnCount); }
                get rowCount() { return (this._rowCount); }
                // update the part grid
                setSize(columnCount, rowCount) {
                    let r, c, p;
                    // contract rows
                    if (rowCount < this._rowCount) {
                        for (r = rowCount; r < this._rowCount; r++) {
                            for (p of this._grid[r])
                                this.removePart(p);
                        }
                        this._grid.splice(rowCount, this._rowCount - rowCount);
                        this._rowCount = rowCount;
                    }
                    // expand columns
                    if ((columnCount > this._columnCount) && (this._rowCount > 0)) {
                        r = 0;
                        for (const row of this._grid) {
                            for (c = this._columnCount; c < columnCount; c++) {
                                p = this.makeBackgroundPart(c, r);
                                row.push(p);
                                this.addPart(p);
                                this.layoutPart(p, c, r);
                            }
                            r++;
                        }
                    }
                    else if ((columnCount < this._columnCount) && (this._rowCount > 0)) {
                        for (const row of this._grid) {
                            for (c = columnCount; c < this._columnCount; c++) {
                                this.removePart(row[c]);
                            }
                            row.splice(columnCount, this._columnCount - columnCount);
                        }
                    }
                    this._columnCount = columnCount;
                    // expand rows
                    if (rowCount > this._rowCount) {
                        for (r = this._rowCount; r < rowCount; r++) {
                            const row = [];
                            for (c = 0; c < columnCount; c++) {
                                p = this.makeBackgroundPart(c, r);
                                row.push(p);
                                this.addPart(p);
                                this.layoutPart(p, c, r);
                            }
                            this._grid.push(row);
                        }
                    }
                    this._rowCount = rowCount;
                }
                // whether a part can be placed at the given row and column
                canPlacePart(type, column, row) {
                    if ((column < 0) || (column >= this._columnCount) ||
                        (row < 0) || (row >= this._rowCount))
                        return (false);
                    if ((type == 0 /* PARTLOC */) || (type == 1 /* GEARLOC */))
                        return (true);
                    else if (type == 7 /* GEAR */)
                        return ((row + column) % 2 != 0);
                    else
                        return ((row + column) % 2 == 0);
                }
                // make a background part for the given row and column position
                makeBackgroundPart(column, row) {
                    return (this.partFactory.make((row + column) % 2 == 0 ?
                        0 /* PARTLOC */ : 1 /* GEARLOC */));
                }
                // set the tool to use when the user clicks
                get tool() { return (this._tool); }
                set tool(v) {
                    if (v === this._tool)
                        return;
                    this._tool = v;
                    this.view.cursor = (this.tool != 0 /* NONE */) ?
                        'pointer' : 'auto';
                }
                // set the part used as a prototype for adding parts
                get partPrototype() { return (this._partPrototype); }
                set partPrototype(p) {
                    if (p === this._partPrototype)
                        return;
                    if (this._partPrototype)
                        this.removePart(this._partPrototype);
                    this._partPrototype = p;
                    if (this._partPrototype) {
                        this._partPrototype.alpha = 0.5 /* PREVIEW_ALPHA */;
                        this._partPrototype.visible = false;
                        this.addPart(this._partPrototype);
                    }
                }
                // get the part at the given coordinates
                getPart(column, row) {
                    if ((column < 0) || (column >= this._columnCount) ||
                        (row < 0) || (row >= this._rowCount))
                        return (null);
                    return (this._grid[row][column]);
                }
                // set the part at the given coordinates
                setPart(newPart, column, row) {
                    if ((column < 0) || (column >= this._columnCount) ||
                        (row < 0) || (row >= this._rowCount))
                        return;
                    const oldPart = this.getPart(column, row);
                    if (oldPart === newPart)
                        return;
                    if (oldPart)
                        this.removePart(oldPart);
                    if (newPart)
                        this.addPart(newPart);
                    this._grid[row][column] = newPart;
                    if (newPart)
                        this.layoutPart(newPart, column, row);
                    // update gear connections
                    if ((oldPart instanceof gearbit_2.GearBase) || (newPart instanceof gearbit_2.GearBase)) {
                        // disconnect the old part
                        if (oldPart instanceof gearbit_2.GearBase)
                            oldPart.connected = null;
                        // rebuild connections between gears and gearbits
                        this._connectGears();
                        // merge the new part's rotation with the connected set
                        if ((newPart instanceof gearbit_2.GearBase) && (newPart.connected)) {
                            let sum = 0.0;
                            for (const part of newPart.connected) {
                                sum += part.rotation;
                            }
                            newPart.rotation = ((sum / newPart.connected.size) >= 0.5) ? 1.0 : 0.0;
                        }
                    }
                }
                // clear parts from the given coordinates
                clearPart(column, row) {
                    this.setPart(this.makeBackgroundPart(column, row), column, row);
                }
                // add a part to the board's layers
                addPart(part) {
                    for (let i = 0 /* BACK */; i < 3 /* COUNT */; i++) {
                        const sprite = part.getSpriteForLayer(i);
                        if (!sprite)
                            continue;
                        const container = this._containers.get(i);
                        container.addChild(sprite);
                    }
                }
                // remove a part from the board's layers
                removePart(part) {
                    for (let i = 0 /* BACK */; i < 3 /* COUNT */; i++) {
                        const sprite = part.getSpriteForLayer(i);
                        if (!sprite)
                            continue;
                        const container = this._containers.get(i);
                        if (sprite.parent === container)
                            container.removeChild(sprite);
                    }
                }
                // do layout for one part at the given location
                layoutPart(part, column, row) {
                    part.size = this.partSize;
                    part.x = this.xForColumn(column);
                    part.y = this.yForRow(row);
                }
                // do layout for all parts on the grid
                layoutParts() {
                    let r = 0;
                    for (const row of this._grid) {
                        let c = 0;
                        for (const part of row) {
                            this.layoutPart(part, c, r);
                            c++;
                        }
                        r++;
                    }
                }
                // get the margin to place the top/left parts at
                get margin() { return (Math.ceil(this.partSize * 0.75)); }
                get spacing() { return (this.partSize * 1.0625); }
                // get the column for the given X coordinate
                columnForX(x) {
                    return (Math.round((x - this.margin) / this.spacing));
                }
                // get the row for the given X coordinate
                rowForY(y) {
                    return (Math.round((y - this.margin) / this.spacing));
                }
                // get the X coordinate for the given column index
                xForColumn(column) {
                    return (this.margin + Math.round(column * this.partSize * 1.0625));
                }
                // get the Y coordinate for the given row index
                yForRow(row) {
                    return (this.margin + Math.round(row * this.partSize * 1.0625));
                }
                // connect adjacent sets of gears
                //  see: https://en.wikipedia.org/wiki/Connected-component_labeling
                _connectGears() {
                    let r;
                    let c;
                    let label = 0;
                    let min, max;
                    let westPart, westLabel;
                    let northPart, northLabel;
                    let allGears = new Set();
                    for (const row of this._grid) {
                        for (const part of row) {
                            if (part instanceof gearbit_2.GearBase)
                                allGears.add(part);
                        }
                    }
                    let equivalence = new disjoint_1.DisjointSet(allGears.size);
                    r = 0;
                    for (const row of this._grid) {
                        c = 0;
                        westPart = null;
                        for (const part of row) {
                            northPart = r > 0 ? this.getPart(c, r - 1) : null;
                            if (part instanceof gearbit_2.GearBase) {
                                northLabel = (northPart instanceof gearbit_2.GearBase) ?
                                    northPart._connectionLabel : -1;
                                westLabel = (westPart instanceof gearbit_2.GearBase) ?
                                    westPart._connectionLabel : -1;
                                if ((northLabel >= 0) && (westLabel >= 0)) {
                                    if (northLabel === westLabel) {
                                        part._connectionLabel = northLabel;
                                    }
                                    else {
                                        min = Math.min(northLabel, westLabel);
                                        max = Math.max(northLabel, westLabel);
                                        part._connectionLabel = min;
                                        equivalence.mergeSets(min, max);
                                    }
                                }
                                else if (northLabel >= 0) {
                                    part._connectionLabel = northLabel;
                                }
                                else if (westLabel >= 0) {
                                    part._connectionLabel = westLabel;
                                }
                                else
                                    part._connectionLabel = label++;
                            }
                            westPart = part;
                            c++;
                        }
                        r++;
                    }
                    // group labeled gears into sets
                    const sets = new Map();
                    for (const part of allGears) {
                        label = equivalence.getRepr(part._connectionLabel);
                        if (!sets.has(label))
                            sets.set(label, new Set());
                        const set = sets.get(label);
                        set.add(part);
                        part.connected = set;
                    }
                }
                // INTERACTION **************************************************************
                _bindMouseEvents() {
                    this.view.interactive = true;
                    this.view.addListener('mousemove', this._onMouseMove.bind(this));
                    this.view.addListener('click', this._onClick.bind(this));
                }
                _onMouseMove(e) {
                    const p = e.data.getLocalPosition(this.view);
                    this._updatePreview(p.x, p.y);
                }
                _updatePreview(x, y) {
                    if (!this.partPrototype)
                        return;
                    const column = this.columnForX(x);
                    const row = this.rowForY(y);
                    if (this.canPlacePart(this.partPrototype.type, column, row)) {
                        this.partPrototype.visible = true;
                        this.layoutPart(this.partPrototype, column, row);
                    }
                    else {
                        this.partPrototype.visible = false;
                    }
                }
                _onClick(e) {
                    const p = e.data.getLocalPosition(this.view);
                    const column = this.columnForX(p.x);
                    const row = this.rowForY(p.y);
                    if (this.tool == 1 /* PART */) {
                        if (this.partPrototype)
                            this._placePartPrototype(column, row);
                    }
                    else if (this.tool == 2 /* ERASER */) {
                        this.clearPart(column, row);
                    }
                    else if (this.tool == 3 /* FLIPPER */) {
                        const part = this.getPart(column, row);
                        if (part)
                            part.flip(0.25 /* FLIP */);
                    }
                }
                _placePartPrototype(column, row) {
                    if (!this.partPrototype)
                        return;
                    if (!this.canPlacePart(this.partPrototype.type, column, row))
                        return;
                    const oldPart = this.getPart(column, row);
                    if (this.partPrototype.hasSameStateAs(oldPart)) {
                        this.clearPart(column, row);
                    }
                    else {
                        this.setPart(this.partFactory.copy(this.partPrototype), column, row);
                    }
                }
            };
            exports_12("Board", Board);
        }
    };
});
/// <reference types="pixi.js" />
System.register("ui/button", ["renderer"], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    var renderer_2, Button, PartButton, SpriteButton;
    return {
        setters: [
            function (renderer_2_1) {
                renderer_2 = renderer_2_1;
            }
        ],
        execute: function () {
            Button = class Button extends PIXI.Sprite {
                constructor() {
                    super();
                    this._size = 96;
                    this._isToggled = false;
                    this._mouseOver = false;
                    this._mouseDown = false;
                    this.cursor = 'pointer';
                    this.interactive = true;
                    this.anchor.set(0.5, 0.5);
                    this._background = new PIXI.Graphics();
                    this.addChild(this._background);
                    this._updateState();
                    this.onSizeChanged();
                    this._bindHover();
                }
                get size() { return (this._size); }
                set size(v) {
                    if (v === this._size)
                        return;
                    this._size = v;
                    this.onSizeChanged();
                    renderer_2.Renderer.needsUpdate();
                }
                get isToggled() { return (this._isToggled); }
                set isToggled(v) {
                    if (v === this._isToggled)
                        return;
                    this._isToggled = v;
                    this._drawDecorations();
                    this._updateState();
                }
                onSizeChanged() {
                    this._drawDecorations();
                }
                _bindHover() {
                    this.addListener('mouseover', (e) => {
                        this._mouseOver = true;
                        this._updateState();
                    });
                    this.addListener('mouseout', (e) => {
                        this._mouseOver = false;
                        this._updateState();
                    });
                    this.addListener('mousedown', (e) => {
                        this._mouseDown = true;
                        this._updateState();
                    });
                    this.addListener('mouseup', (e) => {
                        this._mouseDown = false;
                        this._updateState();
                    });
                }
                _updateState() {
                    if ((this._mouseOver) && (this._mouseDown)) {
                        this._background.alpha = 0.3 /* BUTTON_DOWN */;
                    }
                    else if (this._mouseOver) {
                        this._background.alpha = 0.15 /* BUTTON_OVER */;
                    }
                    else
                        this._background.alpha = 0.1 /* BUTTON_NORMAL */;
                    renderer_2.Renderer.needsUpdate();
                }
                _drawDecorations() {
                    const radius = 8; // pixels
                    const s = this.size;
                    const hs = Math.round(s * 0.5);
                    if (this._background) {
                        this._background.clear();
                        this._background.beginFill(this.isToggled ? 16711680 /* HIGHLIGHT */ : 0 /* BUTTON_BACK */);
                        this._background.drawRoundedRect(-hs, -hs, s, s, radius);
                        this._background.endFill();
                    }
                    renderer_2.Renderer.needsUpdate();
                }
            };
            exports_13("Button", Button);
            PartButton = class PartButton extends Button {
                constructor(part) {
                    super();
                    this.part = part;
                    for (let i = 0 /* BACK */; i < 3 /* COUNT */; i++) {
                        const sprite = part.getSpriteForLayer(i);
                        if (sprite)
                            this.addChild(sprite);
                    }
                    this.onSizeChanged();
                }
                onSizeChanged() {
                    super.onSizeChanged();
                    if (this.part)
                        this.part.size = Math.floor(this.size * 0.5);
                }
            };
            exports_13("PartButton", PartButton);
            SpriteButton = class SpriteButton extends Button {
                constructor(sprite) {
                    super();
                    this.sprite = sprite;
                    if (sprite) {
                        sprite.anchor.set(0.5, 0.5);
                        this.addChild(sprite);
                    }
                    this.onSizeChanged();
                }
                onSizeChanged() {
                    super.onSizeChanged();
                    if (this.sprite) {
                        this.sprite.width =
                            this.sprite.height =
                                Math.floor(this.size * 0.75);
                    }
                }
            };
            exports_13("SpriteButton", SpriteButton);
        }
    };
});
/// <reference types="pixi.js" />
System.register("ui/toolbox", ["ui/button"], function (exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
    var button_1, Toolbox;
    return {
        setters: [
            function (button_1_1) {
                button_1 = button_1_1;
            }
        ],
        execute: function () {
            Toolbox = class Toolbox extends PIXI.Container {
                constructor(board) {
                    super();
                    this.board = board;
                    this._width = 96;
                    this._margin = 4;
                    this._buttons = [];
                    // add a button to change the position of parts
                    this._flipperButton = new button_1.SpriteButton(new PIXI.Sprite(board.partFactory.textures['flipper']));
                    this._buttons.push(this._flipperButton);
                    // add a button to remove parts
                    this._eraserButton = new button_1.PartButton(this.board.partFactory.make(0 /* PARTLOC */));
                    this._buttons.push(this._eraserButton);
                    // add buttons for parts
                    for (let i = 2 /* TOOLBOX_MIN */; i <= 7 /* TOOLBOX_MAX */; i++) {
                        const part = board.partFactory.make(i);
                        if (!part)
                            continue;
                        const button = new button_1.PartButton(part);
                        this._buttons.push(button);
                    }
                    for (const button of this._buttons) {
                        this.addChild(button);
                        button.addListener('click', this._onButtonClick.bind(this));
                    }
                    this._layout();
                }
                get width() { return (this._width); }
                set width(v) {
                    if (v === this._width)
                        return;
                    this._width = v;
                    for (const button of this._buttons) {
                        button.size = this.width;
                    }
                    this._layout();
                }
                get margin() { return (this._margin); }
                set margin(v) {
                    if (v === this._margin)
                        return;
                    this._margin = v;
                    this._layout();
                }
                get height() {
                    return ((this.width * this._buttons.length) +
                        (this.margin * (this._buttons.length + 1)));
                }
                _onButtonClick(e) {
                    if (e.target === this._flipperButton) {
                        this.board.tool = 3 /* FLIPPER */;
                        this.board.partPrototype = null;
                    }
                    else if (e.target === this._eraserButton) {
                        this.board.tool = 2 /* ERASER */;
                        this.board.partPrototype = null;
                    }
                    else if (e.target instanceof button_1.PartButton) {
                        const newPart = e.target.part;
                        if ((this.board.partPrototype) &&
                            (newPart.type === this.board.partPrototype.type)) {
                            // toggle direction if the selected part is clicked again
                            newPart.flip(0.25 /* FLIP */);
                        }
                        this.board.tool = 1 /* PART */;
                        this.board.partPrototype = this.board.partFactory.copy(newPart);
                    }
                    this._updateToggled();
                }
                _updateToggled() {
                    // update button toggle states
                    for (const button of this._buttons) {
                        if (button === this._flipperButton) {
                            button.isToggled = (this.board.tool === 3 /* FLIPPER */);
                        }
                        else if (button === this._eraserButton) {
                            button.isToggled = (this.board.tool === 2 /* ERASER */);
                        }
                        else if (button instanceof button_1.PartButton) {
                            button.isToggled = ((this.board.tool === 1 /* PART */) &&
                                (this.board.partPrototype) &&
                                (button.part.type === this.board.partPrototype.type));
                        }
                    }
                }
                _layout() {
                    const m = this.margin;
                    const w = this.width - (2 * m);
                    const hw = Math.floor(w / 2);
                    const x = m + hw;
                    let y = m + hw;
                    for (const button of this._buttons) {
                        button.size = w;
                        button.x = x;
                        button.y = y;
                        y += w + m;
                    }
                }
            };
            exports_14("Toolbox", Toolbox);
        }
    };
});
/// <reference types="pixi.js" />
System.register("app", ["board/board", "parts/factory", "ui/toolbox", "renderer"], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    var board_1, factory_1, toolbox_1, renderer_3, SimulatorApp;
    return {
        setters: [
            function (board_1_1) {
                board_1 = board_1_1;
            },
            function (factory_1_1) {
                factory_1 = factory_1_1;
            },
            function (toolbox_1_1) {
                toolbox_1 = toolbox_1_1;
            },
            function (renderer_3_1) {
                renderer_3 = renderer_3_1;
            }
        ],
        execute: function () {
            SimulatorApp = class SimulatorApp extends PIXI.Container {
                constructor(textures) {
                    super();
                    this.textures = textures;
                    this._width = 0;
                    this._height = 0;
                    this.partFactory = new factory_1.PartFactory(textures);
                    this.board = new board_1.Board(this.partFactory);
                    this.toolbox = new toolbox_1.Toolbox(this.board);
                    this.toolbox.width = 64;
                    this.board.setSize(11, 9);
                    this.addChild(this.toolbox);
                    this.board.view.x = this.toolbox.width;
                    this.addChild(this.board.view);
                }
                get width() { return (this._width); }
                set width(v) {
                    if (v === this._width)
                        return;
                    this._width = v;
                    this._layout();
                }
                get height() { return (this._height); }
                set height(v) {
                    if (v === this._height)
                        return;
                    this._height = v;
                    this._layout();
                }
                _layout() {
                    this.board.width = Math.max(0, this.width - this.toolbox.width);
                    this.board.height = this.height;
                    renderer_3.Renderer.needsUpdate();
                }
            };
            exports_15("SimulatorApp", SimulatorApp);
        }
    };
});
/// <reference types="pixi.js" />
System.register("index", ["app", "renderer"], function (exports_16, context_16) {
    "use strict";
    var __moduleName = context_16 && context_16.id;
    var app_1, renderer_4, container, sim, resizeApp, loader;
    return {
        setters: [
            function (app_1_1) {
                app_1 = app_1_1;
            },
            function (renderer_4_1) {
                renderer_4 = renderer_4_1;
            }
        ],
        execute: function () {
            container = document.getElementById('container');
            container.appendChild(renderer_4.Renderer.instance.view);
            // dynamically resize the app to track the size of the browser window
            container.style.overflow = 'hidden';
            resizeApp = () => {
                const r = container.getBoundingClientRect();
                renderer_4.Renderer.instance.resize(r.width, r.height);
                if (sim) {
                    sim.width = r.width;
                    sim.height = r.height;
                }
            };
            resizeApp();
            window.addEventListener('resize', resizeApp);
            renderer_4.Renderer.start();
            // load sprites
            loader = PIXI.loader;
            loader.add('images/parts.json').load(() => {
                sim = new app_1.SimulatorApp(PIXI.loader.resources["images/parts.json"].textures);
                sim.width = renderer_4.Renderer.instance.width;
                sim.height = renderer_4.Renderer.instance.height;
                renderer_4.Renderer.stage.addChild(sim);
            });
        }
    };
});
