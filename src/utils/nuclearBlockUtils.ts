
import { TetrisPiece, TetrisBoard, GridSettings } from '@/types/tetris';

export const NUCLEAR_BLOCK_TYPE = 14;

export const createNuclearBlock = (gridSettings?: GridSettings): TetrisPiece => {
  const boardWidth = gridSettings?.width || 10;
  
  // 2x2 nuclear block shape
  const nuclearShape = [
    [NUCLEAR_BLOCK_TYPE, NUCLEAR_BLOCK_TYPE],
    [NUCLEAR_BLOCK_TYPE, NUCLEAR_BLOCK_TYPE]
  ];
  
  return {
    shape: nuclearShape,
    row: 0,
    col: Math.floor(boardWidth / 2) - 1, // Center the 2x2 block
    type: NUCLEAR_BLOCK_TYPE,
    rarity: 'legendary',
    isNuclear: true
  };
};

export const applyNuclearExplosion = (board: TetrisBoard): TetrisBoard => {
  // Nuclear explosion clears ALL blocks on the board
  return board.map(row => row.map(() => 0));
};

export const placeNuclearBlock = (board: TetrisBoard, piece: TetrisPiece, gridSettings: GridSettings): TetrisBoard => {
  // Nuclear blocks explode immediately when they touch any existing block or the bottom
  let hasContact = false;
  
  // Check if nuclear block touches existing blocks or bottom
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] !== 0) {
        const boardRow = piece.row + row;
        const boardCol = piece.col + col;
        
        // Check if touching bottom
        if (boardRow >= gridSettings.height - 1) {
          hasContact = true;
          break;
        }
        
        // Check if touching existing blocks
        if (boardRow + 1 < gridSettings.height && 
            boardCol >= 0 && boardCol < gridSettings.width &&
            board[boardRow + 1][boardCol] !== 0) {
          hasContact = true;
          break;
        }
      }
    }
    if (hasContact) break;
  }
  
  if (hasContact) {
    // Nuclear explosion - clear all blocks
    return applyNuclearExplosion(board);
  } else {
    // Place normally if not touching anything yet
    const newBoard = board.map(row => [...row]);
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] !== 0) {
          const boardRow = piece.row + row;
          const boardCol = piece.col + col;
          
          if (boardRow >= 0 && boardRow < gridSettings.height && 
              boardCol >= 0 && boardCol < gridSettings.width) {
            newBoard[boardRow][boardCol] = NUCLEAR_BLOCK_TYPE;
          }
        }
      }
    }
    
    return newBoard;
  }
};
