
import { TetrisBoard, TetrisPiece, GridSettings } from '@/types/tetris';

export const FIRE_BLOCK_TYPE = 15;

export const createFireBlock = (gridSettings?: GridSettings): TetrisPiece => {
  const boardWidth = gridSettings?.width || 10;
  
  // Randomly assign a color (1-7 are the standard piece colors)
  const fireColor = Math.floor(Math.random() * 7) + 1;
  
  return {
    shape: [[FIRE_BLOCK_TYPE]],
    row: 0,
    col: Math.floor(boardWidth / 2),
    type: FIRE_BLOCK_TYPE,
    rarity: 'legendary',
    fireColor // Store the color this fire block will burn
  };
};

export const placeFireBlock = (
  board: TetrisBoard, 
  piece: TetrisPiece, 
  gridSettings: GridSettings
): TetrisBoard => {
  // Place the fire block on the board first
  const newBoard = board.map(row => [...row]);
  const fireRow = piece.row;
  const fireCol = piece.col;
  
  // Place the fire block
  newBoard[fireRow][fireCol] = FIRE_BLOCK_TYPE;
  
  // Apply fire effect if the piece has a fire color
  if (piece.fireColor) {
    return applyFireEffect(newBoard, fireRow, fireCol, piece.fireColor);
  }
  
  return newBoard;
};

export const applyFireEffect = (
  board: TetrisBoard, 
  fireRow: number, 
  fireCol: number, 
  fireColor: number,
  onBoardUpdate?: (newBoard: TetrisBoard) => void
): TetrisBoard => {
  const newBoard = board.map(row => [...row]);
  const boardHeight = board.length;
  const boardWidth = board[0]?.length || 10;
  
  // Define fire radius (1 block in each direction)
  const fireRadius = 1;
  
  // Remove all blocks of the same color within radius
  for (let row = Math.max(0, fireRow - fireRadius); row <= Math.min(boardHeight - 1, fireRow + fireRadius); row++) {
    for (let col = Math.max(0, fireCol - fireRadius); col <= Math.min(boardWidth - 1, fireCol + fireRadius); col++) {
      // Calculate distance from fire center
      const distance = Math.abs(row - fireRow) + Math.abs(col - fireCol);
      
      // Only affect blocks within radius and of matching color
      if (distance <= fireRadius && newBoard[row][col] === fireColor) {
        newBoard[row][col] = 0; // Burn the block
      }
    }
  }
  
  // Apply gravity after burning
  const gravityBoard = applyGravityAfterFire(newBoard);
  
  // Start continuous burning effect for 3 seconds
  if (onBoardUpdate) {
    startContinuousBurning(gravityBoard, fireRow, fireCol, fireColor, onBoardUpdate);
  }
  
  return gravityBoard;
};

const startContinuousBurning = (
  board: TetrisBoard,
  fireRow: number,
  fireCol: number,
  fireColor: number,
  onBoardUpdate: (newBoard: TetrisBoard) => void
) => {
  let burnCount = 0;
  const maxBurns = 2; // Burn 2 more blocks over 3 seconds
  const burnInterval = 1500; // 1.5 seconds between burns
  
  const burnTimer = setInterval(() => {
    if (burnCount >= maxBurns) {
      clearInterval(burnTimer);
      return;
    }
    
    const newBoard = board.map(row => [...row]);
    const boardHeight = board.length;
    const boardWidth = board[0]?.length || 10;
    let blocksBurned = false;
    
    // Find blocks of matching color within 2-block radius for continuous burning
    const searchRadius = 2;
    for (let row = Math.max(0, fireRow - searchRadius); row <= Math.min(boardHeight - 1, fireRow + searchRadius); row++) {
      for (let col = Math.max(0, fireCol - searchRadius); col <= Math.min(boardWidth - 1, fireCol + searchRadius); col++) {
        const distance = Math.abs(row - fireRow) + Math.abs(col - fireCol);
        
        if (distance <= searchRadius && newBoard[row][col] === fireColor && !blocksBurned) {
          newBoard[row][col] = 0;
          blocksBurned = true;
          break;
        }
      }
      if (blocksBurned) break;
    }
    
    if (blocksBurned) {
      const gravityBoard = applyGravityAfterFire(newBoard);
      onBoardUpdate(gravityBoard);
    }
    
    burnCount++;
  }, burnInterval);
};

const applyGravityAfterFire = (board: TetrisBoard): TetrisBoard => {
  const newBoard = board.map(row => [...row]);
  const boardHeight = board.length;
  const boardWidth = board[0]?.length || 10;
  
  // Apply gravity column by column
  for (let col = 0; col < boardWidth; col++) {
    // Extract all non-zero blocks in this column
    const blocks = [];
    for (let row = boardHeight - 1; row >= 0; row--) {
      if (newBoard[row][col] !== 0) {
        blocks.push(newBoard[row][col]);
        newBoard[row][col] = 0;
      }
    }
    
    // Place blocks at the bottom, maintaining their order
    let targetRow = boardHeight - 1;
    for (let i = 0; i < blocks.length; i++) {
      newBoard[targetRow][col] = blocks[i];
      targetRow--;
    }
  }
  
  return newBoard;
};
