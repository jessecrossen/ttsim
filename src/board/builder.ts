import { Board } from 'board/board';
import { PartType } from 'parts/factory';
import { Fence } from 'parts/fence';
import { Drop } from 'parts/drop';

export class BoardBuilder {

  public static initStandardBoard(board:Board,
      redBlueDistance:number=5, verticalDrop:number=11):void {
    let r:number, c:number, run:number;
    const width:number = (redBlueDistance * 2) + 3;
    const center:number = Math.floor(width / 2);
    const blueColumn:number = center - Math.floor(redBlueDistance / 2);
    const redColumn:number = center + Math.floor(redBlueDistance / 2);
    const dropLevel:number = (blueColumn % 2 == 0) ? 1 : 0;
    const collectLevel:number = dropLevel + verticalDrop;
    const steps:number = Math.ceil(center / Fence.maxModulus);
    const maxModulus:number = Math.ceil(center / steps);
    const height:number = collectLevel + steps + 2;
    board.setSize(width, height);
    // block out unreachable locations at the top
    const blank = board.partFactory.make(PartType.BLANK);
    blank.isLocked = true;
    for (r = 0; r < height; r++) {
      for (c = 0; c < width; c++) {
        const blueCantReach:boolean = 
          ((r + c) < (blueColumn + dropLevel)) || 
          ((c - r) > (blueColumn - dropLevel));
        const redCantReach:boolean = 
          ((r + c) < (redColumn + dropLevel)) || 
          ((c - r) > (redColumn - dropLevel));
        if ((blueCantReach && redCantReach) || (r <= dropLevel)) {
          board.setPart(board.partFactory.copy(blank), c, r);
        }
      }
    }
    // add fences on the sides
    const fence = board.partFactory.make(PartType.FENCE);
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
      if (run >= maxModulus) { r++; run = 0; }
      board.setPart(board.partFactory.copy(fence), c, r);
    }
    r = collectLevel;
    run = 0;
    for (c = width - 1; c > center; c--, run++) {
      if (run >= maxModulus) { r++; run = 0; }
      board.setPart(board.partFactory.copy(flippedFence), c, r);
    }
    // block out the unreachable locations at the bottom
    for (r = collectLevel; r < height; r++) {
      for (c = 0; c < width; c++) {
        if (board.getPart(c, r) instanceof Fence) break;
        board.setPart(board.partFactory.copy(blank), c, r);
      }
      for (c = width - 1; c >= 0; c--) {
        if (board.getPart(c, r) instanceof Fence) break;
        board.setPart(board.partFactory.copy(blank), c, r);
      }
    }
    // make a fence to collect balls
    r = height - 1;
    const rightSide:number = Math.min(center + Fence.maxModulus, height - 1);
    for (c = center; c < rightSide; c++) {
      board.setPart(board.partFactory.copy(fence), c, r);
    }
    board.setPart(board.partFactory.copy(fence), rightSide, r);
    board.setPart(board.partFactory.copy(fence), rightSide, r - 1);
    // make a ball drops
    const blueDrop:Drop = board.partFactory.make(PartType.DROP) as Drop;
    board.setPart(blueDrop, blueColumn - 1, dropLevel);
    const redDrop:Drop = board.partFactory.make(PartType.DROP) as Drop;
    redDrop.isFlipped = true;
    board.setPart(redDrop, redColumn + 1, dropLevel);
  }

}