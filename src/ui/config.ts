export const enum Colors {
  BACKGROUND = 0xFFFFFF,  // background of the whole app
  BUTTON_BACK = 0x000000, // background of buttons when not toggled
  HIGHLIGHT = 0xFFAA00,   // general-purpose highlight color
  BALL_COUNT = 0xFFFFFF,  // ball count text over a drop
  RESIZE_HINT = 0x808080, // border around board when ready to resize
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
  FLIP = 0.25,
  TURN = 0.25,
  SHOW_CONTROL = 0.1,
  HIDE_CONTROL = 0.25,
  UPDATE_URL = 0.5
}

export const enum Sizes {
  DRAG_THRESHOLD = 5,
  RESIZE_THRESHOLD = 16
}

export const Zooms:number[] = 
  [ 2, 4, 6, 8, 12, 16, 24, 32, 48, 64 ];
export const Speeds:number[] = 
  [ 0.0, 0.25, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0 ];

export const ButtonSizes:number[] = [ 16, 24, 32, 48, 64 ];

// formats a color as an HTML color code
export function htmlColor(c:number):string {
  return('#'+('000000'+c.toString(16)).substr(-6));
}

// converts an HSL color value to RGB
//  adapted from http://en.wikipedia.org/wiki/HSL_color_space
//  via https://stackoverflow.com/a/9493060/745831
export function colorFromHSL(h:number, s:number, l:number):number {
    let r, g, b;
    if (s == 0) {
      r = g = b = l; // achromatic
    }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return((Math.round(r * 255) << 16) |
           (Math.round(g * 255) << 8) |
           (Math.round(b * 255)));
}
function hue2rgb(p:number, q:number, t:number):number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return(p + (q - p) * 6 * t);
  if (t < 1/2) return(q);
  if (t < 2/3) return(p + (q - p) * (2/3 - t) * 6);
  return(p);
}