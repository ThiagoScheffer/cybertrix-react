
import { TetrisPiece, TetrisBoard, GridSettings } from '@/types/tetris';
import { TETRIS_PIECES } from './tetrisUtils';

export const ACID_BLOCK_TYPE = 15;

export const createAcidBlock = (gridSettings?: GridSettings): TetrisPiece => {
  const boardWidth = gridSettings?.width || 10;
  
  // Single 1x1 acid block
  const acidShape = [[ACID_BLOCK_TYPE]];
  
  return {
    shape: acidShape,
    row: 0,
    col: Math.floor(boardWidth / 2), // Center the single block
    type: ACID_BLOCK_TYPE,
    rarity: 'rare',
    isAcid: true
  };
};

export const applyAcidEffect = (board: TetrisBoard, pieceRow: number, pieceCol: number, pieceShape: number[][], gridSettings: GridSettings): TetrisBoard => {
  const newBoard = board.map(row => [...row]);
  
  // Find the bottom row of the acid piece
  let bottomRow = pieceRow;
  for (let row = pieceShape.length - 1; row >= 0; row--) {
    if (pieceShape[row].some(cell => cell !== 0)) {
      bottomRow = pieceRow + row;
      break;
    }
  }
  
  // Melt 4 blocks below the acid piece in the same column
  const acidCol = pieceCol; // Single block column
  
  for (let melted = 0; melted < 4; melted++) {
    const targetRow = bottomRow + 1 + melted;
    
    if (targetRow >= gridSettings.height) break;
    
    // Melt block in the same column as the acid piece
    if (acidCol >= 0 && acidCol < gridSettings.width && 
        targetRow >= 0 && targetRow < gridSettings.height) {
      newBoard[targetRow][acidCol] = 0; // Melt the block
    }
  }
  
  // Apply gravity to make blocks fall after melting
  return applyGravityToBoard(newBoard, gridSettings);
};

const applyGravityToBoard = (board: TetrisBoard, gridSettings: GridSettings): TetrisBoard => {
  const newBoard = board.map(row => [...row]);
  
  // Apply gravity column by column
  for (let col = 0; col < gridSettings.width; col++) {
    // Collect all non-empty blocks in this column
    const blocks = [];
    for (let row = gridSettings.height - 1; row >= 0; row--) {
      if (newBoard[row][col] !== 0) {
        blocks.push(newBoard[row][col]);
        newBoard[row][col] = 0; // Clear the position
      }
    }
    
    // Place blocks at the bottom of the column
    for (let i = 0; i < blocks.length; i++) {
      const targetRow = gridSettings.height - 1 - i;
      newBoard[targetRow][col] = blocks[i];
    }
  }
  
  return newBoard;
};

export const placeAcidBlock = (board: TetrisBoard, piece: TetrisPiece, gridSettings: GridSettings): TetrisBoard => {
  // First place the acid block normally
  const newBoard = board.map(row => [...row]);
  
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] !== 0) {
        const boardRow = piece.row + row;
        const boardCol = piece.col + col;
        
        if (boardRow >= 0 && boardRow < gridSettings.height && 
            boardCol >= 0 && boardCol < gridSettings.width) {
          newBoard[boardRow][boardCol] = ACID_BLOCK_TYPE;
        }
      }
    }
  }
  
  // Then apply acid melting effect with gravity
  return applyAcidEffect(newBoard, piece.row, piece.col, piece.shape, gridSettings);
};
