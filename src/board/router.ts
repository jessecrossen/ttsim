import { Ball } from 'parts/ball';

export interface IBallRouter {
  // respond to changes to the size or scale of the board
  onBoardSizeChanged():void;
  // update ball positions, etc.
  update(speed:number, correction:number):void;
  // the set of balls to route
  balls:Set<Ball>;
}