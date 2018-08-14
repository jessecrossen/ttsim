import { Board } from 'board/board';
import { PartType } from 'parts/factory';
import { Slope, Side } from 'parts/fence';
import { Drop } from 'parts/drop';

export class BoardBuilder {

  public static initStandardBoard(board:Board,
      redBlueDistance:number=5, verticalDrop:number=11):void {
    let r:number, c:number, run:number;
    const width:number = (redBlueDistance * 2) + 3;
    const center:number = Math.floor(width / 2);
    const blueColumn:number = center - Math.floor(redBlueDistance / 2);
    const redColumn:number = center + Math.floor(redBlueDistance / 2);
    const dropLevel:number = (blueColumn % 2 == 0) ? 1 : 2;
    const collectLevel:number = dropLevel + verticalDrop;
    const steps:number = Math.ceil(center / Slope.maxModulus);
    const maxModulus:number = Math.ceil(center / steps);
    const height:number = collectLevel + steps + 4;
    board.bulkUpdate = true;
    board.setSize(width, height, false);
    board.clear(true);
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
    const side = board.partFactory.make(PartType.SIDE);
    side.isLocked = true;
    const flippedSide = board.partFactory.copy(side);
    flippedSide.flip();
    for (r = dropLevel - 1; r < collectLevel; r++) {
      board.setPart(board.partFactory.copy(side), 0, r);
      board.setPart(board.partFactory.copy(flippedSide), width - 1, r);
    }
    // add collection slopes at the bottom
    const slope = board.partFactory.make(PartType.SLOPE);
    slope.isLocked = true;
    const flippedSlope = board.partFactory.copy(slope);
    flippedSlope.flip();
    r = collectLevel;
    run = 0;
    for (c = 0; c < center - 1; c++, run++) {
      if (run >= maxModulus) { r++; run = 0; }
      board.setPart(board.partFactory.copy(slope), c, r);
    }
    r = collectLevel;
    run = 0;
    for (c = width - 1; c > center + 1; c--, run++) {
      if (run >= maxModulus) { r++; run = 0; }
      board.setPart(board.partFactory.copy(flippedSlope), c, r);
    }
    const turnstileLevel = r + 1;
    // add hoppers for extra balls
    board.setPart(board.partFactory.copy(slope), blueColumn - 2, dropLevel - 1);
    board.setPart(board.partFactory.copy(flippedSlope), blueColumn, dropLevel - 1);
    board.setPart(board.partFactory.copy(slope), redColumn, dropLevel - 1);
    board.setPart(board.partFactory.copy(flippedSlope), redColumn + 2, dropLevel - 1);
    // block out the unreachable locations at the bottom
    for (r = collectLevel; r < height; r++) {
      for (c = 0; c < width; c++) {
        const p = board.getPart(c, r);
        if ((p instanceof Side) || (p instanceof Slope)) break;
        board.setPart(board.partFactory.copy(blank), c, r);
      }
      for (c = width - 1; c >= 0; c--) {
        const p = board.getPart(c, r);
        if ((p instanceof Side) || (p instanceof Slope)) break;
        board.setPart(board.partFactory.copy(blank), c, r);
      }
    }
    // make a fence to collect balls
    const rightSide:number = center + Slope.maxModulus;
    for (c = center; c < rightSide; c++) {
      board.setPart(board.partFactory.copy(slope), c, height - 1);
      board.setPart(board.partFactory.copy(flippedSlope), c, height - 3);
    }
    for (r = height - 3; r <= height - 1; r++) {
      board.setPart(board.partFactory.copy(side), rightSide, r);
    }
    board.setPart(board.partFactory.copy(slope), center - 1, height - 2);
    board.setPart(board.partFactory.copy(slope), center - 2, height - 3);
    // make ball drops
    const blueDrop:Drop = board.partFactory.make(PartType.DROP) as Drop;
    board.setPart(blueDrop, blueColumn - 1, dropLevel);
    blueDrop.hue = 220;
    blueDrop.isLocked = true;
    const redDrop:Drop = board.partFactory.make(PartType.DROP) as Drop;
    redDrop.isFlipped = true;
    board.setPart(redDrop, redColumn + 1, dropLevel);
    redDrop.hue = 0;
    redDrop.isLocked = true;
    // add balls
    board.setDropBallCount(blueDrop, 8);
    board.setDropBallCount(redDrop, 8);
    // make turnstiles
    const blueTurnstile = board.partFactory.make(PartType.TURNSTILE);
    blueTurnstile.isLocked = true;
    board.setPart(blueTurnstile, center - 1, turnstileLevel);
    const redTurnstile = board.partFactory.make(PartType.TURNSTILE);
    redTurnstile.isLocked = true;
    redTurnstile.isFlipped = true;
    board.setPart(redTurnstile, center + 1, turnstileLevel);
    board.bulkUpdate = false;
  }

}