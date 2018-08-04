import { Board } from './board';

export interface IBallRouter {
  // respond to changes to the size or scale of the board
  onBoardSizeChanged():void;
  // update ball positions, etc.
  update(speed:number, correction:number):void;
}