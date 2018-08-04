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
                    this.changeCounter++;
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
                    return (this.variant == 2 /* SLOPE */ ?
                        (this.sequence / this.modulus) : 0);
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
    var PART_SIZE, SPACING, BALL_RADIUS, PART_DENSITY, BALL_DENSITY, BALL_FRICTION, PART_FRICTION, BALL_FRICTION_STATIC, PART_FRICTION_STATIC, IDEAL_VX, NUDGE_ACCEL, MAX_V, DAMPER_RADIUS, BIAS_STIFFNESS, BIAS_DAMPING, COUNTERWEIGHT_STIFFNESS, COUNTERWEIGHT_DAMPING, DEFAULT_MASK, PART_CATEGORY, BALL_CATEGORY, PIN_CATEGORY, PART_MASK, BALL_MASK, PIN_MASK;
    return {
        setters: [],
        execute: function () {
            // the canonical part size the simulator runs at
            exports_10("PART_SIZE", PART_SIZE = 64);
            exports_10("SPACING", SPACING = 68);
            // the size of a ball in simulator units
            exports_10("BALL_RADIUS", BALL_RADIUS = 10);
            exports_10("PART_DENSITY", PART_DENSITY = 0.100);
            exports_10("BALL_DENSITY", BALL_DENSITY = 0.008);
            exports_10("BALL_FRICTION", BALL_FRICTION = 0.03);
            exports_10("PART_FRICTION", PART_FRICTION = 0.03);
            exports_10("BALL_FRICTION_STATIC", BALL_FRICTION_STATIC = 0.03);
            exports_10("PART_FRICTION_STATIC", PART_FRICTION_STATIC = 0.03);
            // the ideal horizontal velocity at which a ball should be moving
            exports_10("IDEAL_VX", IDEAL_VX = 1.5);
            // the maximum acceleration to use when nudging the ball
            exports_10("NUDGE_ACCEL", NUDGE_ACCEL = 0.001);
            // the maximum speed at which a part can move
            exports_10("MAX_V", MAX_V = 12);
            // damping/counterweight constraint parameters
            exports_10("DAMPER_RADIUS", DAMPER_RADIUS = PART_SIZE / 2);
            exports_10("BIAS_STIFFNESS", BIAS_STIFFNESS = BALL_DENSITY / 16);
            exports_10("BIAS_DAMPING", BIAS_DAMPING = 0.3);
            exports_10("COUNTERWEIGHT_STIFFNESS", COUNTERWEIGHT_STIFFNESS = BALL_DENSITY / 32);
            exports_10("COUNTERWEIGHT_DAMPING", COUNTERWEIGHT_DAMPING = 0.1);
            // collision filtering categories
            exports_10("DEFAULT_MASK", DEFAULT_MASK = 0xFFFFFF);
            exports_10("PART_CATEGORY", PART_CATEGORY = 0x0001);
            exports_10("BALL_CATEGORY", BALL_CATEGORY = 0x0002);
            exports_10("PIN_CATEGORY", PIN_CATEGORY = 0x0004);
            exports_10("PART_MASK", PART_MASK = BALL_CATEGORY | PIN_CATEGORY);
            exports_10("BALL_MASK", BALL_MASK = DEFAULT_MASK);
            exports_10("PIN_MASK", PIN_MASK = PART_CATEGORY);
        }
    };
});
System.register("parts/ball", ["parts/part"], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    var part_10, Ball;
    return {
        setters: [
            function (part_10_1) {
                part_10 = part_10_1;
            }
        ],
        execute: function () {
            Ball = class Ball extends part_10.Part {
                constructor() {
                    super(...arguments);
                    this.lastDistinctColumn = NaN;
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
                get bodyRestitution() { return (0.1); }
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
                        case 9 /* BALL */: return (ball_1.Ball);
                        case 10 /* DROP */: return (drop_1.Drop);
                        case 11 /* FENCE */: return (fence_1.Fence);
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
    var Zooms, Speeds;
    return {
        setters: [],
        execute: function () {
            exports_13("Zooms", Zooms = [2, 4, 6, 8, 12, 16, 24, 32, 48, 64]);
            exports_13("Speeds", Speeds = [0.0, 0.25, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0]);
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
System.register("ui/animator", [], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    var Animator;
    return {
        setters: [],
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
                animate(subject, property, start, end, time) {
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
                    }
                    else {
                        animation = {
                            subject: subject,
                            property: property,
                            start: start,
                            end: end,
                            time: time,
                            delta: delta
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
                    for (const [subject, properties] of this._subjects.entries()) {
                        for (const [property, animation] of properties) {
                            let current = subject[property];
                            current += (animation.delta * Math.abs(correction));
                            if (animation.delta > 0) {
                                if (current >= animation.end) {
                                    current = animation.end;
                                    this.stopAnimating(subject, property);
                                }
                            }
                            else if (animation.delta < 0) {
                                if (current <= animation.end) {
                                    current = animation.end;
                                    this.stopAnimating(subject, property);
                                }
                            }
                            else {
                                current = animation.end;
                            }
                            subject[property] = current;
                        }
                    }
                }
            };
            exports_15("Animator", Animator);
        }
    };
});
System.register("parts/part", ["pixi.js", "renderer", "ui/animator"], function (exports_16, context_16) {
    "use strict";
    var __moduleName = context_16 && context_16.id;
    var PIXI, renderer_1, animator_1, Part;
    return {
        setters: [
            function (PIXI_2) {
                PIXI = PIXI_2;
            },
            function (renderer_1_1) {
                renderer_1 = renderer_1_1;
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
                            for (const gear of connected) {
                                if (gear !== this)
                                    animator_1.Animator.current.stopAnimating(gear, 'rotation');
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
                    sprite.visible = this.visible;
                    sprite.alpha = sprite.visible ? this.alpha : 0;
                    // schedule rendering
                    renderer_1.Renderer.needsUpdate();
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
System.register("board/router", [], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
// WARNING: this file is autogenerated from src/svg/parts.svg
//  (any changes you make will be overwritten)
System.register("parts/partvertices", [], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    function getVertexSets(name) {
        switch (name) {
            case 'Bit':
                return ([[{ x: -1.055229, y: -32.311155 }, { x: 0.083096, y: -27.714947 }, { x: -27.716345, y: 0.194331 }, { x: -32.193815, y: -1.017234 }, { x: -34.041082, y: -34.054877 }], [{ x: -9.275339, y: -18.699338 }, { x: -18.644511, y: -8.976617 }, { x: -0.000000, y: 14.000038 }, { x: 12.203028, y: 15.153399 }, { x: 15.296620, y: 11.971414 }, { x: 13.999993, y: 0.000026 }], [{ x: 26.999992, y: -2.999974 }, { x: 27.625371, y: -30.038638 }, { x: 27.844206, y: -31.163652 }, { x: 28.781680, y: -32.163640 }, { x: 30.000426, y: -32.538569 }, { x: 31.156697, y: -32.288364 }, { x: 32.156684, y: -31.507136 }, { x: 32.625459, y: -30.163362 }, { x: 31.999993, y: -2.999974 }], [{ x: -4.000006, y: 27.000025 }, { x: -30.292815, y: 27.954318 }, { x: -31.416143, y: 28.181468 }, { x: -32.409014, y: 29.126463 }, { x: -32.774721, y: 30.348006 }, { x: -32.515785, y: 31.502387 }, { x: -31.727017, y: 32.496403 }, { x: -30.379740, y: 32.955011 }, { x: -4.000006, y: 32.000038 }], [{ x: 26.999992, y: -2.999974 }, { x: 13.999993, y: 0.000026 }, { x: 15.385009, y: 12.059818 }, { x: 28.731650, y: 2.602268 }, { x: 31.999993, y: -2.999974 }], [{ x: -4.000006, y: 27.000025 }, { x: 0.000034, y: 14.000038 }, { x: 11.959139, y: 15.360668 }, { x: 2.501590, y: 28.707313 }, { x: -4.000006, y: 32.000038 }]]);
            case 'Crossover':
                return ([[{ x: -0.125001, y: -48.250007 }, { x: -2.750000, y: -46.000016 }, { x: -2.750000, y: -15.874990 }, { x: 3.000000, y: -15.874990 }, { x: 3.000000, y: -46.374983 }], [{ x: -3.000008, y: -15.999979 }, { x: -12.000004, y: -9.999979 }, { x: -2.249998, y: 4.250011 }, { x: 2.374998, y: 4.250011 }, { x: 11.999992, y: -9.999979 }, { x: 2.999992, y: -15.999979 }], [{ x: -32.250001, y: 31.999982 }, { x: -0.051776, y: 29.502583 }, { x: 31.124998, y: 31.499988 }, { x: 32.874999, y: 34.374999 }, { x: 30.375000, y: 36.999994 }, { x: -30.250000, y: 36.999994 }, { x: -32.749999, y: 35.125008 }], [{ x: -36.000003, y: -27.999979 }, { x: -43.000005, y: -5.000005 }, { x: -48.000003, y: -2.999992 }, { x: -45.000003, y: -20.999992 }, { x: -36.000003, y: -35.999991 }], [{ x: -43.000005, y: -5.000005 }, { x: -33.000003, y: 6.999995 }, { x: -39.000003, y: 6.999995 }, { x: -48.000003, y: -2.999992 }], [{ x: -35.999992, y: -35.999991 }, { x: -32.000004, y: -35.999991 }, { x: -31.999993, y: -31.999966 }, { x: -35.999999, y: -27.999979 }], [{ x: 35.999938, y: -27.999979 }, { x: 42.999941, y: -5.000005 }, { x: 47.999938, y: -2.999992 }, { x: 44.999938, y: -20.999992 }, { x: 35.999938, y: -35.999991 }], [{ x: 42.999941, y: -5.000005 }, { x: 32.999938, y: 6.999995 }, { x: 38.999938, y: 6.999995 }, { x: 47.999938, y: -2.999992 }], [{ x: 35.999927, y: -35.999991 }, { x: 31.999993, y: -35.999991 }, { x: 31.999989, y: -31.999966 }, { x: 35.999935, y: -27.999979 }]]);
            case 'Fence-l':
                return ([[{ x: -37.000036, y: -33.999997 }, { x: -31.000036, y: -33.999997 }, { x: -31.000036, y: 34.000014 }, { x: -37.000036, y: 34.000014 }]]);
            case 'Fence-s1':
                return ([[{ x: -32.000020, y: -35.999989 }, { x: 35.999990, y: 30.999929 }, { x: 31.999965, y: 36.000017 }, { x: -36.000008, y: -31.999990 }]]);
            case 'Fence-s2':
                return ([[{ x: -32.000020, y: -35.999984 }, { x: 35.999990, y: -2.999985 }, { x: 32.999990, y: 3.000015 }, { x: -35.000020, y: -30.999986 }]]);
            case 'Fence-s3':
                return ([[{ x: -33.000008, y: -35.999982 }, { x: 35.999990, y: -13.999980 }, { x: 33.999978, y: -7.999981 }, { x: -35.000020, y: -30.999981 }]]);
            case 'Fence-s4':
                return ([[{ x: -33.000011, y: -36.999976 }, { x: 34.999962, y: -19.999979 }, { x: 32.999987, y: -13.999979 }, { x: -35.000024, y: -30.999976 }]]);
            case 'Fence-s5':
                return ([[{ x: -33.999999, y: -36.999974 }, { x: 34.999962, y: -23.999972 }, { x: 33.999974, y: -16.999974 }, { x: -36.000011, y: -30.999975 }]]);
            case 'Fence-s6':
                return ([[{ x: -34.000028, y: -35.999970 }, { x: 33.999996, y: -26.999965 }, { x: 33.999976, y: -19.999970 }, { x: -34.000015, y: -30.999970 }]]);
            case 'GearLocation':
                return ([[{ x: -0.015621, y: -4.546895 }, { x: 2.093748, y: -4.046864 }, { x: 4.046880, y: -2.046889 }, { x: 4.562502, y: 0.015637 }, { x: 4.031251, y: 2.062516 }, { x: 2.093748, y: 4.015624 }, { x: -0.015621, y: 4.468752 }, { x: -2.031251, y: 4.000015 }, { x: -4.015620, y: 2.015612 }, { x: -4.546870, y: -0.031267 }, { x: -4.031252, y: -2.031242 }, { x: -2.046871, y: -3.999997 }]]);
            case 'Gearbit':
                return ([[{ x: -19.999998, y: 16.000009 }, { x: -22.637133, y: 25.233206 }, { x: -19.101593, y: 28.768727 }, { x: -14.858953, y: 22.316393 }, { x: -14.682184, y: 16.040828 }], [{ x: -22.637133, y: 25.144803 }, { x: -30.857243, y: 28.326787 }, { x: -30.945646, y: 32.569420 }, { x: -23.962965, y: 32.216034 }, { x: -18.748056, y: 28.326938 }], [{ x: 15.999998, y: -20.000004 }, { x: 25.168111, y: -23.063500 }, { x: 28.703632, y: -19.527960 }, { x: 22.251299, y: -15.285319 }, { x: 15.975734, y: -15.108551 }], [{ x: 25.079708, y: -23.063500 }, { x: 28.261692, y: -31.283609 }, { x: 32.504325, y: -31.372012 }, { x: 32.150939, y: -24.389332 }, { x: 28.261843, y: -19.174423 }], [{ x: -27.999998, y: -32.000000 }, { x: 15.999998, y: -20.000000 }, { x: 6.999995, y: 7.000026 }, { x: -20.000001, y: 16.000003 }, { x: -32.000001, y: -28.000001 }, { x: -31.999993, y: -31.999985 }]]);
            case 'Interceptor':
                return ([[{ x: -45.691339, y: -8.678364 }, { x: 45.525429, y: -8.678364 }, { x: 46.507671, y: -3.375045 }, { x: -46.600349, y: -3.375045 }], [{ x: -40.374999, y: -8.249992 }, { x: -28.500000, y: -30.875000 }, { x: -33.125000, y: -33.624984 }, { x: -41.999999, y: -20.749986 }, { x: -45.625001, y: -9.124991 }], [{ x: 40.624999, y: -8.249992 }, { x: 28.750000, y: -30.875000 }, { x: 33.375000, y: -33.624984 }, { x: 42.249999, y: -20.749986 }, { x: 45.875001, y: -9.124991 }], [{ x: -6.999999, y: -3.499996 }, { x: -6.500009, y: 3.625018 }, { x: -0.000012, y: 6.999985 }, { x: 6.374989, y: 3.624980 }, { x: 6.499978, y: -3.499996 }]]);
            case 'PartLocation':
                return ([[{ x: -0.015621, y: -4.546889 }, { x: 2.093748, y: -4.046857 }, { x: 4.046880, y: -2.046883 }, { x: 4.562502, y: 0.015643 }, { x: 4.031251, y: 2.062522 }, { x: 2.093748, y: 4.015631 }, { x: -0.015621, y: 4.468758 }, { x: -2.031251, y: 4.000021 }, { x: -4.015620, y: 2.015618 }, { x: -4.546870, y: -0.031261 }, { x: -4.031252, y: -2.031235 }, { x: -2.046871, y: -3.999991 }]]);
            case 'Ramp':
                return ([[{ x: 13.000002, y: -13.999995 }, { x: -44.999999, y: -28.000007 }, { x: -44.999999, y: -34.000007 }, { x: -44.000000, y: -37.000007 }, { x: 16.000002, y: -21.000020 }], [{ x: 16.000002, y: -21.000020 }, { x: 25.000002, y: -24.000019 }, { x: 30.000003, y: -21.000020 }, { x: 23.000000, y: -16.000007 }, { x: 14.000001, y: -16.000007 }], [{ x: 25.000002, y: -24.000019 }, { x: 27.759382, y: -30.974457 }, { x: 30.000003, y: -31.999994 }, { x: 33.000003, y: -30.000019 }, { x: 30.000003, y: -21.000020 }], [{ x: -15.999999, y: 10.999992 }, { x: -27.999998, y: 10.999992 }, { x: -32.999999, y: 18.000017 }, { x: -32.999999, y: 25.999992 }, { x: -27.999998, y: 33.000017 }, { x: -15.999999, y: 33.000017 }, { x: -10.999997, y: 25.999992 }, { x: -10.999997, y: 18.000017 }], [{ x: -17.000001, y: 12.000017 }, { x: -7.999998, y: 2.999980 }, { x: -4.999998, y: 5.999980 }, { x: -12.999999, y: 15.000017 }], [{ x: -3.999999, y: -7.000007 }, { x: -7.999998, y: -3.000020 }, { x: -7.999998, y: 1.999992 }, { x: -3.999999, y: 7.000005 }, { x: 9.000000, y: 13.999992 }, { x: 14.000001, y: 13.999992 }, { x: 14.000001, y: 9.000017 }, { x: 6.000000, y: -6.000020 }], [{ x: -3.999999, y: -17.999982 }, { x: 12.999998, y: -13.999995 }, { x: 6.000000, y: -6.000020 }, { x: -3.999999, y: -7.000007 }]]);
            default:
                return (null);
        }
    }
    exports_19("getVertexSets", getVertexSets);
    function getPinLocations(name) {
        switch (name) {
            default:
                return (null);
        }
    }
    exports_19("getPinLocations", getPinLocations);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("parts/partbody", ["matter-js", "parts/factory", "parts/partvertices", "board/constants", "parts/fence"], function (exports_20, context_20) {
    "use strict";
    var __moduleName = context_20 && context_20.id;
    var matter_js_1, factory_1, partvertices_1, constants_1, fence_2, PartBody, PartBodyFactory;
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
            function (fence_2_1) {
                fence_2 = fence_2_1;
            }
        ],
        execute: function () {
            // this composes a part with a matter.js body which simulates it
            PartBody = class PartBody {
                constructor(part) {
                    this._body = undefined;
                    // the fence parameters last time we constructed a fence
                    this._fenceSignature = NaN;
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
                    this._bodyFlipped = false;
                    // construct the ball as a circle
                    if (this.type == 9 /* BALL */) {
                        this._body = matter_js_1.Bodies.circle(0, 0, (5 * constants_1.PART_SIZE) / 32, { density: constants_1.BALL_DENSITY, friction: constants_1.BALL_FRICTION,
                            frictionStatic: constants_1.BALL_FRICTION_STATIC,
                            collisionFilter: { category: constants_1.BALL_CATEGORY, mask: constants_1.BALL_MASK, group: 0 } });
                    }
                    else if (this._part instanceof fence_2.Fence) {
                        this._body = this._bodyForFence(this._part);
                        this._fenceSignature = this._part.signature;
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
                    if ((this._part.bodyCanRotate) && (!this._pins)) {
                        this._makeRotationConstraints();
                    }
                    // set restitution
                    this._body.restitution = this._part.bodyRestitution;
                    // perform a first update of properties from the part
                    this.updateBodyFromPart();
                }
                _makeRotationConstraints() {
                    // make constraints that bias parts and keep them from bouncing at the 
                    //  ends of their range
                    if (this._part.isCounterWeighted) {
                        this._counterweightDamper = this._makeDamper(false, true, constants_1.COUNTERWEIGHT_STIFFNESS, constants_1.COUNTERWEIGHT_DAMPING);
                    }
                    else {
                        this._biasDamper = this._makeDamper(false, false, constants_1.BIAS_STIFFNESS, constants_1.BIAS_DAMPING);
                    }
                    // make stops to confine the body's rotation
                    const constructor = factory_1.PartFactory.constructorForType(this.type);
                    this._pinLocations = partvertices_1.getPinLocations(constructor.name);
                    if (this._pinLocations) {
                        this._pins = [];
                        const options = { isStatic: true, restitution: 0,
                            collisionFilter: { category: constants_1.PIN_CATEGORY, mask: constants_1.PIN_MASK, group: 0 } };
                        for (const pinLocation of this._pinLocations) {
                            const pin = matter_js_1.Bodies.circle(pinLocation.x, pinLocation.y, pinLocation.r, options);
                            this._pins.push(pin);
                            matter_js_1.Composite.add(this._composite, pin);
                        }
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
                        { x: flipped ? constants_1.DAMPER_RADIUS : -constants_1.DAMPER_RADIUS, y: 0 } :
                        { x: 0, y: constants_1.DAMPER_RADIUS });
                }
                // transfer relevant properties to the body
                updateBodyFromPart() {
                    // skip the update if the part hasn't changed
                    if ((!this._body) || (!this._part) ||
                        (this._part.changeCounter === this._partChangeCounter))
                        return;
                    // rebuild the body if the fence signature changes
                    if ((this._part instanceof fence_2.Fence) &&
                        (this._part.signature != this._fenceSignature)) {
                        matter_js_1.Composite.remove(this._composite, this._body);
                        this._makeBody();
                    }
                    // update mirroring
                    if (this._bodyFlipped !== this._part.isFlipped) {
                        const prevAngle = this._body.angle;
                        matter_js_1.Body.setAngle(this._body, 0);
                        matter_js_1.Composite.scale(this._composite, -1, 1, this._body.position, true);
                        matter_js_1.Body.setAngle(this._body, -prevAngle);
                        this._bodyOffset.x *= -1;
                        if (this._counterweightDamper) {
                            const attachment = this._counterweightDamper.pointA;
                            attachment.x *= -1;
                        }
                        this._bodyFlipped = this._part.isFlipped;
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
                _bodyForFence(fence) {
                    const name = (fence.variant == 1 /* SIDE */) ?
                        'Fence-l' : 'Fence-s' + fence.modulus;
                    const y = -((fence.sequence % fence.modulus) / fence.modulus) * constants_1.SPACING;
                    return (this._bodyFromVertexSets(partvertices_1.getVertexSets(name), 0, y));
                }
                // construct a body from a set of vertex lists
                _bodyFromVertexSets(vertexSets, x = 0, y = 0) {
                    if (!vertexSets)
                        return (null);
                    const parts = [];
                    for (const vertices of vertexSets) {
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
                    this._controlRotation(contacts);
                    this._controlVelocity();
                    if (contacts) {
                        for (const contact of contacts) {
                            const nudged = this._nudgeBall(contact);
                            // if we've nudged a ball, don't do other stuff to it
                            if ((nudged) && (nearby))
                                nearby.delete(contact.ballPartBody);
                        }
                    }
                    if (nearby) {
                        for (const ballPartBody of nearby) {
                            this._influenceBall(ballPartBody);
                        }
                    }
                }
                // constrain the position and angle of the part to simulate 
                //  an angle-constrained revolute joint
                _controlRotation(contacts) {
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
                        if ((r <= 0.0) || (r >= 1.0)) {
                            const target = this._part.angleForRotation(Math.min(Math.max(0.0, r), 1.0));
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
                    if ((this._part.type == 3 /* RAMP */) &&
                        (this._part.rotation < 0.25) &&
                        (ball.row < this._part.row)) {
                        sign = this._part.isFlipped ? -1 : 1;
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
                            sign = bottomHalf ? 1 : 1;
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
                    else if ((this._part instanceof fence_2.Fence) &&
                        (this._part.variant == 2 /* SLOPE */)) {
                        mag = 2;
                        sign = this._part.isFlipped ? -1 : 1;
                        // the tangent is always the same for slopes, and setting it explicitly
                        //  prevents strange effect at corners
                        tangent = matter_js_1.Vector.normalise({ x: this._part.modulus * sign, y: 1 });
                        maxSlope = 1;
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
            exports_20("PartBody", PartBody);
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
            exports_20("PartBodyFactory", PartBodyFactory);
        }
    };
});
System.register("board/physics", ["pixi.js", "matter-js", "renderer", "parts/gearbit", "parts/partbody", "board/constants", "ui/animator"], function (exports_21, context_21) {
    "use strict";
    var __moduleName = context_21 && context_21.id;
    var PIXI, matter_js_2, renderer_2, gearbit_2, partbody_1, constants_2, animator_2, PhysicalBallRouter;
    return {
        setters: [
            function (PIXI_3) {
                PIXI = PIXI_3;
            },
            function (matter_js_2_1) {
                matter_js_2 = matter_js_2_1;
            },
            function (renderer_2_1) {
                renderer_2 = renderer_2_1;
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
                        renderer_2.Renderer.needsUpdate();
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
                    for (const ball of this.board.balls) {
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
                    const h = ((this.board.rowCount + 3) * constants_2.SPACING);
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
                    for (const ball of this.board.balls) {
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
                            for (let r = -1; r <= 3; r++) {
                                const part = this.board.getPart(column + c, row + r);
                                if (!part)
                                    continue;
                                addParts.add(part);
                                removeParts.delete(part);
                                neighbors.add(part);
                            }
                        }
                        // track the last column the ball was in before the current one
                        if (isNaN(ball.lastDistinctColumn))
                            ball.lastDistinctColumn = column;
                        else if (ball.lastColumn !== column) {
                            ball.lastDistinctColumn = ball.lastColumn;
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
                    animator_2.Animator.current.animate(part, 'rotation', part.rotation, part.restingRotation, 0.1);
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
                        renderer_2.Renderer.needsUpdate();
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
                    renderer_2.Renderer.needsUpdate();
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
            exports_21("PhysicalBallRouter", PhysicalBallRouter);
        }
    };
});
System.register("board/board", ["pixi-filters", "parts/fence", "parts/gearbit", "util/disjoint", "renderer", "parts/ball", "board/constants", "board/physics"], function (exports_22, context_22) {
    "use strict";
    var __moduleName = context_22 && context_22.id;
    var filter, fence_3, gearbit_3, disjoint_1, renderer_3, ball_2, constants_3, physics_1, SPACING_FACTOR, Board;
    return {
        setters: [
            function (filter_1) {
                filter = filter_1;
            },
            function (fence_3_1) {
                fence_3 = fence_3_1;
            },
            function (gearbit_3_1) {
                gearbit_3 = gearbit_3_1;
            },
            function (disjoint_1_1) {
                disjoint_1 = disjoint_1_1;
            },
            function (renderer_3_1) {
                renderer_3 = renderer_3_1;
            },
            function (ball_2_1) {
                ball_2 = ball_2_1;
            },
            function (constants_3_1) {
                constants_3 = constants_3_1;
            },
            function (physics_1_1) {
                physics_1 = physics_1_1;
            }
        ],
        execute: function () {
            exports_22("SPACING_FACTOR", SPACING_FACTOR = 1.0625);
            Board = class Board {
                constructor(partFactory) {
                    this.partFactory = partFactory;
                    this.view = new PIXI.Sprite();
                    this._layers = new PIXI.Container();
                    // the set of balls currently on the board
                    this.balls = new Set();
                    this._changeCounter = 0;
                    this._schematic = false;
                    // the speed to run the simulator at
                    this.speed = 1.0;
                    // routers to manage the positions of the balls
                    this.physicalRouter = new physics_1.PhysicalBallRouter(this);
                    this.router = this.physicalRouter;
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
                // update the board state
                update(correction) {
                    this.router.update(this.speed, correction);
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
                    renderer_3.Renderer.needsUpdate();
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
                    renderer_3.Renderer.needsUpdate();
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
                    if (this._partPrototype) {
                        this.removePart(this._partPrototype);
                        this._partPrototype.alpha = 1.0;
                        this._partPrototype.visible = true;
                    }
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
                    if (newPart instanceof gearbit_3.Gear) {
                        newPart.isOnPartLocation = ((column + row) % 2) == 0;
                    }
                    // update gear connections
                    if ((oldPart instanceof gearbit_3.GearBase) || (newPart instanceof gearbit_3.GearBase)) {
                        // disconnect the old part
                        if (oldPart instanceof gearbit_3.GearBase)
                            oldPart.connected = null;
                        // rebuild connections between gears and gearbits
                        this._connectGears();
                        // merge the new part's rotation with the connected set
                        if ((newPart instanceof gearbit_3.GearBase) && (newPart.connected)) {
                            let sum = 0.0;
                            for (const part of newPart.connected) {
                                sum += part.rotation;
                            }
                            newPart.rotation = ((sum / newPart.connected.size) >= 0.5) ? 1.0 : 0.0;
                        }
                    }
                    // update fences
                    if ((oldPart instanceof fence_3.Fence) || (newPart instanceof fence_3.Fence)) {
                        this._updateFences();
                    }
                    this.onChange();
                }
                // flip the part at the given coordinates
                flipPart(column, row) {
                    const part = this.getPart(column, row);
                    if (part instanceof fence_3.Fence) {
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
                        renderer_3.Renderer.needsUpdate();
                        this.onChange();
                    }
                }
                // get the ball under the given point in fractional column/row units
                ballUnder(column, row) {
                    const radius = (constants_3.BALL_RADIUS / constants_3.SPACING) * 1.2;
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
                    part.destroySprites();
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
                            if (part instanceof gearbit_3.GearBase)
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
                            if (part instanceof gearbit_3.GearBase) {
                                northLabel = (northPart instanceof gearbit_3.GearBase) ?
                                    northPart._connectionLabel : -1;
                                westLabel = (westPart instanceof gearbit_3.GearBase) ?
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
                            if (part instanceof fence_3.Fence) {
                                northPart = this.getPart(c, r - 1);
                                // track the parts above the ends of the slope
                                if ((northPart instanceof fence_3.Fence) &&
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
                    if (!(fence instanceof fence_3.Fence))
                        return;
                    const wasFlipped = fence.isFlipped;
                    const variant = fence.variant;
                    fence.flip();
                    // make a test function to shorten the code below
                    const shouldContinue = (part) => {
                        if ((part instanceof fence_3.Fence) && (part.isFlipped == wasFlipped) &&
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
                    if (this._action === 4 /* FLIP_PART */) {
                        this._action = 5 /* DRAG_PART */;
                    }
                    if ((this._action === 5 /* DRAG_PART */) && (this._actionPart)) {
                        if (this._actionPart instanceof ball_2.Ball)
                            this.removeBall(this._actionPart);
                        else
                            this.clearPart(this._actionColumn, this._actionRow);
                        this.partPrototype = this._actionPart;
                        this._action = 5 /* DRAG_PART */;
                        this.view.cursor = 'move';
                        this._partDragStartColumn = this._actionColumn;
                        this._partDragStartRow = this._actionRow;
                    }
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
                }
                _onDragFinish() {
                    this._dragFlippedParts.clear();
                    if ((this._action === 5 /* DRAG_PART */) && (this.partPrototype)) {
                        const part = this.partFactory.copy(this.partPrototype);
                        this.partPrototype = null;
                        if (part instanceof ball_2.Ball) {
                            this.partPrototype = null;
                            this.addBall(part, this._actionX, this._actionY);
                        }
                        else if (this.canPlacePart(part.type, this._actionColumn, this._actionRow)) {
                            this.setPart(part, this._actionColumn, this._actionRow);
                        }
                        else {
                            this.setPart(part, this._partDragStartColumn, this._partDragStartRow);
                        }
                    }
                }
                _updateAction(e) {
                    const p = e.data.getLocalPosition(this._layers);
                    this._actionPart = null;
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
                        (this._actionPart =
                            this.ballUnder(this.columnForX(p.x), this.rowForY(p.y)))) {
                        this._action = 5 /* DRAG_PART */;
                        this.view.cursor = 'move';
                    }
                    else if ((this.tool == 3 /* HAND */) &&
                        (this.canFlipPart(column, row))) {
                        this._action = 4 /* FLIP_PART */;
                        this._actionPart = this.getPart(column, row);
                        this.view.cursor = 'pointer';
                    }
                    else if ((this.tool == 3 /* HAND */) &&
                        (!this.isBackgroundPart(column, row))) {
                        this._action = 5 /* DRAG_PART */;
                        this._actionPart = this.getPart(column, row);
                        this.view.cursor = 'move';
                    }
                    else {
                        this._action = 0 /* PAN */;
                        this.view.cursor = 'auto';
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
                            this.addBall(this.partFactory.copy(this.partPrototype), this._actionX, this._actionY);
                        }
                    }
                    else if (this._action === 3 /* CLEAR_PART */) {
                        this.clearPart(this._actionColumn, this._actionRow);
                    }
                    else if (this._action === 4 /* FLIP_PART */) {
                        this.flipPart(this._actionColumn, this._actionRow);
                    }
                }
            };
            exports_22("Board", Board);
        }
    };
});
System.register("ui/button", ["pixi.js", "renderer"], function (exports_23, context_23) {
    "use strict";
    var __moduleName = context_23 && context_23.id;
    var PIXI, renderer_4, Button, PartButton, SpriteButton, ButtonBar;
    return {
        setters: [
            function (PIXI_4) {
                PIXI = PIXI_4;
            },
            function (renderer_4_1) {
                renderer_4 = renderer_4_1;
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
                    renderer_4.Renderer.needsUpdate();
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
                    renderer_4.Renderer.needsUpdate();
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
                    renderer_4.Renderer.needsUpdate();
                }
            };
            exports_23("Button", Button);
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
                    renderer_4.Renderer.needsUpdate();
                }
                onSizeChanged() {
                    super.onSizeChanged();
                    if (this.part)
                        this.part.size = Math.floor(this.size * 0.5);
                }
            };
            exports_23("PartButton", PartButton);
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
            exports_23("SpriteButton", SpriteButton);
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
                    renderer_4.Renderer.needsUpdate();
                }
            };
            exports_23("ButtonBar", ButtonBar);
        }
    };
});
System.register("ui/toolbar", ["pixi.js", "ui/button", "renderer"], function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    var PIXI, button_1, renderer_5, Toolbar;
    return {
        setters: [
            function (PIXI_5) {
                PIXI = PIXI_5;
            },
            function (button_1_1) {
                button_1 = button_1_1;
            },
            function (renderer_5_1) {
                renderer_5 = renderer_5_1;
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
                    renderer_5.Renderer.needsUpdate();
                }
            };
            exports_24("Toolbar", Toolbar);
        }
    };
});
System.register("ui/actionbar", ["pixi.js", "board/board", "ui/button", "ui/config", "renderer"], function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    var PIXI, board_2, button_2, config_1, renderer_6, Actionbar;
    return {
        setters: [
            function (PIXI_6) {
                PIXI = PIXI_6;
            },
            function (board_2_1) {
                board_2 = board_2_1;
            },
            function (button_2_1) {
                button_2 = button_2_1;
            },
            function (config_1_1) {
                config_1 = config_1_1;
            },
            function (renderer_6_1) {
                renderer_6 = renderer_6_1;
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
                    this._fasterButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['faster']));
                    this.addButton(this._fasterButton);
                    this._slowerButton = new button_2.SpriteButton(new PIXI.Sprite(board.partFactory.textures['slower']));
                    this.addButton(this._slowerButton);
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
                    else if (button === this._fasterButton) {
                        this.goFaster();
                    }
                    else if (button === this._slowerButton) {
                        this.goSlower();
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
                        else if (button == this._fasterButton) {
                            button.isEnabled = this.canGoFaster;
                        }
                        else if (button == this._slowerButton) {
                            button.isEnabled = this.canGoSlower;
                        }
                        else if (button instanceof button_2.PartButton) {
                            button.isToggled = ((this.board.tool === 1 /* PART */) &&
                                (this.board.partPrototype) &&
                                (button.part.type === this.board.partPrototype.type));
                            button.schematic = this.board.schematic;
                        }
                    }
                    renderer_6.Renderer.needsUpdate();
                }
                // SPEED CONTROL ************************************************************
                get canGoFaster() {
                    return (this.speedIndex < config_1.Speeds.length - 1);
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
                    return (config_1.Speeds.indexOf(this.board.speed));
                }
                set speedIndex(i) {
                    if ((i >= 0) && (i < config_1.Speeds.length))
                        this.board.speed = config_1.Speeds[i];
                    this.updateToggled();
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
                    return (this.zoomIndex < config_1.Zooms.length - 1);
                }
                get canZoomOut() {
                    return (this.zoomIndex > 0);
                }
                zoomIn() {
                    if (!this.canZoomIn)
                        return;
                    this.board.partSize = config_1.Zooms[this.zoomIndex + 1];
                    this._updateAutoSchematic();
                    this.updateToggled();
                }
                zoomOut() {
                    if (!this.canZoomOut)
                        return;
                    this.board.partSize = config_1.Zooms[this.zoomIndex - 1];
                    this._updateAutoSchematic();
                    this.updateToggled();
                }
                // zoom to fit the board
                zoomToFit() {
                    this.board.centerColumn = (this.board.columnCount - 1) / 2;
                    this.board.centerRow = (this.board.rowCount - 1) / 2;
                    let s = config_1.Zooms[0];
                    for (let i = config_1.Zooms.length - 1; i >= 0; i--) {
                        s = config_1.Zooms[i];
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
                    return (config_1.Zooms.indexOf(this.board.partSize));
                }
            };
            exports_25("Actionbar", Actionbar);
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
System.register("app", ["pixi.js", "board/board", "parts/factory", "ui/toolbar", "ui/actionbar", "renderer", "ui/animator", "ui/keyboard", "parts/gearbit"], function (exports_27, context_27) {
    "use strict";
    var __moduleName = context_27 && context_27.id;
    var PIXI, board_3, factory_2, toolbar_1, actionbar_1, renderer_7, animator_3, keyboard_1, gearbit_4, SimulatorApp;
    return {
        setters: [
            function (PIXI_7) {
                PIXI = PIXI_7;
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
            function (renderer_7_1) {
                renderer_7 = renderer_7_1;
            },
            function (animator_3_1) {
                animator_3 = animator_3_1;
            },
            function (keyboard_1_1) {
                keyboard_1 = keyboard_1_1;
            },
            function (gearbit_4_1) {
                gearbit_4 = gearbit_4_1;
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
                    this.toolbar.width = 64;
                    this.actionbar = new actionbar_1.Actionbar(this.board);
                    this.actionbar.width = 64;
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
                    animator_3.Animator.current.update(delta);
                    this.board.update(delta);
                    gearbit_4.GearBase.update();
                    renderer_7.Renderer.render();
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
                    w.press = () => { this.board.physicalRouter.showWireframe = true; };
                    w.release = () => { this.board.physicalRouter.showWireframe = false; };
                }
            };
            exports_27("SimulatorApp", SimulatorApp);
        }
    };
});
System.register("board/builder", ["parts/fence"], function (exports_28, context_28) {
    "use strict";
    var __moduleName = context_28 && context_28.id;
    var fence_4, BoardBuilder;
    return {
        setters: [
            function (fence_4_1) {
                fence_4 = fence_4_1;
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
                    const steps = Math.ceil(center / fence_4.Fence.maxModulus);
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
                            if (board.getPart(c, r) instanceof fence_4.Fence)
                                break;
                            board.setPart(board.partFactory.copy(blank), c, r);
                        }
                        for (c = width - 1; c >= 0; c--) {
                            if (board.getPart(c, r) instanceof fence_4.Fence)
                                break;
                            board.setPart(board.partFactory.copy(blank), c, r);
                        }
                    }
                    // make a fence to collect balls
                    r = height - 1;
                    const rightSide = Math.min(center + fence_4.Fence.maxModulus, height - 1);
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
            exports_28("BoardBuilder", BoardBuilder);
        }
    };
});
System.register("index", ["pixi.js", "app", "renderer", "board/builder"], function (exports_29, context_29) {
    "use strict";
    var __moduleName = context_29 && context_29.id;
    var PIXI, app_1, renderer_8, builder_1, sim, container, resizeApp, loader;
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
            // dynamically resize the app to track the size of the browser window
            container = document.getElementById('container');
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
                // remove the loading animation
                const loading = document.getElementById('loading');
                if (loading) {
                    loading.style.opacity = '0';
                    // clear it from the display list after the animation,
                    //  in case the browser still renders it at zero opacity
                    setTimeout(() => loading.style.display = 'none', 1000);
                }
                // attach the stage to the document and fade it in
                container.appendChild(renderer_8.Renderer.instance.view);
                container.style.opacity = '1';
                // start the game loop
                PIXI.ticker.shared.add(sim.update, sim);
            });
        }
    };
});
