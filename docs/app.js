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
                get type() { return (1 /* PARTLOC */); }
            };
            exports_1("PartLocation", PartLocation);
            GearLocation = class GearLocation extends part_1.Part {
                get canRotate() { return (false); }
                get canMirror() { return (true); }
                get canFlip() { return (false); }
                get type() { return (2 /* GEARLOC */); }
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
                get type() { return (3 /* RAMP */); }
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
                get type() { return (4 /* CROSSOVER */); }
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
                get type() { return (5 /* INTERCEPTOR */); }
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
                get type() { return (6 /* BIT */); }
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
                get type() { return (7 /* GEARBIT */); }
            };
            exports_6("Gearbit", Gearbit);
            Gear = class Gear extends GearBase {
                constructor() {
                    super(...arguments);
                    this._isOnPartLocation = false;
                }
                get canRotate() { return (true); }
                get canMirror() { return (false); } // (the cross is not mirrored)
                get canFlip() { return (false); }
                get type() { return (8 /* GEAR */); }
                get isOnPartLocation() { return (this._isOnPartLocation); }
                set isOnPartLocation(v) {
                    if (v === this.isOnPartLocation)
                        return;
                    this._isOnPartLocation = v;
                    this._updateSprites();
                }
                _angleForRotation(r) {
                    // gears on a regular-part location need to be rotated by 1/16 turn 
                    //  to mesh with neighbors
                    if (this.isOnPartLocation) {
                        return (super._angleForRotation(r) + (Math.PI * 0.125));
                    }
                    else {
                        return (-super._angleForRotation(r));
                    }
                }
            };
            exports_6("Gear", Gear);
        }
    };
});
System.register("parts/fence", ["parts/part", "board/board"], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var part_7, board_1, Fence;
    return {
        setters: [
            function (part_7_1) {
                part_7 = part_7_1;
            },
            function (board_1_1) {
                board_1 = board_1_1;
            }
        ],
        execute: function () {
            Fence = class Fence extends part_7.Part {
                constructor() {
                    super(...arguments);
                    this._variant = 0 /* PREVIEW */;
                    this._modulus = 1;
                    this._sequence = 1;
                }
                get canRotate() { return (false); }
                get canMirror() { return (false); }
                get canFlip() { return (true); }
                get type() { return (10 /* FENCE */); }
                // the type of fence segment to display
                get variant() { return (this._variant); }
                set variant(v) {
                    if (v === this.variant)
                        return;
                    this._variant = v;
                    this._updateTexture();
                }
                static get maxModulus() { return (6); }
                // for slopes, the number of part units in the slope
                get modulus() { return (this._modulus); }
                set modulus(v) {
                    v = Math.min(Math.max(1, Math.round(v)), Fence.maxModulus);
                    if (v === this.modulus)
                        return;
                    this._modulus = v;
                    this._updateTexture();
                }
                // for slopes, the position of this part in the run of parts,
                //  where 0 is at the highest point and (modulus - 1) is at the lowest
                get sequence() { return (this._sequence); }
                set sequence(v) {
                    if (v === this.sequence)
                        return;
                    this._sequence = v;
                    this._updateTexture();
                }
                _updateTexture() {
                    for (let layer = 0 /* BACK */; layer < 7 /* COUNT */; layer++) {
                        const sprite = this.getSpriteForLayer(layer);
                        if (!sprite)
                            continue;
                        let suffix = this.textureSuffix(layer);
                        if (this.variant === 1 /* SIDE */) {
                            suffix += 'l';
                            this._yOffset = 0.0;
                        }
                        else if (this.variant === 2 /* SLOPE */) {
                            suffix += 's' + this.modulus;
                            this._yOffset = ((this.sequence % this.modulus) / this.modulus) * board_1.SPACING_FACTOR;
                        }
                        else {
                            this._yOffset = 0.0;
                        }
                        const textureName = this.texturePrefix + suffix;
                        if (textureName in this.textures) {
                            sprite.texture = this.textures[textureName];
                        }
                    }
                    this._updateSprites();
                }
            };
            exports_7("Fence", Fence);
        }
    };
});
System.register("parts/blank", ["parts/part"], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    var part_8, Blank;
    return {
        setters: [
            function (part_8_1) {
                part_8 = part_8_1;
            }
        ],
        execute: function () {
            Blank = class Blank extends part_8.Part {
                get canRotate() { return (false); }
                get canMirror() { return (false); }
                get canFlip() { return (false); }
                get type() { return (0 /* BLANK */); }
            };
            exports_8("Blank", Blank);
        }
    };
});
System.register("parts/drop", ["parts/part"], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    var part_9, Drop;
    return {
        setters: [
            function (part_9_1) {
                part_9 = part_9_1;
            }
        ],
        execute: function () {
            Drop = class Drop extends part_9.Part {
                get canRotate() { return (false); }
                get canMirror() { return (false); }
                get canFlip() { return (true); }
                get type() { return (9 /* DROP */); }
            };
            exports_9("Drop", Drop);
        }
    };
});
System.register("parts/factory", ["parts/location", "parts/ramp", "parts/crossover", "parts/interceptor", "parts/bit", "parts/gearbit", "parts/fence", "parts/blank", "parts/drop"], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    var location_1, ramp_1, crossover_1, interceptor_1, bit_1, gearbit_1, fence_1, blank_1, drop_1, PartFactory;
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
            },
            function (fence_1_1) {
                fence_1 = fence_1_1;
            },
            function (blank_1_1) {
                blank_1 = blank_1_1;
            },
            function (drop_1_1) {
                drop_1 = drop_1_1;
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
                        case 0 /* BLANK */: return (new blank_1.Blank(this.textures));
                        case 1 /* PARTLOC */: return (new location_1.PartLocation(this.textures));
                        case 2 /* GEARLOC */: return (new location_1.GearLocation(this.textures));
                        case 3 /* RAMP */: return (new ramp_1.Ramp(this.textures));
                        case 4 /* CROSSOVER */: return (new crossover_1.Crossover(this.textures));
                        case 5 /* INTERCEPTOR */: return (new interceptor_1.Interceptor(this.textures));
                        case 6 /* BIT */: return (new bit_1.Bit(this.textures));
                        case 8 /* GEAR */: return (new gearbit_1.Gear(this.textures));
                        case 7 /* GEARBIT */: return (new gearbit_1.Gearbit(this.textures));
                        case 9 /* DROP */: return (new drop_1.Drop(this.textures));
                        case 10 /* FENCE */: return (new fence_1.Fence(this.textures));
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
                        newPart.isLocked = part.isLocked;
                    }
                    return (newPart);
                }
            };
            exports_10("PartFactory", PartFactory);
        }
    };
});
System.register("ui/config", [], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
/// <reference types="pixi.js" />
System.register("renderer", [], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
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
                backgroundColor: 16777215 /* BACKGROUND */
            });
            Renderer.stage = new PIXI.Container();
            exports_12("Renderer", Renderer);
        }
    };
});
/// <reference types="pixi.js" />
System.register("parts/part", ["renderer"], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
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
                    // whether the part can be replaced
                    this.isLocked = false;
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
                    // adjustable offsets for textures (as a fraction of the size)
                    this._xOffset = 0.0;
                    this._yOffset = 0.0;
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
                // SPRITES ******************************************************************
                // the prefix to append before texture names for this part
                get texturePrefix() { return (this.constructor.name); }
                // the suffix to append to select a specific layer
                textureSuffix(layer) {
                    if (layer === 0 /* BACK */)
                        return ('-b');
                    if (layer === 1 /* MID */)
                        return ('-m');
                    if (layer === 2 /* FRONT */)
                        return ('-f');
                    if (layer === 3 /* SCHEMATIC_BACK */)
                        return ('-sb');
                    if (layer === 4 /* SCHEMATIC */)
                        return ('-s');
                    if (layer === 6 /* SCHEMATIC_4 */)
                        return ('-s4');
                    if (layer === 5 /* SCHEMATIC_2 */)
                        return ('-s2');
                    return ('');
                }
                // get texture names for the various layers
                getTextureNameForLayer(layer) {
                    return (this.texturePrefix + this.textureSuffix(layer));
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
                    for (let i = 0 /* BACK */; i < 7 /* COUNT */; i++) {
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
                    const size = (this.size > 2) ? (this.size * 1.5) : this.size;
                    sprite.width = size;
                    sprite.height = size;
                    // apply flipping
                    let xScale = this._flipX ?
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
                    sprite.position.set(this.x + (this._xOffset * this.size), this.y + (this._yOffset * this.size));
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
                // get whether to flip the x axis
                get _flipX() {
                    return (this.isFlipped);
                }
            };
            exports_13("Part", Part);
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
System.register("util/disjoint", [], function (exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
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
            exports_14("DisjointSet", DisjointSet);
        }
    };
});
/// <reference types="pixi.js" />
/// <reference types="pixi-filters" />
System.register("board/board", ["parts/fence", "parts/gearbit", "util/disjoint", "renderer"], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    var fence_2, gearbit_2, disjoint_1, renderer_2, PartSizes, SPACING_FACTOR, Board;
    return {
        setters: [
            function (fence_2_1) {
                fence_2 = fence_2_1;
            },
            function (gearbit_2_1) {
                gearbit_2 = gearbit_2_1;
            },
            function (disjoint_1_1) {
                disjoint_1 = disjoint_1_1;
            },
            function (renderer_2_1) {
                renderer_2 = renderer_2_1;
            }
        ],
        execute: function () {
            exports_15("PartSizes", PartSizes = [2, 4, 6, 8, 12, 16, 24, 32, 48, 64]);
            exports_15("SPACING_FACTOR", SPACING_FACTOR = 1.0625);
            Board = class Board {
                constructor(partFactory) {
                    this.partFactory = partFactory;
                    this.view = new PIXI.Sprite();
                    this._layers = new PIXI.Container();
                    this._schematic = false;
                    this._containers = new Map();
                    this._partSize = 64;
                    this._width = 0;
                    this._height = 0;
                    this._centerColumn = 0.0;
                    this._centerRow = 0.0;
                    this._columnCount = 0;
                    this._rowCount = 0;
                    this._grid = [];
                    this._tool = 0 /* NONE */;
                    this._partPrototype = null;
                    this._isMouseDown = false;
                    this._dragging = false;
                    this._dragFlippedParts = new Set();
                    this._action = 0 /* PAN */;
                    this._bindMouseEvents();
                    this.view.addChild(this._layers);
                    this._initContainers();
                    this._updateDropShadows();
                }
                // whether to show parts in schematic form
                get schematic() { return (this._schematic); }
                set schematic(v) {
                    if (v === this._schematic)
                        return;
                    this._schematic = v;
                    this._updateLayerVisibility();
                }
                // LAYERS *******************************************************************
                _initContainers() {
                    this._setContainer(0 /* BACK */, false);
                    this._setContainer(1 /* MID */, false);
                    this._setContainer(2 /* FRONT */, false);
                    this._setContainer(3 /* SCHEMATIC_BACK */, true);
                    this._setContainer(4 /* SCHEMATIC */, true);
                    this._setContainer(6 /* SCHEMATIC_4 */, true);
                    this._setContainer(5 /* SCHEMATIC_2 */, true);
                    this._updateLayerVisibility();
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
                    const tl = this.view.toGlobal(new PIXI.Point(0, 0));
                    const br = this.view.toGlobal(new PIXI.Point(this.width, this.height));
                    const area = new PIXI.Rectangle(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
                    this._containers.get(0 /* BACK */).filterArea = area;
                    this._containers.get(1 /* MID */).filterArea = area;
                    this._containers.get(2 /* FRONT */).filterArea = area;
                }
                _updateLayerVisibility() {
                    const showContainer = (layer, show) => {
                        if (this._containers.has(layer))
                            this._containers.get(layer).visible = show;
                    };
                    showContainer(0 /* BACK */, !this.schematic);
                    showContainer(1 /* MID */, !this.schematic);
                    showContainer(2 /* FRONT */, !this.schematic);
                    showContainer(3 /* SCHEMATIC_BACK */, this.schematic && (this.partSize >= 12));
                    showContainer(4 /* SCHEMATIC */, this.schematic);
                    showContainer(6 /* SCHEMATIC_4 */, this.schematic && (this.partSize == 4));
                    showContainer(5 /* SCHEMATIC_2 */, this.schematic && (this.partSize == 2));
                    renderer_2.Renderer.needsUpdate();
                }
                // LAYOUT *******************************************************************
                // change the size to draw parts at
                get partSize() { return (this._partSize); }
                set partSize(v) {
                    if (v === this._partSize)
                        return;
                    this._partSize = v;
                    this.layoutParts();
                    this._updateDropShadows();
                    this._updateLayerVisibility();
                    this._updatePan();
                }
                // the width of the display area
                get width() { return (this._width); }
                set width(v) {
                    if (v === this._width)
                        return;
                    this._width = v;
                    this.view.hitArea = new PIXI.Rectangle(0, 0, this._width, this._height);
                    this._updatePan();
                    this._updateFilterAreas();
                }
                // the height of the display area
                get height() { return (this._height); }
                set height(v) {
                    if (v === this._height)
                        return;
                    this._height = v;
                    this.view.hitArea = new PIXI.Rectangle(0, 0, this._width, this._height);
                    this._updatePan();
                    this._updateFilterAreas();
                }
                // the fractional column and row to keep in the center
                get centerColumn() { return (this._centerColumn); }
                set centerColumn(v) {
                    v = Math.min(Math.max(0, v), this.columnCount - 1);
                    if (v === this.centerColumn)
                        return;
                    this._centerColumn = v;
                    this._updatePan();
                }
                get centerRow() { return (this._centerRow); }
                set centerRow(v) {
                    v = Math.min(Math.max(0, v), this.rowCount - 1);
                    if (v === this.centerRow)
                        return;
                    this._centerRow = v;
                    this._updatePan();
                }
                _updatePan() {
                    this._layers.x =
                        Math.round((this.width / 2) - this.xForColumn(this.centerColumn));
                    this._layers.y =
                        Math.round((this.height / 2) - this.yForRow(this.centerRow));
                    this._updateFilterAreas();
                    renderer_2.Renderer.needsUpdate();
                }
                // do layout for one part at the given location
                layoutPart(part, column, row) {
                    if (!part)
                        return;
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
                // get the spacing between part centers
                get spacing() { return (Math.floor(this.partSize * SPACING_FACTOR)); }
                // get the column for the given X coordinate
                columnForX(x) {
                    return (x / this.spacing);
                }
                // get the row for the given X coordinate
                rowForY(y) {
                    return (y / this.spacing);
                }
                // get the X coordinate for the given column index
                xForColumn(column) {
                    return (Math.round(column * this.spacing));
                }
                // get the Y coordinate for the given row index
                yForRow(row) {
                    return (Math.round(row * this.spacing));
                }
                // GRID MANAGEMENT **********************************************************
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
                    const oldPart = this.getPart(column, row);
                    if ((oldPart) && (oldPart.isLocked))
                        return (false);
                    else if ((type == 1 /* PARTLOC */) || (type == 2 /* GEARLOC */) ||
                        (type == 8 /* GEAR */) || (type == 10 /* FENCE */))
                        return (true);
                    else
                        return ((row + column) % 2 == 0);
                }
                // whether the part at the given location can be flipped
                canFlipPart(column, row) {
                    const part = this.getPart(column, row);
                    return ((part) && (part.canFlip || part.canRotate));
                }
                // whether the part at the given location is a background part
                isBackgroundPart(column, row) {
                    const part = this.getPart(column, row);
                    return ((!part) ||
                        (part.type === 1 /* PARTLOC */) ||
                        (part.type === 2 /* GEARLOC */));
                }
                // make a background part for the given row and column position
                makeBackgroundPart(column, row) {
                    return (this.partFactory.make((row + column) % 2 == 0 ?
                        1 /* PARTLOC */ : 2 /* GEARLOC */));
                }
                // set the tool to use when the user clicks
                get tool() { return (this._tool); }
                set tool(v) {
                    if (v === this._tool)
                        return;
                    this._tool = v;
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
                    // tell gears what kind of location they're on
                    if (newPart instanceof gearbit_2.Gear) {
                        newPart.isOnPartLocation = ((column + row) % 2) == 0;
                    }
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
                    // update fences
                    if ((oldPart instanceof fence_2.Fence) || (newPart instanceof fence_2.Fence)) {
                        this._updateFences();
                    }
                }
                // flip the part at the given coordinates
                flipPart(column, row) {
                    const part = this.getPart(column, row);
                    if (part instanceof fence_2.Fence) {
                        this._flipFence(column, row);
                    }
                    else if (part)
                        part.flip(0.25 /* FLIP */);
                }
                // clear parts from the given coordinates
                clearPart(column, row) {
                    this.setPart(this.makeBackgroundPart(column, row), column, row);
                }
                // add a part to the board's layers
                addPart(part) {
                    for (let layer of this._containers.keys()) {
                        const sprite = part.getSpriteForLayer(layer);
                        if (!sprite)
                            continue;
                        this._containers.get(layer).addChild(sprite);
                    }
                }
                // remove a part from the board's layers
                removePart(part) {
                    for (let layer of this._containers.keys()) {
                        const sprite = part.getSpriteForLayer(layer);
                        if (!sprite)
                            continue;
                        const container = this._containers.get(layer);
                        if (sprite.parent === container)
                            container.removeChild(sprite);
                    }
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
                // configure fences
                _updateFences() {
                    let slopeParts = [];
                    let northPart;
                    let leftNorthFence;
                    let rightNorthFence;
                    let r = 0;
                    let c;
                    for (const row of this._grid) {
                        c = 0;
                        for (const part of row) {
                            if (part instanceof fence_2.Fence) {
                                northPart = this.getPart(c, r - 1);
                                // track the parts above the ends of the slope
                                if ((northPart instanceof fence_2.Fence) &&
                                    (northPart.variant == 1 /* SIDE */)) {
                                    if (slopeParts.length == 0)
                                        leftNorthFence = northPart;
                                    else
                                        rightNorthFence = northPart;
                                }
                                else {
                                    rightNorthFence = null;
                                }
                                if ((slopeParts.length > 0) &&
                                    (slopeParts[0].isFlipped !== part.isFlipped)) {
                                    this._makeSlope(slopeParts, leftNorthFence, rightNorthFence);
                                    leftNorthFence = rightNorthFence = null;
                                }
                                slopeParts.push(part);
                            }
                            else if (slopeParts.length > 0) {
                                this._makeSlope(slopeParts, leftNorthFence, rightNorthFence);
                                leftNorthFence = rightNorthFence = null;
                            }
                            c++;
                        }
                        if (slopeParts.length > 0) {
                            this._makeSlope(slopeParts, leftNorthFence, rightNorthFence);
                            leftNorthFence = rightNorthFence = null;
                        }
                        r++;
                    }
                }
                // configure a horizontal run of fence parts
                _makeSlope(fences, leftNorthFence, rightNorthFence) {
                    if (!(fences.length > 0))
                        return;
                    // allow for acute angles with a side at the lower end of a slope
                    //  by converting slope ends to sides if the flip direction matches
                    if ((fences[0].isFlipped) && (leftNorthFence) &&
                        (leftNorthFence.isFlipped)) {
                        const side = fences.shift();
                        side.variant = 1 /* SIDE */;
                    }
                    else if ((!fences[0].isFlipped) && (rightNorthFence) &&
                        (!rightNorthFence.isFlipped)) {
                        const side = fences.pop();
                        side.variant = 1 /* SIDE */;
                    }
                    if (fences.length == 1)
                        fences[0].variant = 1 /* SIDE */;
                    else {
                        for (let i = 0; i < fences.length; i++) {
                            fences[i].variant = 2 /* SLOPE */;
                            fences[i].modulus = fences.length;
                            fences[i].sequence = fences[i].isFlipped ?
                                ((fences.length - 1) - i) : i;
                        }
                    }
                    fences.splice(0, fences.length);
                }
                // flip a fence part
                _flipFence(column, row) {
                    const fence = this.getPart(column, row);
                    if (!(fence instanceof fence_2.Fence))
                        return;
                    const wasFlipped = fence.isFlipped;
                    const variant = fence.variant;
                    fence.flip();
                    // make a test function to shorten the code below
                    const shouldContinue = (part) => {
                        if ((part instanceof fence_2.Fence) && (part.isFlipped == wasFlipped) &&
                            (part.variant == variant)) {
                            part.flip();
                            return (true);
                        }
                        return (false);
                    };
                    if (variant == 2 /* SLOPE */) {
                        // go right
                        for (let c = column + 1; c < this._columnCount; c++) {
                            if (!shouldContinue(this.getPart(c, row)))
                                break;
                        }
                        // go left
                        for (let c = column - 1; c >= 0; c--) {
                            if (!shouldContinue(this.getPart(c, row)))
                                break;
                        }
                    }
                    else if (variant == 1 /* SIDE */) {
                        // go down
                        for (let r = row + 1; r < this._rowCount; r++) {
                            if (!shouldContinue(this.getPart(column, r)))
                                break;
                        }
                        // go up
                        for (let r = row - 1; r >= 0; r--) {
                            if (!shouldContinue(this.getPart(column, r)))
                                break;
                        }
                    }
                    // update sequence numbers for slopes
                    this._updateFences();
                }
                // INTERACTION **************************************************************
                _bindMouseEvents() {
                    this.view.interactive = true;
                    this.view.addListener('mousedown', this._onMouseDown.bind(this));
                    this.view.addListener('mousemove', this._onMouseMove.bind(this));
                    this.view.addListener('mouseup', this._onMouseUp.bind(this));
                    this.view.addListener('click', this._onClick.bind(this));
                }
                _onMouseDown(e) {
                    this._updateAction(e);
                    this._isMouseDown = true;
                    this._mouseDownPoint = e.data.getLocalPosition(this.view);
                }
                _onMouseMove(e) {
                    // start dragging if the mouse moves more than the threshold
                    const p = e.data.getLocalPosition(this.view);
                    // cancel dragging if the button has been released elsewhere
                    if ((this._isMouseDown) && (e.data.buttons === 0)) {
                        this._onMouseUp(e);
                    }
                    if ((this._isMouseDown) && (!this._dragging) &&
                        ((Math.abs(p.x - this._mouseDownPoint.x) >= 5 /* DRAG_THRESHOLD */) ||
                            (Math.abs(p.y - this._mouseDownPoint.y) >= 5 /* DRAG_THRESHOLD */))) {
                        this._dragging = true;
                        this._lastMousePoint = this._mouseDownPoint;
                        this._onDragStart(this._mouseDownPoint.x, this._mouseDownPoint.y);
                    }
                    // handle dragging
                    if (this._dragging) {
                        this._onDrag(this._mouseDownPoint.x, this._mouseDownPoint.y, this._lastMousePoint.x, this._lastMousePoint.y, p.x, p.y);
                    }
                    else
                        this._updateAction(e);
                    // store this point for the next time
                    this._lastMousePoint = p;
                }
                _onMouseUp(e) {
                    this._updateAction(e);
                    this._isMouseDown = false;
                    if (this._dragging) {
                        this._dragging = false;
                        this._onDragFinish();
                        // don't trigger a click
                        e.stopPropagation();
                    }
                }
                _onDragStart(x, y) {
                    this._panStartColumn = this.centerColumn;
                    this._panStartRow = this.centerRow;
                }
                _onDrag(startX, startY, lastX, lastY, currentX, currentY) {
                    const deltaColumn = this.columnForX(currentX) - this.columnForX(startX);
                    const deltaRow = this.rowForY(currentY) - this.rowForY(startY);
                    const column = Math.round(this._actionColumn + deltaColumn);
                    const row = Math.round(this._actionRow + deltaRow);
                    if (this._action === 0 /* PAN */) {
                        this.centerColumn = this._panStartColumn - deltaColumn;
                        this.centerRow = this._panStartRow - deltaRow;
                    }
                    else if ((this._action === 1 /* PLACE_PART */) &&
                        (this.partPrototype)) {
                        if (this.canPlacePart(this.partPrototype.type, column, row)) {
                            const oldPart = this.getPart(column, row);
                            if (!(oldPart.hasSameStateAs(this.partPrototype))) {
                                this.setPart(this.partFactory.copy(this.partPrototype), column, row);
                            }
                        }
                    }
                    else if (this._action === 2 /* CLEAR_PART */) {
                        if (!this.isBackgroundPart(column, row)) {
                            // don't clear locked parts when dragging, as it's less likely
                            //  to be intentional than with a click
                            const oldPart = this.getPart(column, row);
                            if (!oldPart.isLocked)
                                this.clearPart(column, row);
                        }
                    }
                    else if (this._action === 3 /* FLIP_PART */) {
                        const part = this.getPart(column, row);
                        if ((part) && (!part.isLocked) &&
                            (!this._dragFlippedParts.has(part))) {
                            this.flipPart(column, row);
                            this._dragFlippedParts.add(part);
                        }
                    }
                }
                _onDragFinish() {
                    this._dragFlippedParts.clear();
                }
                _updateAction(e) {
                    const p = e.data.getLocalPosition(this._layers);
                    const column = this._actionColumn = Math.round(this.columnForX(p.x));
                    const row = this._actionRow = Math.round(this.rowForY(p.y));
                    if ((this.tool == 1 /* PART */) && (this.partPrototype) &&
                        (this.canPlacePart(this.partPrototype.type, column, row))) {
                        this._action = 1 /* PLACE_PART */;
                        this.view.cursor = 'pointer';
                    }
                    else if ((this.tool == 2 /* ERASER */) &&
                        (!this.isBackgroundPart(column, row))) {
                        this._action = 2 /* CLEAR_PART */;
                        this.view.cursor = 'pointer';
                    }
                    else if ((this.tool == 3 /* HAND */) &&
                        (this.canFlipPart(column, row))) {
                        this._action = 3 /* FLIP_PART */;
                        this.view.cursor = 'pointer';
                    }
                    else {
                        this._action = 0 /* PAN */;
                        this.view.cursor = 'move';
                    }
                    this._updatePreview();
                }
                _updatePreview() {
                    if (this.partPrototype) {
                        if (this._action === 1 /* PLACE_PART */) {
                            this.partPrototype.visible = true;
                            this.layoutPart(this.partPrototype, this._actionColumn, this._actionRow);
                        }
                        else {
                            this.partPrototype.visible = false;
                        }
                    }
                }
                _onClick(e) {
                    this._updateAction(e);
                    // place parts
                    if ((this._action === 1 /* PLACE_PART */) &&
                        (this.partPrototype)) {
                        const oldPart = this.getPart(this._actionColumn, this._actionRow);
                        if (this.partPrototype.hasSameStateAs(oldPart)) {
                            this.clearPart(this._actionColumn, this._actionRow);
                        }
                        else {
                            this.setPart(this.partFactory.copy(this.partPrototype), this._actionColumn, this._actionRow);
                        }
                    }
                    else if (this._action === 2 /* CLEAR_PART */) {
                        this.clearPart(this._actionColumn, this._actionRow);
                    }
                    else if (this._action === 3 /* FLIP_PART */) {
                        this.flipPart(this._actionColumn, this._actionRow);
                    }
                }
            };
            exports_15("Board", Board);
        }
    };
});
/// <reference types="pixi.js" />
System.register("ui/button", ["renderer"], function (exports_16, context_16) {
    "use strict";
    var __moduleName = context_16 && context_16.id;
    var renderer_3, Button, PartButton, SpriteButton, ButtonBar;
    return {
        setters: [
            function (renderer_3_1) {
                renderer_3 = renderer_3_1;
            }
        ],
        execute: function () {
            Button = class Button extends PIXI.Sprite {
                constructor() {
                    super();
                    this._size = 96;
                    this._isToggled = false;
                    this._isEnabled = true;
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
                    renderer_3.Renderer.needsUpdate();
                }
                get isToggled() { return (this._isToggled); }
                set isToggled(v) {
                    if (v === this._isToggled)
                        return;
                    this._isToggled = v;
                    this._drawDecorations();
                    this._updateState();
                }
                get isEnabled() { return (this._isEnabled); }
                set isEnabled(v) {
                    if (v === this._isEnabled)
                        return;
                    this._isEnabled = v;
                    this.interactive = v;
                    this.cursor = v ? 'pointer' : 'auto';
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
                    let alpha = 0.1 /* BUTTON_NORMAL */;
                    if (this.isEnabled) {
                        if ((this._mouseOver) && (this._mouseDown)) {
                            alpha = 0.3 /* BUTTON_DOWN */;
                        }
                        else if (this._mouseOver) {
                            alpha = 0.15 /* BUTTON_OVER */;
                        }
                        else
                            alpha = 0.1 /* BUTTON_NORMAL */;
                        if (this.isToggled)
                            alpha = Math.min(alpha * 2, 1.0);
                    }
                    this._background.alpha = alpha;
                    this.alpha = this.isEnabled ? 1.0 : 0.25 /* BUTTON_DISABLED */;
                    renderer_3.Renderer.needsUpdate();
                }
                _drawDecorations() {
                    const radius = 8; // pixels
                    const s = this.size;
                    const hs = Math.round(s * 0.5);
                    if (this._background) {
                        this._background.clear();
                        if (this.isToggled) {
                            this._background.lineStyle(2, 16755200 /* HIGHLIGHT */);
                        }
                        this._background.beginFill(this.isToggled ? 16755200 /* HIGHLIGHT */ : 0 /* BUTTON_BACK */);
                        this._background.drawRoundedRect(-hs, -hs, s, s, radius);
                        this._background.endFill();
                    }
                    renderer_3.Renderer.needsUpdate();
                }
            };
            exports_16("Button", Button);
            PartButton = class PartButton extends Button {
                constructor(part) {
                    super();
                    this.part = part;
                    this._schematic = false;
                    this._schematicView = part.getSpriteForLayer(4 /* SCHEMATIC */);
                    if (!this._schematicView) {
                        this._schematicView = part.getSpriteForLayer(3 /* SCHEMATIC_BACK */);
                    }
                    this._normalView = new PIXI.Container();
                    this.addChild(this._normalView);
                    let firstLayer = 0 /* BACK */;
                    let lastLayer = 2 /* FRONT */;
                    // show only the darker back layer for fence-like components 
                    //  because otherwise they're hard to see
                    if ((part.type == 10 /* FENCE */) || (part.type == 9 /* DROP */)) {
                        lastLayer = firstLayer;
                    }
                    for (let i = firstLayer; i <= lastLayer; i++) {
                        const sprite = part.getSpriteForLayer(i);
                        if (sprite)
                            this._normalView.addChild(sprite);
                    }
                    this.onSizeChanged();
                }
                get schematic() { return (this._schematic); }
                set schematic(v) {
                    if (v === this._schematic)
                        return;
                    this._schematic = v;
                    if (v) {
                        this.removeChild(this._normalView);
                        this.addChild(this._schematicView);
                    }
                    else {
                        this.addChild(this._normalView);
                        this.removeChild(this._schematicView);
                    }
                    renderer_3.Renderer.needsUpdate();
                }
                onSizeChanged() {
                    super.onSizeChanged();
                    if (this.part)
                        this.part.size = Math.floor(this.size * 0.5);
                }
            };
            exports_16("PartButton", PartButton);
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
            exports_16("SpriteButton", SpriteButton);
            ButtonBar = class ButtonBar extends PIXI.Container {
                constructor() {
                    super();
                    this._background = new PIXI.Graphics();
                    this._buttons = [];
                    this._bottomCount = 0;
                    this._width = 96;
                    this._height = 96;
                    this._margin = 4;
                    this.addChild(this._background);
                    this._layout();
                }
                // the number of buttons to push to the bottom of the bar
                get bottomCount() { return (this._bottomCount); }
                set bottomCount(v) {
                    if (v === this.bottomCount)
                        return;
                    this._bottomCount = v;
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
                get height() { return (this._height); }
                set height(v) {
                    if (v === this._height)
                        return;
                    this._height = v;
                    this._layout();
                }
                get margin() { return (this._margin); }
                set margin(v) {
                    if (v === this._margin)
                        return;
                    this._margin = v;
                    this._layout();
                }
                addButton(button) {
                    this._buttons.push(button);
                    this.addChild(button);
                    button.addListener('click', this._onButtonClick.bind(this));
                    this._layout();
                }
                // handle buttons being clicked
                _onButtonClick(e) {
                    if (!(e.target instanceof Button))
                        return;
                    this.onButtonClick(e.target);
                }
                // lay out buttons in a vertical strip
                _layout() {
                    const m = this.margin;
                    const w = this.width - (2 * m);
                    const hw = Math.floor(w / 2);
                    const x = m + hw;
                    let y = m + hw;
                    // lay out top buttons
                    for (let i = 0; i < this._buttons.length - this.bottomCount; i++) {
                        const button = this._buttons[i];
                        button.size = w;
                        button.x = x;
                        button.y = y;
                        y += w + m;
                    }
                    // lay out bottom buttons
                    y = this.height - (m + hw);
                    for (let i = 0; i < this.bottomCount; i++) {
                        const button = this._buttons[(this._buttons.length - 1) - i];
                        button.size = w;
                        button.x = x;
                        button.y = y;
                        y -= w + m;
                    }
                    this._background.clear();
                    this._background.beginFill(16777215 /* BACKGROUND */, 1.0);
                    this._background.drawRect(0, 0, this.width, this.height);
                    this._background.endFill();
                    renderer_3.Renderer.needsUpdate();
                }
            };
            exports_16("ButtonBar", ButtonBar);
        }
    };
});
/// <reference types="pixi.js" />
System.register("ui/toolbar", ["ui/button", "renderer"], function (exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
    var button_1, renderer_4, Toolbar;
    return {
        setters: [
            function (button_1_1) {
                button_1 = button_1_1;
            },
            function (renderer_4_1) {
                renderer_4 = renderer_4_1;
            }
        ],
        execute: function () {
            Toolbar = class Toolbar extends button_1.ButtonBar {
                constructor(board) {
                    super();
                    this.board = board;
                    // add a button to change the position of parts
                    this._handButton = new button_1.SpriteButton(new PIXI.Sprite(board.partFactory.textures['hand']));
                    this.addButton(this._handButton);
                    // add a button to remove parts
                    this._eraserButton = new button_1.PartButton(this.board.partFactory.make(1 /* PARTLOC */));
                    this.addButton(this._eraserButton);
                    // add buttons for parts
                    for (let i = 3 /* TOOLBOX_MIN */; i <= 10 /* TOOLBOX_MAX */; i++) {
                        const part = board.partFactory.make(i);
                        if (!part)
                            continue;
                        const button = new button_1.PartButton(part);
                        this.addButton(button);
                    }
                    this.updateToggled();
                }
                onButtonClick(button) {
                    if (button === this._handButton) {
                        this.board.tool = 3 /* HAND */;
                        this.board.partPrototype = null;
                    }
                    else if (button === this._eraserButton) {
                        this.board.tool = 2 /* ERASER */;
                        this.board.partPrototype = null;
                    }
                    else if (button instanceof button_1.PartButton) {
                        const newPart = button.part;
                        if ((this.board.partPrototype) &&
                            (newPart.type === this.board.partPrototype.type)) {
                            // toggle direction if the selected part is clicked again
                            newPart.flip(0.25 /* FLIP */);
                        }
                        this.board.tool = 1 /* PART */;
                        this.board.partPrototype = this.board.partFactory.copy(newPart);
                    }
                    this.updateToggled();
                }
                updateToggled() {
                    // update button toggle states
                    for (const button of this._buttons) {
                        if (button === this._handButton) {
                            button.isToggled = (this.board.tool === 3 /* HAND */);
                        }
                        else if (button === this._eraserButton) {
                            button.isToggled = (this.board.tool === 2 /* ERASER */);
                            this._eraserButton.schematic = this.board.schematic;
                        }
                        else if (button instanceof button_1.PartButton) {
                            button.isToggled = ((this.board.tool === 1 /* PART */) &&
                                (this.board.partPrototype) &&
                                (button.part.type === this.board.partPrototype.type));
                            button.schematic = this.board.schematic;
                        }
                    }
                    renderer_4.Renderer.needsUpdate();
                }
            };
            exports_17("Toolbar", Toolbar);
        }
    };
});
/// <reference types="pixi.js" />
System.register("ui/actionbar", ["board/board", "ui/button", "renderer"], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    var board_2, button_2, renderer_5, Actionbar;
    return {
        setters: [
            function (board_2_1) {
                board_2 = board_2_1;
            },
            function (button_2_1) {
                button_2 = button_2_1;
            },
            function (renderer_5_1) {
                renderer_5 = renderer_5_1;
            }
        ],
        execute: function () {
            Actionbar = class Actionbar extends button_2.ButtonBar {
                constructor(board) {
                    super();
                    this.board = board;
                    // ZOOMING ******************************************************************
                    // the user's desired shematic setting
                    this._desiredSchematic = false;
                    // add a button to toggle schematic view
                    this._schematicButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['schematic']));
                    this.addButton(this._schematicButton);
                    // add zoom controls
                    this._zoomInButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['zoomin']));
                    this.addButton(this._zoomInButton);
                    this._zoomOutButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['zoomout']));
                    this.addButton(this._zoomOutButton);
                    this._zoomToFitButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['zoomtofit']));
                    this.addButton(this._zoomToFitButton);
                    // add more top buttons here...
                    // add a link to the Turing Tumble website
                    this._heartButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['heart']));
                    this.addButton(this._heartButton);
                    this.bottomCount = 1;
                    this.updateToggled();
                }
                onButtonClick(button) {
                    if (button === this._schematicButton) {
                        this.board.schematic = !this.board.schematic;
                        this._desiredSchematic = this.board.schematic;
                        this.updateToggled();
                        if (this.peer)
                            this.peer.updateToggled();
                    }
                    else if (button === this._zoomInButton) {
                        this.zoomIn();
                    }
                    else if (button === this._zoomOutButton) {
                        this.zoomOut();
                    }
                    else if (button === this._zoomToFitButton) {
                        this.zoomToFit();
                    }
                    else if (button === this._heartButton) {
                        window.open('https://www.turingtumble.com/', '_blank');
                    }
                }
                updateToggled() {
                    // update button toggle states
                    for (const button of this._buttons) {
                        if (button === this._schematicButton) {
                            button.isEnabled = !this.forceSchematic;
                            button.isToggled = this.board.schematic;
                        }
                        else if (button == this._zoomInButton) {
                            button.isEnabled = this.canZoomIn;
                        }
                        else if (button == this._zoomOutButton) {
                            button.isEnabled = this.canZoomOut;
                        }
                        else if (button instanceof button_2.PartButton) {
                            button.isToggled = ((this.board.tool === 1 /* PART */) &&
                                (this.board.partPrototype) &&
                                (button.part.type === this.board.partPrototype.type));
                            button.schematic = this.board.schematic;
                        }
                    }
                    renderer_5.Renderer.needsUpdate();
                }
                // force schematic mode when parts are very small
                get forceSchematic() {
                    return (this.board.spacing <= this.board.partSize);
                }
                // when the board gets too small to see parts clearly, 
                //  switch to schematic mode
                _updateAutoSchematic() {
                    if (this.forceSchematic) {
                        this.board.schematic = true;
                    }
                    else {
                        this.board.schematic = this._desiredSchematic;
                    }
                }
                get canZoomIn() {
                    return (this.zoomIndex < board_2.PartSizes.length - 1);
                }
                get canZoomOut() {
                    return (this.zoomIndex > 0);
                }
                zoomIn() {
                    if (!this.canZoomIn)
                        return;
                    this.board.partSize = board_2.PartSizes[this.zoomIndex + 1];
                    this._updateAutoSchematic();
                    this.updateToggled();
                }
                zoomOut() {
                    if (!this.canZoomOut)
                        return;
                    this.board.partSize = board_2.PartSizes[this.zoomIndex - 1];
                    this._updateAutoSchematic();
                    this.updateToggled();
                }
                // zoom to fit the board
                zoomToFit() {
                    this.board.centerColumn = (this.board.columnCount - 1) / 2;
                    this.board.centerRow = (this.board.rowCount - 1) / 2;
                    let s = board_2.PartSizes[0];
                    for (let i = board_2.PartSizes.length - 1; i >= 0; i--) {
                        s = board_2.PartSizes[i];
                        const w = this.board.columnCount * Math.floor(s * board_2.SPACING_FACTOR);
                        const h = this.board.rowCount * Math.floor(s * board_2.SPACING_FACTOR);
                        if ((w <= this.board.width) && (h <= this.board.height))
                            break;
                    }
                    this.board.partSize = s;
                    this._updateAutoSchematic();
                    this.updateToggled();
                }
                get zoomIndex() {
                    return (board_2.PartSizes.indexOf(this.board.partSize));
                }
            };
            exports_18("Actionbar", Actionbar);
        }
    };
});
/// <reference types="pixi.js" />
System.register("app", ["board/board", "parts/factory", "ui/toolbar", "ui/actionbar", "renderer", "parts/fence"], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    var board_3, factory_1, toolbar_1, actionbar_1, renderer_6, fence_3, SimulatorApp;
    return {
        setters: [
            function (board_3_1) {
                board_3 = board_3_1;
            },
            function (factory_1_1) {
                factory_1 = factory_1_1;
            },
            function (toolbar_1_1) {
                toolbar_1 = toolbar_1_1;
            },
            function (actionbar_1_1) {
                actionbar_1 = actionbar_1_1;
            },
            function (renderer_6_1) {
                renderer_6 = renderer_6_1;
            },
            function (fence_3_1) {
                fence_3 = fence_3_1;
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
                    this.board = new board_3.Board(this.partFactory);
                    this.toolbar = new toolbar_1.Toolbar(this.board);
                    this.toolbar.width = 64;
                    this.actionbar = new actionbar_1.Actionbar(this.board);
                    this.actionbar.width = 64;
                    this.actionbar.peer = this.toolbar;
                    this.toolbar.peer = this.actionbar;
                    this.addChild(this.board.view);
                    this.addChild(this.toolbar);
                    this.addChild(this.actionbar);
                    this._layout();
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
                    this.toolbar.height = this.height;
                    this.actionbar.height = this.height;
                    this.actionbar.x = this.width - this.actionbar.width;
                    this.board.view.x = this.toolbar.width;
                    this.board.width = Math.max(0, this.width - (this.toolbar.width + this.actionbar.width));
                    this.board.height = this.height;
                    renderer_6.Renderer.needsUpdate();
                }
                initStandardBoard(redBlueDistance = 5, verticalDrop = 11) {
                    let r, c, run;
                    const width = (redBlueDistance * 2) + 3;
                    const center = Math.floor(width / 2);
                    const blueColumn = center - Math.floor(redBlueDistance / 2);
                    const redColumn = center + Math.floor(redBlueDistance / 2);
                    const dropLevel = (blueColumn % 2 == 0) ? 1 : 0;
                    const collectLevel = dropLevel + verticalDrop;
                    const steps = Math.ceil(center / fence_3.Fence.maxModulus);
                    const maxModulus = Math.ceil(center / steps);
                    const height = collectLevel + steps + 2;
                    this.board.setSize(width, height);
                    // block out unreachable locations at the top
                    const blank = this.partFactory.make(0 /* BLANK */);
                    blank.isLocked = true;
                    for (r = 0; r < height; r++) {
                        for (c = 0; c < width; c++) {
                            const blueCantReach = ((r + c) < (blueColumn + dropLevel)) ||
                                ((c - r) > (blueColumn - dropLevel));
                            const redCantReach = ((r + c) < (redColumn + dropLevel)) ||
                                ((c - r) > (redColumn - dropLevel));
                            if ((blueCantReach && redCantReach) || (r <= dropLevel)) {
                                this.board.setPart(this.partFactory.copy(blank), c, r);
                            }
                        }
                    }
                    // add fences on the sides
                    const fence = this.partFactory.make(10 /* FENCE */);
                    fence.isLocked = true;
                    const flippedFence = this.partFactory.copy(fence);
                    flippedFence.flip();
                    for (r = dropLevel; r < collectLevel; r++) {
                        this.board.setPart(this.partFactory.copy(fence), 0, r);
                        this.board.setPart(this.partFactory.copy(flippedFence), width - 1, r);
                    }
                    // add collection fences at the bottom
                    r = collectLevel;
                    run = 0;
                    for (c = 0; c < center; c++, run++) {
                        if (run >= maxModulus) {
                            r++;
                            run = 0;
                        }
                        this.board.setPart(this.partFactory.copy(fence), c, r);
                    }
                    r = collectLevel;
                    run = 0;
                    for (c = width - 1; c > center; c--, run++) {
                        if (run >= maxModulus) {
                            r++;
                            run = 0;
                        }
                        this.board.setPart(this.partFactory.copy(flippedFence), c, r);
                    }
                    // block out the unreachable locations at the bottom
                    for (r = collectLevel; r < height; r++) {
                        for (c = 0; c < width; c++) {
                            if (this.board.getPart(c, r) instanceof fence_3.Fence)
                                break;
                            this.board.setPart(this.partFactory.copy(blank), c, r);
                        }
                        for (c = width - 1; c >= 0; c--) {
                            if (this.board.getPart(c, r) instanceof fence_3.Fence)
                                break;
                            this.board.setPart(this.partFactory.copy(blank), c, r);
                        }
                    }
                    // make a fence to collect balls
                    r = height - 1;
                    const rightSide = Math.min(center + fence_3.Fence.maxModulus, height - 1);
                    for (c = center; c < rightSide; c++) {
                        this.board.setPart(this.partFactory.copy(fence), c, r);
                    }
                    this.board.setPart(this.partFactory.copy(fence), rightSide, r);
                    this.board.setPart(this.partFactory.copy(fence), rightSide, r - 1);
                    // make a ball drops
                    const blueDrop = this.partFactory.make(9 /* DROP */);
                    this.board.setPart(blueDrop, blueColumn - 1, dropLevel);
                    const redDrop = this.partFactory.make(9 /* DROP */);
                    redDrop.isFlipped = true;
                    this.board.setPart(redDrop, redColumn + 1, dropLevel);
                }
            };
            exports_19("SimulatorApp", SimulatorApp);
        }
    };
});
/// <reference types="pixi.js" />
System.register("index", ["app", "renderer"], function (exports_20, context_20) {
    "use strict";
    var __moduleName = context_20 && context_20.id;
    var app_1, renderer_7, container, sim, resizeApp, loader;
    return {
        setters: [
            function (app_1_1) {
                app_1 = app_1_1;
            },
            function (renderer_7_1) {
                renderer_7 = renderer_7_1;
            }
        ],
        execute: function () {
            container = document.getElementById('container');
            container.appendChild(renderer_7.Renderer.instance.view);
            // dynamically resize the app to track the size of the browser window
            container.style.overflow = 'hidden';
            resizeApp = () => {
                const r = container.getBoundingClientRect();
                renderer_7.Renderer.instance.resize(r.width, r.height);
                if (sim) {
                    sim.width = r.width;
                    sim.height = r.height;
                }
            };
            resizeApp();
            window.addEventListener('resize', resizeApp);
            renderer_7.Renderer.start();
            // load sprites
            loader = PIXI.loader;
            loader.add('images/parts.json').load(() => {
                sim = new app_1.SimulatorApp(PIXI.loader.resources["images/parts.json"].textures);
                sim.width = renderer_7.Renderer.instance.width;
                sim.height = renderer_7.Renderer.instance.height;
                renderer_7.Renderer.stage.addChild(sim);
                // set up the standard board
                sim.initStandardBoard();
                sim.actionbar.zoomToFit();
            });
        }
    };
});
