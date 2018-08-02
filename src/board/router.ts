export interface IBallRouter {
  // respond to changes to the size or scale of the board
  onBoardSizeChanged():void;
  // start updating ball positions, etc.
  start():void;
  // stop updating ball positions, etc.
  stop():void;
}