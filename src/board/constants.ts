// the canonical part size the simulator runs at
export const PART_SIZE:number = 64;
export const SPACING:number = 68;

export const PART_DENSITY:number = 0.100;
export const BALL_DENSITY:number = 0.008;

// damping/counterweight constraint parameters
export const DAMPER_RADIUS:number = PART_SIZE / 2;
export const BIAS_STIFFNESS:number = BALL_DENSITY / 16;
export const BIAS_DAMPING:number = 0.3;
export const COUNTERWEIGHT_STIFFNESS:number = BALL_DENSITY / 8;
export const COUNTERWEIGHT_DAMPING:number = 0.3;

// collision filtering categories
export const DEFAULT_MASK:number = 0xFFFFFF;
export const PART_CATEGORY:number = 0x0001;
export const PART_MASK:number = DEFAULT_MASK;
export const BALL_CATEGORY:number = 0x0002;
export const BALL_MASK:number = DEFAULT_MASK;
export const PIN_CATEGORY:number = 0x0004;
export const PIN_MASK:number = PART_CATEGORY;