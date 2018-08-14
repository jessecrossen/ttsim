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
                // make the pins bouncy so it's more fun when the ball goes off track
                get bodyRestitution() { return (0.5); }
            };
            exports_1("PartLocation", PartLocation);
            GearLocation = class GearLocation extends part_1.Part {
                get canRotate() { return (false); }
                get canMirror() { return (true); }
                get canFlip() { return (false); }
                get type() { return (2 /* GEARLOC */); }
                // make the pins bouncy so it's more fun when the ball goes off track
                get bodyRestitution() { return (0.5); }
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
                get bodyRestitution() { return (0.0); }
                // simulate the counterweight when doing physics
                get isCounterWeighted() { return (true); }
                // return ramps to zero (simulating counterweight when not doing physics)
                get restingRotation() { return (0.0); }
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
                get bodyRestitution() { return (0.5); }
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
                // return the bit to whichever side it's closest to, preventing stuck bits
                get restingRotation() { return (this.bitValue ? 1.0 : 0.0); }
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
                    this._rotationVote = NaN;
                }
                // transfer rotation to connected elements
                get rotation() { return (super.rotation); }
                set rotation(r) {
                    // if this is connected to a gear train, register a vote 
                    //  to be tallied later
                    if ((this.connected) && (this.connected.size > 1) &&
                        (!GearBase._updating)) {
                        this._rotationVote = r;
                        GearBase._rotationElections.add(this.connected);
                    }
                    else {
                        super.rotation = r;
                    }
                }
                // tally votes and apply rotation
                static update() {
                    // skip this if there are no votes
                    if (!(GearBase._rotationElections.size > 0))
                        return;
                    GearBase._updating = true;
                    for (const election of GearBase._rotationElections) {
                        let sum = 0;
                        let count = 0;
                        for (const voter of election) {
                            if (!isNaN(voter._rotationVote)) {
                                sum += voter._rotationVote;
                                count += 1;
                                voter._rotationVote = NaN;
                            }
                        }
                        if (!(count > 0))
                            continue;
                        const mean = sum / count;
                        for (const voter of election) {
                            voter.rotation = mean;
                        }
                    }
                    GearBase._rotationElections.clear();
                    GearBase._updating = false;
                }
                isBeingDriven() {
                    return (GearBase._rotationElections.has(this.connected) &&
                        (isNaN(this._rotationVote)));
                }
            };
            GearBase._rotationElections = new Set();
            GearBase._updating = false;
            exports_6("GearBase", GearBase);
            Gearbit = class Gearbit extends GearBase {
                get canRotate() { return (true); }
                get canMirror() { return (true); }
                get canFlip() { return (false); }
                get type() { return (7 /* GEARBIT */); }
                // return the bit to whichever side it's closest to, preventing stuck bits
                get restingRotation() { return (this.bitValue ? 1.0 : 0.0); }
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
                // gears don't interact with balls in a rotationally asymmetric way, 
                //  so we can ignore their rotation
                get bodyCanRotate() { return (false); }
                angleForRotation(r, layer) {
                    // gears on a regular-part location need to be rotated by 1/16 turn 
                    //  to mesh with neighbors
                    if (this.isOnPartLocation) {
                        if (layer == 4 /* SCHEMATIC */) {
                            return (super.angleForRotation(r, layer));
                        }
                        else {
                            return (super.angleForRotation(r, layer) + (Math.PI * 0.125));
                        }
                    }
                    else {
                        return (-super.angleForRotation(r, layer));
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
    var part_7, board_1, Side, Slope;
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
            Side = class Side extends part_7.Part {
                get canRotate() { return (false); }
                get canMirror() { return (false); }
                get canFlip() { return (true); }
                get type() { return (12 /* SIDE */); }
            };
            exports_7("Side", Side);
            Slope = class Slope extends part_7.Part {
                constructor() {
                    super(...arguments);
                    this._modulus = 1;
                    this._sequence = 1;
                }
                get canRotate() { return (false); }
                get canMirror() { return (false); }
                get canFlip() { return (true); }
                get type() { return (13 /* SLOPE */); }
                static get maxModulus() { return (6); }
                // for slopes, the number of part units in the slope
                get modulus() { return (this._modulus); }
                set modulus(v) {
                    v = Math.min(Math.max(0, Math.round(v)), Slope.maxModulus);
                    if (v === this.modulus)
                        return;
                    this._modulus = v;
                    this._updateTexture();
                    this.changeCounter++;
                }
                // for slopes, the position of this part in the run of parts,
                //  where 0 is at the highest point and (modulus - 1) is at the lowest
                get sequence() { return (this._sequence); }
                set sequence(v) {
                    if (v === this.sequence)
                        return;
                    this._sequence = v;
                    this._updateTexture();
                    this.changeCounter++;
                }
                // a number that uniquely identifies the fence body type
                get signature() {
                    return (this.modulus > 0 ?
                        (this.sequence / this.modulus) : -1);
                }
                textureSuffix(layer) {
                    let suffix = super.textureSuffix(layer);
                    if (layer != 7 /* TOOL */)
                        suffix += this.modulus;
                    return (suffix);
                }
                _updateTexture() {
                    for (let layer = 0 /* BACK */; layer < 9 /* COUNT */; layer++) {
                        const sprite = this.getSpriteForLayer(layer);
                        if (!sprite)
                            continue;
                        if (this.modulus > 0) {
                            this._yOffset = ((this.sequence % this.modulus) / this.modulus) * board_1.SPACING_FACTOR;
                        }
                        else {
                            this._yOffset = 0;
                        }
                        const textureName = this.getTextureNameForLayer(layer);
                        if (textureName in this.textures) {
                            sprite.texture = this.textures[textureName];
                        }
                    }
                    this._updateSprites();
                }
            };
            exports_7("Slope", Slope);
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
System.register("ui/config", [], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    // formats a color as an HTML color code
    function htmlColor(c) {
        return ('#' + ('000000' + c.toString(16)).substr(-6));
    }
    exports_9("htmlColor", htmlColor);
    // converts an HSL color value to RGB
    //  adapted from http://en.wikipedia.org/wiki/HSL_color_space
    //  via https://stackoverflow.com/a/9493060/745831
    function colorFromHSL(h, s, l) {
        let r, g, b;
        if (s == 0) {
            r = g = b = l; // achromatic
        }
        else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return ((Math.round(r * 255) << 16) |
            (Math.round(g * 255) << 8) |
            (Math.round(b * 255)));
    }
    exports_9("colorFromHSL", colorFromHSL);
    function hue2rgb(p, q, t) {
        if (t < 0)
            t += 1;
        if (t > 1)
            t -= 1;
        if (t < 1 / 6)
            return (p + (q - p) * 6 * t);
        if (t < 1 / 2)
            return (q);
        if (t < 2 / 3)
            return (p + (q - p) * (2 / 3 - t) * 6);
        return (p);
    }
    var Zooms, Speeds, ButtonSizes;
    return {
        setters: [],
        execute: function () {
            exports_9("Zooms", Zooms = [2, 4, 6, 8, 12, 16, 24, 32, 48, 64]);
            exports_9("Speeds", Speeds = [0.0, 0.25, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0]);
            exports_9("ButtonSizes", ButtonSizes = [16, 24, 32, 48, 64]);
        }
    };
});
System.register("parts/ball", ["parts/part", "ui/config"], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    var part_9, config_1, Ball;
    return {
        setters: [
            function (part_9_1) {
                part_9 = part_9_1;
            },
            function (config_1_1) {
                config_1 = config_1_1;
            }
        ],
        execute: function () {
            Ball = class Ball extends part_9.Part {
                constructor() {
                    super(...arguments);
                    this.lastDistinctColumn = NaN;
                    // whether the ball has been released from a drop
                    this.released = false;
                    this.vx = 0;
                    this.vy = 0;
                    this.minX = NaN;
                    this.maxX = NaN;
                    this.maxY = NaN;
                    this._hue = 220;
                    this._color = this._colorForHue(this._hue);
                }
                get canRotate() { return (false); }
                get canMirror() { return (false); }
                get canFlip() { return (false); }
                get type() { return (9 /* BALL */); }
                // when the ball goes below its drop, reset the released flag
                get row() { return (super.row); }
                set row(r) {
                    super.row = r;
                    if ((this.released) && (this.drop) && (r > this.drop.row + 0.5)) {
                        this.released = false;
                    }
                }
                // track the last column the ball was in to determine travel direction
                get column() { return (super.column); }
                set column(c) {
                    const oldColumn = Math.round(this.column);
                    const newColumn = Math.round(c);
                    super.column = c;
                    if (isNaN(this.lastDistinctColumn))
                        this.lastDistinctColumn = newColumn;
                    if (newColumn !== oldColumn) {
                        this.lastDistinctColumn = oldColumn;
                    }
                }
                // the hue of the ball in degrees
                get hue() { return (this._hue); }
                set hue(v) {
                    if (isNaN(v))
                        return;
                    while (v < 0)
                        v += 360;
                    if (v >= 360)
                        v %= 360;
                    if (v === this._hue)
                        return;
                    this._hue = v;
                    this._color = this._colorForHue(this._hue);
                    this._updateSprites();
                }
                // the color of the ball
                get color() { return (this._color); }
                _colorForHue(hue) {
                    return (config_1.colorFromHSL(hue / 360, 1, 0.53));
                }
                // update the given sprite to track the part's state
                _updateSprite(layer) {
                    super._updateSprite(layer);
                    // we use the front layer for a specular highlight, so don't tint it
                    if (layer !== 2 /* FRONT */) {
                        const sprite = this.getSpriteForLayer(layer);
                        if (!sprite)
                            return;
                        sprite.tint = this.color;
                    }
                }
                get bodyCanMove() { return (true); }
                get bodyRestitution() { return (0.05); }
            };
            exports_10("Ball", Ball);
        }
    };
});
System.register("parts/turnstile", ["parts/part", "parts/ball"], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    var part_10, ball_1, Turnstile;
    return {
        setters: [
            function (part_10_1) {
                part_10 = part_10_1;
            },
            function (ball_1_1) {
                ball_1 = ball_1_1;
            }
        ],
        execute: function () {
            Turnstile = class Turnstile extends part_10.Part {
                constructor() {
                    super(...arguments);
                    this._centerBall = new ball_1.Ball(this.textures);
                }
                get canRotate() { return (true); }
                get canMirror() { return (false); }
                get canFlip() { return (true); }
                get type() { return (11 /* TURNSTILE */); }
                // the drop the turnstile is connected to
                get drop() { return (this._drop); }
                set drop(newDrop) {
                    if (newDrop === this.drop)
                        return;
                    if (this._drop)
                        this._drop.turnstiles.delete(this);
                    this._drop = newDrop;
                    if (this._drop) {
                        this._drop.turnstiles.add(this);
                        this.hue = this._drop.hue;
                    }
                }
                // put a ball in the center to show the color of the associated drop
                _initSprite(layer) {
                    if (layer == 3 /* SCHEMATIC_BACK */) {
                        return (this._centerBall.getSpriteForLayer(4 /* SCHEMATIC */));
                    }
                    const sprite = super._initSprite(layer);
                    if ((layer == 2 /* FRONT */) && (!this._ballContainer)) {
                        this._ballContainer = new PIXI.Container();
                        this._ballContainer.addChild(this._centerBall.getSpriteForLayer(1 /* MID */));
                        this._ballContainer.addChild(this._centerBall.getSpriteForLayer(2 /* FRONT */));
                        sprite.addChild(this._ballContainer);
                    }
                    return (sprite);
                }
                // keep the ball the same size as the component
                get size() { return (super.size); }
                set size(s) {
                    if (s === this.size)
                        return;
                    super.size = s;
                    this._centerBall.size = s;
                }
                // pass hue through to the center ball
                get hue() { return (this._centerBall.hue); }
                set hue(v) {
                    this._centerBall.hue = v;
                    this._updateSprites();
                }
                // don't rotate or flip the ball or the highlight will look strange
                _shouldRotateLayer(layer) {
                    return ((layer !== 0 /* BACK */) && (layer !== 2 /* FRONT */));
                }
                _shouldFlipLayer(layer) {
                    return (layer !== 2 /* FRONT */);
                }
                // release a ball when the turnstile makes a turn
                get rotation() { return (super.rotation); }
                set rotation(r) {
                    const oldRotation = this.rotation;
                    super.rotation = r;
                    if ((this.rotation == 0.0) && (oldRotation > 0.5) && (this.drop)) {
                        this.drop.releaseBall();
                    }
                }
                // configure for continuous rotation
                get biasRotation() { return (false); }
                get restingRotation() {
                    return (Math.round(this.rotation));
                }
            };
            exports_11("Turnstile", Turnstile);
        }
    };
});
System.register("parts/drop", ["parts/part"], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    var part_11, Drop;
    return {
        setters: [
            function (part_11_1) {
                part_11 = part_11_1;
            }
        ],
        execute: function () {
            Drop = class Drop extends part_11.Part {
                constructor() {
                    super(...arguments);
                    // a set of balls associated with the drop
                    this.balls = new Set();
                    // a set of turnstiles associated with the drop
                    this.turnstiles = new Set();
                    this._hue = 0.0;
                }
                get canRotate() { return (false); }
                get canMirror() { return (false); }
                get canFlip() { return (true); }
                get type() { return (10 /* DROP */); }
                // a flag to set signalling a desire to release a ball, which will be cleared
                //  after a ball is released
                releaseBall() {
                    // find the ball closest to the bottom right
                    let closest;
                    let maxSum = -Infinity;
                    for (const ball of this.balls) {
                        // skip balls we've already released
                        if (ball.released)
                            continue;
                        // never release a ball that is outside the drop
                        if ((Math.round(ball.row) != this.row) ||
                            (Math.round(ball.column) != this.column))
                            continue;
                        let dc = ball.column - this.column;
                        if (this.isFlipped)
                            dc *= -1;
                        const d = dc + ball.row;
                        if (d > maxSum) {
                            closest = ball;
                            maxSum = d;
                        }
                    }
                    // release the ball closest to the exit if we found one
                    if (closest) {
                        closest.released = true;
                        if (this.onRelease)
                            this.onRelease();
                    }
                }
                // the hue of balls in this ball drop
                get hue() { return (this._hue); }
                set hue(v) {
                    if (isNaN(v))
                        return;
                    while (v < 0)
                        v += 360;
                    if (v >= 360)
                        v %= 360;
                    if (v === this._hue)
                        return;
                    this._hue = v;
                    for (const ball of this.balls) {
                        ball.hue = this.hue;
                    }
                    for (const turnstile of this.turnstiles) {
                        turnstile.hue = this.hue;
                    }
                }
            };
            exports_12("Drop", Drop);
        }
    };
});
System.register("parts/factory", ["parts/location", "parts/ramp", "parts/crossover", "parts/interceptor", "parts/bit", "parts/gearbit", "parts/fence", "parts/blank", "parts/drop", "parts/ball", "parts/turnstile"], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    var location_1, ramp_1, crossover_1, interceptor_1, bit_1, gearbit_1, fence_1, blank_1, drop_1, ball_2, turnstile_1, PartFactory;
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
            },
            function (ball_2_1) {
                ball_2 = ball_2_1;
            },
            function (turnstile_1_1) {
                turnstile_1 = turnstile_1_1;
            }
        ],
        execute: function () {
            PartFactory = class PartFactory {
                constructor(textures) {
                    this.textures = textures;
                }
                static constructorForType(type) {
                    switch (type) {
                        case 0 /* BLANK */: return (blank_1.Blank);
                        case 1 /* PARTLOC */: return (location_1.PartLocation);
                        case 2 /* GEARLOC */: return (location_1.GearLocation);
                        case 3 /* RAMP */: return (ramp_1.Ramp);
                        case 4 /* CROSSOVER */: return (crossover_1.Crossover);
                        case 5 /* INTERCEPTOR */: return (interceptor_1.Interceptor);
                        case 6 /* BIT */: return (bit_1.Bit);
                        case 8 /* GEAR */: return (gearbit_1.Gear);
                        case 7 /* GEARBIT */: return (gearbit_1.Gearbit);
                        case 9 /* BALL */: return (ball_2.Ball);
                        case 12 /* SIDE */: return (fence_1.Side);
                        case 13 /* SLOPE */: return (fence_1.Slope);
                        case 10 /* DROP */: return (drop_1.Drop);
                        case 11 /* TURNSTILE */: return (turnstile_1.Turnstile);
                        default: return (null);
                    }
                }
                // make a new part of the given type
                make(type) {
                    const constructor = PartFactory.constructorForType(type);
                    if (!constructor)
                        return (null);
                    return (new constructor(this.textures));
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
                        newPart.hue = part.hue;
                    }
                    if ((newPart instanceof ball_2.Ball) && (part instanceof ball_2.Ball)) {
                        newPart.drop = part.drop;
                        if (newPart.drop)
                            newPart.drop.balls.add(newPart);
                    }
                    return (newPart);
                }
            };
            exports_13("PartFactory", PartFactory);
        }
    };
});
System.register("renderer", ["pixi.js"], function (exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
    var PIXI, Renderer;
    return {
        setters: [
            function (PIXI_1) {
                PIXI = PIXI_1;
            }
        ],
        execute: function () {
            Renderer = class Renderer {
                static needsUpdate() {
                    Renderer._needsUpdate = true;
                }
                static get interaction() {
                    return (Renderer.instance.plugins.interaction);
                }
                static render() {
                    // render at 30fps, it's good enough
                    if (Renderer._counter++ % 2 == 0)
                        return;
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
            Renderer._counter = 0;
            exports_14("Renderer", Renderer);
        }
    };
});
System.register("ui/animator", ["renderer"], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    var renderer_1, Animator;
    return {
        setters: [
            function (renderer_1_1) {
                renderer_1 = renderer_1_1;
            }
        ],
        execute: function () {
            // centrally manage animations of properties
            Animator = class Animator {
                constructor() {
                    this._subjects = new Map();
                }
                // a singleton instance of the class
                static get current() {
                    if (!Animator._current)
                        Animator._current = new Animator();
                    return (Animator._current);
                }
                // animate the given property of the given subject from its current value
                //  to the given end point, at a speed which would take the given time to 
                //  traverse the range from start to end
                animate(subject, property, start, end, time, callback) {
                    // handle the edge-cases of zero or negative time
                    if (!(time > 0.0)) {
                        this.stopAnimating(subject, property);
                        subject[property] = end;
                        return (null);
                    }
                    // get all animations for this subject
                    if (!this._subjects.has(subject))
                        this._subjects.set(subject, new Map());
                    const properties = this._subjects.get(subject);
                    // calculate a delta to traverse the property's entire range in the given time
                    const delta = (end - start) / (time * 60);
                    // update an existing animation
                    let animation = null;
                    if (properties.has(property)) {
                        animation = properties.get(property);
                        animation.start = start;
                        animation.end = end;
                        animation.time = time;
                        animation.delta = delta;
                        animation.callback = callback;
                    }
                    else {
                        animation = {
                            subject: subject,
                            property: property,
                            start: start,
                            end: end,
                            time: time,
                            delta: delta,
                            callback: callback
                        };
                        properties.set(property, animation);
                    }
                    return (animation);
                }
                // get the end value for the given property, or the current value if it's
                //  not currently being animated
                getEndValue(subject, property) {
                    const current = subject[property];
                    if (!this._subjects.has(subject))
                        return (current);
                    const properties = this._subjects.get(subject);
                    if (!properties.has(property))
                        return (current);
                    return (properties.get(property).end);
                }
                // get whether the given property is being animated
                isAnimating(subject, property) {
                    const current = subject[property];
                    if (!this._subjects.has(subject))
                        return (false);
                    const properties = this._subjects.get(subject);
                    return (properties.has(property));
                }
                // stop animating the given property, leaving the current value as-is
                stopAnimating(subject, property) {
                    if (!this._subjects.has(subject))
                        return;
                    const properties = this._subjects.get(subject);
                    properties.delete(property);
                    // remove entries for subjects with no animations
                    if (properties.size == 0) {
                        this._subjects.delete(subject);
                    }
                }
                // advance all animations by one tick
                update(correction) {
                    let someAnimations = false;
                    for (const [subject, properties] of this._subjects.entries()) {
                        for (const [property, animation] of properties) {
                            someAnimations = true;
                            let finished = false;
                            let current = subject[property];
                            current += (animation.delta * Math.abs(correction));
                            if (animation.delta > 0) {
                                if (current >= animation.end) {
                                    current = animation.end;
                                    finished = true;
                                }
                            }
                            else if (animation.delta < 0) {
                                if (current <= animation.end) {
                                    current = animation.end;
                                    finished = true;
                                }
                            }
                            else {
                                current = animation.end;
                            }
                            subject[property] = current;
                            if (finished) {
                                this.stopAnimating(subject, property);
                                if (animation.callback)
                                    animation.callback();
                            }
                        }
                    }
                    if (someAnimations)
                        renderer_1.Renderer.needsUpdate();
                }
            };
            exports_15("Animator", Animator);
        }
    };
});
System.register("parts/part", ["pixi.js", "renderer", "ui/animator"], function (exports_16, context_16) {
    "use strict";
    var __moduleName = context_16 && context_16.id;
    var PIXI, renderer_2, animator_1, Part;
    return {
        setters: [
            function (PIXI_2) {
                PIXI = PIXI_2;
            },
            function (renderer_2_1) {
                renderer_2 = renderer_2_1;
            },
            function (animator_1_1) {
                animator_1 = animator_1_1;
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
                    // a counter to track changes to non-display properties
                    this.changeCounter = 0;
                    this._column = 0.0;
                    this._row = 0.0;
                    this._size = 64;
                    this._rotation = 0.0;
                    this._isFlipped = false;
                    this._x = 0;
                    this._y = 0;
                    this._alpha = 1;
                    this._visible = true;
                    this._sprites = new Map();
                    // adjustable offsets for textures (as a fraction of the size)
                    this._xOffset = 0.0;
                    this._yOffset = 0.0;
                }
                // the current position of the ball in grid units
                get column() { return (this._column); }
                set column(v) {
                    if (v === this._column)
                        return;
                    this._column = v;
                    this.changeCounter++;
                }
                get row() { return (this._row); }
                set row(v) {
                    if (v === this._row)
                        return;
                    this._row = v;
                    this.changeCounter++;
                }
                // a placeholder for the hue property of parts that have it
                get hue() { return (0); }
                set hue(v) { }
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
                    this.changeCounter++;
                }
                // whether the part is pointing right (or will be when animations finish)
                get bitValue() {
                    return (animator_1.Animator.current.getEndValue(this, 'rotation') >= 0.5);
                }
                // whether the part is flipped to its left/right variant
                get isFlipped() { return (this._isFlipped); }
                set isFlipped(v) {
                    if ((!this.canFlip) || (v === this._isFlipped))
                        return;
                    this._isFlipped = v;
                    this._updateSprites();
                    this.changeCounter++;
                }
                // flip the part if it can be flipped
                flip(time = 0.0) {
                    if (this.canFlip)
                        this.isFlipped = !this.isFlipped;
                    else if (this.canRotate) {
                        const bitValue = this.bitValue;
                        animator_1.Animator.current.animate(this, 'rotation', bitValue ? 1.0 : 0.0, bitValue ? 0.0 : 1.0, time);
                        // cancel rotation animations for connected gear trains
                        //  (note that we don't refer to Gearbase to avoid a circular reference)
                        if ((this.type == 8 /* GEAR */) || (this.type == 7 /* GEARBIT */)) {
                            const connected = this.connected;
                            if (connected) {
                                for (const gear of connected) {
                                    if (gear !== this)
                                        animator_1.Animator.current.stopAnimating(gear, 'rotation');
                                }
                            }
                        }
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
                    if (layer === 7 /* TOOL */)
                        return ('-t');
                    return ('');
                }
                // get texture names for the various layers
                getTextureNameForLayer(layer) {
                    return (this.texturePrefix + this.textureSuffix(layer));
                }
                // return a sprite for the given layer, or null if there is none
                getSpriteForLayer(layer) {
                    if (!this._sprites.has(layer)) {
                        this._sprites.set(layer, this._initSprite(layer));
                        this._updateSprite(layer);
                    }
                    return (this._sprites.get(layer));
                }
                // destroy all cached sprites for the part
                destroySprites() {
                    for (const layer of this._sprites.keys()) {
                        const sprite = this._sprites.get(layer);
                        if (sprite)
                            sprite.destroy();
                    }
                    this._sprites.clear();
                }
                // set initial properties for a newly-created sprite
                _initSprite(layer) {
                    const textureName = this.getTextureNameForLayer(layer);
                    const sprite = new PIXI.Sprite(this.textures[textureName]);
                    if ((!textureName) || (!(textureName in this.textures)))
                        return (null);
                    if (sprite) {
                        // always position sprites from the center
                        sprite.anchor.set(0.5, 0.5);
                    }
                    return (sprite);
                }
                // update all sprites to track the part's state
                _updateSprites() {
                    for (let i = 0 /* BACK */; i < 9 /* COUNT */; i++) {
                        if (this._sprites.has(i))
                            this._updateSprite(i);
                    }
                }
                // update the given sprite to track the part's state
                _updateSprite(layer) {
                    const sprite = this._sprites.get(layer);
                    if ((!sprite) || (!sprite.transform))
                        return;
                    // apply size
                    const size = (this.size > 2) ? (this.size * 1.5) : this.size;
                    sprite.width = size;
                    sprite.height = size;
                    // apply flipping
                    let xScale = (this._flipX && this._shouldFlipLayer(layer)) ?
                        -Math.abs(sprite.scale.x) : Math.abs(sprite.scale.x);
                    // apply rotation on all layers but the background
                    if (this._shouldRotateLayer(layer)) {
                        // if we can, flip the sprite when it rotates past the center so there's
                        //  less distortion from the rotation transform
                        if ((this.canMirror) && (this.rotation > 0.5)) {
                            xScale = -xScale;
                            sprite.rotation = this.angleForRotation(this.rotation - 1.0, layer);
                        }
                        else {
                            sprite.rotation = this.angleForRotation(this.rotation, layer);
                        }
                    }
                    // apply any scale changes
                    sprite.scale.x = xScale;
                    // position the part
                    sprite.position.set(this.x + (this._xOffset * this.size), this.y + (this._yOffset * this.size));
                    // apply opacity and visibility
                    sprite.visible = this._isLayerVisible(layer);
                    sprite.alpha = this._layerAlpha(layer);
                    // schedule rendering
                    renderer_2.Renderer.needsUpdate();
                }
                // control the rotation of layers
                _shouldRotateLayer(layer) {
                    return (layer !== 0 /* BACK */);
                }
                // control the flipping of layers
                _shouldFlipLayer(layer) {
                    return (true);
                }
                // control the visibility of layers
                _isLayerVisible(layer) {
                    return (this.visible);
                }
                // control the opacity of layers
                _layerAlpha(layer) {
                    return (this._isLayerVisible(layer) ? this.alpha : 0.0);
                }
                // get the angle for the given rotation value
                angleForRotation(r, layer = 1 /* MID */) {
                    return ((this.isFlipped ? -r : r) * (Math.PI / 2));
                }
                // get the rotation for the given angle
                rotationForAngle(a) {
                    return ((this.isFlipped ? -a : a) / (Math.PI / 2));
                }
                // get whether to flip the x axis
                get _flipX() {
                    return (this.isFlipped);
                }
                // PHYSICS ******************************************************************
                // whether the body can be moved by the physics simulator
                get bodyCanMove() { return (false); }
                // whether the body can be rotated by the physics simulator
                get bodyCanRotate() { return (this.canRotate); }
                // the rotation to return the body to when not active
                get restingRotation() { return (this.rotation); }
                // whether the body has a counterweight (like a ramp)
                get isCounterWeighted() { return (false); }
                // whether to bias the rotation to either side
                get biasRotation() { return (!this.isCounterWeighted); }
                ;
                // the amount the body will bounce in a collision (0.0 - 1.0)
                get bodyRestitution() { return (0.1); }
            };
            exports_16("Part", Part);
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
System.register("util/disjoint", [], function (exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
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
            exports_17("DisjointSet", DisjointSet);
        }
    };
});
System.register("board/constants", [], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    var PART_SIZE, SPACING, BALL_RADIUS, PART_DENSITY, BALL_DENSITY, BALL_MASS, BALL_FRICTION, PART_FRICTION, DROP_FRICTION, BALL_FRICTION_STATIC, PART_FRICTION_STATIC, DROP_FRICTION_STATIC, IDEAL_VX, NUDGE_ACCEL, MAX_V, DAMPER_RADIUS, BIAS_STIFFNESS, BIT_BIAS_STIFFNESS, BIAS_DAMPING, COUNTERWEIGHT_STIFFNESS, COUNTERWEIGHT_DAMPING, PART_CATEGORY, UNRELEASED_BALL_CATEGORY, BALL_CATEGORY, GATE_CATEGORY, DEFAULT_MASK, PART_MASK, UNRELEASED_BALL_MASK, BALL_MASK, GATE_MASK;
    return {
        setters: [],
        execute: function () {
            // the canonical part size the simulator runs at
            exports_18("PART_SIZE", PART_SIZE = 64);
            exports_18("SPACING", SPACING = 68);
            // the size of a ball in simulator units
            exports_18("BALL_RADIUS", BALL_RADIUS = 10);
            exports_18("PART_DENSITY", PART_DENSITY = 0.100);
            exports_18("BALL_DENSITY", BALL_DENSITY = 0.008);
            exports_18("BALL_MASS", BALL_MASS = BALL_DENSITY * (BALL_RADIUS * BALL_RADIUS * Math.PI));
            exports_18("BALL_FRICTION", BALL_FRICTION = 0.03);
            exports_18("PART_FRICTION", PART_FRICTION = 0.03);
            exports_18("DROP_FRICTION", DROP_FRICTION = 0);
            exports_18("BALL_FRICTION_STATIC", BALL_FRICTION_STATIC = 0.03);
            exports_18("PART_FRICTION_STATIC", PART_FRICTION_STATIC = 0.03);
            exports_18("DROP_FRICTION_STATIC", DROP_FRICTION_STATIC = 0);
            // the ideal horizontal velocity at which a ball should be moving
            exports_18("IDEAL_VX", IDEAL_VX = 1.5);
            // the maximum acceleration to use when nudging the ball
            exports_18("NUDGE_ACCEL", NUDGE_ACCEL = 0.001);
            // the maximum speed at which a part can move
            exports_18("MAX_V", MAX_V = 12);
            // damping/counterweight constraint parameters
            exports_18("DAMPER_RADIUS", DAMPER_RADIUS = PART_SIZE / 2);
            exports_18("BIAS_STIFFNESS", BIAS_STIFFNESS = BALL_DENSITY / 16);
            exports_18("BIT_BIAS_STIFFNESS", BIT_BIAS_STIFFNESS = BALL_DENSITY / 4);
            exports_18("BIAS_DAMPING", BIAS_DAMPING = 0.3);
            exports_18("COUNTERWEIGHT_STIFFNESS", COUNTERWEIGHT_STIFFNESS = BALL_DENSITY / 8);
            exports_18("COUNTERWEIGHT_DAMPING", COUNTERWEIGHT_DAMPING = 0.1);
            // collision filtering categories
            exports_18("PART_CATEGORY", PART_CATEGORY = 0x0001);
            exports_18("UNRELEASED_BALL_CATEGORY", UNRELEASED_BALL_CATEGORY = 0x0002);
            exports_18("BALL_CATEGORY", BALL_CATEGORY = 0x0004);
            exports_18("GATE_CATEGORY", GATE_CATEGORY = 0x0008);
            exports_18("DEFAULT_MASK", DEFAULT_MASK = 0xFFFFFF);
            exports_18("PART_MASK", PART_MASK = UNRELEASED_BALL_CATEGORY | BALL_CATEGORY);
            exports_18("UNRELEASED_BALL_MASK", UNRELEASED_BALL_MASK = DEFAULT_MASK ^ BALL_CATEGORY);
            exports_18("BALL_MASK", BALL_MASK = DEFAULT_MASK);
            exports_18("GATE_MASK", GATE_MASK = DEFAULT_MASK ^ BALL_CATEGORY);
        }
    };
});
System.register("board/router", [], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
// WARNING: this file is autogenerated from src/svg/parts.svg
//  (any changes you make will be overwritten)
System.register("parts/partvertices", [], function (exports_20, context_20) {
    "use strict";
    var __moduleName = context_20 && context_20.id;
    function getVertexSets(name) {
        switch (name) {
            case 'Bit':
                return ([[{ x: -1.055230, y: -32.311157 }, { x: 0.083096, y: -27.714949 }, { x: -27.716345, y: 0.194329 }, { x: -32.193815, y: -1.017236 }, { x: -34.041082, y: -34.054879 }], [{ x: -9.275339, y: -18.699340 }, { x: -18.644512, y: -8.976619 }, { x: -0.000001, y: 14.000036 }, { x: 12.203027, y: 15.153396 }, { x: 15.296620, y: 11.971412 }, { x: 13.999992, y: 0.000024 }], [{ x: 26.999991, y: -2.999976 }, { x: 27.625370, y: -30.038640 }, { x: 27.844205, y: -31.163654 }, { x: 28.781679, y: -32.163642 }, { x: 30.000425, y: -32.538571 }, { x: 31.156696, y: -32.288366 }, { x: 32.156683, y: -31.507138 }, { x: 32.625458, y: -30.163364 }, { x: 31.999992, y: -2.999976 }], [{ x: -4.000007, y: 27.000023 }, { x: -30.292815, y: 27.954316 }, { x: -31.416144, y: 28.181465 }, { x: -32.409014, y: 29.126461 }, { x: -32.774721, y: 30.348004 }, { x: -32.515786, y: 31.502385 }, { x: -31.727017, y: 32.496401 }, { x: -30.379740, y: 32.955008 }, { x: -4.000007, y: 32.000035 }], [{ x: 26.999991, y: -2.999976 }, { x: 13.999992, y: 0.000024 }, { x: 15.385008, y: 12.059815 }, { x: 28.731649, y: 2.602266 }, { x: 31.999992, y: -2.999976 }], [{ x: -4.000007, y: 27.000023 }, { x: 0.000033, y: 14.000036 }, { x: 11.959138, y: 15.360666 }, { x: 2.501589, y: 28.707311 }, { x: -4.000007, y: 32.000035 }]]);
            case 'Crossover':
                return ([[{ x: -0.125001, y: -48.250010 }, { x: -2.750000, y: -46.000019 }, { x: -2.750000, y: -15.874993 }, { x: 2.999999, y: -15.874993 }, { x: 2.999999, y: -46.374986 }], [{ x: -3.000008, y: -15.999982 }, { x: -12.000004, y: -9.999982 }, { x: -2.249999, y: 4.250008 }, { x: 2.374997, y: 4.250008 }, { x: 11.999991, y: -9.999982 }, { x: 2.999991, y: -15.999982 }], [{ x: -32.250002, y: 31.999979 }, { x: -0.051777, y: 29.502580 }, { x: 31.124997, y: 31.499985 }, { x: 32.874998, y: 34.374996 }, { x: 30.374999, y: 36.999991 }, { x: -30.250001, y: 36.999991 }, { x: -32.749999, y: 35.125005 }], [{ x: -36.000004, y: -27.999982 }, { x: -43.000006, y: -5.000008 }, { x: -48.000003, y: -2.999995 }, { x: -45.000003, y: -20.999995 }, { x: -36.000004, y: -35.999994 }], [{ x: -43.000006, y: -5.000008 }, { x: -33.000004, y: 6.999992 }, { x: -39.000004, y: 6.999992 }, { x: -48.000003, y: -2.999995 }], [{ x: -35.999992, y: -35.999994 }, { x: -32.000005, y: -35.999994 }, { x: -31.999994, y: -31.999969 }, { x: -36.000000, y: -27.999982 }], [{ x: 35.999937, y: -27.999982 }, { x: 42.999940, y: -5.000008 }, { x: 47.999937, y: -2.999995 }, { x: 44.999937, y: -20.999995 }, { x: 35.999937, y: -35.999994 }], [{ x: 42.999940, y: -5.000008 }, { x: 32.999938, y: 6.999992 }, { x: 38.999937, y: 6.999992 }, { x: 47.999937, y: -2.999995 }], [{ x: 35.999926, y: -35.999994 }, { x: 31.999992, y: -35.999994 }, { x: 31.999988, y: -31.999969 }, { x: 35.999934, y: -27.999982 }]]);
            case 'Drop':
                return ([[{ x: -37.000010, y: -36.999968 }, { x: -31.000048, y: -36.999968 }, { x: -31.000048, y: 21.000014 }, { x: -37.000010, y: 21.000014 }], [{ x: -24.987727, y: 28.000303 }, { x: 35.938482, y: 31.000038 }, { x: 35.643301, y: 36.992782 }, { x: -25.282870, y: 33.993046 }], [{ x: -31.000048, y: 21.000014 }, { x: -25.000048, y: 28.000001 }, { x: -25.000048, y: 34.000001 }, { x: -28.000048, y: 34.000001 }, { x: -34.000048, y: 29.000026 }, { x: -37.000048, y: 24.000013 }, { x: -37.000048, y: 21.000014 }]]);
            case 'GearLocation':
                return ([[{ x: -0.015622, y: -4.546899 }, { x: 2.093748, y: -4.046868 }, { x: 4.046879, y: -2.046893 }, { x: 4.562501, y: 0.015633 }, { x: 4.031251, y: 2.062512 }, { x: 2.093748, y: 4.015620 }, { x: -0.015622, y: 4.468748 }, { x: -2.031251, y: 4.000011 }, { x: -4.015620, y: 2.015608 }, { x: -4.546871, y: -0.031271 }, { x: -4.031252, y: -2.031246 }, { x: -2.046872, y: -4.000001 }]]);
            case 'Gearbit':
                return ([[{ x: -19.999999, y: 16.000007 }, { x: -22.637134, y: 25.233204 }, { x: -19.101594, y: 28.768725 }, { x: -14.858953, y: 22.316391 }, { x: -14.682185, y: 16.040826 }], [{ x: -22.637134, y: 25.144801 }, { x: -30.857243, y: 28.326785 }, { x: -30.945646, y: 32.569418 }, { x: -23.962966, y: 32.216032 }, { x: -18.748057, y: 28.326936 }], [{ x: 15.999997, y: -20.000005 }, { x: 25.168110, y: -23.063501 }, { x: 28.703632, y: -19.527961 }, { x: 22.251298, y: -15.285321 }, { x: 15.975733, y: -15.108552 }], [{ x: 25.079707, y: -23.063501 }, { x: 28.261691, y: -31.283611 }, { x: 32.504324, y: -31.372014 }, { x: 32.150939, y: -24.389333 }, { x: 28.261843, y: -19.174424 }], [{ x: -27.999999, y: -32.000001 }, { x: 15.999997, y: -20.000002 }, { x: 6.999994, y: 7.000024 }, { x: -20.000002, y: 16.000001 }, { x: -32.000001, y: -28.000003 }, { x: -31.999994, y: -31.999986 }]]);
            case 'Interceptor':
                return ([[{ x: -45.691339, y: -8.678367 }, { x: 45.525428, y: -8.678367 }, { x: 46.507670, y: -3.375047 }, { x: -46.600350, y: -3.375047 }], [{ x: -40.374999, y: -8.249995 }, { x: -28.500000, y: -30.875002 }, { x: -33.125000, y: -33.624986 }, { x: -42.000000, y: -20.749988 }, { x: -45.625001, y: -9.124993 }], [{ x: 40.624998, y: -8.249995 }, { x: 28.749999, y: -30.875002 }, { x: 33.374999, y: -33.624986 }, { x: 42.249998, y: -20.749988 }, { x: 45.875000, y: -9.124993 }], [{ x: -6.999999, y: -3.499998 }, { x: -6.500010, y: 3.625016 }, { x: -0.000012, y: 6.999982 }, { x: 6.374988, y: 3.624978 }, { x: 6.499977, y: -3.499998 }]]);
            case 'PartLocation':
                return ([[{ x: -0.015622, y: -4.546893 }, { x: 2.093748, y: -4.046862 }, { x: 4.046879, y: -2.046887 }, { x: 4.562501, y: 0.015639 }, { x: 4.031251, y: 2.062517 }, { x: 2.093748, y: 4.015626 }, { x: -0.015622, y: 4.468754 }, { x: -2.031251, y: 4.000017 }, { x: -4.015620, y: 2.015613 }, { x: -4.546871, y: -0.031265 }, { x: -4.031252, y: -2.031240 }, { x: -2.046872, y: -3.999996 }]]);
            case 'Ramp':
                return ([[{ x: 13.000001, y: -13.999998 }, { x: -32.000005, y: -24.999972 }, { x: -34.000006, y: -29.999985 }, { x: -34.000006, y: -31.999997 }, { x: -32.000005, y: -32.999985 }, { x: 16.000001, y: -21.000023 }], [{ x: 16.000001, y: -21.000023 }, { x: 25.000001, y: -24.000023 }, { x: 30.000002, y: -21.000023 }, { x: 23.000000, y: -16.000011 }, { x: 14.000000, y: -16.000011 }], [{ x: 25.000001, y: -24.000023 }, { x: 27.759381, y: -30.974460 }, { x: 30.000002, y: -31.999997 }, { x: 33.000002, y: -30.000023 }, { x: 30.000002, y: -21.000023 }], [{ x: -8.000006, y: 3.000014 }, { x: -27.999999, y: 10.999989 }, { x: -33.000000, y: 18.000014 }, { x: -33.000000, y: 25.999988 }, { x: -27.000004, y: 33.000013 }, { x: -16.000007, y: 33.000013 }, { x: -11.000006, y: 25.000001 }, { x: -5.000006, y: 6.000014 }], [{ x: -4.000000, y: -7.000011 }, { x: -7.999998, y: -3.000024 }, { x: -7.999998, y: 1.999989 }, { x: -4.000000, y: 7.000001 }, { x: 8.999999, y: 13.999989 }, { x: 14.000000, y: 13.999989 }, { x: 14.000000, y: 9.000014 }, { x: 5.999999, y: -6.000023 }], [{ x: -4.000000, y: -17.999985 }, { x: 12.999997, y: -13.999998 }, { x: 5.999999, y: -6.000023 }, { x: -4.000000, y: -7.000011 }]]);
            case 'Side':
                return ([[{ x: -37.000038, y: -34.000014 }, { x: -31.000038, y: -34.000014 }, { x: -31.000038, y: 33.999997 }, { x: -37.000038, y: 33.999997 }]]);
            case 'Slope-1':
                return ([[{ x: -32.000022, y: -35.999992 }, { x: 35.999988, y: 30.999925 }, { x: 31.999963, y: 36.000013 }, { x: -36.000010, y: -31.999994 }]]);
            case 'Slope-2':
                return ([[{ x: -32.000022, y: -35.999987 }, { x: 35.999988, y: -2.999988 }, { x: 32.999988, y: 3.000012 }, { x: -35.000022, y: -30.999989 }]]);
            case 'Slope-3':
                return ([[{ x: -33.000010, y: -35.999985 }, { x: 35.999988, y: -13.999983 }, { x: 33.999976, y: -7.999983 }, { x: -35.000022, y: -30.999984 }]]);
            case 'Slope-4':
                return ([[{ x: -33.000013, y: -36.999978 }, { x: 34.999960, y: -19.999981 }, { x: 32.999985, y: -13.999981 }, { x: -35.000026, y: -30.999978 }]]);
            case 'Slope-5':
                return ([[{ x: -34.000001, y: -36.999976 }, { x: 34.999960, y: -23.999974 }, { x: 33.999972, y: -16.999975 }, { x: -36.000013, y: -30.999976 }]]);
            case 'Slope-6':
                return ([[{ x: -34.000030, y: -35.999971 }, { x: 33.999994, y: -26.999966 }, { x: 33.999974, y: -19.999971 }, { x: -34.000017, y: -30.999971 }]]);
            case 'Turnstile':
                return ([[{ x: -32.500401, y: -33.999981 }, { x: 15.254059, y: -9.330725 }, { x: 12.500281, y: -3.999993 }, { x: -35.254179, y: -28.669249 }], [{ x: 32.500294, y: 34.000001 }, { x: -15.254149, y: 9.330753 }, { x: -12.500385, y: 4.000020 }, { x: 35.254057, y: 28.669279 }], [{ x: 33.999934, y: -32.500316 }, { x: 9.330694, y: 15.254111 }, { x: 3.999973, y: 12.500363 }, { x: 28.669213, y: -35.254080 }], [{ x: -34.000038, y: 32.500360 }, { x: -9.330798, y: -15.254068 }, { x: -4.000077, y: -12.500304 }, { x: -28.669317, y: 35.254123 }]]);
            default:
                return (null);
        }
    }
    exports_20("getVertexSets", getVertexSets);
    function getPinLocations(name) {
        switch (name) {
            default:
                return (null);
        }
    }
    exports_20("getPinLocations", getPinLocations);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("parts/partbody", ["matter-js", "parts/factory", "parts/partvertices", "board/constants", "parts/ball", "parts/fence", "parts/drop", "parts/turnstile"], function (exports_21, context_21) {
    "use strict";
    var __moduleName = context_21 && context_21.id;
    var matter_js_1, factory_1, partvertices_1, constants_1, ball_3, fence_2, drop_2, turnstile_2, PartBody, PartBodyFactory;
    return {
        setters: [
            function (matter_js_1_1) {
                matter_js_1 = matter_js_1_1;
            },
            function (factory_1_1) {
                factory_1 = factory_1_1;
            },
            function (partvertices_1_1) {
                partvertices_1 = partvertices_1_1;
            },
            function (constants_1_1) {
                constants_1 = constants_1_1;
            },
            function (ball_3_1) {
                ball_3 = ball_3_1;
            },
            function (fence_2_1) {
                fence_2 = fence_2_1;
            },
            function (drop_2_1) {
                drop_2 = drop_2_1;
            },
            function (turnstile_2_1) {
                turnstile_2 = turnstile_2_1;
            }
        ],
        execute: function () {
            // this composes a part with a matter.js body which simulates it
            PartBody = class PartBody {
                constructor(part) {
                    this._body = undefined;
                    // the fence parameters last time we constructed a fence
                    this._slopeSignature = NaN;
                    this._composite = matter_js_1.Composite.create();
                    this._compositePosition = { x: 0.0, y: 0.0 };
                    this._bodyOffset = { x: 0.0, y: 0.0 };
                    this._bodyFlipped = false;
                    this._partChangeCounter = NaN;
                    this.type = part.type;
                    this.part = part;
                }
                get part() { return (this._part); }
                set part(part) {
                    if (part === this._part)
                        return;
                    if (part) {
                        if (part.type !== this.type)
                            throw ('Part type must match PartBody type');
                        this._partChangeCounter = NaN;
                        this._part = part;
                        this.initBodyFromPart();
                    }
                }
                // a body representing the physical form of the part
                get body() {
                    // if there are no stored vertices, the body will be set to null,
                    //  and we shouldn't keep trying to construct it
                    if (this._body === undefined)
                        this._makeBody();
                    return (this._body);
                }
                ;
                _makeBody() {
                    this._body = null;
                    // construct the ball as a circle
                    if (this.type == 9 /* BALL */) {
                        this._body = matter_js_1.Bodies.circle(0, 0, constants_1.BALL_RADIUS, { density: constants_1.BALL_DENSITY, friction: constants_1.BALL_FRICTION,
                            frictionStatic: constants_1.BALL_FRICTION_STATIC,
                            collisionFilter: { category: constants_1.UNRELEASED_BALL_CATEGORY, mask: constants_1.UNRELEASED_BALL_MASK, group: 0 } });
                    }
                    else if (this._part instanceof fence_2.Slope) {
                        this._body = this._bodyForSlope(this._part);
                        this._slopeSignature = this._part.signature;
                    }
                    else {
                        const constructor = factory_1.PartFactory.constructorForType(this.type);
                        this._body = this._bodyFromVertexSets(partvertices_1.getVertexSets(constructor.name));
                    }
                    if (this._body) {
                        matter_js_1.Body.setPosition(this._body, { x: 0.0, y: 0.0 });
                        matter_js_1.Composite.add(this._composite, this._body);
                    }
                    this.initBodyFromPart();
                }
                _refreshBody() {
                    this._clearBody();
                    this._makeBody();
                }
                // a composite representing the body and related constraints, etc.
                get composite() { return (this._composite); }
                // initialize the body after creation
                initBodyFromPart() {
                    if ((!this._body) || (!this._part))
                        return;
                    // parts that can't rotate can be static
                    if ((!this._part.bodyCanRotate) && (!this._part.bodyCanMove)) {
                        matter_js_1.Body.setStatic(this._body, true);
                    }
                    else {
                        matter_js_1.Body.setStatic(this._body, false);
                    }
                    // add bodies and constraints to control rotation
                    if (this._part.bodyCanRotate) {
                        this._makeRotationConstraints();
                    }
                    // set restitution
                    this._body.restitution = this._part.bodyRestitution;
                    // do special configuration for ball drops
                    if (this._part.type == 10 /* DROP */) {
                        this._makeDropGate();
                    }
                    // perform a first update of properties from the part
                    this.updateBodyFromPart();
                }
                _makeRotationConstraints() {
                    // make constraints that bias parts and keep them from bouncing at the 
                    //  ends of their range
                    if (this._part.isCounterWeighted) {
                        this._counterweightDamper = this._makeDamper(this._part.isFlipped, true, constants_1.COUNTERWEIGHT_STIFFNESS, constants_1.COUNTERWEIGHT_DAMPING);
                    }
                    else if (this._part.biasRotation) {
                        this._biasDamper = this._makeDamper(false, false, this._part.type == 6 /* BIT */ ? constants_1.BIT_BIAS_STIFFNESS : constants_1.BIAS_STIFFNESS, constants_1.BIAS_DAMPING);
                    }
                }
                _makeDamper(flipped, counterweighted, stiffness, damping) {
                    const constraint = matter_js_1.Constraint.create({
                        bodyA: this._body,
                        pointA: this._damperAttachmentVector(flipped),
                        pointB: this._damperAnchorVector(flipped, counterweighted),
                        stiffness: stiffness,
                        damping: damping
                    });
                    matter_js_1.Composite.add(this._composite, constraint);
                    return (constraint);
                }
                _damperAttachmentVector(flipped) {
                    return ({ x: flipped ? constants_1.DAMPER_RADIUS : -constants_1.DAMPER_RADIUS,
                        y: -constants_1.DAMPER_RADIUS });
                }
                _damperAnchorVector(flipped, counterweighted) {
                    return (counterweighted ?
                        { x: (flipped ? constants_1.DAMPER_RADIUS : -constants_1.DAMPER_RADIUS), y: 0 } :
                        { x: 0, y: constants_1.DAMPER_RADIUS });
                }
                _makeDropGate() {
                    this._body.friction = constants_1.DROP_FRICTION;
                    this._body.friction = constants_1.DROP_FRICTION_STATIC;
                    const sign = this._part.isFlipped ? -1 : 1;
                    this._dropGate = matter_js_1.Bodies.rectangle((constants_1.SPACING / 2) * sign, 0, constants_1.PART_SIZE / 16, constants_1.SPACING, { friction: constants_1.DROP_FRICTION, frictionStatic: constants_1.DROP_FRICTION_STATIC,
                        collisionFilter: { category: constants_1.GATE_CATEGORY, mask: constants_1.GATE_MASK, group: 0 },
                        isStatic: true });
                    matter_js_1.Composite.add(this._composite, this._dropGate);
                }
                // remove all constraints and bodies we've added to the composite
                _clearBody() {
                    const clear = (item) => {
                        if (item)
                            matter_js_1.Composite.remove(this._composite, item);
                        return (undefined);
                    };
                    this._counterweightDamper = clear(this._counterweightDamper);
                    this._biasDamper = clear(this._biasDamper);
                    this._dropGate = clear(this._dropGate);
                    this._body = clear(this._body);
                    this._compositePosition.x = this._compositePosition.y = 0;
                }
                // transfer relevant properties to the body
                updateBodyFromPart() {
                    // skip the update if we have no part
                    if ((!this._body) || (!this._part))
                        return;
                    // update collision masks for balls
                    if (this._part instanceof ball_3.Ball) {
                        this._body.collisionFilter.category = this._part.released ?
                            constants_1.BALL_CATEGORY : constants_1.UNRELEASED_BALL_CATEGORY;
                        this._body.collisionFilter.mask = this._part.released ?
                            constants_1.BALL_MASK : constants_1.UNRELEASED_BALL_MASK;
                    }
                    // skip the rest of the update if the part hasn't changed
                    if (this._part.changeCounter === this._partChangeCounter)
                        return;
                    // rebuild the body if the slope signature changes
                    if ((this._part instanceof fence_2.Slope) &&
                        (this._part.signature != this._slopeSignature)) {
                        this._refreshBody();
                        return;
                    }
                    // update mirroring
                    if (this._bodyFlipped !== this._part.isFlipped) {
                        this._refreshBody();
                        return;
                    }
                    // update position
                    const position = { x: (this._part.column * constants_1.SPACING) + this._bodyOffset.x,
                        y: (this._part.row * constants_1.SPACING) + this._bodyOffset.y };
                    const positionDelta = matter_js_1.Vector.sub(position, this._compositePosition);
                    matter_js_1.Composite.translate(this._composite, positionDelta, true);
                    this._compositePosition = position;
                    matter_js_1.Body.setVelocity(this._body, { x: 0, y: 0 });
                    // move damper anchor points
                    if (this._counterweightDamper) {
                        matter_js_1.Vector.add(this._body.position, this._damperAnchorVector(this._part.isFlipped, true), this._counterweightDamper.pointB);
                    }
                    if (this._biasDamper) {
                        matter_js_1.Vector.add(this._body.position, this._damperAnchorVector(this._part.isFlipped, false), this._biasDamper.pointB);
                    }
                    matter_js_1.Body.setAngle(this._body, this._part.angleForRotation(this._part.rotation));
                    // record that we've synced with the part
                    this._partChangeCounter = this._part.changeCounter;
                }
                // tranfer relevant properties from the body
                updatePartFromBody() {
                    if ((!this._body) || (!this._part) || (this._body.isStatic))
                        return;
                    if (this._part.bodyCanMove) {
                        this._part.column = this._body.position.x / constants_1.SPACING;
                        this._part.row = this._body.position.y / constants_1.SPACING;
                    }
                    if (this._part.bodyCanRotate) {
                        const r = this._part.rotationForAngle(this._body.angle);
                        this._part.rotation = r;
                    }
                    // record that we've synced with the part
                    this._partChangeCounter = this._part.changeCounter;
                }
                // add the body to the given world, creating the body if needed
                addToWorld(world) {
                    const body = this.body;
                    if (body) {
                        matter_js_1.World.add(world, this._composite);
                        // try to release any stored energy in the part
                        matter_js_1.Body.setVelocity(this._body, { x: 0, y: 0 });
                        matter_js_1.Body.setAngularVelocity(this._body, 0);
                    }
                }
                // remove the body from the given world
                removeFromWorld(world) {
                    matter_js_1.World.remove(world, this._composite);
                }
                // construct a body for the current fence configuration
                _bodyForSlope(slope) {
                    const name = 'Slope-' + slope.modulus;
                    const y = -((slope.sequence % slope.modulus) / slope.modulus) * constants_1.SPACING;
                    return (this._bodyFromVertexSets(partvertices_1.getVertexSets(name), 0, y));
                }
                // construct a body from a set of vertex lists
                _bodyFromVertexSets(vertexSets, x = 0, y = 0) {
                    if (!vertexSets)
                        return (null);
                    const parts = [];
                    this._bodyFlipped = this._part.isFlipped;
                    for (const vertices of vertexSets) {
                        // flip the vertices if the part is flipped
                        if (this._part.isFlipped) {
                            matter_js_1.Vertices.scale(vertices, -1, 1, { x: 0, y: 0 });
                        }
                        // make sure they're in clockwise order, because flipping reverses 
                        //  their direction and we can't be sure how the source SVG is drawn
                        matter_js_1.Vertices.clockwiseSort(vertices);
                        const center = matter_js_1.Vertices.centre(vertices);
                        parts.push(matter_js_1.Body.create({ position: center, vertices: vertices }));
                    }
                    const body = matter_js_1.Body.create({ parts: parts,
                        friction: constants_1.PART_FRICTION, frictionStatic: constants_1.PART_FRICTION_STATIC,
                        density: constants_1.PART_DENSITY,
                        collisionFilter: { category: constants_1.PART_CATEGORY, mask: constants_1.PART_MASK, group: 0 } });
                    // this is a hack to prevent matter.js from placing the body's center 
                    //  of mass over the origin, which complicates our ability to precisely
                    //  position parts of an arbitrary shape
                    body.position.x = x;
                    body.position.y = y;
                    body.positionPrev.x = x;
                    body.positionPrev.y = y;
                    return (body);
                }
                // PHYSICS ENGINE CHEATS ****************************************************
                // apply corrections to the body and any balls contacting it
                cheat(contacts, nearby) {
                    if ((!this._body) || (!this._part))
                        return;
                    this._controlRotation(contacts, nearby);
                    this._controlVelocity();
                    this._nudge(contacts, nearby);
                    if (nearby) {
                        for (const ballPartBody of nearby) {
                            this._influenceBall(ballPartBody);
                        }
                    }
                }
                _nudge(contacts, nearby) {
                    if (!contacts)
                        return;
                    // don't nudge multiple balls on slopes, 
                    //  it tends to cause pileups in the output
                    if ((this._part.type === 13 /* SLOPE */) && (contacts.size > 1))
                        return;
                    for (const contact of contacts) {
                        const nudged = this._nudgeBall(contact);
                        // if we've nudged a ball, don't do other stuff to it
                        if ((nudged) && (nearby))
                            nearby.delete(contact.ballPartBody);
                    }
                }
                // constrain the position and angle of the part to simulate 
                //  an angle-constrained revolute joint
                _controlRotation(contacts, nearby) {
                    const positionDelta = { x: 0, y: 0 };
                    let angleDelta = 0;
                    let moved = false;
                    if (!this._part.bodyCanMove) {
                        matter_js_1.Vector.sub(this._compositePosition, this._body.position, positionDelta);
                        matter_js_1.Body.translate(this._body, positionDelta);
                        matter_js_1.Body.setVelocity(this._body, { x: 0, y: 0 });
                        moved = true;
                    }
                    if (this._part.bodyCanRotate) {
                        const r = this._part.rotationForAngle(this._body.angle);
                        let target = this._part.angleForRotation(Math.min(Math.max(0.0, r), 1.0));
                        let lock = false;
                        if (this._part instanceof turnstile_2.Turnstile) {
                            // turnstiles can only rotate in one direction
                            if (((!this._part.isFlipped) && (this._body.angularVelocity < 0)) ||
                                ((this._part.isFlipped) && (this._body.angularVelocity > 0))) {
                                matter_js_1.Body.setAngularVelocity(this._body, 0);
                            }
                            // engage and disengage based on ball contact
                            const engaged = ((nearby instanceof Set) && (nearby.size > 0));
                            if (!engaged) {
                                target = this._part.angleForRotation(0);
                                lock = true;
                            }
                            else if (r >= 1.0)
                                lock = true;
                        }
                        else if ((r < 0) || (r > 1))
                            lock = true;
                        if (lock) {
                            angleDelta = target - this._body.angle;
                            matter_js_1.Body.rotate(this._body, angleDelta);
                            matter_js_1.Body.setAngularVelocity(this._body, 0);
                        }
                        moved = true;
                    }
                    // apply the same movements to balls if there are any, otherwise they 
                    //  will squash into the part
                    if ((moved) && (contacts)) {
                        const combined = matter_js_1.Vector.rotate(positionDelta, angleDelta);
                        for (const contact of contacts) {
                            matter_js_1.Body.translate(contact.ballPartBody.body, combined);
                        }
                    }
                }
                // apply a limit to how fast a part can move, mainly to prevent fall-through
                //  and conditions resulting from too much kinetic energy
                _controlVelocity() {
                    if ((!this._body) || (!this._part) || (!this._part.bodyCanMove))
                        return;
                    if (matter_js_1.Vector.magnitude(this._body.velocity) > constants_1.MAX_V) {
                        const v = matter_js_1.Vector.mult(matter_js_1.Vector.normalise(this._body.velocity), constants_1.MAX_V);
                        matter_js_1.Body.setVelocity(this._body, v);
                    }
                }
                // apply a speed limit to the given ball
                _nudgeBall(contact) {
                    if ((!this._body) || (!contact.ballPartBody.body))
                        return (false);
                    const ball = contact.ballPartBody.part;
                    const body = contact.ballPartBody.body;
                    let tangent = matter_js_1.Vector.clone(contact.tangent);
                    // only nudge the ball if it's touching a horizontal-ish surface
                    let maxSlope = 0.3;
                    // get the horizontal direction and relative magnitude we want the ball 
                    //  to be going in
                    let mag = 1;
                    let sign = 0;
                    // ramps direct in a single direction
                    if (this._part.type == 3 /* RAMP */) {
                        if ((this._part.rotation < 0.25) && (ball.row < this._part.row)) {
                            sign = this._part.isFlipped ? -1 : 1;
                        }
                        if (body.velocity.y < 0) {
                            matter_js_1.Body.setVelocity(body, { x: body.velocity.x, y: 0 });
                        }
                    }
                    else if (this._part.type == 7 /* GEARBIT */) {
                        if (this._part.rotation < 0.25)
                            sign = 1;
                        else if (this._part.rotation > 0.75)
                            sign = -1;
                    }
                    else if (this._part.type == 6 /* BIT */) {
                        const bottomHalf = ball.row > this._part.row;
                        if (this._part.rotation >= 0.9)
                            sign = bottomHalf ? 1 : -1;
                        else if (this._part.rotation <= 0.1)
                            sign = bottomHalf ? -1 : 1;
                        if (!bottomHalf)
                            mag = 0.5;
                    }
                    else if (this._part.type == 4 /* CROSSOVER */) {
                        if (ball.lastDistinctColumn < ball.lastColumn)
                            sign = 1;
                        else if (ball.lastDistinctColumn > ball.lastColumn)
                            sign = -1;
                        else if (ball.row < this._part.row) {
                            sign = ball.column < this._part.column ? 1 : -1;
                            // remember this for when we get to the bottom
                            ball.lastDistinctColumn -= sign;
                        }
                        else {
                            sign = ball.column < this._part.column ? -1 : 1;
                        }
                        if (ball.row < this._part.row)
                            mag *= 16;
                    }
                    else if (this._part instanceof fence_2.Slope) {
                        mag = 2;
                        sign = this._part.isFlipped ? -1 : 1;
                        // the tangent is always the same for slopes, and setting it explicitly
                        //  prevents strange effect at corners
                        tangent = matter_js_1.Vector.normalise({ x: this._part.modulus * sign, y: 1 });
                        maxSlope = 1;
                    }
                    else if ((this._part instanceof drop_2.Drop) && (ball.released)) {
                        sign = this._part.isFlipped ? -1 : 1;
                    }
                    // exit if we're not nudging
                    if (sign == 0)
                        return (false);
                    // limit slope
                    const slope = Math.abs(tangent.y) / Math.abs(tangent.x);
                    if (slope > maxSlope)
                        return (false);
                    // flip the tangent if the direction doesn't match the target direction
                    if (((sign < 0) && (tangent.x > 0)) ||
                        ((sign > 0) && (tangent.x < 0)))
                        tangent = matter_js_1.Vector.mult(tangent, -1);
                    // see how much and in which direction we need to correct the horizontal velocity
                    const target = constants_1.IDEAL_VX * sign * mag;
                    const current = body.velocity.x;
                    let accel = 0;
                    if (sign > 0) {
                        if (current < target)
                            accel = constants_1.NUDGE_ACCEL; // too slow => right
                        else if (current > target)
                            accel = -constants_1.NUDGE_ACCEL; // too fast => right
                    }
                    else {
                        if (target < current)
                            accel = constants_1.NUDGE_ACCEL; // too slow <= left
                        else if (target > current)
                            accel = -constants_1.NUDGE_ACCEL; // too fast <= left
                    }
                    if (accel == 0)
                        return (false);
                    // scale the acceleration by the difference 
                    //  if it gets close to prevent flip-flopping
                    accel *= Math.min(Math.abs(current - target) * 4, 1.0);
                    // accelerate the ball in the desired direction
                    matter_js_1.Body.applyForce(body, body.position, matter_js_1.Vector.mult(tangent, accel * body.mass));
                    // return that we've nudged the ball
                    return (true);
                }
                // apply trajectory influences to balls in the vicinity
                _influenceBall(ballPartBody) {
                    const ball = ballPartBody.part;
                    const body = ballPartBody.body;
                    // crossovers are complicated!
                    if (this._part.type == 4 /* CROSSOVER */) {
                        const currentSign = body.velocity.x > 0 ? 1 : -1;
                        // make trajectories in the upper half of the crossover more diagonal,
                        //  which ensures they have enough horizontal energy to make it through
                        //  the bottom half without the "conveyer belt" nudge being obvious
                        if ((ball.row < this._part.row) && (body.velocity.x > 0.001)) {
                            if (Math.abs(body.velocity.x) < Math.abs(body.velocity.y)) {
                                matter_js_1.Body.applyForce(body, body.position, { x: currentSign * constants_1.NUDGE_ACCEL * body.mass, y: 0 });
                                return (true);
                            }
                        }
                        else if (ball.row > this._part.row) {
                            let desiredSign = 0;
                            if (ball.lastDistinctColumn < ball.lastColumn)
                                desiredSign = 1;
                            else if (ball.lastDistinctColumn > ball.lastColumn)
                                desiredSign = -1;
                            if ((desiredSign != 0) && (desiredSign != currentSign)) {
                                matter_js_1.Body.applyForce(body, body.position, { x: desiredSign * constants_1.NUDGE_ACCEL * body.mass, y: 0 });
                                return (true);
                            }
                        }
                    }
                    return (false);
                }
            };
            exports_21("PartBody", PartBody);
            // FACTORY / CACHE ************************************************************
            // maintain a cache of PartBody instances
            PartBodyFactory = class PartBodyFactory {
                constructor() {
                    // cached instances
                    this._instances = new WeakMap();
                }
                // make or reuse a part body from the cache
                make(part) {
                    if (!this._instances.has(part)) {
                        this._instances.set(part, new PartBody(part));
                    }
                    return (this._instances.get(part));
                }
                // mark that a part body is not currently being used
                release(instance) {
                }
            };
            exports_21("PartBodyFactory", PartBodyFactory);
        }
    };
});
System.register("board/physics", ["pixi.js", "matter-js", "renderer", "parts/gearbit", "parts/partbody", "board/constants", "ui/animator"], function (exports_22, context_22) {
    "use strict";
    var __moduleName = context_22 && context_22.id;
    var PIXI, matter_js_2, renderer_3, gearbit_2, partbody_1, constants_2, animator_2, PhysicalBallRouter;
    return {
        setters: [
            function (PIXI_3) {
                PIXI = PIXI_3;
            },
            function (matter_js_2_1) {
                matter_js_2 = matter_js_2_1;
            },
            function (renderer_3_1) {
                renderer_3 = renderer_3_1;
            },
            function (gearbit_2_1) {
                gearbit_2 = gearbit_2_1;
            },
            function (partbody_1_1) {
                partbody_1 = partbody_1_1;
            },
            function (constants_2_1) {
                constants_2 = constants_2_1;
            },
            function (animator_2_1) {
                animator_2 = animator_2_1;
            }
        ],
        execute: function () {
            PhysicalBallRouter = class PhysicalBallRouter {
                constructor(board) {
                    this.board = board;
                    this.partBodyFactory = new partbody_1.PartBodyFactory();
                    this._boardChangeCounter = -1;
                    this._wallWidth = 16;
                    this._wallHeight = 16;
                    this._wallThickness = 16;
                    this._ballNeighbors = new Map();
                    this._parts = new Map();
                    this._bodies = new Map();
                    this.engine = matter_js_2.Engine.create();
                    this.balls = this.board.balls;
                    // make walls to catch stray balls
                    this._createWalls();
                    // capture initial board state
                    this.beforeUpdate();
                }
                onBoardSizeChanged() {
                    // update the walls around the board
                    this._updateWalls();
                    // re-render the wireframe
                    this.renderWireframe();
                    // capture changes to board state
                    this.beforeUpdate();
                }
                // UPDATING *****************************************************************
                update(speed, correction) {
                    if (!(speed > 0))
                        return;
                    let iterations = speed * 2;
                    if (iterations < 1) {
                        this.engine.timing.timeScale = speed;
                        iterations = 1;
                    }
                    else
                        this.engine.timing.timeScale = 1;
                    for (let i = 0; i < iterations; i++) {
                        this.beforeUpdate();
                        matter_js_2.Engine.update(this.engine);
                        this.afterUpdate();
                        gearbit_2.GearBase.update();
                    }
                }
                beforeUpdate() {
                    this.addNeighborParts(this._boardChangeCounter !== this.board.changeCounter);
                    this._boardChangeCounter = this.board.changeCounter;
                    for (const partBody of this._parts.values()) {
                        partBody.updateBodyFromPart();
                    }
                }
                afterUpdate() {
                    // determine the set of balls touching each part
                    const contacts = this._mapContacts();
                    const nearby = this._mapNearby();
                    // apply physics corrections
                    for (const partBody of this._parts.values()) {
                        partBody.cheat(contacts.get(partBody), nearby.get(partBody));
                    }
                    // transfer part positions
                    for (const [part, partBody] of this._parts.entries()) {
                        partBody.updatePartFromBody();
                        if (part.bodyCanMove) {
                            this.board.layoutPart(part, part.column, part.row);
                        }
                    }
                    // combine the velocities of connected gear trains
                    this.connectGears(contacts);
                    // re-render the wireframe if there is one
                    this.renderWireframe();
                    // re-render the whole display if we're managing parts
                    if (this._parts.size > 0)
                        renderer_3.Renderer.needsUpdate();
                }
                // average the angular velocities of all simulated gears with ball contacts,
                //  and transfer it to all simulated gears that are connected
                connectGears(contacts) {
                    const activeTrains = new Set();
                    for (const part of this._parts.keys()) {
                        if (part instanceof gearbit_2.GearBase)
                            activeTrains.add(part.connected);
                    }
                    for (const train of activeTrains) {
                        let av = 0;
                        let contactCount = 0;
                        for (const gear of train) {
                            // select gears which are simulated and have balls in contact
                            const partBody = this._parts.get(gear);
                            if ((partBody) && (partBody.body) && (contacts.has(partBody))) {
                                av += partBody.body.angularVelocity;
                                contactCount++;
                            }
                        }
                        // transfer the average angular velocity to all connected gears
                        if (contactCount > 0) {
                            av /= contactCount;
                            for (const gear of train) {
                                const partBody = this._parts.get(gear);
                                if ((partBody) && (partBody.body)) {
                                    matter_js_2.Body.setAngularVelocity(partBody.body, av);
                                }
                            }
                        }
                    }
                }
                _mapContacts() {
                    const contacts = new Map();
                    for (const pair of this.engine.pairs.collisionActive) {
                        const partA = this._findPartBody(pair.bodyA);
                        if (!partA)
                            continue;
                        const partB = this._findPartBody(pair.bodyB);
                        if (!partB)
                            continue;
                        if ((partA.type == 9 /* BALL */) && (partB.type != 9 /* BALL */)) {
                            if (!contacts.has(partB))
                                contacts.set(partB, new Set());
                            contacts.get(partB).add({ ballPartBody: partA, tangent: pair.collision.tangent });
                        }
                        else if ((partB.type == 9 /* BALL */) && (partA.type != 9 /* BALL */)) {
                            if (!contacts.has(partA))
                                contacts.set(partA, new Set());
                            contacts.get(partA).add({ ballPartBody: partB, tangent: pair.collision.tangent });
                        }
                    }
                    return (contacts);
                }
                _findPartBody(body) {
                    if (this._bodies.has(body))
                        return (this._bodies.get(body));
                    if ((body.parent) && (body.parent !== body)) {
                        return (this._findPartBody(body.parent));
                    }
                    return (null);
                }
                // map parts to the balls in their grid square
                _mapNearby() {
                    const map = new Map;
                    for (const ball of this.balls) {
                        const ballPartBody = this._parts.get(ball);
                        if (!ballPartBody)
                            continue;
                        const part = this.board.getPart(Math.round(ball.column), Math.round(ball.row));
                        const partBody = this._parts.get(part);
                        if (!partBody)
                            continue;
                        if (!map.has(partBody))
                            map.set(partBody, new Set());
                        map.get(partBody).add(ballPartBody);
                    }
                    return (map);
                }
                // STATE MANAGEMENT *********************************************************
                _createWalls() {
                    const options = { isStatic: true };
                    this._top = matter_js_2.Bodies.rectangle(0, 0, this._wallWidth, this._wallThickness, options);
                    this._bottom = matter_js_2.Bodies.rectangle(0, 0, this._wallWidth, this._wallThickness, options);
                    this._left = matter_js_2.Bodies.rectangle(0, 0, this._wallThickness, this._wallHeight, options);
                    this._right = matter_js_2.Bodies.rectangle(0, 0, this._wallThickness, this._wallHeight, options);
                    matter_js_2.World.add(this.engine.world, [this._top, this._right, this._bottom, this._left]);
                }
                _updateWalls() {
                    const w = ((this.board.columnCount + 3) * constants_2.SPACING);
                    const h = ((this.board.rowCount + 5) * constants_2.SPACING);
                    const hw = (w - this._wallThickness) / 2;
                    const hh = (h + this._wallThickness) / 2;
                    const cx = ((this.board.columnCount - 1) / 2) * constants_2.SPACING;
                    const cy = ((this.board.rowCount - 1) / 2) * constants_2.SPACING;
                    matter_js_2.Body.setPosition(this._top, { x: cx, y: cy - hh });
                    matter_js_2.Body.setPosition(this._bottom, { x: cx, y: cy + hh });
                    matter_js_2.Body.setPosition(this._left, { x: cx - hw, y: cy });
                    matter_js_2.Body.setPosition(this._right, { x: cx + hw, y: cy });
                    const sx = w / this._wallWidth;
                    const sy = h / this._wallHeight;
                    if (sx != 1.0) {
                        matter_js_2.Body.scale(this._top, sx, 1.0);
                        matter_js_2.Body.scale(this._bottom, sx, 1.0);
                    }
                    if (sy != 1.0) {
                        matter_js_2.Body.scale(this._left, 1.0, sy);
                        matter_js_2.Body.scale(this._right, 1.0, sy);
                    }
                    this._wallWidth = w;
                    this._wallHeight = h;
                }
                addNeighborParts(force = false) {
                    // track parts to add and remove
                    const addParts = new Set();
                    const removeParts = new Set(this._parts.keys());
                    // update for all balls on the board
                    for (const ball of this.balls) {
                        // get the ball's current location
                        const column = Math.round(ball.column);
                        const row = Math.round(ball.row);
                        // remove balls that drop off the board
                        if (Math.round(row) > this.board.rowCount) {
                            this.board.removeBall(ball);
                            continue;
                        }
                        // don't update for balls in the same locality (unless forced to)
                        if ((!force) && (this._ballNeighbors.has(ball)) &&
                            (ball.lastColumn === column) &&
                            ((ball.lastRow === row) || (ball.lastRow === row + 1))) {
                            removeParts.delete(ball);
                            for (const part of this._ballNeighbors.get(ball)) {
                                removeParts.delete(part);
                            }
                            continue;
                        }
                        // add the ball itself
                        addParts.add(ball);
                        removeParts.delete(ball);
                        // reset the list of neighbors
                        if (!this._ballNeighbors.has(ball)) {
                            this._ballNeighbors.set(ball, new Set());
                        }
                        const neighbors = this._ballNeighbors.get(ball);
                        neighbors.clear();
                        // update the neighborhood of parts around the ball
                        for (let c = -1; c <= 1; c++) {
                            for (let r = -1; r <= 1; r++) {
                                const part = this.board.getPart(column + c, row + r);
                                if (!part)
                                    continue;
                                addParts.add(part);
                                removeParts.delete(part);
                                neighbors.add(part);
                            }
                        }
                        // store the last place we updated the ball
                        ball.lastColumn = column;
                        ball.lastRow = row;
                    }
                    // add new parts and remove old ones
                    for (const part of addParts)
                        this.addPart(part);
                    for (const part of removeParts)
                        this.removePart(part);
                }
                addPart(part) {
                    if (this._parts.has(part))
                        return; // make it idempotent
                    const partBody = this.partBodyFactory.make(part);
                    this._parts.set(part, partBody);
                    partBody.updateBodyFromPart();
                    partBody.addToWorld(this.engine.world);
                    if (partBody.body)
                        this._bodies.set(partBody.body, partBody);
                }
                removePart(part) {
                    if (!this._parts.has(part))
                        return; // make it idempotent
                    const partBody = this._parts.get(part);
                    partBody.removeFromWorld(this.engine.world);
                    this._bodies.delete(partBody.body);
                    this.partBodyFactory.release(partBody);
                    this._parts.delete(part);
                    this._restoreRestingRotation(part);
                }
                // restore the rotation of the part if it has one
                _restoreRestingRotation(part) {
                    if (part.rotation === part.restingRotation)
                        return;
                    // ensure we don't "restore" a gear that's still connected
                    //  to a chain that's being simulated
                    if ((part instanceof gearbit_2.Gearbit) && (part.connected)) {
                        for (const gear of part.connected) {
                            if ((gear instanceof gearbit_2.Gearbit) && (this._parts.has(gear)))
                                return;
                        }
                    }
                    if (this.board.speed > 0) {
                        animator_2.Animator.current.animate(part, 'rotation', part.rotation, part.restingRotation, 0.1 / this.board.speed);
                    }
                }
                // WIREFRAME PREVIEW ********************************************************
                get showWireframe() {
                    return (this._wireframe ? true : false);
                }
                set showWireframe(v) {
                    if ((v) && (!this._wireframe)) {
                        this._wireframe = new PIXI.Sprite();
                        this._wireframeGraphics = new PIXI.Graphics();
                        this._wireframe.addChild(this._wireframeGraphics);
                        this.board._layers.addChild(this._wireframe);
                        this.onBoardSizeChanged();
                        this.renderWireframe();
                    }
                    else if ((!v) && (this._wireframe)) {
                        this.board._layers.removeChild(this._wireframe);
                        this._wireframe = null;
                        this._wireframeGraphics = null;
                        renderer_3.Renderer.needsUpdate();
                    }
                }
                renderWireframe() {
                    if (!this._wireframe)
                        return;
                    // setup
                    const g = this._wireframeGraphics;
                    g.clear();
                    const scale = this.board.spacing / constants_2.SPACING;
                    // draw all constraints
                    var constraints = matter_js_2.Composite.allConstraints(this.engine.world);
                    for (const constraint of constraints) {
                        this._drawConstraint(g, constraint, scale);
                    }
                    // draw all bodies
                    var bodies = matter_js_2.Composite.allBodies(this.engine.world);
                    for (const body of bodies) {
                        this._drawBody(g, body, scale);
                    }
                    renderer_3.Renderer.needsUpdate();
                }
                _drawBody(g, body, scale) {
                    if (body.parts.length > 1) {
                        // if the body has more than one part, the first is the convex hull, which
                        //  we draw in a different color to distinguish it
                        this._drawVertices(g, body.vertices, 65280 /* WIREFRAME_HULL */, scale);
                        for (let i = 1; i < body.parts.length; i++) {
                            this._drawBody(g, body.parts[i], scale);
                        }
                    }
                    else {
                        this._drawVertices(g, body.vertices, 16711680 /* WIREFRAME */, scale);
                    }
                }
                _drawVertices(g, vertices, color, scale) {
                    g.lineStyle(1, color);
                    g.beginFill(color, 0.2 /* WIREFRAME */);
                    // draw the vertices of the body
                    let first = true;
                    for (const vertex of vertices) {
                        if (first) {
                            g.moveTo(vertex.x * scale, vertex.y * scale);
                            first = false;
                        }
                        else {
                            g.lineTo(vertex.x * scale, vertex.y * scale);
                        }
                    }
                    g.closePath();
                    g.endFill();
                }
                _drawConstraint(g, c, scale) {
                    if ((!c.pointA) || (!c.pointB))
                        return;
                    g.lineStyle(2, 255 /* WIREFRAME_CONSTRAINT */, 0.5);
                    if (c.bodyA) {
                        g.moveTo((c.bodyA.position.x + c.pointA.x) * scale, (c.bodyA.position.y + c.pointA.y) * scale);
                    }
                    else {
                        g.moveTo(c.pointA.x * scale, c.pointA.y * scale);
                    }
                    if (c.bodyB) {
                        g.lineTo((c.bodyB.position.x + c.pointB.x) * scale, (c.bodyB.position.y + c.pointB.y) * scale);
                    }
                    else {
                        g.lineTo(c.pointB.x * scale, c.pointB.y * scale);
                    }
                }
            };
            exports_22("PhysicalBallRouter", PhysicalBallRouter);
        }
    };
});
System.register("board/schematic", ["matter-js", "board/constants", "parts/fence", "parts/gearbit"], function (exports_23, context_23) {
    "use strict";
    var __moduleName = context_23 && context_23.id;
    var matter_js_3, constants_3, fence_3, gearbit_3, RAD, DIAM, DIAM_2, FENCE, STEP, EXIT, SchematicBallRouter;
    return {
        setters: [
            function (matter_js_3_1) {
                matter_js_3 = matter_js_3_1;
            },
            function (constants_3_1) {
                constants_3 = constants_3_1;
            },
            function (fence_3_1) {
                fence_3 = fence_3_1;
            },
            function (gearbit_3_1) {
                gearbit_3 = gearbit_3_1;
            }
        ],
        execute: function () {
            // compute the ball radius and diameter in grid units
            RAD = constants_3.BALL_RADIUS / constants_3.SPACING;
            DIAM = 2 * RAD;
            // square the diameter for fast distance tests
            DIAM_2 = DIAM * DIAM;
            // the thickness of fences in grid units
            FENCE = 0.125;
            // the speed at which a ball should move through schematic parts
            STEP = 1 / constants_3.PART_SIZE;
            // the offset the schematic router should move toward when routing a ball,
            //  which must be over 0.5 to allow the next part to capture the ball
            EXIT = 0.51 + RAD;
            SchematicBallRouter = class SchematicBallRouter {
                constructor(board) {
                    this.board = board;
                    this._initialBitValue = new WeakMap();
                    this.balls = this.board.balls;
                }
                onBoardSizeChanged() { }
                update(speed, correction) {
                    const iterations = Math.ceil(speed * 8);
                    for (let i = 0; i < iterations; i++) {
                        for (const ball of this.balls) {
                            ball.vx = ball.vy = 0;
                            ball.minX = ball.maxX = ball.maxY = NaN;
                            if (this.routeBall(ball)) {
                                this.board.layoutPart(ball, ball.column, ball.row);
                            }
                            else {
                                this.board.removeBall(ball);
                            }
                        }
                        this.stackBalls();
                        this.moveBalls();
                        this.confineBalls();
                        gearbit_3.GearBase.update();
                    }
                }
                moveBalls() {
                    for (const ball of this.balls) {
                        const m = Math.sqrt((ball.vx * ball.vx) + (ball.vy * ball.vy));
                        if (m == 0.0)
                            continue;
                        const d = Math.min(m, STEP);
                        ball.column += (ball.vx * d) / m;
                        ball.row += (ball.vy * d) / m;
                    }
                }
                confineBalls() {
                    for (const ball of this.balls) {
                        if ((!isNaN(ball.maxX)) && (ball.column > ball.maxX)) {
                            ball.column = ball.maxX;
                        }
                        if ((!isNaN(ball.minX)) && (ball.column < ball.minX)) {
                            ball.column = ball.minX;
                        }
                        if ((!isNaN(ball.maxY)) && (ball.row > ball.maxY)) {
                            ball.row = ball.maxY;
                        }
                    }
                }
                routeBall(ball) {
                    let part;
                    let method;
                    // confine the ball on the sides
                    this.checkSides(ball);
                    // get the part containing the ball's center
                    part = this.board.getPart(Math.round(ball.column), Math.round(ball.row));
                    if ((part) && (method = this.routeMethodForPart(part)) &&
                        (method.call(this, part, ball)))
                        return (true);
                    // get the leading corner of the ball's location if 
                    //  we know it's moving horizontally
                    if (ball.lastColumn !== ball.column) {
                        const sign = ball.lastColumn < ball.column ? 1 : -1;
                        const c = ball.column + (RAD * sign);
                        const r = ball.row + RAD;
                        // get the part on the grid square containing the leading corner
                        part = this.board.getPart(Math.round(c), Math.round(r));
                        if ((part) && (method = this.routeMethodForPart(part)) &&
                            (method.call(this, part, ball)))
                            return (true);
                    }
                    // if we get here, the ball was not moved, so let it fall
                    this.routeFreefall(ball);
                    if (ball.row > this.board.rowCount + 0.5)
                        return (false);
                    return (true);
                }
                checkSides(ball) {
                    const c = Math.round(ball.column);
                    const r = Math.round(ball.row);
                    const left = this.board.getPart(c - 1, r);
                    const center = this.board.getPart(c, r);
                    const right = this.board.getPart(c + 1, r);
                    if (((left) && (left.type == 12 /* SIDE */) && (left.isFlipped)) ||
                        ((center) && (center.type == 12 /* SIDE */) && (!center.isFlipped))) {
                        ball.minX = c - 0.5 + RAD + (FENCE / 2);
                    }
                    if (((right) && (right.type == 12 /* SIDE */) && (!right.isFlipped)) ||
                        ((center) && (center.type == 12 /* SIDE */) && (center.isFlipped))) {
                        ball.maxX = c + 0.5 - RAD - (FENCE / 2);
                    }
                }
                routeMethodForPart(part) {
                    if (!part)
                        return (null);
                    switch (part.type) {
                        case 3 /* RAMP */: return (this.routeRamp);
                        case 4 /* CROSSOVER */: return (this.routeCrossover);
                        case 5 /* INTERCEPTOR */: return (this.routeInterceptor);
                        case 6 /* BIT */: // fall-through
                        case 7 /* GEARBIT */: return (this.routeBit);
                        case 12 /* SIDE */: return (this.routeSide);
                        case 13 /* SLOPE */: return (this.routeSlope);
                        case 10 /* DROP */: return (this.routeDrop);
                        case 11 /* TURNSTILE */: return (this.routeTurnstile);
                        default: return (null);
                    }
                }
                routeRamp(part, ball) {
                    // if the ball is in the top half of the part, proceed toward the center
                    if (ball.row < part.row)
                        this.approachTarget(ball, part.column, part.row);
                    else {
                        this.approachTarget(ball, part.column + (part.isFlipped ? -EXIT : EXIT), part.row + EXIT);
                    }
                    return (true);
                }
                routeCrossover(part, ball) {
                    // if the ball is in the top half of the part, proceed toward the center
                    if (ball.row < part.row)
                        this.approachTarget(ball, part.column, part.row);
                    else if (ball.lastDistinctColumn < ball.column) {
                        this.approachTarget(ball, part.column + EXIT, part.row + EXIT);
                    }
                    else {
                        this.approachTarget(ball, part.column - EXIT, part.row + EXIT);
                    }
                    return (true);
                }
                routeInterceptor(part, ball) {
                    ball.minX = part.column - 0.5 + RAD;
                    ball.maxX = part.column + 0.5 - RAD;
                    ball.maxY = part.row + 0.5 - RAD;
                    return (this.routeFreefall(ball));
                }
                routeBit(part, ball) {
                    // if the ball is in the top half of the part, proceed toward the center,
                    //  rotating the bit as we go
                    if (ball.row < part.row) {
                        this._initialBitValue.set(part, part.bitValue);
                        this.approachTarget(ball, part.column, part.row);
                    }
                    else if (!this._initialBitValue.get(part)) {
                        this.approachTarget(ball, part.column + EXIT, part.row + EXIT);
                    }
                    else {
                        this.approachTarget(ball, part.column - EXIT, part.row + EXIT);
                    }
                    // rotate the part as the ball travels through it
                    let r = (part.row + 0.5) - ball.row;
                    if (!this._initialBitValue.get(part))
                        r = 1.0 - r;
                    part.rotation = r;
                    return (true);
                }
                routeSide(part, ball) {
                    // if the ball is contacting the side, push it inward
                    if (part.isFlipped) {
                        ball.maxX = part.column + 0.5 - RAD;
                    }
                    else {
                        ball.minX = part.column - 0.5 + RAD;
                    }
                    return (this.routeFreefall(ball));
                }
                routeSlope(part, ball) {
                    if (!(part instanceof fence_3.Slope))
                        return (false);
                    // get the ball's row and column as a percentage of the part area
                    const r = ball.row - (part.row - 0.5);
                    let c = ball.column - (part.column - 0.5);
                    if (part.isFlipped)
                        c = 1 - c;
                    // get the level the ball center should be at at that column
                    const m = part.modulus;
                    const s = part.sequence;
                    const level = ((c + s - FENCE) / m) - RAD;
                    // if the ball is above the slope, allow it to drop
                    if (r + STEP <= level)
                        return (this.routeFreefall(ball));
                    // if the ball is well below the slope, allow it to drop
                    if (r > level + DIAM)
                        return (this.routeFreefall(ball));
                    // the ball is near the fence, so put it on top of the fence
                    ball.maxY = (part.row - 0.5) + level;
                    // get the target column to aim for
                    const sign = part.isFlipped ? -1 : 1;
                    let target = sign * EXIT;
                    // roll toward the exit
                    this.approachTarget(ball, part.column + target, part.row - 0.5 + ((0.5 + (target * sign) + s - FENCE) / m) - RAD);
                    return (true);
                }
                routeDrop(part, ball) {
                    if (ball.released) {
                        const sign = part.isFlipped ? -1 : 1;
                        this.approachTarget(ball, part.column + (sign * EXIT), part.row + 0.5 - RAD);
                    }
                    else {
                        const offset = RAD + (FENCE / 2);
                        ball.minX = part.column - 0.5 + offset;
                        ball.maxX = part.column + 0.5 - offset;
                        ball.maxY = part.row + 0.5 - offset;
                        this.routeFreefall(ball);
                    }
                    return (true);
                }
                routeTurnstile(part, ball) {
                    // convert to direction and position neutral coordinates for simplicity
                    const sign = part.isFlipped ? -1 : 1;
                    let r = ball.row - part.row;
                    let tc = NaN;
                    let tr = NaN;
                    // lots of magic numbers here because the shape is complicated
                    const pocketR = -0.35;
                    const pocketC = 0.13;
                    if (r < pocketR) {
                        // if another ball is already rotating the turnstile, 
                        //  stop this one until that one goes through
                        if (part.rotation > 0.1)
                            return (true);
                        tc = pocketC;
                        tr = pocketR;
                    }
                    else if ((part.rotation < 1.0) && (r < pocketC)) {
                        part.rotation += 0.01;
                        const v = matter_js_3.Vector.rotate({ x: pocketC, y: pocketR }, part.angleForRotation(part.rotation) * sign);
                        tc = v.x;
                        tr = v.y;
                    }
                    else {
                        part.rotation = 0.0;
                        tr = 0.28;
                        tc = EXIT;
                    }
                    // if there is a target, convert back into real coordinates and route
                    if ((!isNaN(tc)) && (!isNaN(tr))) {
                        this.approachTarget(ball, part.column + (tc * sign), part.row + tr);
                    }
                    return (true);
                }
                routeFreefall(ball) {
                    ball.vy += STEP;
                    return (true);
                }
                // move the ball toward the given location
                approachTarget(ball, c, r) {
                    let v = matter_js_3.Vector.normalise({ x: c - ball.column, y: r - ball.row });
                    ball.vx += v.x * STEP;
                    ball.vy += v.y * STEP;
                }
                // BALL STACKING ************************************************************
                stackBalls() {
                    // group balls into columns containing balls that are on either side
                    const columns = [];
                    const add = (ball, c) => {
                        if ((c < 0) || (c >= this.board.rowCount))
                            return;
                        if (columns[c] === undefined)
                            columns[c] = [];
                        columns[c].push(ball);
                    };
                    for (const ball of this.balls) {
                        const center = Math.round(ball.column);
                        add(ball, center);
                        add(ball, center - 1);
                        add(ball, center + 1);
                    }
                    // sort the balls in each column from bottom to top
                    for (const c in columns) {
                        const column = columns[c];
                        if (!column)
                            continue;
                        column.sort((a, b) => a.row > b.row ? -1 : a.row < b.row ? 1 : 0);
                        this.stackColumn(parseInt(c), column);
                    }
                }
                stackColumn(column, balls) {
                    let ball;
                    let r, c, i, j, dc, dr;
                    const collisions = new Set();
                    for (i = 0; i < balls.length; i++) {
                        ball = balls[i];
                        // don't move balls from other columns, they'll be taken care of there
                        if (Math.round(ball.column) !== column)
                            continue;
                        // iterate over balls below this one to find collisions
                        collisions.clear();
                        r = ball.row;
                        c = ball.column;
                        for (j = i - 1; j >= 0; j--) {
                            dc = balls[j].column - c;
                            dr = balls[j].row - r;
                            // if we find a ball more than a diameter below this one, 
                            //  the rest must be lower
                            if (dr > DIAM)
                                break;
                            if ((dr * dr) + (dc * dc) < DIAM_2) {
                                collisions.add(balls[j]);
                            }
                        }
                        // if there are no collisions, there's nothing to do
                        if (collisions.size == 0)
                            continue;
                        // if the ball is in contact, remove any horizontal motion 
                        //  applied by the router so far
                        ball.vx = 0;
                        // move away from each other ball
                        for (const b of collisions) {
                            let dx = ball.column - b.column;
                            let dy = ball.row - b.row;
                            const m = Math.sqrt((dx * dx) + (dy * dy));
                            // if two ball are directly on top of eachother, push one of them up
                            if (!(m > 0)) {
                                ball.vy -= (DIAM - STEP);
                            }
                            else {
                                const d = (DIAM - STEP) - m;
                                // add some jitter so balls don't stack up vertically
                                if (dx === 0.0)
                                    dx = (Math.random() - 0.5) * STEP * 0.01;
                                if (d > 0) {
                                    ball.vx += (dx * d) / m;
                                    ball.vy += (dy * d) / m;
                                }
                            }
                        }
                    }
                }
            };
            exports_23("SchematicBallRouter", SchematicBallRouter);
        }
    };
});
System.register("board/serializer", ["parts/drop"], function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    var drop_3, URLBoardSerializer;
    return {
        setters: [
            function (drop_3_1) {
                drop_3 = drop_3_1;
            }
        ],
        execute: function () {
            URLBoardSerializer = class URLBoardSerializer {
                constructor(board) {
                    this.board = board;
                    this._uiState = null;
                    this._boardState = null;
                    this._historyState = { 'source': 'URLBoardSerializer' };
                    this._trySaveInterval = NaN;
                    this._restoring = false;
                }
                get dataUrl() { return (this._boardState); }
                onBoardStateChanged() {
                    this._uiState = null;
                    this._boardState = null;
                    this.onChange();
                }
                onUIStateChanged() {
                    this._uiState = null;
                    this.onChange();
                }
                onChange() {
                    if (!isNaN(this._trySaveInterval))
                        clearInterval(this._trySaveInterval);
                    this._trySaveInterval = setInterval(this.save.bind(this), 0.5 /* UPDATE_URL */ * 1000);
                }
                save() {
                    // don't save if we're in the process of a restore operation,
                    //  the interval will call back again later and restore may be finished
                    if (this._restoring)
                        return;
                    // stop trying to save
                    if (!isNaN(this._trySaveInterval)) {
                        clearInterval(this._trySaveInterval);
                        this._trySaveInterval = NaN;
                    }
                    // regenerate any invalid state
                    if (this._uiState === null)
                        this._uiState = this._writeUIState();
                    if (this._boardState === null)
                        this._boardState = this._writeBoardState();
                    // if we can't update the URL, exit now
                    if ((!window.history) || (!window.history.replaceState) ||
                        (!window.history.pushState))
                        return;
                    // compose a hash to use to save state
                    const hash = '#' + this._uiState + '&b=' + this._boardState;
                    // if no hash is set, we need to push state first
                    if (window.location.hash.length == 0) {
                        window.history.pushState(this._historyState, '', hash);
                    }
                    else {
                        window.history.replaceState(this._historyState, '', hash);
                    }
                }
                restore(callback) {
                    // if there is no hash, there's nothing to restore
                    const hash = window.location.hash.substr(1);
                    if (hash.length == 0) {
                        callback(false);
                        return;
                    }
                    try {
                        this._restoring = true;
                        const [ui, board] = hash.split('&b=', 2);
                        this._readUIState(ui);
                        this._readBoardState(board, callback);
                    }
                    catch (e) {
                        console.warn(e);
                        callback(false);
                    }
                    finally {
                        this._restoring = false;
                    }
                }
                download() {
                    const url = this.dataUrl;
                    if (!(url.length > 0))
                        return (false);
                    const a = document.createElement('a');
                    a.setAttribute('href', url);
                    a.setAttribute('download', 'ttsim.png');
                    a.click();
                    return (true);
                }
                upload(callback) {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/png');
                    input.onchange = () => {
                        if (!(input.files.length > 0))
                            return;
                        const file = input.files[0];
                        var reader = new FileReader();
                        reader.onload = (e) => {
                            this._restoring = true;
                            try {
                                this._readBoardState(e.target.result, callback);
                            }
                            finally {
                                this._restoring = false;
                            }
                        };
                        reader.readAsDataURL(file);
                    };
                    input.click();
                    return (false);
                }
                _writeUIState() {
                    let s = '';
                    s += 's=' + this.board.columnCount + ',' + this.board.rowCount;
                    s += '&z=' + this.board.partSize;
                    s += '&cc=' + Math.round(this.board.centerColumn * 2) / 2;
                    s += '&cr=' + Math.round(this.board.centerRow * 2) / 2;
                    s += '&t=' + this.board.tool;
                    if (this.board.partPrototype) {
                        s += '&pt=' + this.board.partPrototype.type;
                    }
                    s += '&sp=' + this.board.speed;
                    s += '&sc=' + (this.board.schematic ? '1' : '0');
                    return (s);
                }
                _readUIState(s) {
                    // split the hash into variables and parse them
                    for (const kv of s.split('&')) {
                        const [key, value] = kv.split('=', 2);
                        if (key == 't')
                            this.board.tool = parseInt(value);
                        else if (key == 'pt') {
                            this.board.partPrototype = this.board.partFactory.make(parseInt(value));
                        }
                        else if (key == 'z')
                            this.board.partSize = parseInt(value);
                        else if (key == 's') {
                            const [c, r] = value.split(',');
                            this.board.setSize(parseInt(c), parseInt(r), false);
                        }
                        else if (key == 'cc')
                            this.board.centerColumn = parseFloat(value);
                        else if (key == 'cr')
                            this.board.centerRow = parseFloat(value);
                        else if (key == 'sp')
                            this.board.speed = parseFloat(value);
                        else if (key == 'sc')
                            this.board.schematic = (parseInt(value) === 1);
                    }
                }
                _writeMetadata() {
                    let items = [];
                    // add metadata about drops
                    for (const drop of this._getSortedDrops()) {
                        items.push('d ' + drop.hue + ' ' + drop.balls.size);
                    }
                    return (items.join(' '));
                }
                _readMetadata(s) {
                    const drops = this._getSortedDrops();
                    // tokenize the string
                    const tokens = s.split(' ');
                    let token, type, params;
                    while (tokens.length > 0) {
                        token = tokens.shift();
                        if (parseFloat(token).toString() != token) {
                            type = token;
                            params = [];
                        }
                        else {
                            params.push(parseFloat(token));
                        }
                        // read drop metadata
                        if ((type == 'd') && (params.length == 2)) {
                            const drop = drops.shift();
                            if (drop) {
                                drop.hue = Math.round(params[0]);
                                this.board.setDropBallCount(drop, Math.floor(params[1]));
                            }
                        }
                    }
                }
                _getSortedDrops() {
                    const drops = [];
                    let part;
                    for (let c = 0; c < this.board.columnCount; c++) {
                        for (let r = 0; r < this.board.rowCount; r++) {
                            part = this.board.getPart(c, r);
                            if (part instanceof drop_3.Drop)
                                drops.push(part);
                        }
                    }
                    return (drops);
                }
                _writeBoardState() {
                    // compose metadata to include with the image
                    let metadata = this._writeMetadata();
                    const metadataBytesPerRow = (this.board.columnCount - 1) * 3;
                    const metadataRows = Math.ceil(metadata.length / metadataBytesPerRow);
                    // make a canvas where grid location on the board is a pixel
                    const canvas = document.createElement('canvas');
                    canvas.width = this.board.columnCount;
                    canvas.height = this.board.rowCount + metadataRows;
                    const ctx = canvas.getContext('2d');
                    const imageData = ctx.createImageData(canvas.width, canvas.height);
                    const rw = canvas.width * 4;
                    // draw pixels representing the parts
                    for (let c = 0; c < this.board.columnCount; c++) {
                        for (let r = 0; r < this.board.rowCount; r++) {
                            const part = this.board.getPart(c, r);
                            this.partToColor(part, imageData.data, (r * rw) + (c * 4));
                        }
                    }
                    // write metadata
                    for (let r = this.board.rowCount; r < canvas.height; r++) {
                        if (!(metadata.length > 0))
                            break;
                        metadata = this.writeMetadataRow(imageData.data, (r * rw), canvas.width, metadata);
                    }
                    ctx.putImageData(imageData, 0, 0);
                    return (canvas.toDataURL());
                }
                _readBoardState(url, callback) {
                    const expectedPrefix = 'data:image/png;base64,';
                    const prefix = url.substr(0, expectedPrefix.length);
                    if (prefix !== expectedPrefix) {
                        console.warn('Unexpected data url prefix: ' + prefix);
                        callback(false);
                        return;
                    }
                    const img = document.createElement('img');
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const w = img.width;
                        const h = img.height;
                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, w, h);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        let s, metadata = '';
                        // read parts and metadata from the image's pixels
                        this.board.bulkUpdate = true;
                        this.board.setSize(w, 0, false);
                        let r = 0;
                        for (let y = 0; y < h; y++) {
                            // read metadata row
                            s = this.readMetadataRow(imageData.data, (y * w * 4), w);
                            if (s !== null) {
                                metadata += s;
                                continue;
                            }
                            // read part row
                            this.board.sizeBottom(1, false);
                            for (let c = 0; c < this.board.columnCount; c++) {
                                const part = this.colorToPart(imageData.data, (y * w * 4) + (c * 4));
                                if (part)
                                    this.board.setPart(part, c, r);
                                else
                                    this.board.clearPart(c, r);
                            }
                            r++;
                        }
                        this._readMetadata(metadata);
                        this.board.bulkUpdate = false;
                        callback(true);
                    };
                    img.onerror = () => {
                        callback(false);
                    };
                    img.src = url;
                }
                partToColor(part, data, i) {
                    let r = 0xFF, g = 0xFF, b = 0xFF, a = 0xFF;
                    let flip = (part) && ((part.canFlip && part.isFlipped) ||
                        (part.canRotate && part.bitValue));
                    // select a color for the part
                    if (part)
                        switch (part.type) {
                            // leave both types of locations white so we don't get a checker pattern 
                            //  in the image, which makes editing harder
                            case 1 /* PARTLOC */: // fall-through
                            case 2 /* GEARLOC */: break;
                            // handle parts
                            case 3 /* RAMP */:
                                r = 0x00;
                                g = 0xFF;
                                b = 0x00;
                                break; // green
                            case 4 /* CROSSOVER */:
                                r = 0xFF;
                                g = 0x80;
                                b = 0x00;
                                break; // orange
                            case 5 /* INTERCEPTOR */:
                                r = 0x00;
                                g = 0x00;
                                b = 0x00;
                                break; // black
                            case 6 /* BIT */:
                                r = 0x00;
                                g = 0xFF;
                                b = 0xFF;
                                break; // cyan
                            case 7 /* GEARBIT */:
                                r = 0x80;
                                g = 0x00;
                                b = 0xFF;
                                break; // purple
                            case 8 /* GEAR */:
                                r = 0xFF;
                                g = 0x00;
                                b = 0x00;
                                break; // red
                            case 10 /* DROP */:
                                r = 0xFF;
                                g = 0xFF;
                                b = 0x00;
                                break; // yellow
                            case 11 /* TURNSTILE */:
                                r = 0xFF;
                                g = 0x00;
                                b = 0xFF;
                                break; // magenta
                            case 12 /* SIDE */:
                                if (!flip) {
                                    r = 0xC0;
                                    g = 0xC0;
                                    b = 0xC0;
                                } // light gray
                                else {
                                    r = 0xA0;
                                    g = 0xA0;
                                    b = 0xA0;
                                }
                                flip = false;
                                break;
                            case 13 /* SLOPE */:
                                if (!flip) {
                                    r = 0x80;
                                    g = 0x80;
                                    b = 0x80;
                                } // middle gray
                                else {
                                    r = 0x60;
                                    g = 0x60;
                                    b = 0x60;
                                }
                                flip = false;
                                break;
                            // leave blank spots and unknown parts a very dark gray
                            case 0 /* BLANK */: // fall-through
                            default:
                                r = g = b = 0x20;
                                break;
                        }
                    // if a part is flipped or rotated, make the color less bright
                    if (flip) {
                        r = (r >> 2) * 3;
                        g = (g >> 2) * 3;
                        b = (b >> 2) * 3;
                    }
                    // if a part is locked, reduce opacity very slightly
                    if ((part) && (part.isLocked))
                        a = 0xFE;
                    // write the color
                    data[i++] = r;
                    data[i++] = g;
                    data[i++] = b;
                    data[i++] = a;
                }
                colorToPart(data, i) {
                    // read the color
                    let r = data[i++];
                    let g = data[i++];
                    let b = data[i++];
                    const a = data[i++];
                    const max = Math.max(r, g, b);
                    // define fudge factors for color recognition so the image can be edited,
                    //  and slightly different colors will still be recognized 
                    const isLow = (n) => n <= 0.25;
                    const isMid = (n) => (n > 0.25) && (n < 0.75);
                    const isHigh = (n) => n >= 0.75;
                    // get the part type
                    let type = -1;
                    let flipped = false;
                    if (max == 0)
                        type = 5 /* INTERCEPTOR */; // black
                    else {
                        r /= max;
                        g /= max;
                        b /= max;
                        // gray
                        if ((isHigh(r)) && (isHigh(g)) && (isHigh(b))) {
                            if (max >= 0xD0) { } // whiteish, clear the location
                            else if (max >= 0x90) {
                                type = 12 /* SIDE */;
                                flipped = (max < 0xB0); // distinguish between 0xC0 and 0xA0
                            }
                            else if (max >= 0x40) {
                                type = 13 /* SLOPE */;
                                flipped = (max < 0x70); // distinguish between 0x60 and 0x80
                            }
                            else {
                                type = 0 /* BLANK */;
                            }
                        }
                        else {
                            // colors
                            if ((isLow(r)) && (isHigh(g)) && (isLow(b)))
                                type = 3 /* RAMP */; // green
                            else if ((isHigh(r)) && (isMid(g)) && (isLow(b)))
                                type = 4 /* CROSSOVER */; // orange
                            else if ((isLow(r)) && (isHigh(g)) && (isHigh(b)))
                                type = 6 /* BIT */; // cyan
                            else if ((isMid(r)) && (isLow(g)) && (isHigh(b)))
                                type = 7 /* GEARBIT */; // purple
                            else if ((isHigh(r)) && (isLow(g)) && (isLow(b)))
                                type = 8 /* GEAR */; // red
                            else if ((isHigh(r)) && (isHigh(g)) && (isLow(b)))
                                type = 10 /* DROP */; // yellow
                            else if ((isHigh(r)) && (isLow(g)) && (isHigh(b)))
                                type = 11 /* TURNSTILE */; // magenta
                            flipped = (max < 0xDE);
                        }
                    }
                    if (type >= 0) {
                        const part = this.board.partFactory.make(type);
                        if (a < 0xFF)
                            part.isLocked = true;
                        if (flipped) {
                            if (part.canFlip)
                                part.isFlipped = true;
                            else if (part.canRotate)
                                part.rotation = 1;
                        }
                        return (part);
                    }
                    return (null);
                }
                writeMetadataRow(data, i, w, s) {
                    const end = i + (w * 4);
                    // write a blue pixel to indicate a metadata row
                    data[i++] = 0x00;
                    data[i++] = 0x00;
                    data[i++] = 0xFF;
                    let c = 0;
                    for (; i < end; i++) {
                        if (i % 4 == 3) {
                            data[i] = 0xFF;
                        }
                        else if (c >= s.length) {
                            data[i] = 0;
                        }
                        else {
                            data[i] = s.charCodeAt(c++);
                        }
                    }
                    // return the unwritten string
                    return (s.substr(c));
                }
                readMetadataRow(data, i, w) {
                    const end = i + (w * 4);
                    // a blue pixel at the start represents a metadata row, skip if there isn't one
                    if ((data[i++] != 0x00) || (data[i++] != 0x00) || (data[i++] != 0xFF))
                        return (null);
                    // build a string from the data in the row
                    let s = '';
                    let c;
                    for (; i < end; i++) {
                        if (i % 4 == 3)
                            continue; // skip alpha
                        c = data[i];
                        if (c == 0)
                            return (s); // null termination
                        s += String.fromCharCode(c);
                    }
                    return (s);
                }
            };
            exports_24("URLBoardSerializer", URLBoardSerializer);
        }
    };
});
System.register("board/controls", ["pixi.js", "renderer", "ui/config"], function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    var PIXI, renderer_4, config_2, ColorWheel, SpriteWithSize, DropButton, TurnButton, BallCounter;
    return {
        setters: [
            function (PIXI_4) {
                PIXI = PIXI_4;
            },
            function (renderer_4_1) {
                renderer_4 = renderer_4_1;
            },
            function (config_2_1) {
                config_2 = config_2_1;
            }
        ],
        execute: function () {
            ColorWheel = class ColorWheel extends PIXI.Sprite {
                constructor(textures) {
                    super();
                    this.textures = textures;
                    this._hue = 0.0;
                    this._wheel = new PIXI.Sprite(textures['ColorWheel-m']);
                    this._wheel.anchor.set(0.5, 0.5);
                    this.addChild(this._wheel);
                    this._pointer = new PIXI.Sprite(textures['ColorWheel-f']);
                    this._pointer.anchor.set(0.5, 0.5);
                    this.addChild(this._pointer);
                    this.anchor.set(0.5, 0.5);
                }
                // the size of the control
                get size() { return (this._wheel.width); }
                set size(v) {
                    if (v === this.size)
                        return;
                    this._wheel.width = this._wheel.height = v;
                    this._pointer.width = this._pointer.height = v;
                    renderer_4.Renderer.needsUpdate();
                }
                // the hue in degrees
                get hue() { return (this._hue); }
                set hue(v) {
                    if (isNaN(v))
                        return;
                    while (v < 0)
                        v += 360;
                    if (v >= 360)
                        v %= 360;
                    if (v === this.hue)
                        return;
                    this._hue = v;
                    this._wheel.rotation = (this._hue / 180) * Math.PI;
                    renderer_4.Renderer.needsUpdate();
                }
            };
            exports_25("ColorWheel", ColorWheel);
            SpriteWithSize = class SpriteWithSize extends PIXI.Sprite {
                // the size of the control
                get size() { return (this.width); }
                set size(v) {
                    if (v === this.size)
                        return;
                    this.width = this.height = v;
                    renderer_4.Renderer.needsUpdate();
                }
                // whether to flip the control horizontally
                get isFlipped() { return (this.scale.x < 0); }
                set isFlipped(v) {
                    if (v === this.isFlipped)
                        return;
                    this.scale.x = Math.abs(this.scale.x) * (v ? -1 : 1);
                    renderer_4.Renderer.needsUpdate();
                }
            };
            DropButton = class DropButton extends SpriteWithSize {
                constructor(textures) {
                    super(textures['DropButton-f']);
                    this.textures = textures;
                    this.anchor.set(0.5, 0.5);
                }
            };
            exports_25("DropButton", DropButton);
            TurnButton = class TurnButton extends SpriteWithSize {
                constructor(textures) {
                    super(textures['TurnButton-f']);
                    this.textures = textures;
                    this.anchor.set(0.5, 0.5);
                }
            };
            exports_25("TurnButton", TurnButton);
            BallCounter = class BallCounter extends PIXI.Sprite {
                constructor() {
                    super();
                    this._text = new PIXI.Text('0', { fontFamily: 'sans-serif', fontWeight: 'bold', align: 'center',
                        fontSize: 24, fill: config_2.htmlColor(16777215 /* BALL_COUNT */),
                        stroke: '#000000', strokeThickness: 4 });
                    this._text.anchor.set(0.5, 0.5);
                    this.addChild(this._text);
                }
                get count() {
                    if (!this.drop)
                        return (0);
                    let count = 0;
                    for (const ball of this.drop.balls) {
                        if ((ball.released) || (ball.row > this.drop.row + 0.5))
                            continue;
                        count++;
                    }
                    return (count);
                }
                update() {
                    const oldText = this._text.text;
                    this._text.text = this.count.toString();
                    if (this._text.text !== oldText)
                        renderer_4.Renderer.needsUpdate();
                }
            };
            exports_25("BallCounter", BallCounter);
        }
    };
});
System.register("ui/keyboard", [], function (exports_26, context_26) {
    "use strict";
    var __moduleName = context_26 && context_26.id;
    function makeKeyHandler(key) {
        const handler = {
            key: key,
            isDown: false,
            isUp: true,
            downHandler: (event) => {
                if (event.key === handler.key) {
                    if ((handler.isUp) && (handler.press))
                        handler.press();
                    handler.isDown = true;
                    handler.isUp = false;
                    event.preventDefault();
                }
            },
            upHandler: (event) => {
                if (event.key === handler.key) {
                    if ((handler.isDown) && (handler.release))
                        handler.release();
                    handler.isDown = false;
                    handler.isUp = true;
                    event.preventDefault();
                }
            }
        };
        //Attach event listeners
        window.addEventListener('keydown', handler.downHandler.bind(handler), false);
        window.addEventListener('keyup', handler.upHandler.bind(handler), false);
        return (handler);
    }
    exports_26("makeKeyHandler", makeKeyHandler);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("board/board", ["pixi-filters", "parts/fence", "parts/gearbit", "ui/config", "util/disjoint", "renderer", "parts/ball", "board/constants", "board/physics", "board/schematic", "parts/drop", "board/controls", "ui/animator", "parts/turnstile", "ui/keyboard"], function (exports_27, context_27) {
    "use strict";
    var __moduleName = context_27 && context_27.id;
    var filter, fence_4, gearbit_4, config_3, disjoint_1, renderer_5, ball_4, constants_4, physics_1, schematic_1, drop_4, controls_1, animator_3, turnstile_3, keyboard_1, SPACING_FACTOR, Board;
    return {
        setters: [
            function (filter_1) {
                filter = filter_1;
            },
            function (fence_4_1) {
                fence_4 = fence_4_1;
            },
            function (gearbit_4_1) {
                gearbit_4 = gearbit_4_1;
            },
            function (config_3_1) {
                config_3 = config_3_1;
            },
            function (disjoint_1_1) {
                disjoint_1 = disjoint_1_1;
            },
            function (renderer_5_1) {
                renderer_5 = renderer_5_1;
            },
            function (ball_4_1) {
                ball_4 = ball_4_1;
            },
            function (constants_4_1) {
                constants_4 = constants_4_1;
            },
            function (physics_1_1) {
                physics_1 = physics_1_1;
            },
            function (schematic_1_1) {
                schematic_1 = schematic_1_1;
            },
            function (drop_4_1) {
                drop_4 = drop_4_1;
            },
            function (controls_1_1) {
                controls_1 = controls_1_1;
            },
            function (animator_3_1) {
                animator_3 = animator_3_1;
            },
            function (turnstile_3_1) {
                turnstile_3 = turnstile_3_1;
            },
            function (keyboard_1_1) {
                keyboard_1 = keyboard_1_1;
            }
        ],
        execute: function () {
            exports_27("SPACING_FACTOR", SPACING_FACTOR = 1.0625);
            Board = class Board {
                constructor(partFactory) {
                    this.partFactory = partFactory;
                    this.view = new PIXI.Sprite();
                    this._layers = new PIXI.Container();
                    // a serializer for the board state
                    this.serializer = null;
                    // the set of balls currently on the board
                    this.balls = new Set();
                    this._changeCounter = 0;
                    this._spriteChangeCounter = 0;
                    this._schematic = false;
                    this._speed = 1.0;
                    // routers to manage the positions of the balls
                    this.physicalRouter = new physics_1.PhysicalBallRouter(this);
                    this.schematicRouter = new schematic_1.SchematicBallRouter(this);
                    this._counter = 0;
                    this._areBallsAtRest = true;
                    this._visibleParts = new Set();
                    this._containers = new Map();
                    this._controls = [];
                    this._partSize = 64;
                    this._width = 0;
                    this._height = 0;
                    this._centerColumn = 0.0;
                    this._centerRow = 0.0;
                    this._columnCount = 0;
                    this._rowCount = 0;
                    // storage for the part grid
                    this._grid = [];
                    this._bulkUpdate = false;
                    this._tool = 3 /* HAND */;
                    this._partPrototype = null;
                    // keep a set of all drops on the board
                    this.drops = new Set();
                    this._ballPositions = new WeakMap();
                    this._bitState = new WeakMap();
                    this._controlKeyDown = false;
                    this._isMouseDown = false;
                    this._dragging = false;
                    this._dragFlippedParts = new Set();
                    this._action = 0 /* PAN */;
                    this._actionResizeDelta = 0;
                    this._bindMouseEvents();
                    this.view.addChild(this._layers);
                    this._initContainers();
                    this._updateDropShadows();
                    this._makeControls();
                    this._bindKeyEvents();
                }
                // a counter that increments whenever the board changes
                get changeCounter() { return (this._changeCounter); }
                onChange() {
                    this._changeCounter++;
                    this._spriteChangeCounter++;
                    if (this.serializer)
                        this.serializer.onBoardStateChanged();
                }
                // register changes to UI state
                onUIChange() {
                    if (this.serializer)
                        this.serializer.onUIStateChanged();
                }
                // whether to show parts in schematic form
                get schematicView() {
                    return ((this._schematic) || (this.spacing <= this.partSize));
                }
                // whether to route parts using the schematic router
                get schematic() { return (this._schematic); }
                set schematic(v) {
                    if (v === this._schematic)
                        return;
                    this._schematic = v;
                    this._updateLayerVisibility();
                    // return all balls because their positions will be different in the two
                    //  routers and it can cause a lot of jumping and sticking
                    this.returnBalls();
                    this.onUIChange();
                }
                // the speed to run the simulator at
                get speed() { return (this._speed); }
                set speed(v) {
                    if ((isNaN(v)) || (v == null))
                        return;
                    v = Math.min(Math.max(config_3.Speeds[0], v), config_3.Speeds[config_3.Speeds.length - 1]);
                    if (v === this.speed)
                        return;
                    this._speed = v;
                    this.onUIChange();
                }
                // update the board state
                update(correction) {
                    if (this.schematic)
                        this.schematicRouter.update(this.speed, correction);
                    else
                        this.physicalRouter.update(this.speed, correction);
                    if (++this._counter % 30 == 0) {
                        this._areBallsAtRest = this._checkBallMovement();
                        if (this.areBallsAtRest)
                            this._checkBitRotations();
                        this._counter = 0;
                    }
                    // update sprite visibility if the board changes
                    if (this._spriteChangeCounter !== this._lastSpriteChangeCounter) {
                        this._updateSpriteVisibility();
                        this._lastSpriteChangeCounter = this._spriteChangeCounter;
                    }
                }
                // whether all balls on the board have been basically motionless for a bit
                get areBallsAtRest() { return (this._areBallsAtRest); }
                // LAYERS *******************************************************************
                _updateSpriteVisibility() {
                    // get the row/column limits on sprite visibility
                    const cx = this.xForColumn(this.centerColumn);
                    const cy = this.yForRow(this.centerRow);
                    const cMin = Math.floor(this.columnForX(cx - (this.width / 2)));
                    const cMax = Math.ceil(this.columnForX(cx + (this.width / 2)));
                    const rMin = Math.floor(this.rowForY(cy - (this.height / 2)));
                    const rMax = Math.ceil(this.rowForY(cy + (this.height / 2)));
                    // clamp to the limits of the actual grid
                    const cMinGrid = Math.min(Math.max(0, cMin), this.columnCount);
                    const cMaxGrid = Math.min(Math.max(0, cMax), this.columnCount);
                    const rMinGrid = Math.min(Math.max(0, rMin), this.rowCount);
                    const rMaxGrid = Math.min(Math.max(0, rMax), this.rowCount);
                    // make a list of parts we should be showing at this time
                    const visible = new Set();
                    // add parts from the grid
                    let c, r, row, part;
                    for (r = rMinGrid; r < rMaxGrid; r++) {
                        row = this._grid[r];
                        for (c = cMinGrid; c < cMaxGrid; c++) {
                            part = row[c];
                            if (part)
                                visible.add(part);
                        }
                    }
                    // add balls
                    for (const ball of this.balls) {
                        if ((ball.column < cMin) || (ball.column > cMax) ||
                            (ball.row < rMin) || (ball.row > rMax))
                            continue;
                        visible.add(ball);
                    }
                    // add the prototype part if there is one
                    if (this.partPrototype)
                        visible.add(this.partPrototype);
                    // remove sprites for parts that are no longer visible
                    const invisible = new Set();
                    for (const part of this._visibleParts) {
                        if (!visible.has(part))
                            invisible.add(part);
                    }
                    // remove sprites for parts that have become invisible
                    for (const part of invisible) {
                        this._removeSpritesForPart(part);
                        this._visibleParts.delete(part);
                    }
                    // add sprites for parts that have just become visible
                    for (const part of visible) {
                        if (!this._visibleParts.has(part)) {
                            this._addSpritesForPart(part);
                            this._visibleParts.add(part);
                        }
                    }
                }
                // add a part to the board's layers
                _addSpritesForPart(part) {
                    for (let layer of this._containers.keys()) {
                        const sprite = part.getSpriteForLayer(layer);
                        if (!sprite)
                            continue;
                        // in non-schematic mode, add balls behind other parts to prevent ball 
                        //  highlights from displaying on top of gears, etc.
                        if ((part instanceof ball_4.Ball) && (layer < 4 /* SCHEMATIC */)) {
                            this._containers.get(layer).addChildAt(sprite, 0);
                        }
                        else {
                            // in schematic mode, place other parts behind balls
                            if ((layer >= 4 /* SCHEMATIC */) && (!(part instanceof ball_4.Ball))) {
                                this._containers.get(layer).addChildAt(sprite, 0);
                            }
                            else {
                                this._containers.get(layer).addChild(sprite);
                            }
                        }
                    }
                    renderer_5.Renderer.needsUpdate();
                }
                // remove a part from the board's layers
                _removeSpritesForPart(part) {
                    if (!part)
                        return;
                    for (let layer of this._containers.keys()) {
                        const sprite = part.getSpriteForLayer(layer);
                        if (!sprite)
                            continue;
                        const container = this._containers.get(layer);
                        if (sprite.parent === container)
                            container.removeChild(sprite);
                    }
                    renderer_5.Renderer.needsUpdate();
                }
                _initContainers() {
                    this._setContainer(0 /* BACK */, false);
                    this._setContainer(1 /* MID */, false);
                    this._setContainer(2 /* FRONT */, false);
                    this._setContainer(3 /* SCHEMATIC_BACK */, true);
                    this._setContainer(4 /* SCHEMATIC */, true);
                    this._setContainer(6 /* SCHEMATIC_4 */, true);
                    this._setContainer(5 /* SCHEMATIC_2 */, true);
                    this._setContainer(8 /* CONTROL */, false);
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
                        return (new PIXI.particles.ParticleContainer(16384, {
                            vertices: true,
                            position: true,
                            rotation: true,
                            tint: true,
                            alpha: true
                        }, 16384, true));
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
                    this._containers.get(8 /* CONTROL */).filters = [
                        this._makeShadow(8.0)
                    ];
                }
                _makeShadow(size) {
                    return (new filter.DropShadowFilter({
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
                    showContainer(0 /* BACK */, !this.schematicView);
                    showContainer(1 /* MID */, !this.schematicView);
                    showContainer(2 /* FRONT */, !this.schematicView);
                    showContainer(3 /* SCHEMATIC_BACK */, this.schematicView && (this.partSize >= 12));
                    showContainer(4 /* SCHEMATIC */, this.schematicView);
                    showContainer(6 /* SCHEMATIC_4 */, this.schematicView && (this.partSize == 4));
                    showContainer(5 /* SCHEMATIC_2 */, this.schematicView && (this.partSize == 2));
                    let showControls = false;
                    for (const control of this._controls) {
                        if (control.visible) {
                            showControls = true;
                            break;
                        }
                    }
                    showContainer(8 /* CONTROL */, showControls);
                    renderer_5.Renderer.needsUpdate();
                }
                // controls
                _makeControls() {
                    this._ballCounter = new controls_1.BallCounter();
                    this._controls.push(this._ballCounter);
                    this._dropButton = new controls_1.DropButton(this.partFactory.textures);
                    this._controls.push(this._dropButton);
                    this._turnButton = new controls_1.TurnButton(this.partFactory.textures);
                    this._controls.push(this._turnButton);
                    this._colorWheel = new controls_1.ColorWheel(this.partFactory.textures);
                    this._controls.push(this._colorWheel);
                    this._resizeOverlay = new PIXI.Sprite();
                    this._resizeOverlayGraphics = new PIXI.Graphics();
                    this._resizeOverlay.addChild(this._resizeOverlayGraphics);
                    this._controls.push(this._resizeOverlay);
                    const container = this._containers.get(8 /* CONTROL */);
                    for (const control of this._controls) {
                        control.visible = false;
                        container.addChild(control);
                    }
                }
                _showControl(control) {
                    if (!control.visible)
                        control.alpha = 0.0;
                    control.visible = true;
                    animator_3.Animator.current.animate(control, 'alpha', 0, 1, 0.1 /* SHOW_CONTROL */);
                    this._updateLayerVisibility();
                }
                _hideControl(control) {
                    animator_3.Animator.current.animate(control, 'alpha', 1, 0, 0.25 /* HIDE_CONTROL */, () => {
                        control.visible = false;
                        this._updateLayerVisibility();
                    });
                }
                _updateResizeOverlay(active, side, delta) {
                    const x0 = this.xForColumn(-1 - (side == 0 /* LEFT */ ? delta : 0));
                    const y0 = this.yForRow(-1 - (side == 1 /* TOP */ ? delta : 0));
                    const x1 = this.xForColumn(this.columnCount + (side == 2 /* RIGHT */ ? delta : 0));
                    const y1 = this.yForRow(this.rowCount + (side == 3 /* BOTTOM */ ? delta : 0));
                    const g = this._resizeOverlayGraphics;
                    g.clear();
                    g.lineStyle(2, active ? 16755200 /* HIGHLIGHT */ : 8421504 /* RESIZE_HINT */, 0.75);
                    if (active)
                        g.beginFill(16755200 /* HIGHLIGHT */, 0.25);
                    g.drawRect(x0, y0, x1 - x0, y1 - y0);
                    if (active)
                        g.endFill();
                    renderer_5.Renderer.needsUpdate();
                }
                // LAYOUT *******************************************************************
                // change the size to draw parts at
                get partSize() { return (this._partSize); }
                set partSize(v) {
                    if ((isNaN(v)) || (v == null))
                        return;
                    v = Math.min(Math.max(config_3.Zooms[0], v), config_3.Zooms[config_3.Zooms.length - 1]);
                    if (v === this._partSize)
                        return;
                    this._partSize = v;
                    this.layoutParts();
                    this._updateDropShadows();
                    this._updateLayerVisibility();
                    this._updatePan();
                    this.physicalRouter.onBoardSizeChanged();
                    this.schematicRouter.onBoardSizeChanged();
                    this.onUIChange();
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
                    if ((isNaN(v)) || (v == null))
                        return;
                    v = Math.min(Math.max(0, v), this.columnCount - 1);
                    if (v === this.centerColumn)
                        return;
                    this._centerColumn = v;
                    this._updatePan();
                    this._spriteChangeCounter++;
                    this.onUIChange();
                }
                get centerRow() { return (this._centerRow); }
                set centerRow(v) {
                    if ((isNaN(v)) || (v == null))
                        return;
                    v = Math.min(Math.max(0, v), this.rowCount - 1);
                    if (v === this.centerRow)
                        return;
                    this._centerRow = v;
                    this._updatePan();
                    this._spriteChangeCounter++;
                    this.onUIChange();
                }
                _updatePan() {
                    this._layers.x =
                        Math.round((this.width / 2) - this.xForColumn(this.centerColumn));
                    this._layers.y =
                        Math.round((this.height / 2) - this.yForRow(this.centerRow));
                    this._updateFilterAreas();
                    this._spriteChangeCounter++;
                    renderer_5.Renderer.needsUpdate();
                }
                // do layout for one part at the given location
                layoutPart(part, column, row) {
                    if (!part)
                        return;
                    part.size = this.partSize;
                    part.column = column;
                    part.row = row;
                    part.x = this.xForColumn(column);
                    part.y = this.yForRow(row);
                    this._spriteChangeCounter++;
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
                    for (const ball of this.balls) {
                        this.layoutPart(ball, ball.column, ball.row);
                    }
                }
                // get the spacing between part centers
                get spacing() { return (Math.floor(this.partSize * SPACING_FACTOR)); }
                // get the size of controls overlayed on the parts
                get controlSize() {
                    return (Math.min(Math.max(16, Math.ceil(this.partSize * 0.75)), 32));
                }
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
                // suspend expensive operations when updating parts in bulk
                get bulkUpdate() { return (this._bulkUpdate); }
                set bulkUpdate(v) {
                    if (v === this._bulkUpdate)
                        return;
                    this._bulkUpdate = v;
                    // when finishing a bulk update, execute deferred tasks
                    if (!v) {
                        this._connectSlopes();
                        this._connectTurnstiles();
                        this._connectGears();
                        // average gear rotations in connected sets
                        for (const row of this._grid) {
                            for (const part of row) {
                                if (part instanceof gearbit_4.GearBase) {
                                    part.rotation = part.rotation >= 0.5 ? 1.0 : 0.0;
                                }
                            }
                        }
                    }
                }
                sizeRight(delta, addBackground = true) {
                    delta = Math.max(-this.columnCount, delta);
                    if (delta == 0)
                        return;
                    const oldBulkUpdate = this.bulkUpdate;
                    this.bulkUpdate = true;
                    const newColumnCount = this.columnCount + delta;
                    let c, r;
                    if (delta < 0) {
                        r = 0;
                        for (const row of this._grid) {
                            for (c = newColumnCount; c < this.columnCount; c++) {
                                this.setPart(null, c, r);
                            }
                            row.splice(newColumnCount, -delta);
                            r++;
                        }
                    }
                    else {
                        r = 0;
                        for (const row of this._grid) {
                            for (c = this.columnCount; c < newColumnCount; c++) {
                                if (addBackground) {
                                    row.push(this.makeBackgroundPart(c, r));
                                }
                                else
                                    row.push(null);
                            }
                            r++;
                        }
                    }
                    this._columnCount = newColumnCount;
                    this.bulkUpdate = oldBulkUpdate;
                    this.layoutParts();
                    this.physicalRouter.onBoardSizeChanged();
                    this.schematicRouter.onBoardSizeChanged();
                    this.onChange();
                }
                sizeBottom(delta, addBackground = true) {
                    delta = Math.max(-this.rowCount, delta);
                    if (delta == 0)
                        return;
                    const oldBulkUpdate = this.bulkUpdate;
                    this.bulkUpdate = true;
                    const newRowCount = this.rowCount + delta;
                    let c, r;
                    if (delta < 0) {
                        for (r = newRowCount; r < this.rowCount; r++) {
                            for (c = 0; c < this.columnCount; c++) {
                                this.setPart(null, c, r);
                            }
                        }
                        this._grid.splice(newRowCount, -delta);
                    }
                    else {
                        for (r = this.rowCount; r < newRowCount; r++) {
                            const row = [];
                            for (c = 0; c < this.columnCount; c++) {
                                if (addBackground) {
                                    row.push(this.makeBackgroundPart(c, r));
                                }
                                else
                                    row.push(null);
                            }
                            this._grid.push(row);
                        }
                    }
                    this._rowCount = newRowCount;
                    this.bulkUpdate = oldBulkUpdate;
                    this.layoutParts();
                    this.physicalRouter.onBoardSizeChanged();
                    this.schematicRouter.onBoardSizeChanged();
                    this.onChange();
                }
                sizeLeft(delta, addBackground = true) {
                    // we must increase/decrease by even numbers to keep part/gear locations
                    //  on the same diagonals
                    if (delta % 2 !== 0)
                        delta += 1;
                    delta = Math.max(-this.columnCount, delta);
                    if (delta == 0)
                        return;
                    const oldBulkUpdate = this.bulkUpdate;
                    this.bulkUpdate = true;
                    const newColumnCount = this.columnCount + delta;
                    let c, r;
                    if (delta < 0) {
                        r = 0;
                        for (const row of this._grid) {
                            for (c = 0; c < Math.abs(delta); c++) {
                                this.setPart(null, c, r);
                            }
                            row.splice(0, Math.abs(delta));
                            r++;
                        }
                    }
                    else {
                        r = 0;
                        for (const row of this._grid) {
                            for (c = delta - 1; c >= 0; c--) {
                                if (addBackground) {
                                    row.unshift(this.makeBackgroundPart(c, r));
                                }
                                else
                                    row.unshift(null);
                            }
                            r++;
                        }
                    }
                    this._columnCount = newColumnCount;
                    this.centerColumn += delta;
                    this.bulkUpdate = oldBulkUpdate;
                    this.layoutParts();
                    this.physicalRouter.onBoardSizeChanged();
                    this.schematicRouter.onBoardSizeChanged();
                    this.onChange();
                }
                sizeTop(delta, addBackground = true) {
                    // we must increase/decrease by even numbers to keep part/gear locations
                    //  on the same diagonals
                    if (delta % 2 !== 0)
                        delta += 1;
                    delta = Math.max(-this.rowCount, delta);
                    if (delta == 0)
                        return;
                    const oldBulkUpdate = this.bulkUpdate;
                    this.bulkUpdate = true;
                    const newRowCount = this.rowCount + delta;
                    let c, r, part;
                    if (delta < 0) {
                        for (r = 0; r < Math.abs(delta); r++) {
                            for (c = 0; c < this.columnCount; c++) {
                                this.setPart(null, c, r);
                            }
                        }
                        this._grid.splice(0, Math.abs(delta));
                    }
                    else {
                        for (r = delta - 1; r >= 0; r--) {
                            const row = [];
                            for (c = 0; c < this.columnCount; c++) {
                                if (addBackground) {
                                    part = this.makeBackgroundPart(c, r);
                                    this.layoutPart(part, c, r);
                                    row.push(part);
                                }
                                else
                                    row.push(null);
                            }
                            this._grid.unshift(row);
                        }
                    }
                    this._rowCount = newRowCount;
                    this.centerRow += delta;
                    this.bulkUpdate = oldBulkUpdate;
                    this.layoutParts();
                    this.physicalRouter.onBoardSizeChanged();
                    this.schematicRouter.onBoardSizeChanged();
                    this.onChange();
                }
                // update the part grid
                setSize(columnCount, rowCount, addBackground = true) {
                    this.sizeRight(columnCount - this.columnCount, addBackground);
                    this.sizeBottom(rowCount - this.rowCount, addBackground);
                }
                // remove everything from the board
                clear(addBackground = true) {
                    const oldBulkUpdate = this.bulkUpdate;
                    this.bulkUpdate = true;
                    // remove parts
                    let part;
                    for (let r = 0; r < this.rowCount; r++) {
                        for (let c = 0; c < this.columnCount; c++) {
                            part = addBackground ? this.makeBackgroundPart(c, r) : null;
                            this.setPart(part, c, r);
                        }
                    }
                    // remove balls
                    this.clearBalls();
                    this.bulkUpdate = oldBulkUpdate;
                }
                // remove balls from the board
                clearBalls() {
                    for (const ball of this.balls)
                        this.removeBall(ball);
                }
                // whether a part can be placed at the given row and column
                canPlacePart(type, column, row) {
                    if (type == 9 /* BALL */) {
                        return ((row >= 0.0) && (column >= 0.0) &&
                            (row < this.rowCount) && (column < this.columnCount));
                    }
                    if ((column < 0) || (column >= this._columnCount) ||
                        (row < 0) || (row >= this._rowCount))
                        return (false);
                    const oldPart = this.getPart(column, row);
                    if ((oldPart) && (oldPart.isLocked))
                        return (false);
                    else if ((type == 1 /* PARTLOC */) || (type == 2 /* GEARLOC */) ||
                        (type == 8 /* GEAR */) || (type == 13 /* SLOPE */) ||
                        (type == 12 /* SIDE */))
                        return (true);
                    else
                        return ((row + column) % 2 == 0);
                }
                // whether the part at the given location can be flipped
                canFlipPart(column, row) {
                    const part = this.getPart(column, row);
                    return ((part) && (part.canFlip || part.canRotate) && (!part.isLocked));
                }
                // whether the part at the given location can be dragged
                canDragPart(column, row) {
                    const part = this.getPart(column, row);
                    return ((part) && (part.type !== 2 /* GEARLOC */) &&
                        (part.type !== 1 /* PARTLOC */) &&
                        (part.type !== 0 /* BLANK */) &&
                        (!part.isLocked));
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
                    if (!(v >= 0))
                        return;
                    v = Math.min(Math.max(0 /* MIN */, v), 3 /* MAX */);
                    if (v === this._tool)
                        return;
                    this._tool = v;
                    this.onUIChange();
                }
                // set the part used as a prototype for adding parts
                get partPrototype() { return (this._partPrototype); }
                set partPrototype(p) {
                    if (p === this._partPrototype)
                        return;
                    if (this._partPrototype) {
                        this._partPrototype.alpha = 1.0;
                        this._partPrototype.visible = true;
                    }
                    this._partPrototype = p;
                    if (this._partPrototype) {
                        // clear the part if the prototype is being pulled off the board
                        if (p instanceof ball_4.Ball)
                            this.removeBall(p);
                        else if (this.getPart(p.column, p.row) === p) {
                            this.clearPart(p.column, p.row);
                        }
                        this._partPrototype.alpha = 0.5 /* PREVIEW_ALPHA */;
                        this._partPrototype.visible = false;
                    }
                    this._spriteChangeCounter++;
                    this.onUIChange();
                }
                // get the part at the given coordinates
                getPart(column, row) {
                    if ((isNaN(column)) || (isNaN(row)) ||
                        (column < 0) || (column >= this._columnCount) ||
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
                    this._grid[row][column] = newPart;
                    if (newPart)
                        this.layoutPart(newPart, column, row);
                    // tell gears what kind of location they're on
                    if (newPart instanceof gearbit_4.Gear) {
                        newPart.isOnPartLocation = ((column + row) % 2) == 0;
                    }
                    // update gear connections
                    if ((oldPart instanceof gearbit_4.GearBase) || (newPart instanceof gearbit_4.GearBase)) {
                        // disconnect the old part
                        if (oldPart instanceof gearbit_4.GearBase)
                            oldPart.connected = null;
                        // rebuild connections between gears and gearbits
                        if (!this.bulkUpdate)
                            this._connectGears();
                        // merge the new part's rotation with the connected set
                        if ((newPart instanceof gearbit_4.GearBase) && (newPart.connected)) {
                            let sum = 0.0;
                            for (const part of newPart.connected) {
                                sum += part.rotation;
                            }
                            newPart.rotation = ((sum / newPart.connected.size) >= 0.5) ? 1.0 : 0.0;
                        }
                    }
                    // update fences
                    if ((oldPart instanceof fence_4.Slope) || (newPart instanceof fence_4.Slope)) {
                        if (!this.bulkUpdate)
                            this._connectSlopes();
                    }
                    // maintain our set of drops
                    if ((oldPart instanceof drop_4.Drop) && (oldPart !== this.partPrototype)) {
                        this.drops.delete(oldPart);
                        for (const ball of oldPart.balls) {
                            this.removeBall(ball);
                        }
                    }
                    if (newPart instanceof drop_4.Drop) {
                        this.drops.add(newPart);
                        newPart.onRelease = () => {
                            if ((this._ballCounter.visible) &&
                                (this._ballCounter.drop === newPart))
                                this._ballCounter.update();
                        };
                    }
                    if ((oldPart instanceof drop_4.Drop) || (newPart instanceof drop_4.Drop) ||
                        (oldPart instanceof turnstile_3.Turnstile) || (newPart instanceof turnstile_3.Turnstile)) {
                        if (!this.bulkUpdate)
                            this._connectTurnstiles();
                    }
                    // remove and destroy sprites for the old part to avoid memory leaks
                    if ((oldPart) && (oldPart !== this.partPrototype)) {
                        this._removeSpritesForPart(oldPart);
                        oldPart.destroySprites();
                    }
                    this.onChange();
                }
                // flip the part at the given coordinates
                flipPart(column, row) {
                    const part = this.getPart(column, row);
                    if ((part instanceof fence_4.Slope) || (part instanceof fence_4.Side)) {
                        this._flipFence(column, row);
                    }
                    else if (part)
                        part.flip(0.25 /* FLIP */);
                    this.onChange();
                }
                // clear parts from the given coordinates
                clearPart(column, row) {
                    this.setPart(this.makeBackgroundPart(column, row), column, row);
                }
                // add a ball to the board
                addBall(ball, c, r) {
                    if (!this.balls.has(ball)) {
                        this.balls.add(ball);
                        this.layoutPart(ball, c, r);
                        // assign the ball to a drop if it doesn't have one
                        if (!ball.drop) {
                            let drop = this.catchmentDrop(c, r);
                            if (drop) {
                                ball.released = false;
                            }
                            else {
                                ball.released = true;
                                drop = this.nearestDrop(c, r);
                            }
                            if (drop) {
                                this.drops.add(drop);
                                drop.balls.add(ball);
                                ball.drop = drop;
                                ball.hue = drop.hue;
                            }
                        }
                        // update the ball counter
                        if (this._ballCounter.visible)
                            this._ballCounter.update();
                        this.onChange();
                    }
                    this._spriteChangeCounter++;
                }
                // remove a ball from the board
                removeBall(ball) {
                    if (this.balls.has(ball)) {
                        if (ball.drop)
                            ball.drop.balls.delete(ball);
                        this.balls.delete(ball);
                        // update the ball counter
                        if (this._ballCounter.visible)
                            this._ballCounter.update();
                        renderer_5.Renderer.needsUpdate();
                        this.onChange();
                    }
                }
                // add a ball to the given drop without returning all balls to it
                addBallToDrop(drop) {
                    // get the highest ball associated with the drop
                    let topBall;
                    for (const ball of drop.balls) {
                        if ((!topBall) || (ball.row < topBall.row)) {
                            topBall = ball;
                        }
                    }
                    // get the fraction of a grid unit a ball's radius takes up
                    const radius = constants_4.BALL_RADIUS / constants_4.SPACING;
                    let c = drop.column;
                    let r = drop.row;
                    // if the highest ball is on or above the drop, add the new ball above it
                    if ((topBall) && (topBall.row <= drop.row + (0.5 - radius))) {
                        c = topBall.column;
                        r = topBall.row - (2 * radius);
                    }
                    this.addBall(this.partFactory.make(9 /* BALL */), c, Math.max(-0.5, r));
                }
                // fill the drop with the given number of balls, adjusting its total count
                setDropBallCount(drop, count = drop.balls.size) {
                    // turn off bulk updating so we can make sure slopes are configured properly
                    const oldBulkUpdate = this.bulkUpdate;
                    this.bulkUpdate = false;
                    // remove all existing balls (we'll create new ones)
                    for (const ball of drop.balls) {
                        this.removeBall(ball);
                    }
                    // dividing each grid square into thirds, make a list of all open locations
                    const spots = [];
                    // find all grid locations that drain into the drop
                    let part, x, y, t;
                    for (let r = drop.row; r >= -1; r--) {
                        for (let c = 0; c < this.columnCount; c++) {
                            if (this.catchmentDrop(c, r) !== drop)
                                continue;
                            // add up to 9 locations for each grid unit
                            part = this.getPart(c, r);
                            t = part ? part.type : 0 /* BLANK */;
                            if ((t == 0 /* BLANK */) || (t == 10 /* DROP */) ||
                                (t == 12 /* SIDE */) || (t == 1 /* PARTLOC */) ||
                                (t == 2 /* GEARLOC */)) {
                                for (x = -1; x <= 1; x++) {
                                    for (y = -1; y <= 1; y++) {
                                        // leave room for the pins on part/gear locations
                                        if ((x == 0) && (y == 0) && (!this.schematic) &&
                                            ((t == 2 /* GEARLOC */) || (t == 1 /* PARTLOC */))) {
                                            continue;
                                        }
                                        spots.push({ c: c + (x / 3), r: r + (y / 3) });
                                    }
                                }
                            }
                            else if (part instanceof fence_4.Slope) {
                                const left = part.sequence / part.modulus;
                                const right = (part.sequence + 1) / part.modulus;
                                const sign = part.isFlipped ? -1 : 1;
                                for (x = -1; x <= 1; x++) {
                                    const bottom = ((right + left) / 2) +
                                        ((x / 3) * sign * (right - left)) - 0.5 - (1 / 6);
                                    for (y = -1; y <= 1; y++) {
                                        if ((y / 3) > bottom)
                                            continue;
                                        spots.push({ c: c + (x / 3), r: r + (y / 3) });
                                    }
                                }
                            }
                        }
                    }
                    // sort all the spots from bottom to top and center to edge
                    spots.sort((a, b) => {
                        if (a.r > b.r)
                            return (-1);
                        if (a.r < b.r)
                            return (1);
                        if (Math.abs(a.c - drop.column) < Math.abs(b.c - drop.column))
                            return (-1);
                        if (Math.abs(a.c - drop.column) > Math.abs(b.c - drop.column))
                            return (1);
                        return (0);
                    });
                    // place balls in the spots
                    for (let i = 0; i < count; i++) {
                        const spot = spots[i % spots.length]; // re-use spots if we run out
                        this.addBall(this.partFactory.make(9 /* BALL */), spot.c, spot.r);
                    }
                    this.bulkUpdate = oldBulkUpdate;
                }
                // return all balls to their appropriate drops
                returnBalls() {
                    for (const drop of this.drops) {
                        this.setDropBallCount(drop);
                    }
                }
                // get the ball under the given point in fractional column/row units
                ballUnder(column, row) {
                    const radius = (constants_4.BALL_RADIUS / constants_4.SPACING) * 1.2;
                    let closest = null;
                    let minDistance = Infinity;
                    for (const ball of this.balls) {
                        const dx = Math.abs(column - ball.column);
                        const dy = Math.abs(row - ball.row);
                        if ((dx > radius) || (dy > radius))
                            continue;
                        const d = Math.sqrt((dx * dx) + (dy * dy));
                        if (d < minDistance) {
                            closest = ball;
                            minDistance = d;
                        }
                    }
                    return (closest);
                }
                // return the drop that would definitely collect a ball dropped at the given
                //  location, or null if it won't definitely reach one
                catchmentDrop(c, r) {
                    c = Math.round(c);
                    r = Math.max(0, Math.round(r));
                    let lc = c; // the last column the ball was in
                    while ((r < this.rowCount) && (c >= 0) && (c < this.columnCount)) {
                        const p = this.getPart(c, r);
                        // don't go off the board
                        if (!p)
                            break;
                        // if we hit a drop we're done
                        if (p instanceof drop_4.Drop)
                            return (p);
                        else if (p.type == 13 /* SLOPE */) {
                            c += p.isFlipped ? -1 : 1;
                        }
                        else if (p.type == 3 /* RAMP */) {
                            c += p.isFlipped ? -1 : 1;
                            r++;
                        }
                        else if (p.type == 4 /* CROSSOVER */) {
                            if (lc < c) {
                                c++;
                                r++;
                            }
                            else if (lc > c) {
                                c--;
                                r++;
                            }
                            else
                                break; // a vertical drop onto a crossover is non-deterministic
                        }
                        else if (p.type == 5 /* INTERCEPTOR */)
                            break;
                        else if ((p.type == 6 /* BIT */) || (p.type == 7 /* GEARBIT */))
                            break;
                        else
                            r++;
                        lc = c;
                    }
                    return (null);
                }
                // return the drop that's closest to the given location
                nearestDrop(c, r) {
                    let nearest = null;
                    let minDistance = Infinity;
                    for (const drop of this.drops) {
                        const d = Math.pow(c - drop.column, 2) + Math.pow(r - drop.row, 2);
                        if (d < minDistance) {
                            minDistance = d;
                            nearest = drop;
                        }
                    }
                    return (nearest);
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
                            if (part instanceof gearbit_4.GearBase)
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
                            if (part instanceof gearbit_4.GearBase) {
                                northLabel = (northPart instanceof gearbit_4.GearBase) ?
                                    northPart._connectionLabel : -1;
                                westLabel = (westPart instanceof gearbit_4.GearBase) ?
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
                // connect turnstiles to their nearest drops
                _connectTurnstiles() {
                    for (const row of this._grid) {
                        for (const part of row) {
                            if (part instanceof turnstile_3.Turnstile) {
                                part.drop = this.nearestDrop(part.column, part.row);
                            }
                        }
                    }
                }
                // configure slope angles by grouping adjacent ones
                _connectSlopes() {
                    let slopes = [];
                    for (const row of this._grid) {
                        for (const part of row) {
                            if (part instanceof fence_4.Slope) {
                                if ((slopes.length > 0) &&
                                    (slopes[0].isFlipped !== part.isFlipped)) {
                                    this._makeSlope(slopes);
                                }
                                slopes.push(part);
                            }
                            else if (slopes.length > 0) {
                                this._makeSlope(slopes);
                            }
                        }
                        if (slopes.length > 0) {
                            this._makeSlope(slopes);
                        }
                    }
                }
                // configure a horizontal run of fence parts
                _makeSlope(slopes) {
                    if (!(slopes.length > 0))
                        return;
                    for (let i = 0; i < slopes.length; i++) {
                        slopes[i].modulus = slopes.length;
                        slopes[i].sequence = slopes[i].isFlipped ?
                            ((slopes.length - 1) - i) : i;
                    }
                    slopes.splice(0, slopes.length);
                }
                // flip a fence part
                _flipFence(column, row) {
                    const part = this.getPart(column, row);
                    if ((!(part instanceof fence_4.Slope)) && (!(part instanceof fence_4.Side)))
                        return;
                    const wasFlipped = part.isFlipped;
                    const type = part.type;
                    part.flip();
                    // make a test function to shorten the code below
                    const shouldContinue = (part) => {
                        if ((part.isFlipped == wasFlipped) && (part.type == type)) {
                            part.flip();
                            return (true);
                        }
                        return (false);
                    };
                    if (part instanceof fence_4.Slope) {
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
                    else if (part instanceof fence_4.Side) {
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
                    this._connectSlopes();
                }
                // return whether all balls appear to be at rest since the last check
                _checkBallMovement() {
                    let atRest = true;
                    let p;
                    for (const ball of this.balls) {
                        if (!this._ballPositions.has(ball)) {
                            atRest = false;
                            this._ballPositions.set(ball, { c: ball.column, r: ball.row });
                        }
                        else {
                            p = this._ballPositions.get(ball);
                            if ((atRest) &&
                                (Math.max(Math.abs(p.c - ball.column), Math.abs(p.r - ball.row)) > 0.05)) {
                                atRest = false;
                            }
                            p.c = ball.column;
                            p.r = ball.row;
                        }
                    }
                    return (atRest);
                }
                // see if any bits or gearbits have changed their rotation states from 
                //  interaction with balls, and notify if so
                _checkBitRotations() {
                    let changed = false;
                    for (const row of this._grid) {
                        for (const part of row) {
                            if (!part)
                                continue;
                            if ((part.type !== 6 /* BIT */) &&
                                (part.type !== 7 /* GEARBIT */))
                                continue;
                            if (this._bitState.get(part) !== part.bitValue) {
                                changed = true;
                                this._bitState.set(part, part.bitValue);
                            }
                        }
                    }
                    if (changed)
                        this.onChange();
                }
                // INTERACTION **************************************************************
                _bindMouseEvents() {
                    this.view.interactive = true;
                    this.view.addListener('mousedown', this._onMouseDown.bind(this));
                    this.view.addListener('mousemove', this._onMouseMove.bind(this));
                    this.view.addListener('mouseup', this._onMouseUp.bind(this));
                    this.view.addListener('click', this._onClick.bind(this));
                }
                _bindKeyEvents() {
                    const ctrl = keyboard_1.makeKeyHandler('Control');
                    ctrl.press = () => {
                        this._controlKeyDown = true;
                        if (!this._dragging)
                            this._updateAction();
                    };
                    ctrl.release = () => {
                        this._controlKeyDown = false;
                        if (!this._dragging)
                            this._updateAction();
                    };
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
                    this._isMouseDown = false;
                    if (this._dragging) {
                        this._dragging = false;
                        this._onDragFinish();
                        // don't trigger a click
                        e.stopPropagation();
                    }
                    this._updateAction(e);
                }
                _onDragStart(x, y) {
                    this._panStartColumn = this.centerColumn;
                    this._panStartRow = this.centerRow;
                    if ((this._action === 4 /* FLIP_PART */) &&
                        (this.canDragPart(this._actionColumn, this._actionRow))) {
                        this._action = 5 /* DRAG_PART */;
                    }
                    if ((this._action === 5 /* DRAG_PART */) && (this._actionPart)) {
                        this.partPrototype = this._actionPart;
                        this._action = 5 /* DRAG_PART */;
                        this._partDragStartColumn = this._actionColumn;
                        this._partDragStartRow = this._actionRow;
                        this.view.cursor = 'grabbing';
                    }
                    if ((this._action === 7 /* DROP_BALL */) &&
                        (this._actionPart instanceof drop_4.Drop)) {
                        this._colorWheel.x = this._actionPart.x;
                        this._colorWheel.y = this._actionPart.y;
                        this._colorWheel.hue = this._actionPart.hue;
                        this._actionHue = this._actionPart.hue;
                        this._showControl(this._colorWheel);
                        this._colorWheel.size = this.controlSize;
                        animator_3.Animator.current.animate(this._colorWheel, 'size', this.controlSize, 64, 0.1 /* SHOW_CONTROL */);
                        this._action = 6 /* COLOR_WHEEL */;
                        this.view.cursor = 'grabbing';
                    }
                    if (this.view.cursor === 'grab')
                        this.view.cursor = 'grabbing';
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
                            if ((!(oldPart.hasSameStateAs(this.partPrototype))) &&
                                (!((oldPart.type == 7 /* GEARBIT */) &&
                                    (this.partPrototype.type == 8 /* GEAR */)))) {
                                this.setPart(this.partFactory.copy(this.partPrototype), column, row);
                            }
                        }
                    }
                    else if (this._action === 3 /* CLEAR_PART */) {
                        if (!this.isBackgroundPart(column, row)) {
                            // don't clear locked parts when dragging, as it's less likely
                            //  to be intentional than with a click
                            const oldPart = this.getPart(column, row);
                            if (!oldPart.isLocked)
                                this.clearPart(column, row);
                        }
                    }
                    else if (this._action === 4 /* FLIP_PART */) {
                        const part = this.getPart(column, row);
                        if ((part) && (!part.isLocked) &&
                            (!this._dragFlippedParts.has(part))) {
                            this.flipPart(column, row);
                            this._dragFlippedParts.add(part);
                        }
                    }
                    else if (this._action === 5 /* DRAG_PART */) {
                        this._actionX += currentX - lastX;
                        this._actionY += currentY - lastY;
                        this._actionColumn = Math.round(this.columnForX(this._actionX));
                        this._actionRow = Math.round(this.rowForY(this._actionY));
                        this._updatePreview();
                    }
                    else if (this._action === 6 /* COLOR_WHEEL */) {
                        const dx = Math.abs(currentX - startX);
                        const dy = Math.abs(currentY - startY);
                        const r = Math.sqrt((dx * dx) + (dy * dy));
                        const f = Math.min(r / 20, 1.0);
                        const radians = Math.atan2(currentY - startY, currentX - startX);
                        this._colorWheel.hue = this._actionHue +
                            (f * (((radians * 180) / Math.PI) - 90));
                        if (this._actionPart instanceof drop_4.Drop) {
                            this._actionPart.hue = this._colorWheel.hue;
                        }
                    }
                    else if (this._action === 9 /* RESIZE_BOARD */) {
                        let delta = 0;
                        if (this._actionSide == 0 /* LEFT */) {
                            delta = Math.round(this.columnForX(startX - currentX));
                            if (delta % 2 != 0)
                                delta += 1;
                            delta = Math.max(delta, (-this.columnCount) + 2);
                        }
                        else if (this._actionSide == 1 /* TOP */) {
                            delta = Math.round(this.rowForY(startY - currentY));
                            if (delta % 2 != 0)
                                delta += 1;
                            delta = Math.max(delta, (-this.rowCount + 2));
                        }
                        else if (this._actionSide == 2 /* RIGHT */) {
                            delta = Math.round(this.columnForX(currentX - startX));
                            delta = Math.max(delta, (-this.columnCount) + 2);
                        }
                        else if (this._actionSide == 3 /* BOTTOM */) {
                            delta = Math.round(this.rowForY(currentY - startY));
                            delta = Math.max(delta, (-this.rowCount) + 2);
                        }
                        this._actionResizeDelta = delta;
                        this._updateResizeOverlay(true, this._actionSide, delta);
                    }
                }
                _onDragFinish() {
                    this._dragFlippedParts.clear();
                    if ((this._action === 5 /* DRAG_PART */) && (this.partPrototype)) {
                        // don't copy drops since we want to keep their associations
                        const part = this.partPrototype instanceof drop_4.Drop ? this.partPrototype :
                            this.partFactory.copy(this.partPrototype);
                        this.partPrototype = null;
                        if (part instanceof ball_4.Ball) {
                            this.addBall(part, this.columnForX(this._actionX), this.rowForY(this._actionY));
                        }
                        else if (this.canPlacePart(part.type, this._actionColumn, this._actionRow)) {
                            this.setPart(part, this._actionColumn, this._actionRow);
                        }
                        else {
                            this.setPart(part, this._partDragStartColumn, this._partDragStartRow);
                        }
                    }
                    if (this._action === 6 /* COLOR_WHEEL */) {
                        animator_3.Animator.current.animate(this._colorWheel, 'size', 64, this.controlSize, 0.25 /* HIDE_CONTROL */);
                        this._hideControl(this._colorWheel);
                    }
                    if (this._action === 9 /* RESIZE_BOARD */) {
                        if (this._actionSide == 0 /* LEFT */)
                            this.sizeLeft(this._actionResizeDelta, true);
                        if (this._actionSide == 1 /* TOP */)
                            this.sizeTop(this._actionResizeDelta, true);
                        if (this._actionSide == 2 /* RIGHT */)
                            this.sizeRight(this._actionResizeDelta, true);
                        if (this._actionSide == 3 /* BOTTOM */)
                            this.sizeBottom(this._actionResizeDelta, true);
                        this._updateResizeOverlay(false, this._actionSide, 0);
                    }
                }
                _updateAction(e) {
                    let cursor = 'auto';
                    let c, r, column, row;
                    if (e) {
                        const p = e.data.getLocalPosition(this._layers);
                        this._actionX = p.x;
                        this._actionY = p.y;
                        c = this.columnForX(p.x);
                        r = this.rowForY(p.y);
                        column = this._actionColumn = Math.round(c);
                        row = this._actionRow = Math.round(r);
                    }
                    else {
                        c = this.columnForX(this._actionX);
                        r = this.rowForY(this._actionY);
                        column = this._actionColumn;
                        row = this._actionRow;
                    }
                    const oldActionPart = this._actionPart;
                    this._actionPart = this.getPart(column, row);
                    let ball;
                    if (this._controlKeyDown) {
                        this._action = 0 /* PAN */;
                        cursor = 'all-scroll';
                    }
                    else if ((this.tool == 1 /* PART */) && (this.partPrototype) &&
                        ((this.canPlacePart(this.partPrototype.type, column, row)) ||
                            ((row == -1) && (column >= 0) && (column < this.columnCount)))) {
                        this._action = this.partPrototype.type == 9 /* BALL */ ?
                            2 /* PLACE_BALL */ : 1 /* PLACE_PART */;
                        cursor = 'pointer';
                    }
                    else if (this.tool == 2 /* ERASER */) {
                        this._action = 3 /* CLEAR_PART */;
                        cursor = 'pointer';
                    }
                    else if ((this.tool == 3 /* HAND */) &&
                        (this._actionPart instanceof drop_4.Drop) &&
                        (Math.abs(this._actionX - this._actionPart.x) <= this.controlSize / 2) &&
                        (Math.abs(this._actionY - this._actionPart.y) <= this.controlSize / 2)) {
                        this._action = 7 /* DROP_BALL */;
                        cursor = 'pointer';
                    }
                    else if ((this.tool == 3 /* HAND */) &&
                        (this._actionPart instanceof turnstile_3.Turnstile) &&
                        (Math.abs(this._actionX - this._actionPart.x) <= this.controlSize / 2) &&
                        (Math.abs(this._actionY - this._actionPart.y) <= this.controlSize / 2)) {
                        this._action = 8 /* TURN_TURNSTILE */;
                        cursor = 'pointer';
                    }
                    else if ((this.tool == 3 /* HAND */) &&
                        (ball = this.ballUnder(c, r))) {
                        this._action = 5 /* DRAG_PART */;
                        this._actionPart = ball;
                        cursor = 'grab';
                    }
                    else if ((this.tool == 3 /* HAND */) &&
                        (this.canFlipPart(column, row))) {
                        this._action = 4 /* FLIP_PART */;
                        cursor = 'pointer';
                    }
                    else if ((this.tool == 3 /* HAND */) &&
                        (this.canDragPart(column, row))) {
                        this._action = 5 /* DRAG_PART */;
                        cursor = 'grab';
                    }
                    else if ((this.tool == 3 /* HAND */) &&
                        (this._actionRow >= 0) && (this._actionRow < this.rowCount) &&
                        ((Math.abs(this._actionX - this.xForColumn(-1)) < 16 /* RESIZE_THRESHOLD */) ||
                            (Math.abs(this._actionX - this.xForColumn(this.columnCount)) < 16 /* RESIZE_THRESHOLD */))) {
                        this._action = 9 /* RESIZE_BOARD */;
                        this._actionSide = this._actionColumn < (this.columnCount / 2) ?
                            0 /* LEFT */ : 2 /* RIGHT */;
                        this._actionResizeDelta = 0;
                        cursor = 'ew-resize';
                    }
                    else if ((this.tool == 3 /* HAND */) &&
                        (this._actionColumn >= 0) && (this._actionColumn < this.columnCount) &&
                        ((Math.abs(this._actionY - this.yForRow(-1)) < 16 /* RESIZE_THRESHOLD */) ||
                            (Math.abs(this._actionY - this.yForRow(this.rowCount)) < 16 /* RESIZE_THRESHOLD */))) {
                        this._action = 9 /* RESIZE_BOARD */;
                        this._actionSide = this._actionRow < (this.rowCount / 2) ?
                            1 /* TOP */ : 3 /* BOTTOM */;
                        this._actionResizeDelta = 0;
                        cursor = 'ns-resize';
                    }
                    else {
                        this._action = 0 /* PAN */;
                        this._actionPart = null;
                        cursor = 'auto';
                    }
                    this.view.cursor = cursor;
                    // respond to the part under the cursor changing
                    if (this._actionPart !== oldActionPart) {
                        // show/hide drop controls
                        if ((this._actionPart instanceof drop_4.Drop) &&
                            (this.tool == 3 /* HAND */)) {
                            this._dropButton.x = this._actionPart.x;
                            this._dropButton.y = this._actionPart.y;
                            this._dropButton.size = this.controlSize;
                            this._dropButton.isFlipped = this._actionPart.isFlipped;
                            this._showControl(this._dropButton);
                        }
                        else if (oldActionPart instanceof drop_4.Drop) {
                            this._hideControl(this._dropButton);
                            this._hideControl(this._colorWheel);
                        }
                        // show/hide turnstile controls
                        if ((this._actionPart instanceof turnstile_3.Turnstile) &&
                            (this.tool == 3 /* HAND */)) {
                            this._turnButton.x = this.xForColumn(this._actionPart.column);
                            this._turnButton.y = this.yForRow(this._actionPart.row);
                            this._turnButton.isFlipped = this._actionPart.isFlipped;
                            this._turnButton.size = this.controlSize;
                            this._showControl(this._turnButton);
                        }
                        else if (oldActionPart instanceof turnstile_3.Turnstile) {
                            this._hideControl(this._turnButton);
                        }
                        // show hide the ball counter
                        if ((this._action === 2 /* PLACE_BALL */) &&
                            (this._ballCounter.drop = // intentional assignment
                                this.catchmentDrop(this._actionColumn, this._actionRow))) {
                            this._ballCounter.x = this._ballCounter.drop.x;
                            this._ballCounter.y = this._ballCounter.drop.y;
                            this._showControl(this._ballCounter);
                            this._ballCounter.update();
                        }
                        else if (this._ballCounter.visible) {
                            this._hideControl(this._ballCounter);
                        }
                    }
                    this._updatePreview();
                }
                _updatePreview() {
                    if (this.partPrototype) {
                        if (this._action === 1 /* PLACE_PART */) {
                            this.partPrototype.visible = true;
                            this.layoutPart(this.partPrototype, this._actionColumn, this._actionRow);
                        }
                        else if (this._action == 5 /* DRAG_PART */) {
                            this.partPrototype.visible = true;
                            this.layoutPart(this.partPrototype, this.columnForX(this._actionX), this.rowForY(this._actionY));
                        }
                        else if (this._action === 2 /* PLACE_BALL */) {
                            this.partPrototype.visible = true;
                            this.partPrototype.x = Math.round(this._actionX);
                            this.partPrototype.y = Math.round(this._actionY);
                        }
                        else {
                            this.partPrototype.visible = false;
                        }
                    }
                    if (this._action == 9 /* RESIZE_BOARD */) {
                        this._showControl(this._resizeOverlay);
                        this._updateResizeOverlay(false, this._actionSide, 0);
                    }
                    else if (this._resizeOverlay.visible) {
                        this._hideControl(this._resizeOverlay);
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
                    else if ((this._action === 2 /* PLACE_BALL */) &&
                        (this.partPrototype)) {
                        const ball = this.ballUnder(this.columnForX(this._actionX), this.rowForY(this._actionY));
                        if (ball) {
                            this.removeBall(ball);
                        }
                        else {
                            this.addBall(this.partFactory.copy(this.partPrototype), this.columnForX(this._actionX), this.rowForY(this._actionY));
                        }
                    }
                    else if (this._action === 3 /* CLEAR_PART */) {
                        // clearing a background part makes a blank
                        if (this.isBackgroundPart(this._actionColumn, this._actionRow)) {
                            this.setPart(this.partFactory.make(0 /* BLANK */), this._actionColumn, this._actionRow);
                        }
                        else {
                            this.clearPart(this._actionColumn, this._actionRow);
                        }
                    }
                    else if (this._action === 4 /* FLIP_PART */) {
                        this.flipPart(this._actionColumn, this._actionRow);
                    }
                    else if ((this._action === 7 /* DROP_BALL */) &&
                        (this._actionPart instanceof drop_4.Drop)) {
                        this._actionPart.releaseBall();
                    }
                    else if ((this._action === 8 /* TURN_TURNSTILE */) &&
                        (this._actionPart instanceof turnstile_3.Turnstile)) {
                        const ts = this._actionPart;
                        animator_3.Animator.current.animate(ts, 'rotation', 0, 1, 0.25 /* TURN */, () => { ts.rotation = 0.0; });
                    }
                }
            };
            exports_27("Board", Board);
        }
    };
});
System.register("ui/button", ["pixi.js", "ui/config", "renderer"], function (exports_28, context_28) {
    "use strict";
    var __moduleName = context_28 && context_28.id;
    var PIXI, config_4, renderer_6, Button, PartButton, SpriteButton, ButtonBar;
    return {
        setters: [
            function (PIXI_5) {
                PIXI = PIXI_5;
            },
            function (config_4_1) {
                config_4 = config_4_1;
            },
            function (renderer_6_1) {
                renderer_6 = renderer_6_1;
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
                    renderer_6.Renderer.needsUpdate();
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
                    renderer_6.Renderer.needsUpdate();
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
                    renderer_6.Renderer.needsUpdate();
                }
            };
            exports_28("Button", Button);
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
                    const toolSprite = part.getSpriteForLayer(7 /* TOOL */);
                    if (toolSprite)
                        this._normalView.addChild(toolSprite);
                    else {
                        for (let i = 0 /* BACK */; i <= 2 /* FRONT */; i++) {
                            const sprite = part.getSpriteForLayer(i);
                            if (sprite)
                                this._normalView.addChild(sprite);
                        }
                    }
                    this.onSizeChanged();
                }
                get schematic() { return (this._schematic); }
                set schematic(v) {
                    if (v === this._schematic)
                        return;
                    this._schematic = v;
                    if ((v) && (this.part.type <= 9 /* BALL */)) {
                        this.removeChild(this._normalView);
                        this.addChild(this._schematicView);
                    }
                    else {
                        this.addChild(this._normalView);
                        this.removeChild(this._schematicView);
                    }
                    renderer_6.Renderer.needsUpdate();
                }
                onSizeChanged() {
                    super.onSizeChanged();
                    if (this.part)
                        this.part.size = Math.floor(this.size * 0.75);
                }
            };
            exports_28("PartButton", PartButton);
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
            exports_28("SpriteButton", SpriteButton);
            ButtonBar = class ButtonBar extends PIXI.Container {
                constructor() {
                    super();
                    this._background = new PIXI.Graphics();
                    this._buttons = [];
                    this._bottomCount = 0;
                    this._width = 96;
                    this._height = 96;
                    // whether to automatically adjust the width to match the height
                    this.autowidth = true;
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
                    // if the height doesn't allow some buttons to show, make buttons smaller
                    if (this.autowidth) {
                        let safeSize = config_4.ButtonSizes[0];
                        let s;
                        for (s of config_4.ButtonSizes) {
                            if (this._contentHeightForWidth(s + (2 * this.margin)) <= this.height) {
                                safeSize = s;
                            }
                        }
                        this.width = safeSize + (2 * this.margin);
                    }
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
                    renderer_6.Renderer.needsUpdate();
                }
                // get the height taken up by all the buttons at the given width
                _contentHeightForWidth(w) {
                    const m = this.margin;
                    return (m + ((w - m) * this._buttons.length));
                }
            };
            exports_28("ButtonBar", ButtonBar);
        }
    };
});
System.register("ui/toolbar", ["pixi.js", "ui/button", "renderer"], function (exports_29, context_29) {
    "use strict";
    var __moduleName = context_29 && context_29.id;
    var PIXI, button_1, renderer_7, Toolbar;
    return {
        setters: [
            function (PIXI_6) {
                PIXI = PIXI_6;
            },
            function (button_1_1) {
                button_1 = button_1_1;
            },
            function (renderer_7_1) {
                renderer_7 = renderer_7_1;
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
                    for (let i = 3 /* TOOLBOX_MIN */; i <= 13 /* TOOLBOX_MAX */; i++) {
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
                            this._eraserButton.schematic = this.board.schematicView;
                        }
                        else if (button instanceof button_1.PartButton) {
                            button.isToggled = ((this.board.tool === 1 /* PART */) &&
                                (this.board.partPrototype) &&
                                (button.part.type === this.board.partPrototype.type));
                            button.schematic = this.board.schematicView;
                        }
                    }
                    renderer_7.Renderer.needsUpdate();
                }
            };
            exports_29("Toolbar", Toolbar);
        }
    };
});
System.register("board/builder", ["parts/fence"], function (exports_30, context_30) {
    "use strict";
    var __moduleName = context_30 && context_30.id;
    var fence_5, BoardBuilder;
    return {
        setters: [
            function (fence_5_1) {
                fence_5 = fence_5_1;
            }
        ],
        execute: function () {
            BoardBuilder = class BoardBuilder {
                static initStandardBoard(board, redBlueDistance = 5, verticalDrop = 11) {
                    let r, c, run;
                    const width = (redBlueDistance * 2) + 3;
                    const center = Math.floor(width / 2);
                    const blueColumn = center - Math.floor(redBlueDistance / 2);
                    const redColumn = center + Math.floor(redBlueDistance / 2);
                    const dropLevel = (blueColumn % 2 == 0) ? 1 : 2;
                    const collectLevel = dropLevel + verticalDrop;
                    const steps = Math.ceil(center / fence_5.Slope.maxModulus);
                    const maxModulus = Math.ceil(center / steps);
                    const height = collectLevel + steps + 4;
                    board.bulkUpdate = true;
                    board.setSize(width, height, false);
                    board.clear(true);
                    // block out unreachable locations at the top
                    const blank = board.partFactory.make(0 /* BLANK */);
                    blank.isLocked = true;
                    for (r = 0; r < height; r++) {
                        for (c = 0; c < width; c++) {
                            const blueCantReach = ((r + c) < (blueColumn + dropLevel)) ||
                                ((c - r) > (blueColumn - dropLevel));
                            const redCantReach = ((r + c) < (redColumn + dropLevel)) ||
                                ((c - r) > (redColumn - dropLevel));
                            if ((blueCantReach && redCantReach) || (r <= dropLevel)) {
                                board.setPart(board.partFactory.copy(blank), c, r);
                            }
                        }
                    }
                    // add fences on the sides
                    const side = board.partFactory.make(12 /* SIDE */);
                    side.isLocked = true;
                    const flippedSide = board.partFactory.copy(side);
                    flippedSide.flip();
                    for (r = dropLevel - 1; r < collectLevel; r++) {
                        board.setPart(board.partFactory.copy(side), 0, r);
                        board.setPart(board.partFactory.copy(flippedSide), width - 1, r);
                    }
                    // add collection slopes at the bottom
                    const slope = board.partFactory.make(13 /* SLOPE */);
                    slope.isLocked = true;
                    const flippedSlope = board.partFactory.copy(slope);
                    flippedSlope.flip();
                    r = collectLevel;
                    run = 0;
                    for (c = 0; c < center - 1; c++, run++) {
                        if (run >= maxModulus) {
                            r++;
                            run = 0;
                        }
                        board.setPart(board.partFactory.copy(slope), c, r);
                    }
                    r = collectLevel;
                    run = 0;
                    for (c = width - 1; c > center + 1; c--, run++) {
                        if (run >= maxModulus) {
                            r++;
                            run = 0;
                        }
                        board.setPart(board.partFactory.copy(flippedSlope), c, r);
                    }
                    const turnstileLevel = r + 1;
                    // add hoppers for extra balls
                    board.setPart(board.partFactory.copy(slope), blueColumn - 2, dropLevel - 1);
                    board.setPart(board.partFactory.copy(flippedSlope), blueColumn, dropLevel - 1);
                    board.setPart(board.partFactory.copy(slope), redColumn, dropLevel - 1);
                    board.setPart(board.partFactory.copy(flippedSlope), redColumn + 2, dropLevel - 1);
                    // block out the unreachable locations at the bottom
                    for (r = collectLevel; r < height; r++) {
                        for (c = 0; c < width; c++) {
                            const p = board.getPart(c, r);
                            if ((p instanceof fence_5.Side) || (p instanceof fence_5.Slope))
                                break;
                            board.setPart(board.partFactory.copy(blank), c, r);
                        }
                        for (c = width - 1; c >= 0; c--) {
                            const p = board.getPart(c, r);
                            if ((p instanceof fence_5.Side) || (p instanceof fence_5.Slope))
                                break;
                            board.setPart(board.partFactory.copy(blank), c, r);
                        }
                    }
                    // make a fence to collect balls
                    const rightSide = center + fence_5.Slope.maxModulus;
                    for (c = center; c < rightSide; c++) {
                        board.setPart(board.partFactory.copy(slope), c, height - 1);
                        board.setPart(board.partFactory.copy(flippedSlope), c, height - 3);
                    }
                    for (r = height - 3; r <= height - 1; r++) {
                        board.setPart(board.partFactory.copy(side), rightSide, r);
                    }
                    board.setPart(board.partFactory.copy(slope), center - 1, height - 2);
                    board.setPart(board.partFactory.copy(slope), center - 2, height - 3);
                    // make ball drops
                    const blueDrop = board.partFactory.make(10 /* DROP */);
                    board.setPart(blueDrop, blueColumn - 1, dropLevel);
                    blueDrop.hue = 220;
                    blueDrop.isLocked = true;
                    const redDrop = board.partFactory.make(10 /* DROP */);
                    redDrop.isFlipped = true;
                    board.setPart(redDrop, redColumn + 1, dropLevel);
                    redDrop.hue = 0;
                    redDrop.isLocked = true;
                    // add balls
                    board.setDropBallCount(blueDrop, 8);
                    board.setDropBallCount(redDrop, 8);
                    // make turnstiles
                    const blueTurnstile = board.partFactory.make(11 /* TURNSTILE */);
                    blueTurnstile.isLocked = true;
                    board.setPart(blueTurnstile, center - 1, turnstileLevel);
                    const redTurnstile = board.partFactory.make(11 /* TURNSTILE */);
                    redTurnstile.isLocked = true;
                    redTurnstile.isFlipped = true;
                    board.setPart(redTurnstile, center + 1, turnstileLevel);
                    board.bulkUpdate = false;
                }
            };
            exports_30("BoardBuilder", BoardBuilder);
        }
    };
});
System.register("ui/actionbar", ["pixi.js", "board/board", "ui/button", "ui/config", "renderer", "board/serializer", "ui/animator", "board/builder"], function (exports_31, context_31) {
    "use strict";
    var __moduleName = context_31 && context_31.id;
    var PIXI, board_2, button_2, config_5, renderer_8, serializer_1, animator_4, builder_1, Actionbar, BoardDrawer;
    return {
        setters: [
            function (PIXI_7) {
                PIXI = PIXI_7;
            },
            function (board_2_1) {
                board_2 = board_2_1;
            },
            function (button_2_1) {
                button_2 = button_2_1;
            },
            function (config_5_1) {
                config_5 = config_5_1;
            },
            function (renderer_8_1) {
                renderer_8 = renderer_8_1;
            },
            function (serializer_1_1) {
                serializer_1 = serializer_1_1;
            },
            function (animator_4_1) {
                animator_4 = animator_4_1;
            },
            function (builder_1_1) {
                builder_1 = builder_1_1;
            }
        ],
        execute: function () {
            Actionbar = class Actionbar extends button_2.ButtonBar {
                constructor(board) {
                    super();
                    this.board = board;
                    // add the drawer behind the background
                    this._drawer = new BoardDrawer(this.board);
                    this._drawer.peer = this;
                    this.addChildAt(this._drawer, 0);
                    this._drawer.visible = false;
                    // add a button to show and hide extra board operations
                    this._drawerButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['board-drawer']));
                    this.addButton(this._drawerButton);
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
                    // add speed controls
                    this._fasterButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['faster']));
                    this.addButton(this._fasterButton);
                    this._slowerButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['slower']));
                    this.addButton(this._slowerButton);
                    // add a ball return
                    this._returnButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['return']));
                    this.addButton(this._returnButton);
                    // add more top buttons here...
                    // add a link to documentation
                    this._helpButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['help']));
                    this.addButton(this._helpButton);
                    // add a link to the github repo
                    this._githubButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['octocat']));
                    this.addButton(this._githubButton);
                    // add a link to the Turing Tumble website
                    this._heartButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['heart']));
                    this.addButton(this._heartButton);
                    this.bottomCount = 3;
                    this.updateToggled();
                    // zoom on wheel events
                    document.addEventListener('wheel', (e) => {
                        if (e.wheelDelta > 0)
                            this.zoomIn();
                        else if (e.wheelDelta < 0)
                            this.zoomOut();
                        e.preventDefault();
                    });
                }
                onButtonClick(button) {
                    if (button === this._schematicButton) {
                        this.board.schematic = !this.board.schematicView;
                        this.updateToggled();
                        if (this.peer)
                            this.peer.updateToggled();
                    }
                    else if (button === this._zoomInButton) {
                        this.zoomIn();
                        if (this.peer)
                            this.peer.updateToggled();
                    }
                    else if (button === this._zoomOutButton) {
                        this.zoomOut();
                        if (this.peer)
                            this.peer.updateToggled();
                    }
                    else if (button === this._zoomToFitButton) {
                        this.zoomToFit();
                        if (this.peer)
                            this.peer.updateToggled();
                    }
                    else if (button === this._fasterButton) {
                        this.goFaster();
                    }
                    else if (button === this._slowerButton) {
                        this.goSlower();
                    }
                    else if (button === this._returnButton) {
                        this.board.returnBalls();
                    }
                    else if (button === this._drawerButton)
                        this.toggleDrawer();
                    else if (button === this._helpButton) {
                        window.open('usage', '_blank');
                    }
                    else if (button === this._githubButton) {
                        let m = window.location.host.match(new RegExp('^([^.]+)[.]github[.]io'));
                        const user = m ? m[1] : 'jessecrossen';
                        m = window.location.pathname.match(new RegExp('/*([^/?#]+)'));
                        const repo = m ? m[1] : 'ttsim';
                        window.open('https://github.com/' + user + '/' + repo + '/', '_blank');
                    }
                    else if (button === this._heartButton) {
                        window.open('https://www.turingtumble.com/', '_blank');
                    }
                }
                updateToggled() {
                    // update button toggle states
                    for (const button of this._buttons) {
                        if (button === this._schematicButton) {
                            button.isToggled = this.board.schematic;
                        }
                        else if (button === this._zoomInButton) {
                            button.isEnabled = this.canZoomIn;
                        }
                        else if (button === this._zoomOutButton) {
                            button.isEnabled = this.canZoomOut;
                        }
                        else if (button === this._fasterButton) {
                            button.isEnabled = this.canGoFaster;
                        }
                        else if (button === this._slowerButton) {
                            button.isEnabled = this.canGoSlower;
                        }
                        else if (button === this._drawerButton) {
                            button.isToggled = this._drawer.visible;
                        }
                    }
                    renderer_8.Renderer.needsUpdate();
                }
                // SPEED CONTROL ************************************************************
                get canGoFaster() {
                    return (this.speedIndex < config_5.Speeds.length - 1);
                }
                get canGoSlower() {
                    return (this.speedIndex > 0);
                }
                goFaster() {
                    this.speedIndex++;
                }
                goSlower() {
                    this.speedIndex--;
                }
                get speedIndex() {
                    return (config_5.Speeds.indexOf(this.board.speed));
                }
                set speedIndex(i) {
                    if ((i >= 0) && (i < config_5.Speeds.length))
                        this.board.speed = config_5.Speeds[i];
                    this.updateToggled();
                }
                // ZOOMING ******************************************************************
                get canZoomIn() {
                    return (this.zoomIndex < config_5.Zooms.length - 1);
                }
                get canZoomOut() {
                    return (this.zoomIndex > 0);
                }
                zoomIn() {
                    if (!this.canZoomIn)
                        return;
                    this.board.partSize = config_5.Zooms[this.zoomIndex + 1];
                    this.updateToggled();
                }
                zoomOut() {
                    if (!this.canZoomOut)
                        return;
                    this.board.partSize = config_5.Zooms[this.zoomIndex - 1];
                    this.updateToggled();
                }
                // zoom to fit the board
                zoomToFit() {
                    this.board.centerColumn = (this.board.columnCount - 1) / 2;
                    this.board.centerRow = (this.board.rowCount - 1) / 2;
                    let s = config_5.Zooms[0];
                    for (let i = config_5.Zooms.length - 1; i >= 0; i--) {
                        s = config_5.Zooms[i];
                        const w = this.board.columnCount * Math.floor(s * board_2.SPACING_FACTOR);
                        const h = this.board.rowCount * Math.floor(s * board_2.SPACING_FACTOR);
                        if ((w <= this.board.width) && (h <= this.board.height))
                            break;
                    }
                    this.board.partSize = s;
                    this.updateToggled();
                }
                get zoomIndex() {
                    return (config_5.Zooms.indexOf(this.board.partSize));
                }
                // DRAWER *******************************************************************
                _layout() {
                    super._layout();
                    if (this._drawer) {
                        this._drawer.width = this.width;
                        this._drawer.height = this.height;
                        this._drawer.x = this._drawer.visible ? -this.width : 0;
                    }
                }
                toggleDrawer() {
                    if (!this._drawer.visible) {
                        this._drawerButton.scale.x = -Math.abs(this._drawerButton.scale.x);
                        this._drawer.visible = true;
                        this._drawer.x = 0;
                        animator_4.Animator.current.animate(this._drawer, 'x', 0, -this.width, 0.1 /* SHOW_CONTROL */);
                        this.updateToggled();
                    }
                    else {
                        this._drawerButton.scale.x = Math.abs(this._drawerButton.scale.x);
                        animator_4.Animator.current.animate(this._drawer, 'x', -this.width, 0, 0.25 /* HIDE_CONTROL */, () => {
                            this._drawer.visible = false;
                            this.updateToggled();
                        });
                    }
                }
            };
            exports_31("Actionbar", Actionbar);
            BoardDrawer = class BoardDrawer extends button_2.ButtonBar {
                constructor(board) {
                    super();
                    this.board = board;
                    // add standard boards in several sizes
                    this._smallButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['board-small']));
                    this.addButton(this._smallButton);
                    this._mediumButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['board-medium']));
                    this.addButton(this._mediumButton);
                    this._largeButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['board-large']));
                    this.addButton(this._largeButton);
                    // add clear buttons
                    this._clearButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['board-clear']));
                    this.addButton(this._clearButton);
                    this._clearBallsButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['clear-balls']));
                    this.addButton(this._clearBallsButton);
                    // add upload download actions
                    this._downloadButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['download']));
                    this.addButton(this._downloadButton);
                    this._uploadButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['upload']));
                    this.addButton(this._uploadButton);
                }
                onButtonClick(button) {
                    if (button === this._smallButton) {
                        builder_1.BoardBuilder.initStandardBoard(this.board, 5, 11);
                        this.zoomToFit();
                    }
                    else if (button === this._mediumButton) {
                        builder_1.BoardBuilder.initStandardBoard(this.board, 7, 15);
                        this.zoomToFit();
                    }
                    else if (button === this._largeButton) {
                        builder_1.BoardBuilder.initStandardBoard(this.board, 9, 19);
                        this.zoomToFit();
                    }
                    else if (button === this._clearButton) {
                        this.board.clear();
                        this.zoomToFit();
                    }
                    else if (button === this._clearBallsButton) {
                        this.board.clearBalls();
                    }
                    else if (button === this._downloadButton) {
                        if (this.board.serializer instanceof serializer_1.URLBoardSerializer) {
                            this.board.serializer.download();
                        }
                    }
                    else if (button === this._uploadButton) {
                        if (this.board.serializer instanceof serializer_1.URLBoardSerializer) {
                            this.board.serializer.upload((restored) => {
                                if (restored)
                                    this.zoomToFit();
                            });
                        }
                    }
                }
                zoomToFit() {
                    if (this.peer instanceof Actionbar)
                        this.peer.zoomToFit();
                }
                updateToggled() { }
            };
            exports_31("BoardDrawer", BoardDrawer);
        }
    };
});
System.register("app", ["pixi.js", "board/board", "parts/factory", "ui/toolbar", "ui/actionbar", "renderer", "ui/animator", "ui/keyboard", "parts/gearbit"], function (exports_32, context_32) {
    "use strict";
    var __moduleName = context_32 && context_32.id;
    var PIXI, board_3, factory_2, toolbar_1, actionbar_1, renderer_9, animator_5, keyboard_2, gearbit_5, SimulatorApp;
    return {
        setters: [
            function (PIXI_8) {
                PIXI = PIXI_8;
            },
            function (board_3_1) {
                board_3 = board_3_1;
            },
            function (factory_2_1) {
                factory_2 = factory_2_1;
            },
            function (toolbar_1_1) {
                toolbar_1 = toolbar_1_1;
            },
            function (actionbar_1_1) {
                actionbar_1 = actionbar_1_1;
            },
            function (renderer_9_1) {
                renderer_9 = renderer_9_1;
            },
            function (animator_5_1) {
                animator_5 = animator_5_1;
            },
            function (keyboard_2_1) {
                keyboard_2 = keyboard_2_1;
            },
            function (gearbit_5_1) {
                gearbit_5 = gearbit_5_1;
            }
        ],
        execute: function () {
            SimulatorApp = class SimulatorApp extends PIXI.Container {
                constructor(textures) {
                    super();
                    this.textures = textures;
                    this._width = 0;
                    this._height = 0;
                    this.partFactory = new factory_2.PartFactory(textures);
                    this.board = new board_3.Board(this.partFactory);
                    this.toolbar = new toolbar_1.Toolbar(this.board);
                    this.actionbar = new actionbar_1.Actionbar(this.board);
                    this.actionbar.peer = this.toolbar;
                    this.toolbar.peer = this.actionbar;
                    this.addChild(this.board.view);
                    this.addChild(this.toolbar);
                    this.addChild(this.actionbar);
                    this._layout();
                    // add event listeners
                    this._addKeyHandlers();
                }
                update(delta) {
                    animator_5.Animator.current.update(delta);
                    this.board.update(delta);
                    gearbit_5.GearBase.update();
                    renderer_9.Renderer.render();
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
                    renderer_9.Renderer.needsUpdate();
                }
                _addKeyHandlers() {
                    keyboard_2.makeKeyHandler('w').press = () => {
                        this.board.physicalRouter.showWireframe =
                            !this.board.physicalRouter.showWireframe;
                    };
                }
            };
            exports_32("SimulatorApp", SimulatorApp);
        }
    };
});
System.register("index", ["pixi.js", "app", "renderer", "board/builder", "board/serializer"], function (exports_33, context_33) {
    "use strict";
    var __moduleName = context_33 && context_33.id;
    var PIXI, app_1, renderer_10, builder_2, serializer_2, sim, container, resizeApp, loader;
    return {
        setters: [
            function (PIXI_9) {
                PIXI = PIXI_9;
            },
            function (app_1_1) {
                app_1 = app_1_1;
            },
            function (renderer_10_1) {
                renderer_10 = renderer_10_1;
            },
            function (builder_2_1) {
                builder_2 = builder_2_1;
            },
            function (serializer_2_1) {
                serializer_2 = serializer_2_1;
            }
        ],
        execute: function () {
            // dynamically resize the app to track the size of the browser window
            container = document.getElementById('container');
            container.style.overflow = 'hidden';
            resizeApp = () => {
                const r = container.getBoundingClientRect();
                renderer_10.Renderer.instance.resize(r.width, r.height);
                if (sim) {
                    sim.width = r.width;
                    sim.height = r.height;
                }
            };
            resizeApp();
            window.addEventListener('resize', resizeApp);
            // load sprites
            loader = PIXI.loader;
            loader.add('images/parts.json').load(() => {
                sim = new app_1.SimulatorApp(PIXI.loader.resources["images/parts.json"].textures);
                // restore state if there is any
                sim.board.serializer = new serializer_2.URLBoardSerializer(sim.board);
                sim.board.serializer.restore((restored) => {
                    // update toolbars based on restored state
                    sim.toolbar.updateToggled();
                    sim.actionbar.updateToggled();
                    sim.width = renderer_10.Renderer.instance.width;
                    sim.height = renderer_10.Renderer.instance.height;
                    renderer_10.Renderer.stage.addChild(sim);
                    // set up the standard board if there was no state
                    if (!restored) {
                        builder_2.BoardBuilder.initStandardBoard(sim.board);
                        sim.actionbar.zoomToFit();
                    }
                    // remove the loading animation
                    const loading = document.getElementById('loading');
                    if (loading) {
                        loading.style.opacity = '0';
                        // clear it from the display list after the animation,
                        //  in case the browser still renders it at zero opacity
                        setTimeout(() => loading.style.display = 'none', 1000);
                    }
                    // attach the stage to the document and fade it in
                    container.appendChild(renderer_10.Renderer.instance.view);
                    container.style.opacity = '1';
                    // start the game loop
                    PIXI.ticker.shared.add(sim.update, sim);
                });
            });
        }
    };
});
