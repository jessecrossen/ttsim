export interface IBallRouter {
  // respond to parts on the board changing
  onBoardChanged():void;
  // respond to changes to the size of parts
  onPartSizeChanged():void;
}