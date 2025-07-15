import { TetrisPiece, TetrisBoard, GridSettings } from '@/types/tetris';
import { createFireBlock, applyFireEffect, FIRE_BLOCK_TYPE } from './fireBlockUtils';
import { createNuclearBlock, NUCLEAR_BLOCK_TYPE } from './nuclearBlockUtils';
import { createAcidBlock, placeAcidBlock, ACID_BLOCK_TYPE } from './acidBlockUtils';
import { createColorCleanerBlock, COLOR_CLEANER_BLOCK_TYPE } from './colorCleanerUtils';

export const TETRIS_PIECES = [
  // Original pieces (types 1-7)
  { type: 1, shape: [[1, 1, 1, 1]] }, // I
  { type: 2, shape: [[2, 2], [2, 2]] }, // O
  { type: 3, shape: [[0, 3, 0], [3, 3, 3]] }, // T
  { type: 4, shape: [[0, 4, 4], [4, 4, 0]] }, // S
  { type: 5, shape: [[5, 5, 0], [0, 5, 5]] }, // Z
  { type: 6, shape: [[6, 0, 0], [6, 6, 6]] }, // J
  { type: 7, shape: [[0, 0, 7], [7, 7, 7]] }, // L
  
  // Advanced pieces (types 9-12) - available from level 11+
  { type: 9, shape: [[9, 9, 9], [0, 9, 0], [0, 9, 0]] }, // T-shape
  { type: 10, shape: [[10, 10, 10], [10, 0, 0], [10, 0, 0]] }, // F-shape
  { type: 11, shape: [[11, 0, 11], [11, 11, 11]] }, // U-shape
  { type: 12, shape: [[12, 12, 12], [12, 0, 0], [12, 12, 12]] }, // E-shape
];

export const createEmptyBoard = (gridSettings: GridSettings): TetrisBoard => {
  return Array(gridSettings.height).fill(null).map(() => Array(gridSettings.width).fill(0));
};

export const getGridDimensions = (format: 'standard' | 'wide'): GridSettings => {
  switch (format) {
    case 'wide':
      return { width: 20, height: 40, format: 'wide' };
    case 'standard':
    default:
      return { width: 10, height: 20, format: 'standard' };
  }
};

export const createRandomPiece = (gridSettings: GridSettings, currentLevel: number = 1): TetrisPiece => {
  // Check for color cleaner block after level 10 (1% chance)
  if (currentLevel >= 10 && Math.random() < 0.01) {
    return createColorCleanerBlock(gridSettings);
  }
  
  // Check for nuclear block after level 13 (1% chance)
  if (currentLevel >= 13 && Math.random() < 0.01) {
    return createNuclearBlock(gridSettings);
  }
  
  // Determine available pieces based on level
  let availablePieces = TETRIS_PIECES.slice(0, 7); // Standard pieces (1-7)
  
  // Add advanced pieces from level 11+
  if (currentLevel >= 11) {
    const advancedPieces = TETRIS_PIECES.slice(7); // Advanced pieces (9-12)
    
    // Progressive introduction: more advanced pieces as level increases
    const advancedChance = Math.min(0.3, (currentLevel - 10) * 0.05); // Max 30% chance
    
    if (Math.random() < advancedChance) {
      availablePieces = advancedPieces;
    }
  }
  
  const randomPiece = availablePieces[Math.floor(Math.random() * availablePieces.length)];
  const boardWidth = gridSettings?.width || 10;
  
  const piece: TetrisPiece = {
    shape: randomPiece.shape.map(row => [...row]),
    row: 0,
    col: Math.floor(boardWidth / 2) - Math.floor(randomPiece.shape[0].length / 2),
    type: randomPiece.type,
    isAdvanced: randomPiece.type >= 9 // Mark advanced pieces
  };

  return piece;
};

export const createSpecialPiece = (board: TetrisBoard, gridSettings: GridSettings, level: number): TetrisPiece => {
  const specialTypes = ['neutrino', 'fire', 'acid'];
  const randomType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
  
  switch (randomType) {
    case 'neutrino':
      return createNeutrinoPiece(gridSettings);
    case 'fire':
      return createFireBlock(gridSettings);
    case 'acid':
      return createAcidBlock(gridSettings);
    default:
      return createNeutrinoPiece(gridSettings);
  }
};

export const createRainbowPiece = (gridSettings?: GridSettings): TetrisPiece => {
  const randomPiece = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)];
  const boardWidth = gridSettings?.width || 10;
  
  return {
    shape: randomPiece.shape.map(row => [...row]),
    row: 0,
    col: Math.floor(boardWidth / 2) - Math.floor(randomPiece.shape[0].length / 2),
    type: 8, // Rainbow type
  };
};

export const createNeutrinoPiece = (gridSettings?: GridSettings): TetrisPiece => {
  // Neutrino block is always a single 1x1 block that phases through
  const boardWidth = gridSettings?.width || 10;
  
  return {
    shape: [[50]], // Single block with unique type for neutrino
    row: 0,
    col: Math.floor(boardWidth / 2),
    type: 50, // Unique type for neutrino blocks
    isNeutrino: true,
    rarity: 'rare'
  };
};

export const createRarityBasedSpecialPiece = (board: TetrisBoard, targetRarity?: string, gridSettings?: GridSettings): TetrisPiece => {
  const rarities = ['uncommon', 'rare', 'legendary'];
  const rarity = targetRarity || rarities[Math.floor(Math.random() * rarities.length)];
  
  let piece: TetrisPiece;
  
  if (rarity === 'legendary') {
    const legendaryOptions = Math.random();
    if (legendaryOptions < 0.6) {
      // 60% chance for fire block at legendary rarity
      piece = createFireBlock(gridSettings);
    } else if (legendaryOptions < 0.8) {
      // 20% chance for color cleaner block at legendary rarity
      piece = createColorCleanerBlock(gridSettings);
    } else {
      // 20% chance for standard legendary piece
      const randomPiece = TETRIS_PIECES[Math.floor(Math.random() * 7)];
      const boardWidth = gridSettings?.width || 10;
      
      piece = {
        shape: randomPiece.shape.map(row => [...row]),
        row: 0,
        col: Math.floor(boardWidth / 2) - Math.floor(randomPiece.shape[0].length / 2),
        type: randomPiece.type,
        rarity: 'legendary'
      };
    }
  } else if (rarity === 'rare' && Math.random() < 0.3) {
    // 30% chance for acid block at rare rarity
    piece = createAcidBlock(gridSettings);
  } else {
    // Standard rarity piece
    const randomPiece = TETRIS_PIECES[Math.floor(Math.random() * 7)];
    const boardWidth = gridSettings?.width || 10;
    
    piece = {
      shape: randomPiece.shape.map(row => [...row]),
      row: 0,
      col: Math.floor(boardWidth / 2) - Math.floor(randomPiece.shape[0].length / 2),
      type: randomPiece.type,
      rarity: rarity as 'uncommon' | 'rare' | 'legendary'
    };
  }
  
  return piece;
};

export const createAiOptimizedPiece = (board: TetrisBoard, gridSettings: GridSettings, level: number): TetrisPiece => {
  const topGaps = analyzeTopGridGaps(board, gridSettings);
  const optimalPiece = generateOptimalPieceForGaps(topGaps, gridSettings);
  const boardWidth = gridSettings?.width || 10;
  
  return {
    shape: optimalPiece.shape.map(row => [...row]),
    row: 0,
    col: Math.floor(boardWidth / 2) - Math.floor(optimalPiece.shape[0].length / 2),
    type: optimalPiece.type,
    aiGenerated: true,
    rarity: 'rare'
  };
};

export const analyzeTopGridGaps = (board: TetrisBoard, gridSettings: GridSettings) => {
  const topRows = 8; // Analyze top 8 rows for gap patterns
  const gapPatterns = [];
  
  // Find gap patterns in the top section of the grid
  for (let row = 0; row < Math.min(topRows, board.length); row++) {
    const rowGaps = [];
    let gapStart = -1;
    
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        if (gapStart === -1) gapStart = col;
      } else {
        if (gapStart !== -1) {
          rowGaps.push({
            start: gapStart,
            end: col - 1,
            width: col - gapStart,
            row: row
          });
          gapStart = -1;
        }
      }
    }
    
    // Handle gap at end of row
    if (gapStart !== -1) {
      rowGaps.push({
        start: gapStart,
        end: board[row].length - 1,
        width: board[row].length - gapStart,
        row: row
      });
    }
    
    gapPatterns.push(...rowGaps);
  }
  
  return gapPatterns;
};

export const generateOptimalPieceForGaps = (gaps: any[], gridSettings: GridSettings) => {
  if (gaps.length === 0) {
    // No gaps found, return a random piece
    return TETRIS_PIECES[Math.floor(Math.random() * 7)];
  }
  
  // Find the most significant gap pattern
  const largestGap = gaps.reduce((max, gap) => gap.width > max.width ? gap : max, gaps[0]);
  
  // Generate custom piece shape based on gap pattern
  let customShape;
  const pieceType = 99; // Special AI-generated piece type
  
  if (largestGap.width === 1) {
    // Single column gap - create I-piece
    customShape = [[pieceType, pieceType, pieceType, pieceType]];
  } else if (largestGap.width === 2) {
    // Two column gap - create O-piece or I-piece
    if (Math.random() < 0.5) {
      customShape = [[pieceType, pieceType], [pieceType, pieceType]];
    } else {
      customShape = [[pieceType, pieceType]];
    }
  } else if (largestGap.width === 3) {
    // Three column gap - create T-piece or straight piece
    if (Math.random() < 0.7) {
      customShape = [[0, pieceType, 0], [pieceType, pieceType, pieceType]];
    } else {
      customShape = [[pieceType, pieceType, pieceType]];
    }
  } else if (largestGap.width >= 4) {
    // Large gap - create custom shape to fill efficiently
    if (largestGap.width === 4) {
      customShape = [[pieceType, pieceType, pieceType, pieceType]];
    } else {
      // For very large gaps, create a more complex shape
      customShape = [
        [pieceType, pieceType, pieceType],
        [0, pieceType, 0],
        [0, pieceType, 0]
      ];
    }
  } else {
    // Fallback to standard piece
    return TETRIS_PIECES[2]; // T-piece
  }
  
  return {
    type: pieceType,
    shape: customShape
  };
};

export const analyzeBoard = (board: TetrisBoard) => {
  const gaps = [];
  const heights = [];
  
  for (let col = 0; col < board[0].length; col++) {
    let height = 0;
    let gapCount = 0;
    
    for (let row = board.length - 1; row >= 0; row--) {
      if (board[row][col] !== 0) {
        height = board.length - row;
        break;
      }
    }
    
    for (let row = board.length - height; row < board.length; row++) {
      if (board[row][col] === 0) {
        gapCount++;
      }
    }
    
    heights.push(height);
    gaps.push(gapCount);
  }
  
  return { gaps, heights };
};

export const findOptimalPieceForGaps = (analysis: { gaps: number[]; heights: number[] }) => {
  const { gaps, heights } = analysis;
  const maxGaps = Math.max(...gaps);
  const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;
  
  if (maxGaps > 2) {
    return TETRIS_PIECES[0]; // I piece for filling large gaps
  } else if (avgHeight > 15) {
    return TETRIS_PIECES[2]; // T piece for complex fitting
  } else {
    return TETRIS_PIECES[1]; // O piece as safe default
  }
};

export const isValidMove = (board: TetrisBoard, piece: TetrisPiece, gridSettings: GridSettings): boolean => {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] !== 0) {
        const newRow = piece.row + row;
        const newCol = piece.col + col;
        
        if (newRow < 0 || newRow >= gridSettings.height || 
            newCol < 0 || newCol >= gridSettings.width || 
            board[newRow][newCol] !== 0) {
          return false;
        }
      }
    }
  }
  return true;
};

export const placePiece = (board: TetrisBoard, piece: TetrisPiece, gridSettings: GridSettings): TetrisBoard => {
  const newBoard = board.map(row => [...row]);
  
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] !== 0) {
        const boardRow = piece.row + row;
        const boardCol = piece.col + col;
        
        if (boardRow >= 0 && boardRow < gridSettings.height && 
            boardCol >= 0 && boardCol < gridSettings.width) {
          newBoard[boardRow][boardCol] = piece.shape[row][col];
        }
      }
    }
  }
  
  return newBoard;
};

export const placeNeutrinoPiece = (board: TetrisBoard, piece: TetrisPiece, gridSettings: GridSettings): TetrisBoard => {
  const landingPosition = findNeutrinoLandingPosition(board, piece, gridSettings);
  const newBoard = board.map(row => [...row]);
  
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] !== 0) {
        const boardRow = landingPosition.row + row;
        const boardCol = landingPosition.col + col;
        
        if (boardRow >= 0 && boardRow < gridSettings.height && 
            boardCol >= 0 && boardCol < gridSettings.width) {
          newBoard[boardRow][boardCol] = piece.shape[row][col];
        }
      }
    }
  }
  
  return newBoard;
};

export const placeFireBlock = (board: TetrisBoard, piece: TetrisPiece, gridSettings: GridSettings): TetrisBoard => {
  // First place the fire block normally
  let newBoard = placePiece(board, piece, gridSettings);
  
  // Then apply fire effect if it has a fireColor
  if (piece.fireColor !== undefined) {
    newBoard = applyFireEffect(newBoard, piece.row, piece.col, piece.fireColor);
  }
  
  return newBoard;
};

export const findNeutrinoLandingPosition = (board: TetrisBoard, piece: TetrisPiece, gridSettings: GridSettings): { row: number; col: number } => {
  const neutrinoCol = piece.col;
  
  // Find the lowest empty position in the column
  for (let row = gridSettings.height - 1; row >= 0; row--) {
    if (board[row][neutrinoCol] === 0) {
      return { row, col: neutrinoCol };
    }
  }
  
  // If no empty space found, place at top (shouldn't happen in normal gameplay)
  return { row: 0, col: neutrinoCol };
};

export const clearLines = (board: TetrisBoard): { 
  board: TetrisBoard; 
  linesCleared: number; 
  clearedLineIndices: number[];
  sameColorLines: number;
  sameColorBonus: number;
} => {
  const newBoard = [...board];
  const clearedLineIndices: number[] = [];
  let sameColorLines = 0;
  
  for (let row = board.length - 1; row >= 0; row--) {
    if (newBoard[row].every(cell => cell !== 0)) {
      const firstColor = newBoard[row][0];
      const isAllSameColor = newBoard[row].every(cell => cell === firstColor);
      
      if (isAllSameColor) {
        sameColorLines++;
      }
      
      clearedLineIndices.push(row);
      newBoard.splice(row, 1);
      newBoard.unshift(Array(board[0].length).fill(0));
      row++; // Check the same row again since we removed a line
    }
  }
  
  return {
    board: newBoard,
    linesCleared: clearedLineIndices.length,
    clearedLineIndices,
    sameColorLines,
    sameColorBonus: sameColorLines * 500
  };
};

export const applyGravityEffect = (board: TetrisBoard): TetrisBoard => {
  const newBoard = board.map(row => [...row]);
  
  for (let col = 0; col < newBoard[0].length; col++) {
    const blocks = [];
    
    for (let row = newBoard.length - 1; row >= 0; row--) {
      if (newBoard[row][col] !== 0) {
        blocks.push(newBoard[row][col]);
        newBoard[row][col] = 0;
      }
    }
    
    let targetRow = newBoard.length - 1;
    for (const block of blocks) {
      newBoard[targetRow][col] = block;
      targetRow--;
    }
  }
  
  return newBoard;
};
