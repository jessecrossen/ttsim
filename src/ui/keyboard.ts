export type KeyHandler = {
  key:string,
  isDown:boolean,
  isUp:boolean,
  downHandler:(event:any) => void,
  upHandler:(event:any) => void,
  press?:() => void,
  release?:() => void
};

export function makeKeyHandler(key:string) {
  const handler:KeyHandler = {
    key: key,
    isDown: false,
    isUp: true,
    downHandler: (event:any) => {
      if (event.key === handler.key) {
        if ((handler.isUp) && (handler.press)) handler.press();
        handler.isDown = true;
        handler.isUp = false;
        event.preventDefault();
      }
    },
    upHandler: (event:any) => {
      if (event.key === handler.key) {
        if ((handler.isDown) && (handler.release)) handler.release();
        handler.isDown = false;
        handler.isUp = true;
        event.preventDefault();
      }
    }
  };

  //Attach event listeners
  window.addEventListener('keydown', handler.downHandler.bind(handler), false);
  window.addEventListener('keyup', handler.upHandler.bind(handler), false);
  return(handler);
}