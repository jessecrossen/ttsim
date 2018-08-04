export const enum Colors {
  BACKGROUND = 0xFFFFFF,  // background of the whole app
  BUTTON_BACK = 0x000000, // background of buttons when not toggled
  HIGHLIGHT = 0xFFAA00,   // general-purpose highlight color
  WIREFRAME = 0xFF0000,   // physice engine wireframe (debugging only)
  WIREFRAME_HULL = 0x00FF00,
  WIREFRAME_CONSTRAINT = 0x0000FF,
}

export const enum Alphas {
  // button states
  BUTTON_DISABLED = 0.25,
  BUTTON_NORMAL = 0.1,
  BUTTON_OVER = 0.15,
  BUTTON_DOWN = 0.3,
  // preview parts
  PREVIEW_ALPHA = 0.5,
  // wireframe body fill (debugging only)
  WIREFRAME = 0.2
}

export const enum Delays {
  FLIP = 0.25
}

export const enum Sizes {
  DRAG_THRESHOLD = 5
}

export const Zooms:number[] = 
  [ 2, 4, 6, 8, 12, 16, 24, 32, 48, 64 ];
export const Speeds:number[] = 
  [ 0.0, 0.25, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0 ];