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
                get bodyRestitution() { return (0.05); }
                // return ramps to zero (simulating counterweight)
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
                _angleForRotation(r, layer) {
                    // gears on a regular-part location need to be rotated by 1/16 turn 
                    //  to mesh with neighbors
                    if (this.isOnPartLocation) {
                        if (layer == 4 /* SCHEMATIC */) {
                            return (super._angleForRotation(r, layer));
                        }
                        else {
                            return (super._angleForRotation(r, layer) + (Math.PI * 0.125));
                        }
                    }
                    else {
                        return (-super._angleForRotation(r, layer));
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
                get type() { return (11 /* FENCE */); }
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
                get type() { return (10 /* DROP */); }
            };
            exports_9("Drop", Drop);
        }
    };
});
System.register("board/constants", [], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    var PART_SIZE, SPACING;
    return {
        setters: [],
        execute: function () {
            // the canonical part size the simulator runs at
            exports_10("PART_SIZE", PART_SIZE = 64);
            exports_10("SPACING", SPACING = 68);
        }
    };
});
System.register("parts/ball", ["matter-js", "parts/part", "board/constants"], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    var matter_js_1, part_10, constants_1, Ball;
    return {
        setters: [
            function (matter_js_1_1) {
                matter_js_1 = matter_js_1_1;
            },
            function (part_10_1) {
                part_10 = part_10_1;
            },
            function (constants_1_1) {
                constants_1 = constants_1_1;
            }
        ],
        execute: function () {
            Ball = class Ball extends part_10.Part {
                constructor() {
                    super(...arguments);
                    this._color = 0x0E63FF;
                }
                get canRotate() { return (false); }
                get canMirror() { return (false); }
                get canFlip() { return (false); }
                get type() { return (9 /* BALL */); }
                // the color of the ball
                get color() { return (this._color); }
                set color(v) {
                    if (v === this.color)
                        return;
                    this._color = v;
                    this._updateSprites();
                }
                // update the given sprite to track the part's state
                _updateSprite(layer) {
                    super._updateSprite(layer);
                    // we use the front layer for a specular highlight, so don't tint it
                    if (layer !== 2 /* FRONT */) {
                        const sprite = this.getSpriteForLayer(layer);
                        if (!sprite)
                            return;
                        sprite.tint = this._color;
                    }
                }
                get bodyCanMove() { return (true); }
                getBody() {
                    if (!this._body) {
                        this._body = matter_js_1.Bodies.circle(0, 0, (5 * constants_1.PART_SIZE) / 32, { restitution: this.bodyRestitution,
                            density: .003, friction: 0 });
                        this.initBody();
                        this.writeBody();
                    }
                    return (this._body);
                }
                writeBody() {
                    super.writeBody();
                }
            };
            exports_11("Ball", Ball);
        }
    };
});
System.register("parts/factory", ["parts/location", "parts/ramp", "parts/crossover", "parts/interceptor", "parts/bit", "parts/gearbit", "parts/fence", "parts/blank", "parts/drop", "parts/ball"], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    var location_1, ramp_1, crossover_1, interceptor_1, bit_1, gearbit_1, fence_1, blank_1, drop_1, ball_1, PartFactory;
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
            function (ball_1_1) {
                ball_1 = ball_1_1;
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
                        case 9 /* BALL */: return (new ball_1.Ball(this.textures));
                        case 10 /* DROP */: return (new drop_1.Drop(this.textures));
                        case 11 /* FENCE */: return (new fence_1.Fence(this.textures));
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
            exports_12("PartFactory", PartFactory);
        }
    };
});
System.register("ui/config", [], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [],
        execute: function () {
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
                static start() {
                    PIXI.ticker.shared.add(Renderer.render, Renderer, PIXI.UPDATE_PRIORITY.INTERACTION);
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
            exports_14("Renderer", Renderer);
        }
    };
});
// WARNING: this file is autogenerated from src/svg/parts.svg
//  (any changes you make will be overwritten)
System.register("parts/bodies", [], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    function getVertexSets(name) {
        switch (name) {
            case 'Bit':
                return ([[{ x: -31.902757, y: -34.167318 }, { x: -1.055229, y: -32.311155 }, { x: 0.889319, y: -31.073699 }, { x: 1.066087, y: -29.217536 }, { x: 0.270595, y: -27.714947 }, { x: -28.278844, y: 0.569336 }, { x: -29.869833, y: 1.099641 }, { x: -31.284045, y: 0.569336 }, { x: -32.256313, y: -0.579716 }, { x: -34.554409, y: -31.692408 }, { x: -33.847309, y: -33.283400 }, { x: -32.875029, y: -34.078915 }], [{ x: -18.644511, y: -8.976617 }, { x: -0.082950, y: 12.855295 }, { x: 11.053980, y: 14.888227 }, { x: 13.528849, y: 14.181153 }, { x: 14.854680, y: 11.971414 }, { x: 13.175300, y: 0.038993 }, { x: -9.275339, y: -18.699338 }], [{ x: 13.251941, y: 0.139112 }, { x: 16.699082, y: 0.315994 }, { x: 16.610679, y: 6.591597 }, { x: 13.605463, y: 5.884485 }], [{ x: 16.699097, y: 0.139112 }, { x: 19.439138, y: -0.125833 }, { x: 22.002379, y: 6.326539 }, { x: 19.173970, y: 6.679925 }, { x: 16.433926, y: 6.591484 }], [{ x: 19.439115, y: -0.302828 }, { x: 22.621114, y: -1.452031 }, { x: 26.863758, y: 4.204826 }, { x: 22.002379, y: 6.237758 }], [{ x: 22.797868, y: -1.451842 }, { x: 25.714688, y: -4.015155 }, { x: 31.636735, y: -1.982185 }, { x: 29.426996, y: 1.730104 }, { x: 26.686990, y: 4.028208 }], [{ x: 25.714688, y: -4.191886 }, { x: 26.333415, y: -7.108698 }, { x: 32.785787, y: -7.197139 }, { x: 31.636735, y: -1.893858 }], [{ x: 26.420847, y: -7.162746 }, { x: 27.625371, y: -30.038638 }, { x: 27.844206, y: -31.163652 }, { x: 28.781680, y: -32.163640 }, { x: 30.000426, y: -32.538569 }, { x: 31.156697, y: -32.288364 }, { x: 32.156684, y: -31.507136 }, { x: 32.625459, y: -30.163362 }, { x: 32.835185, y: -6.980308 }], [{ x: -0.224629, y: 13.353078 }, { x: -0.021683, y: 16.798782 }, { x: 6.253072, y: 16.662922 }, { x: 5.523253, y: 13.663140 }], [{ x: -0.198560, y: 16.800135 }, { x: -0.442775, y: 19.542101 }, { x: 6.028796, y: 22.056472 }, { x: 6.360782, y: 19.225471 }, { x: 6.251622, y: 16.486174 }], [{ x: -0.619766, y: 19.543417 }, { x: -1.744872, y: 22.734016 }, { x: 3.943909, y: 26.933758 }, { x: 5.940018, y: 22.057144 }], [{ x: -1.743346, y: 22.910763 }, { x: -4.284527, y: 25.846885 }, { x: -2.206829, y: 31.753388 }, { x: 1.488643, y: 29.515638 }, { x: 3.765959, y: 26.758331 }], [{ x: -4.461253, y: 25.848221 }, { x: -7.373303, y: 26.488990 }, { x: -7.412945, y: 32.941846 }, { x: -2.118504, y: 31.752720 }], [{ x: -7.426687, y: 26.576828 }, { x: -30.292816, y: 27.954319 }, { x: -31.416143, y: 28.181656 }, { x: -32.409012, y: 29.126665 }, { x: -32.774714, y: 30.348212 }, { x: -32.515772, y: 31.502558 }, { x: -31.727003, y: 32.496608 }, { x: -30.379723, y: 32.955207 }, { x: -7.195746, y: 32.989603 }]]);
            case 'Crossover':
                return ([[{ x: -2.562501, y: -15.812515 }, { x: -2.562501, y: -45.750000 }, { x: -1.875001, y: -47.312495 }, { x: -0.749998, y: -47.999991 }, { x: 0.687500, y: -48.062353 }, { x: 1.937499, y: -47.187355 }, { x: 2.562500, y: -45.687336 }, { x: 2.562500, y: -15.874839 }], [{ x: -2.499999, y: -15.781258 }, { x: -5.062500, y: -15.250008 }, { x: -8.062500, y: -13.968748 }, { x: -11.281251, y: -11.624987 }, { x: -12.343752, y: -10.374984 }, { x: -12.562511, y: -9.312483 }, { x: -12.250019, y: -8.343753 }, { x: -11.750018, y: -7.625000 }, { x: -3.187518, y: 3.218767 }, { x: -1.093769, y: 4.375000 }, { x: 0.062479, y: 4.500102 }, { x: 2.062480, y: 4.031365 }, { x: 3.749983, y: 2.531346 }, { x: 12.062483, y: -8.031148 }, { x: 12.499982, y: -9.187381 }, { x: 12.156234, y: -10.656143 }, { x: 11.124986, y: -11.718644 }, { x: 9.312483, y: -13.093636 }, { x: 7.812483, y: -14.062404 }, { x: 5.656236, y: -14.968622 }, { x: 3.718734, y: -15.593642 }, { x: 2.468734, y: -15.781107 }], [{ x: -30.930489, y: 31.659824 }, { x: -20.898410, y: 30.422369 }, { x: -10.689558, y: 29.759478 }, { x: -3.927851, y: 29.538376 }, { x: 3.982911, y: 29.449935 }, { x: 12.158830, y: 29.803320 }, { x: 20.113779, y: 30.333626 }, { x: 28.068728, y: 31.261727 }, { x: 30.941358, y: 31.659446 }, { x: 32.178791, y: 32.454961 }, { x: 32.532366, y: 33.515610 }, { x: 32.355597, y: 34.974016 }, { x: 31.736877, y: 35.990482 }, { x: 30.455247, y: 36.565008 }, { x: -30.046601, y: 36.565008 }, { x: -31.814369, y: 35.902117 }, { x: -32.433089, y: 34.753065 }, { x: -32.565675, y: 33.559793 }, { x: -31.814373, y: 32.101386 }], [{ x: -31.968752, y: -35.937516 }, { x: -33.031249, y: -36.593755 }, { x: -34.062500, y: -36.593755 }, { x: -35.062499, y: -36.187494 }, { x: -36.031248, y: -35.343752 }, { x: -38.000001, y: -33.062505 }, { x: -33.843749, y: -29.875002 }, { x: -31.968752, y: -32.031261 }, { x: -31.187501, y: -33.031248 }, { x: -31.062512, y: -34.093749 }, { x: -31.250014, y: -35.031261 }], [{ x: -38.031250, y: -33.062505 }, { x: -33.812500, y: -29.906259 }, { x: -36.718748, y: -25.843758 }, { x: -41.000000, y: -28.843758 }], [{ x: -36.687499, y: -25.906234 }, { x: -39.343751, y: -20.499998 }, { x: -44.156250, y: -22.562486 }, { x: -40.968751, y: -28.875015 }], [{ x: -39.406249, y: -20.468741 }, { x: -41.343748, y: -14.000004 }, { x: -46.437501, y: -14.968735 }, { x: -44.156250, y: -22.593743 }], [{ x: -41.343748, y: -13.937491 }, { x: -42.843748, y: -4.656257 }, { x: -48.093750, y: -4.468792 }, { x: -47.187499, y: -11.093775 }, { x: -46.406252, y: -15.093800 }], [{ x: -42.812499, y: -4.687513 }, { x: -33.375000, y: 6.593734 }, { x: -32.812501, y: 7.812518 }, { x: -33.124992, y: 9.124997 }, { x: -33.749994, y: 9.937482 }, { x: -34.874993, y: 10.593759 }, { x: -36.062494, y: 10.593759 }, { x: -36.968741, y: 10.156241 }, { x: -47.656243, y: -2.531255 }, { x: -48.062493, y: -3.625013 }, { x: -48.031123, y: -4.593743 }], [{ x: 31.840243, y: -35.937516 }, { x: 32.902740, y: -36.593755 }, { x: 33.933992, y: -36.593755 }, { x: 34.933991, y: -36.187494 }, { x: 35.902740, y: -35.343752 }, { x: 37.871492, y: -33.062505 }, { x: 33.715240, y: -29.875002 }, { x: 31.840243, y: -32.031261 }, { x: 31.058992, y: -33.031248 }, { x: 30.934003, y: -34.093749 }, { x: 31.121506, y: -35.031261 }], [{ x: 37.902741, y: -33.062505 }, { x: 33.683991, y: -29.906259 }, { x: 36.590240, y: -25.843758 }, { x: 40.871492, y: -28.843758 }], [{ x: 36.558991, y: -25.906234 }, { x: 39.215243, y: -20.499998 }, { x: 44.027742, y: -22.562486 }, { x: 40.840243, y: -28.875015 }], [{ x: 39.277741, y: -20.468741 }, { x: 41.215240, y: -14.000004 }, { x: 46.308993, y: -14.968735 }, { x: 44.027742, y: -22.593743 }], [{ x: 41.215240, y: -13.937491 }, { x: 42.715240, y: -4.656257 }, { x: 47.965242, y: -4.468792 }, { x: 47.058991, y: -11.093775 }, { x: 46.277743, y: -15.093800 }], [{ x: 42.683991, y: -4.687513 }, { x: 33.246492, y: 6.593734 }, { x: 32.683993, y: 7.812518 }, { x: 32.996484, y: 9.124997 }, { x: 33.621486, y: 9.937482 }, { x: 34.746485, y: 10.593759 }, { x: 35.933986, y: 10.593759 }, { x: 36.840233, y: 10.156241 }, { x: 47.527735, y: -2.531255 }, { x: 47.933985, y: -3.625013 }, { x: 47.902615, y: -4.593743 }]]);
            case 'Gear':
                return ([[{ x: -0.845361, y: -8.600842 }, { x: -5.529949, y: -6.479521 }, { x: -8.004822, y: -3.297541 }, { x: -8.535150, y: 0.679939 }, { x: -6.502221, y: 5.452912 }, { x: -3.408629, y: 8.016168 }, { x: 1.099179, y: 8.634888 }, { x: 5.518600, y: 6.690340 }, { x: 8.258640, y: 2.889640 }, { x: 8.612177, y: -1.087829 }, { x: 6.667640, y: -5.507249 }, { x: 3.308880, y: -8.070510 }]]);
            case 'GearLocation':
                return ([[{ x: -0.015621, y: -4.546895 }, { x: 2.093748, y: -4.046864 }, { x: 4.046880, y: -2.046889 }, { x: 4.562502, y: 0.015637 }, { x: 4.031251, y: 2.062516 }, { x: 2.093748, y: 4.015624 }, { x: -0.015621, y: 4.468752 }, { x: -2.031251, y: 4.000015 }, { x: -4.015620, y: 2.015612 }, { x: -4.546870, y: -0.031267 }, { x: -4.031252, y: -2.031242 }, { x: -2.046871, y: -3.999997 }]]);
            case 'Gearbit':
                return ([[{ x: 16.733914, y: -20.240208 }, { x: 20.296414, y: -20.333940 }, { x: 21.921414, y: -15.615200 }, { x: 18.608915, y: -15.115206 }, { x: 15.452666, y: -15.365033 }], [{ x: 20.296414, y: -20.365197 }, { x: 23.546414, y: -21.708932 }, { x: 26.796415, y: -17.833934 }, { x: 24.577662, y: -16.521455 }, { x: 22.046414, y: -15.615200 }], [{ x: 23.608913, y: -21.708932 }, { x: 26.046413, y: -24.208939 }, { x: 30.640164, y: -21.865216 }, { x: 28.921413, y: -19.708958 }, { x: 26.765166, y: -17.833934 }], [{ x: 26.108915, y: -24.208939 }, { x: 27.577666, y: -27.583943 }, { x: 32.546414, y: -26.646431 }, { x: 31.765163, y: -24.271452 }, { x: 30.577666, y: -21.833959 }], [{ x: 27.546413, y: -27.646457 }, { x: 27.796429, y: -30.146463 }, { x: 28.608929, y: -31.583968 }, { x: 30.296427, y: -32.271464 }, { x: 32.108930, y: -31.552712 }, { x: 32.858928, y: -29.677688 }, { x: 32.483923, y: -26.583956 }], [{ x: -20.447867, y: 17.081212 }, { x: -20.553619, y: 20.643379 }, { x: -15.840389, y: 22.284299 }, { x: -15.329223, y: 18.973508 }, { x: -15.568392, y: 15.816431 }], [{ x: -20.584872, y: 20.643266 }, { x: -21.939564, y: 23.888746 }, { x: -18.075549, y: 27.151801 }, { x: -16.755594, y: 24.937489 }, { x: -15.840805, y: 22.409288 }], [{ x: -21.939775, y: 23.951222 }, { x: -24.447987, y: 26.380286 }, { x: -22.119775, y: 30.981898 }, { x: -19.957731, y: 29.270453 }, { x: -18.075443, y: 27.120544 }], [{ x: -24.448199, y: 26.442799 }, { x: -27.828139, y: 27.900147 }, { x: -26.907394, y: 32.872040 }, { x: -24.529791, y: 32.098787 }, { x: -22.088307, y: 30.919536 }], [{ x: -27.890547, y: 27.868664 }, { x: -30.391381, y: 28.110176 }, { x: -31.831619, y: 28.917823 }, { x: -32.524803, y: 30.603001 }, { x: -31.812169, y: 32.417930 }, { x: -29.939686, y: 33.174251 }, { x: -26.844706, y: 32.809527 }], [{ x: -20.250002, y: 16.375008 }, { x: -32.250001, y: -29.625001 }, { x: -32.125012, y: -32.125000 }, { x: -30.000011, y: -32.125000 }, { x: 16.124987, y: -20.500001 }, { x: 15.749982, y: -15.124999 }, { x: 6.124981, y: 6.000001 }, { x: -15.500020, y: 15.875014 }]]);
            case 'Interceptor':
                return ([[{ x: -36.145402, y: -19.903674 }, { x: -30.134989, y: -28.212171 }, { x: -29.251109, y: -30.068335 }, { x: -30.046601, y: -32.278036 }, { x: -31.372429, y: -32.896782 }, { x: -33.582141, y: -32.189671 }, { x: -36.675730, y: -28.477343 }, { x: -40.564822, y: -22.201778 }], [{ x: -40.564822, y: -22.290181 }, { x: -36.145402, y: -19.992077 }, { x: -40.388038, y: -8.501596 }, { x: -46.044899, y: -8.590037 }, { x: -43.039690, y: -17.605646 }], [{ x: 36.230705, y: -19.903674 }, { x: 30.220293, y: -28.212171 }, { x: 29.336412, y: -30.068335 }, { x: 30.131904, y: -32.278036 }, { x: 31.457732, y: -32.896782 }, { x: 33.667445, y: -32.189671 }, { x: 36.761033, y: -28.477343 }, { x: 40.650125, y: -22.201778 }], [{ x: 40.650125, y: -22.290181 }, { x: 36.230705, y: -19.992077 }, { x: 40.473342, y: -8.501596 }, { x: 46.130202, y: -8.590037 }, { x: 43.124994, y: -17.605646 }], [{ x: -45.691339, y: -8.678364 }, { x: 45.525429, y: -8.678364 }, { x: 46.409320, y: -5.761552 }, { x: 45.437048, y: -3.816985 }, { x: 43.757672, y: -3.375045 }, { x: -44.100351, y: -3.375045 }, { x: -45.868119, y: -4.258925 }, { x: -46.398451, y: -6.026723 }], [{ x: -5.474638, y: -3.463448 }, { x: -6.712082, y: 0.072073 }, { x: -5.121090, y: 4.226341 }, { x: -1.850721, y: 6.347676 }, { x: 2.480311, y: 6.259236 }, { x: 5.397120, y: 4.137900 }, { x: 6.722948, y: -0.104733 }, { x: 5.573899, y: -3.551889 }]]);
            case 'PartLocation':
                return ([[{ x: -0.015621, y: -4.546889 }, { x: 2.093748, y: -4.046857 }, { x: 4.046880, y: -2.046883 }, { x: 4.562502, y: 0.015643 }, { x: 4.031251, y: 2.062522 }, { x: 2.093748, y: 4.015631 }, { x: -0.015621, y: 4.468758 }, { x: -2.031251, y: 4.000021 }, { x: -4.015620, y: 2.015618 }, { x: -4.546870, y: -0.031261 }, { x: -4.031252, y: -2.031235 }, { x: -2.046871, y: -3.999991 }]]);
            case 'Ramp':
                return ([[{ x: 14.677897, y: -16.036782 }, { x: -30.974694, y: -27.659887 }, { x: -31.991164, y: -28.455364 }, { x: -32.477295, y: -29.339245 }, { x: -32.565698, y: -30.532517 }, { x: -31.946978, y: -31.637348 }, { x: -31.239877, y: -32.256057 }, { x: -30.002437, y: -32.565600 }, { x: 16.534034, y: -20.633141 }], [{ x: 16.468750, y: -20.593758 }, { x: 20.031250, y: -20.687490 }, { x: 21.656250, y: -15.968750 }, { x: 18.343751, y: -15.468757 }, { x: 15.187502, y: -15.718583 }], [{ x: 20.031250, y: -20.718747 }, { x: 23.281250, y: -22.062483 }, { x: 26.531251, y: -18.187484 }, { x: 24.312498, y: -16.875005 }, { x: 21.781250, y: -15.968750 }], [{ x: 23.343748, y: -22.062483 }, { x: 25.781249, y: -24.562489 }, { x: 30.375000, y: -22.218766 }, { x: 28.656248, y: -20.062508 }, { x: 26.500002, y: -18.187484 }], [{ x: 25.843751, y: -24.562489 }, { x: 27.312502, y: -27.937493 }, { x: 32.281250, y: -26.999982 }, { x: 31.499999, y: -24.625002 }, { x: 30.312502, y: -22.187509 }], [{ x: 27.281249, y: -28.000007 }, { x: 27.531265, y: -30.500013 }, { x: 28.343765, y: -31.937518 }, { x: 30.031263, y: -32.625015 }, { x: 31.843766, y: -31.906262 }, { x: 32.593764, y: -30.031238 }, { x: 32.218759, y: -26.937506 }], [{ x: -4.500000, y: -20.874993 }, { x: -4.437487, y: -7.187510 }, { x: 6.187513, y: -5.750004 }, { x: 14.937516, y: -16.187509 }], [{ x: -4.437502, y: -7.312499 }, { x: -7.312501, y: -4.687503 }, { x: -8.687501, y: -0.875018 }, { x: -8.125002, y: 2.687489 }, { x: -5.062500, y: 6.937492 }, { x: 0.062498, y: 8.562499 }, { x: 4.500000, y: 7.437485 }, { x: 7.625000, y: 3.875016 }, { x: 8.624999, y: -0.687516 }, { x: 7.062500, y: -4.937519 }, { x: 6.000000, y: -5.812518 }], [{ x: 7.500000, y: 4.000005 }, { x: 13.750000, y: 8.687488 }, { x: 14.687500, y: 11.499986 }, { x: 12.937500, y: 14.187495 }, { x: 9.937500, y: 14.562424 }, { x: 8.000001, y: 13.062443 }, { x: 3.812500, y: 7.312421 }], [{ x: -17.374998, y: 12.562487 }, { x: -21.250000, y: 11.437510 }, { x: -25.937499, y: 12.000017 }, { x: -29.812501, y: 14.625013 }, { x: -32.250001, y: 19.249983 }, { x: -32.437504, y: 23.750001 }, { x: -30.375004, y: 28.437485 }, { x: -26.812505, y: 31.437485 }, { x: -21.312502, y: 32.562499 }, { x: -16.375003, y: 30.875015 }, { x: -12.312503, y: 26.187494 }, { x: -11.750003, y: 20.250008 }, { x: -13.937503, y: 15.937491 }], [{ x: -8.000001, y: 2.562500 }, { x: -17.499999, y: 12.875016 }, { x: -13.812499, y: 16.249983 }, { x: -4.937499, y: 6.625000 }]]);
            default:
                return (null);
        }
    }
    exports_15("getVertexSets", getVertexSets);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("parts/part", ["pixi.js", "matter-js", "renderer", "board/constants", "parts/bodies"], function (exports_16, context_16) {
    "use strict";
    var __moduleName = context_16 && context_16.id;
    var PIXI, matter_js_2, renderer_1, constants_2, bodies_1, Part;
    return {
        setters: [
            function (PIXI_2) {
                PIXI = PIXI_2;
            },
            function (matter_js_2_1) {
                matter_js_2 = matter_js_2_1;
            },
            function (renderer_1_1) {
                renderer_1 = renderer_1_1;
            },
            function (constants_2_1) {
                constants_2 = constants_2_1;
            },
            function (bodies_1_1) {
                bodies_1 = bodies_1_1;
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
                    this._column = 0.0;
                    this._row = 0.0;
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
                    this._body = undefined;
                    this._constraints = null;
                    this._bodyOffset = { x: 0.0, y: 0.0 };
                    this._bodyFlipped = false;
                    this._bodyAngle = 0.0;
                    this._readingBody = false;
                }
                // the current position of the ball in grid units
                get column() { return (this._column); }
                set column(v) {
                    if (v === this._column)
                        return;
                    this._column = v;
                    this.writeBody();
                }
                get row() { return (this._row); }
                set row(v) {
                    if (v === this._row)
                        return;
                    this._row = v;
                    this.writeBody();
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
                    this.writeBody();
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
                    this.writeBody();
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
                    this._rv = (target < this.rotation ? -1.0 : 1.0) / (time * 60.0);
                    PIXI.ticker.shared.add(this.tickRotation);
                }
                isAnimatingRotation() {
                    return (this._rv !== 0.0);
                }
                cancelRotationAnimation() {
                    if (this._rv !== 0) {
                        this._rv = 0.0;
                        PIXI.ticker.shared.remove(this.tickRotation);
                    }
                }
                _tickRotation(delta) {
                    if (this._rv === 0.0) {
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
                            sprite.rotation = this._angleForRotation(this.rotation - 1.0, layer);
                        }
                        else {
                            sprite.rotation = this._angleForRotation(this.rotation, layer);
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
                _angleForRotation(r, layer = 1 /* MID */) {
                    return ((this.isFlipped ? -r : r) * (Math.PI / 2));
                }
                // get the rotation for the given angle
                _rotationForAngle(a) {
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
                // the amount the body will bounce in a collision (0.0 - 1.0)
                get bodyRestitution() { return (0.25); }
                // a body representing the physical form of the part
                getBody() {
                    if (this._body === undefined) {
                        this._body = this._bodyFromVertexSets(bodies_1.getVertexSets(this.constructor.name));
                        if (this._body) {
                            this.initBody();
                            this.writeBody();
                        }
                    }
                    return (this._body);
                }
                ;
                // get constraints to apply to the body
                get constraints() { return (this._constraints); }
                // initialize the body after creation
                initBody() {
                    if (!this._body)
                        return;
                    // parts that can't rotate can be static
                    if ((!this.bodyCanRotate) && (!this.bodyCanMove)) {
                        matter_js_2.Body.setStatic(this._body, true);
                    }
                    else if (this.bodyCanRotate) {
                        this._rotationConstraint = matter_js_2.Constraint.create({
                            bodyA: this._body,
                            pointB: { x: 0, y: 0 },
                            length: 0,
                            stiffness: 1
                        });
                        if (!this._constraints)
                            this._constraints = [];
                        this._constraints.push(this._rotationConstraint);
                    }
                }
                // transfer relevant properties to the body
                writeBody() {
                    if ((!this._body) || (this._readingBody))
                        return;
                    if (this._bodyFlipped !== this.isFlipped) {
                        matter_js_2.Body.scale(this._body, -1, 1);
                        this._bodyOffset.x *= -1;
                    }
                    if ((this._bodyRow !== this.row) ||
                        (this._bodyColumn !== this.column) ||
                        (this._bodyFlipped !== this.isFlipped)) {
                        const x = (this.column * constants_2.SPACING) + this._bodyOffset.x;
                        const y = (this.row * constants_2.SPACING) + this._bodyOffset.y;
                        matter_js_2.Body.setPosition(this._body, { x: x, y: y });
                        if (this._rotationConstraint) {
                            this._rotationConstraint.pointB = { x: x, y: y };
                        }
                        this._bodyRow = this.row;
                        this._bodyColumn = this.column;
                    }
                    let desiredAngle = this._angleForRotation(this.rotation);
                    if (this._bodyAngle != desiredAngle) {
                        matter_js_2.Body.setAngle(this._body, desiredAngle);
                        this._bodyAngle = desiredAngle;
                    }
                    this._bodyFlipped = this.isFlipped;
                }
                // tranfer relevant properties from the body
                readBody() {
                    if (!this._body)
                        return;
                    this._readingBody = true;
                    if (this.bodyCanMove) {
                        this.column = this._body.position.x / constants_2.SPACING;
                        this.row = this._body.position.y / constants_2.SPACING;
                    }
                    if (this.bodyCanRotate) {
                        const r = this._rotationForAngle(this._body.angle);
                        this.rotation = r;
                        if ((r < 0) || (r > 1)) {
                            matter_js_2.Body.setAngularVelocity(this._body, 0.0);
                            matter_js_2.Body.setAngle(this._body, this._angleForRotation(this.rotation));
                        }
                    }
                    this._readingBody = false;
                }
                // construct a body from a set of vertex lists
                _bodyFromVertexSets(vertexSets) {
                    if (!vertexSets)
                        return (null);
                    const parts = [];
                    for (const vertices of vertexSets) {
                        const center = matter_js_2.Vertices.centre(vertices);
                        parts.push(matter_js_2.Body.create({ position: center, vertices: vertices }));
                    }
                    const body = matter_js_2.Body.create({ parts: parts,
                        restitution: this.bodyRestitution,
                        friction: 0 });
                    // this is a hack to prevent matter.js from placing the body's center 
                    //  of mass over the origin, which complicates our ability to precisely
                    //  position parts of an arbitrary shape
                    body.position.x = 0;
                    body.position.y = 0;
                    body.positionPrev.x = 0;
                    body.positionPrev.y = 0;
                    return (body);
                }
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
System.register("board/router", [], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("board/board", ["pixi-filters", "parts/fence", "parts/gearbit", "util/disjoint", "renderer", "parts/ball"], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    var filter, fence_2, gearbit_2, disjoint_1, renderer_2, ball_2, PartSizes, SPACING_FACTOR, Board;
    return {
        setters: [
            function (filter_1) {
                filter = filter_1;
            },
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
            },
            function (ball_2_1) {
                ball_2 = ball_2_1;
            }
        ],
        execute: function () {
            exports_19("PartSizes", PartSizes = [2, 4, 6, 8, 12, 16, 24, 32, 48, 64]);
            exports_19("SPACING_FACTOR", SPACING_FACTOR = 1.0625);
            Board = class Board {
                constructor(partFactory) {
                    this.partFactory = partFactory;
                    this.view = new PIXI.Sprite();
                    this._layers = new PIXI.Container();
                    // the set of balls currently on the board
                    this.balls = new Set();
                    this._changeCounter = 0;
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
                // a counter that increments whenever the board changes
                get changeCounter() { return (this._changeCounter); }
                onChange() {
                    this._changeCounter++;
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
                    if (this.router)
                        this.router.onBoardSizeChanged();
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
                    part.column = column;
                    part.row = row;
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
                    for (const ball of this.balls) {
                        this.layoutPart(ball, ball.column, ball.row);
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
                    if (this.router)
                        this.router.onBoardSizeChanged();
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
                        (type == 8 /* GEAR */) || (type == 11 /* FENCE */))
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
                    this.onChange();
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
                // add a ball to the board
                addBall(ball, x, y) {
                    if (!this.balls.has(ball)) {
                        this.balls.add(ball);
                        this.layoutPart(ball, this.columnForX(x), this.rowForY(y));
                        this.addPart(ball);
                        this.onChange();
                    }
                }
                // remove a ball from the board
                removeBall(ball) {
                    if (this.balls.has(ball)) {
                        this.balls.delete(ball);
                        this.removePart(ball);
                        renderer_2.Renderer.needsUpdate();
                        this.onChange();
                    }
                }
                // add a part to the board's layers
                addPart(part) {
                    for (let layer of this._containers.keys()) {
                        const sprite = part.getSpriteForLayer(layer);
                        if (!sprite)
                            continue;
                        // add balls behind other parts to prevent ball highlights from
                        //  displaying on top of gears, etc.
                        if (part instanceof ball_2.Ball) {
                            this._containers.get(layer).addChildAt(sprite, 0);
                        }
                        else {
                            this._containers.get(layer).addChild(sprite);
                        }
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
                }
                _onDragFinish() {
                    this._dragFlippedParts.clear();
                }
                _updateAction(e) {
                    const p = e.data.getLocalPosition(this._layers);
                    this._actionX = p.x;
                    this._actionY = p.y;
                    const column = this._actionColumn = Math.round(this.columnForX(p.x));
                    const row = this._actionRow = Math.round(this.rowForY(p.y));
                    if ((this.tool == 1 /* PART */) && (this.partPrototype) &&
                        (this.canPlacePart(this.partPrototype.type, column, row))) {
                        this._action = this.partPrototype.type == 9 /* BALL */ ?
                            2 /* PLACE_BALL */ : 1 /* PLACE_PART */;
                        this.view.cursor = 'pointer';
                    }
                    else if ((this.tool == 2 /* ERASER */) &&
                        (!this.isBackgroundPart(column, row))) {
                        this._action = 3 /* CLEAR_PART */;
                        this.view.cursor = 'pointer';
                    }
                    else if ((this.tool == 3 /* HAND */) &&
                        (this.canFlipPart(column, row))) {
                        this._action = 4 /* FLIP_PART */;
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
                        else if (this._action === 2 /* PLACE_BALL */) {
                            this.partPrototype.visible = true;
                            this.partPrototype.x = Math.round(this._actionX);
                            this.partPrototype.y = Math.round(this._actionY);
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
                    else if ((this._action === 2 /* PLACE_BALL */) &&
                        (this.partPrototype)) {
                        this.addBall(this.partFactory.copy(this.partPrototype), this._actionX, this._actionY);
                    }
                    else if (this._action === 3 /* CLEAR_PART */) {
                        this.clearPart(this._actionColumn, this._actionRow);
                    }
                    else if (this._action === 4 /* FLIP_PART */) {
                        this.flipPart(this._actionColumn, this._actionRow);
                    }
                }
            };
            exports_19("Board", Board);
        }
    };
});
System.register("ui/button", ["pixi.js", "renderer"], function (exports_20, context_20) {
    "use strict";
    var __moduleName = context_20 && context_20.id;
    var PIXI, renderer_3, Button, PartButton, SpriteButton, ButtonBar;
    return {
        setters: [
            function (PIXI_3) {
                PIXI = PIXI_3;
            },
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
            exports_20("Button", Button);
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
                    if ((part.type == 11 /* FENCE */) || (part.type == 10 /* DROP */)) {
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
            exports_20("PartButton", PartButton);
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
            exports_20("SpriteButton", SpriteButton);
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
            exports_20("ButtonBar", ButtonBar);
        }
    };
});
System.register("ui/toolbar", ["pixi.js", "ui/button", "renderer"], function (exports_21, context_21) {
    "use strict";
    var __moduleName = context_21 && context_21.id;
    var PIXI, button_1, renderer_4, Toolbar;
    return {
        setters: [
            function (PIXI_4) {
                PIXI = PIXI_4;
            },
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
                    for (let i = 3 /* TOOLBOX_MIN */; i <= 11 /* TOOLBOX_MAX */; i++) {
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
            exports_21("Toolbar", Toolbar);
        }
    };
});
System.register("ui/actionbar", ["pixi.js", "board/board", "ui/button", "renderer"], function (exports_22, context_22) {
    "use strict";
    var __moduleName = context_22 && context_22.id;
    var PIXI, board_2, button_2, renderer_5, Actionbar;
    return {
        setters: [
            function (PIXI_5) {
                PIXI = PIXI_5;
            },
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
            exports_22("Actionbar", Actionbar);
        }
    };
});
System.register("board/physics", ["pixi.js", "matter-js", "renderer", "parts/gearbit", "board/constants"], function (exports_23, context_23) {
    "use strict";
    var __moduleName = context_23 && context_23.id;
    var PIXI, matter_js_3, renderer_6, gearbit_3, constants_3, PhysicalBallRouter;
    return {
        setters: [
            function (PIXI_6) {
                PIXI = PIXI_6;
            },
            function (matter_js_3_1) {
                matter_js_3 = matter_js_3_1;
            },
            function (renderer_6_1) {
                renderer_6 = renderer_6_1;
            },
            function (gearbit_3_1) {
                gearbit_3 = gearbit_3_1;
            },
            function (constants_3_1) {
                constants_3 = constants_3_1;
            }
        ],
        execute: function () {
            PhysicalBallRouter = class PhysicalBallRouter {
                constructor(board) {
                    this.board = board;
                    this._boardChangeCounter = -1;
                    this._wallWidth = 16;
                    this._wallHeight = 16;
                    this._wallThickness = 16;
                    this._ballNeighbors = new Map();
                    this._parts = new Set();
                    this._dynamicParts = new Set();
                    this.engine = matter_js_3.Engine.create();
                    this.engine.enabled = false;
                    matter_js_3.Events.on(this.engine, 'beforeUpdate', this.beforeUpdate.bind(this));
                    matter_js_3.Events.on(this.engine, 'afterUpdate', this.afterUpdate.bind(this));
                    matter_js_3.Engine.run(this.engine);
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
                start() {
                    this.engine.enabled = true;
                }
                stop() {
                    this.engine.enabled = false;
                }
                beforeUpdate() {
                    this.addNeighborParts(this._boardChangeCounter !== this.board.changeCounter);
                    this._boardChangeCounter = this.board.changeCounter;
                }
                afterUpdate() {
                    // transfer part positions
                    for (const part of this._dynamicParts) {
                        part.readBody();
                        if (part.bodyCanMove) {
                            this.board.layoutPart(part, part.column, part.row);
                        }
                    }
                    // re-render the wireframe if there is one
                    this.renderWireframe();
                    // re-render the whole display if we're managing parts
                    if (this._parts.size > 0)
                        renderer_6.Renderer.needsUpdate();
                }
                // STATE MANAGEMENT *********************************************************
                _createWalls() {
                    const options = { isStatic: true };
                    this._top = matter_js_3.Bodies.rectangle(0, 0, this._wallWidth, this._wallThickness, options);
                    this._bottom = matter_js_3.Bodies.rectangle(0, 0, this._wallWidth, this._wallThickness, options);
                    this._left = matter_js_3.Bodies.rectangle(0, 0, this._wallThickness, this._wallHeight, options);
                    this._right = matter_js_3.Bodies.rectangle(0, 0, this._wallThickness, this._wallHeight, options);
                    matter_js_3.World.add(this.engine.world, [this._top, this._right, this._bottom, this._left]);
                }
                _updateWalls() {
                    const w = ((this.board.columnCount + 3) * constants_3.SPACING);
                    const h = ((this.board.rowCount + 3) * constants_3.SPACING);
                    const hw = (w - this._wallThickness) / 2;
                    const hh = (h + this._wallThickness) / 2;
                    const cx = ((this.board.columnCount - 1) / 2) * constants_3.SPACING;
                    const cy = ((this.board.rowCount - 1) / 2) * constants_3.SPACING;
                    matter_js_3.Body.setPosition(this._top, { x: cx, y: cy - hh });
                    matter_js_3.Body.setPosition(this._bottom, { x: cx, y: cy + hh });
                    matter_js_3.Body.setPosition(this._left, { x: cx - hw, y: cy });
                    matter_js_3.Body.setPosition(this._right, { x: cx + hw, y: cy });
                    const sx = w / this._wallWidth;
                    const sy = h / this._wallHeight;
                    if (sx != 1.0) {
                        matter_js_3.Body.scale(this._top, sx, 1.0);
                        matter_js_3.Body.scale(this._bottom, sx, 1.0);
                    }
                    if (sy != 1.0) {
                        matter_js_3.Body.scale(this._left, 1.0, sy);
                        matter_js_3.Body.scale(this._right, 1.0, sy);
                    }
                    this._wallWidth = w;
                    this._wallHeight = h;
                }
                addNeighborParts(force = false) {
                    // track any balls that may have been removed from the board
                    const removedBalls = new Set(this._ballNeighbors.keys());
                    for (const ball of this.board.balls) {
                        const column = Math.round(ball.column);
                        const row = Math.round(ball.row);
                        // remove balls that drop off the board
                        if (Math.round(row) > this.board.rowCount) {
                            this.board.removeBall(ball);
                            continue;
                        }
                        removedBalls.delete(ball);
                        // don't update for balls in the same locality (unless forced to)
                        if ((!force) && (ball.lastColumn === column) &&
                            (ball.lastRow === row))
                            continue;
                        if (!this._ballNeighbors.has(ball)) {
                            this.addPart(ball);
                            this._ballNeighbors.set(ball, new Set());
                        }
                        const newNeighbors = new Set();
                        const oldNeighbors = this._ballNeighbors.get(ball);
                        for (let c = -1; c <= 1; c++) {
                            for (let r = -1; r <= 1; r++) {
                                const part = this.board.getPart(column + c, row + r);
                                if (!part)
                                    continue;
                                newNeighbors.add(part);
                                oldNeighbors.delete(part);
                            }
                        }
                        for (const part of newNeighbors)
                            this.addPart(part);
                        for (const part of oldNeighbors)
                            this.removePart(part);
                        this._ballNeighbors.set(ball, newNeighbors);
                        ball.lastColumn = column;
                        ball.lastRow = row;
                    }
                    // remove balls and neighbors for any balls no longer on the board
                    for (const ball of removedBalls) {
                        this.removePart(ball);
                        if (this._ballNeighbors.has(ball)) {
                            for (const part of this._ballNeighbors.get(ball)) {
                                this.removePart(part);
                            }
                        }
                    }
                }
                addPart(part) {
                    if (this._parts.has(part))
                        return; // make it idempotent
                    this._parts.add(part);
                    const body = part.getBody();
                    if (body) {
                        matter_js_3.World.add(this.engine.world, body);
                        if (!body.isStatic)
                            this._dynamicParts.add(part);
                    }
                    const constraints = part.constraints;
                    if (constraints)
                        matter_js_3.World.add(this.engine.world, constraints);
                }
                removePart(part) {
                    if (!this._parts.has(part))
                        return; // make it idempotent
                    this._parts.delete(part);
                    this._dynamicParts.delete(part);
                    const body = part.getBody();
                    if (body)
                        matter_js_3.World.remove(this.engine.world, body);
                    const constraints = part.constraints;
                    if (constraints) {
                        for (const constraint of constraints) {
                            matter_js_3.World.remove(this.engine.world, constraint);
                        }
                    }
                    this._restoreRestingRotation(part);
                }
                // restore the rotation of the part if it has one
                _restoreRestingRotation(part) {
                    if (part.rotation === part.restingRotation)
                        return;
                    // ensure we don't "restore" a gear that's still connected
                    //  to a chain that's being simulated
                    if (part instanceof gearbit_3.GearBase) {
                        for (const gear of part.connected) {
                            if (this._dynamicParts.has(gear))
                                return;
                        }
                    }
                    part.animateRotation(part.restingRotation, 0.1);
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
                        renderer_6.Renderer.needsUpdate();
                    }
                }
                renderWireframe() {
                    if (!this._wireframe)
                        return;
                    // setup
                    const g = this._wireframeGraphics;
                    g.clear();
                    const scale = this.board.spacing / constants_3.SPACING;
                    // draw all bodies
                    var bodies = matter_js_3.Composite.allBodies(this.engine.world);
                    for (const body of bodies) {
                        this._drawBody(g, body, scale);
                    }
                    renderer_6.Renderer.needsUpdate();
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
            };
            exports_23("PhysicalBallRouter", PhysicalBallRouter);
        }
    };
});
System.register("ui/keyboard", [], function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
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
    exports_24("makeKeyHandler", makeKeyHandler);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("app", ["pixi.js", "board/board", "parts/factory", "ui/toolbar", "ui/actionbar", "renderer", "board/physics", "ui/keyboard"], function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    var PIXI, board_3, factory_1, toolbar_1, actionbar_1, renderer_7, physics_1, keyboard_1, SimulatorApp;
    return {
        setters: [
            function (PIXI_7) {
                PIXI = PIXI_7;
            },
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
            function (renderer_7_1) {
                renderer_7 = renderer_7_1;
            },
            function (physics_1_1) {
                physics_1 = physics_1_1;
            },
            function (keyboard_1_1) {
                keyboard_1 = keyboard_1_1;
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
                    // set up ball routers
                    this.physicalRouter = new physics_1.PhysicalBallRouter(this.board);
                    this.board.router = this.physicalRouter;
                    this.physicalRouter.start();
                    // add event listeners
                    this._addKeyHandlers();
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
                    renderer_7.Renderer.needsUpdate();
                }
                _addKeyHandlers() {
                    const w = keyboard_1.makeKeyHandler('w');
                    w.press = () => { this.physicalRouter.showWireframe = true; };
                    w.release = () => { this.physicalRouter.showWireframe = false; };
                }
            };
            exports_25("SimulatorApp", SimulatorApp);
        }
    };
});
System.register("board/builder", ["parts/fence"], function (exports_26, context_26) {
    "use strict";
    var __moduleName = context_26 && context_26.id;
    var fence_3, BoardBuilder;
    return {
        setters: [
            function (fence_3_1) {
                fence_3 = fence_3_1;
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
                    const dropLevel = (blueColumn % 2 == 0) ? 1 : 0;
                    const collectLevel = dropLevel + verticalDrop;
                    const steps = Math.ceil(center / fence_3.Fence.maxModulus);
                    const maxModulus = Math.ceil(center / steps);
                    const height = collectLevel + steps + 2;
                    board.setSize(width, height);
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
                    const fence = board.partFactory.make(11 /* FENCE */);
                    fence.isLocked = true;
                    const flippedFence = board.partFactory.copy(fence);
                    flippedFence.flip();
                    for (r = dropLevel; r < collectLevel; r++) {
                        board.setPart(board.partFactory.copy(fence), 0, r);
                        board.setPart(board.partFactory.copy(flippedFence), width - 1, r);
                    }
                    // add collection fences at the bottom
                    r = collectLevel;
                    run = 0;
                    for (c = 0; c < center; c++, run++) {
                        if (run >= maxModulus) {
                            r++;
                            run = 0;
                        }
                        board.setPart(board.partFactory.copy(fence), c, r);
                    }
                    r = collectLevel;
                    run = 0;
                    for (c = width - 1; c > center; c--, run++) {
                        if (run >= maxModulus) {
                            r++;
                            run = 0;
                        }
                        board.setPart(board.partFactory.copy(flippedFence), c, r);
                    }
                    // block out the unreachable locations at the bottom
                    for (r = collectLevel; r < height; r++) {
                        for (c = 0; c < width; c++) {
                            if (board.getPart(c, r) instanceof fence_3.Fence)
                                break;
                            board.setPart(board.partFactory.copy(blank), c, r);
                        }
                        for (c = width - 1; c >= 0; c--) {
                            if (board.getPart(c, r) instanceof fence_3.Fence)
                                break;
                            board.setPart(board.partFactory.copy(blank), c, r);
                        }
                    }
                    // make a fence to collect balls
                    r = height - 1;
                    const rightSide = Math.min(center + fence_3.Fence.maxModulus, height - 1);
                    for (c = center; c < rightSide; c++) {
                        board.setPart(board.partFactory.copy(fence), c, r);
                    }
                    board.setPart(board.partFactory.copy(fence), rightSide, r);
                    board.setPart(board.partFactory.copy(fence), rightSide, r - 1);
                    // make a ball drops
                    const blueDrop = board.partFactory.make(10 /* DROP */);
                    board.setPart(blueDrop, blueColumn - 1, dropLevel);
                    const redDrop = board.partFactory.make(10 /* DROP */);
                    redDrop.isFlipped = true;
                    board.setPart(redDrop, redColumn + 1, dropLevel);
                }
            };
            exports_26("BoardBuilder", BoardBuilder);
        }
    };
});
System.register("index", ["pixi.js", "app", "renderer", "board/builder"], function (exports_27, context_27) {
    "use strict";
    var __moduleName = context_27 && context_27.id;
    var PIXI, app_1, renderer_8, builder_1, container, sim, resizeApp, loader;
    return {
        setters: [
            function (PIXI_8) {
                PIXI = PIXI_8;
            },
            function (app_1_1) {
                app_1 = app_1_1;
            },
            function (renderer_8_1) {
                renderer_8 = renderer_8_1;
            },
            function (builder_1_1) {
                builder_1 = builder_1_1;
            }
        ],
        execute: function () {
            container = document.getElementById('container');
            container.appendChild(renderer_8.Renderer.instance.view);
            // dynamically resize the app to track the size of the browser window
            container.style.overflow = 'hidden';
            resizeApp = () => {
                const r = container.getBoundingClientRect();
                renderer_8.Renderer.instance.resize(r.width, r.height);
                if (sim) {
                    sim.width = r.width;
                    sim.height = r.height;
                }
            };
            resizeApp();
            window.addEventListener('resize', resizeApp);
            renderer_8.Renderer.start();
            // load sprites
            loader = PIXI.loader;
            loader.add('images/parts.json').load(() => {
                sim = new app_1.SimulatorApp(PIXI.loader.resources["images/parts.json"].textures);
                sim.width = renderer_8.Renderer.instance.width;
                sim.height = renderer_8.Renderer.instance.height;
                renderer_8.Renderer.stage.addChild(sim);
                // set up the standard board
                builder_1.BoardBuilder.initStandardBoard(sim.board);
                sim.actionbar.zoomToFit();
            });
        }
    };
});
