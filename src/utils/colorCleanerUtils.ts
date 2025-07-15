
import { TetrisPiece, TetrisBoard, GridSettings } from '@/types/tetris';
import { TETRIS_PIECES } from './tetrisUtils';

export const COLOR_CLEANER_BLOCK_TYPE = 16;

export const createColorCleanerBlock = (gridSettings?: GridSettings): TetrisPiece => {
  const boardWidth = gridSettings?.width || 10;
  
  // Random color for the color cleaner (1-7 for original piece colors)
  const randomColor = Math.floor(Math.random() * 7) + 1;
  
  return {
    shape: [[COLOR_CLEANER_BLOCK_TYPE]], // Single 1x1 block
    row: 0,
    col: Math.floor(boardWidth / 2),
    type: COLOR_CLEANER_BLOCK_TYPE,
    rarity: 'legendary',
    isColorCleaner: true,
    fireColor: randomColor // Reuse fireColor property to store the target color
  };
};

export const applyColorCleanerEffect = (board: TetrisBoard, targetColor: number): TetrisBoard => {
  const newBoard = board.map(row => [...row]);
  
  // Remove all blocks of the target color
  for (let row = 0; row < newBoard.length; row++) {
    for (let col = 0; col < newBoard[row].length; col++) {
      if (newBoard[row][col] === targetColor) {
        newBoard[row][col] = 0;
      }
    }
  }
  
  return newBoard;
};

export const placeColorCleanerBlock = (board: TetrisBoard, piece: TetrisPiece, gridSettings: GridSettings): TetrisBoard => {
  // Color cleaner deletes itself when touching any other block, so we don't place it
  // We only apply the color cleaner effect if it has a target color
  if (piece.fireColor !== undefined) {
    return applyColorCleanerEffect(board, piece.fireColor);
  }
  
  return board;
};
