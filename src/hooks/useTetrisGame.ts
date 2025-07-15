import { useState, useEffect, useCallback, useRef } from 'react';
import { TetrisPiece, TetrisBoard, GridSettings } from '@/types/tetris';
import { createEmptyBoard, createRandomPiece, createSpecialPiece, createRainbowPiece, createAiOptimizedPiece, createRarityBasedSpecialPiece, isValidMove, placePiece, placeNeutrinoPiece, findNeutrinoLandingPosition, clearLines, applyGravityEffect, getGridDimensions, TETRIS_PIECES } from '@/utils/tetrisUtils';
import { FIRE_BLOCK_TYPE, placeFireBlock } from '@/utils/fireBlockUtils';
import { placeNuclearBlock, NUCLEAR_BLOCK_TYPE } from '@/utils/nuclearBlockUtils';
import { placeAcidBlock, ACID_BLOCK_TYPE } from '@/utils/acidBlockUtils';
import { placeColorCleanerBlock, COLOR_CLEANER_BLOCK_TYPE } from '@/utils/colorCleanerUtils';
import { SoundEffects } from './useSoundEffects';

export const useTetrisGame = () => {
  const [gridSettings, setGridSettings] = useState<GridSettings>(getGridDimensions('standard'));
  const [board, setBoard] = useState<TetrisBoard>(createEmptyBoard(gridSettings));
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrisPiece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(true);
  const [paused, setPaused] = useState(false);
  const [clearedLines, setClearedLines] = useState<number[]>([]);
  const [specialBlockActive, setSpecialBlockActive] = useState(false);
  const [rainbowBlocks, setRainbowBlocks] = useState(0);
  const [retrowaveEnabled, setRetrowaveEnabled] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [aiCustomBlocks, setAiCustomBlocks] = useState(0);
  const [gravityEffectActive, setGravityEffectActive] = useState(false);
  const [coffeeBonus, setCoffeeBonus] = useState(0);
  const [showCoffeeBonus, setShowCoffeeBonus] = useState(false);
  
  const soundCallbacksRef = useRef<SoundEffects | null>(null);
  
  const setSoundCallbacks = useCallback((callbacks: SoundEffects) => {
    soundCallbacksRef.current = callbacks;
  }, []);

  const startGame = useCallback(() => {
    setBoard(createEmptyBoard(gridSettings));
    setCurrentPiece(createRandomPiece(gridSettings, 1)); // Start at level 1
    setNextPiece(createRandomPiece(gridSettings, 1));
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setPaused(false);
    setClearedLines([]);
    setSpecialBlockActive(false);
    setComboCount(0);
    setAiCustomBlocks(0);
    setCoffeeBonus(0);
    setShowCoffeeBonus(false);
  }, [gridSettings]);

  const pauseGame = useCallback(() => {
    if (!gameOver) {
      setPaused(prev => !prev);
    }
  }, [gameOver]);

  const resetGame = useCallback(() => {
    setGameOver(true);
    setPaused(false);
    setBoard(createEmptyBoard(gridSettings));
    setCurrentPiece(null);
    setNextPiece(null);
    setClearedLines([]);
    setSpecialBlockActive(false);
  }, []);

  const purchaseRainbowBlock = useCallback(() => {
    if (score >= 1000) {
      setScore(prev => prev - 1000);
      setRainbowBlocks(prev => prev + 1);
      soundCallbacksRef.current?.playPowerUpSound();
    }
  }, [score]);

  const toggleRetrowave = useCallback(() => {
    setRetrowaveEnabled(prev => !prev);
  }, []);

  const useRainbowBlock = useCallback(() => {
    if (rainbowBlocks > 0 && currentPiece && !gameOver && !paused) {
      const rainbowPiece = {
        ...currentPiece,
        type: 8
      };
      setCurrentPiece(rainbowPiece);
      setRainbowBlocks(prev => prev - 1);
      soundCallbacksRef.current?.playSpecialBlockSound();
    }
  }, [rainbowBlocks, currentPiece, gameOver, paused]);

  const cycleRainbowShape = useCallback(() => {
    if (!currentPiece || gameOver || paused || currentPiece.type !== 8) return;

    const currentIndex = TETRIS_PIECES.findIndex(piece => 
      JSON.stringify(piece.shape) === JSON.stringify(currentPiece.shape)
    );
    
    const nextIndex = (currentIndex + 1) % TETRIS_PIECES.length;
    const nextShape = TETRIS_PIECES[nextIndex];
    
    const newPiece = {
      ...currentPiece,
      shape: nextShape.shape
    };

    if (isValidMove(board, newPiece, gridSettings)) {
      setCurrentPiece(newPiece);
      soundCallbacksRef.current?.playRotateSound();
    }
  }, [currentPiece, board, gameOver, paused, gridSettings]);

  const getRarityMultiplier = (rarity?: string): number => {
    switch (rarity) {
      case 'uncommon': return 1.5;
      case 'rare': return 2.0;
      case 'legendary': return 3.0;
      default: return 1.0;
    }
  };

  const getAdvancedBlockMultiplier = (isAdvanced?: boolean): number => {
    return isAdvanced ? 1.25 : 1.0; // 25% bonus for advanced blocks
  };

  const movePiece = useCallback((deltaX: number, deltaY: number) => {
    if (!currentPiece || gameOver || paused) return;

    const newPiece = {
      ...currentPiece,
      col: currentPiece.col + deltaX,
      row: currentPiece.row + deltaY
    };

    if (isValidMove(board, newPiece, gridSettings)) {
      setCurrentPiece(newPiece);
    } else if (deltaY > 0) {
      // Piece can't move down, place it
      let newBoard;
      
      // Handle different block types
      if (currentPiece.isNuclear) {
        newBoard = placeNuclearBlock(board, currentPiece, gridSettings);
        soundCallbacksRef.current?.playSpecialBlockSound(); // Nuclear explosion sound
      } else if (currentPiece.isAcid) {
        newBoard = placeAcidBlock(board, currentPiece, gridSettings);
        soundCallbacksRef.current?.playSpecialBlockSound(); // Acid melting sound
      } else if (currentPiece.isColorCleaner) {
        newBoard = placeColorCleanerBlock(board, currentPiece, gridSettings);
        soundCallbacksRef.current?.playSpecialBlockSound(); // Color cleaner sound
      } else if (currentPiece.isNeutrino) {
        newBoard = placeNeutrinoPiece(board, currentPiece, gridSettings);
      } else if (currentPiece.type === FIRE_BLOCK_TYPE) {
        newBoard = placeFireBlock(board, currentPiece, gridSettings);
        soundCallbacksRef.current?.playSpecialBlockSound(); // Fire sound effect
      } else {
        newBoard = placePiece(board, currentPiece, gridSettings);
      }
      
      // Play rarity sound effect if applicable
      if (currentPiece.rarity && currentPiece.type !== FIRE_BLOCK_TYPE && !currentPiece.isNuclear && !currentPiece.isAcid && !currentPiece.isColorCleaner) {
        soundCallbacksRef.current?.playRaritySound(currentPiece.rarity);
      }
      
      // Play advanced block sound effect
      if (currentPiece.isAdvanced) {
        soundCallbacksRef.current?.playSpecialBlockSound();
      }
      
      // Handle special rarity-based effects before line clearing (except special blocks which handle their own effects)
      if (currentPiece.rarity && currentPiece.type !== FIRE_BLOCK_TYPE && !currentPiece.isNuclear && !currentPiece.isAcid && !currentPiece.isColorCleaner) {
        newBoard = handleRaritySpecialEffects(newBoard, currentPiece);
      }
      
      // Apply gravity effect for Legendary blocks (except special blocks)
      if (currentPiece.rarity === 'legendary' && currentPiece.type !== FIRE_BLOCK_TYPE && !currentPiece.isNuclear && !currentPiece.isAcid && !currentPiece.isColorCleaner) {
        setGravityEffectActive(true);
        setTimeout(() => {
          setBoard(prevBoard => {
            const gravityBoard = applyGravityEffect(prevBoard);
            setGravityEffectActive(false);
            return gravityBoard;
          });
        }, 300); // Delay to show the effect
        soundCallbacksRef.current?.playSpecialBlockSound();
      }
      
      const { board: clearedBoard, linesCleared, clearedLineIndices, sameColorLines, sameColorBonus } = clearLines(newBoard);
      
      // Calculate coffee bonus for legendary combos
      let newCoffeeBonus = 0;
      if (currentPiece.rarity === 'legendary' && comboCount > 0 && linesCleared > 0) {
        newCoffeeBonus = comboCount * 50; // 50 points per combo level
        setCoffeeBonus(prev => prev + newCoffeeBonus);
        setShowCoffeeBonus(true);
        setTimeout(() => setShowCoffeeBonus(false), 3000);
        soundCallbacksRef.current?.playSpecialBlockSound();
      }
      
      // Play sound effects based on actions
      if (linesCleared > 0) {
        soundCallbacksRef.current?.playLineClearSound();
        if (comboCount > 0) {
          soundCallbacksRef.current?.playComboSound();
        }
      }
      
      // Show cleared lines effect
      if (clearedLineIndices.length > 0) {
        setClearedLines(clearedLineIndices);
        setTimeout(() => setClearedLines([]), 500);
      }
      
      setBoard(clearedBoard);
      setLines(prev => prev + linesCleared);
      
      // Update combo system
      if (linesCleared > 0) {
        setComboCount(prev => prev + 1);
      } else {
        setComboCount(0);
      }
      
      // Calculate score with enhanced multiplier system
      const baseScore = (linesCleared * 100 * level) + 10;
      const comboBonus = comboCount > 0 ? Math.pow(1.5, comboCount) : 1;
      const rarityMultiplier = getRarityMultiplier(currentPiece.rarity);
      
      // Fire block bonus (2x for fire blocks)
      const fireBlockMultiplier = currentPiece.type === FIRE_BLOCK_TYPE ? 2.0 : 1.0;
      
      // Nuclear block bonus (5x for nuclear blocks)
      const nuclearBlockMultiplier = currentPiece.isNuclear ? 5.0 : 1.0;
      
      // Acid block bonus (2.5x for acid blocks)
      const acidBlockMultiplier = currentPiece.isAcid ? 2.5 : 1.0;
      
      // Advanced block bonus (1.25x for advanced blocks)
      const advancedBlockMultiplier = getAdvancedBlockMultiplier(currentPiece.isAdvanced);
      
      // Same-color multiplier (6x for lines with all same color blocks)
      const sameColorMultiplier = sameColorLines > 0 ? Math.pow(6, sameColorLines) : 1;
      
      // Wide grid multiplier (3x per line for 20x40 mode)
      const wideGridMultiplier = gridSettings.format === 'wide' ? Math.pow(3, linesCleared) : 1;
      
      // Neutrino bonus (1.5x for neutrino blocks)
      const neutrinoMultiplier = currentPiece.isNeutrino ? 1.5 : 1;
      
      // Color cleaner bonus (3x for color cleaner blocks)
      const colorCleanerMultiplier = currentPiece.isColorCleaner ? 3.0 : 1.0;
      
      const finalScore = Math.floor(
        baseScore * 
        comboBonus * 
        rarityMultiplier * 
        fireBlockMultiplier * 
        nuclearBlockMultiplier *
        acidBlockMultiplier *
        colorCleanerMultiplier *
        advancedBlockMultiplier * 
        sameColorMultiplier * 
        wideGridMultiplier * 
        neutrinoMultiplier
      );
      setScore(prev => prev + finalScore + newCoffeeBonus);
      
      // Enhanced feedback for special scoring events
      if (currentPiece.type === FIRE_BLOCK_TYPE || 
          currentPiece.isNuclear ||
          currentPiece.isAcid ||
          currentPiece.isColorCleaner ||
          sameColorLines > 0 || 
          gridSettings.format === 'wide' || 
          currentPiece.isNeutrino || 
          currentPiece.isAdvanced ||
          newCoffeeBonus > 0) {
        soundCallbacksRef.current?.playSpecialBlockSound();
      } else if (finalScore > 100) {
        soundCallbacksRef.current?.playScoreSound();
      }
      
      // Check for level up
      const newLevel = Math.floor((lines + linesCleared) / 10) + 1;
      setLevel(newLevel);
      
      // Determine next piece type - FIXED: Rainbow blocks only when explicitly purchased
      let newNextPiece;
      if (newLevel >= 5 && Math.random() < 0.15) {
        newNextPiece = createRarityBasedSpecialPiece(clearedBoard, undefined, gridSettings);
        setSpecialBlockActive(true);
        soundCallbacksRef.current?.playSpecialBlockSound();
      } else if (newLevel >= 3 && Math.random() < 0.05) {
        newNextPiece = createSpecialPiece(clearedBoard, gridSettings, newLevel);
        setSpecialBlockActive(true);
      } else {
        // Pass current level to enable level-based restrictions and advanced blocks
        newNextPiece = createRandomPiece(gridSettings, newLevel);
        setSpecialBlockActive(false);
      }
      
      // Spawn next piece
      setCurrentPiece(nextPiece);
      setNextPiece(newNextPiece);
      
      // Check game over
      if (nextPiece && !isValidMove(clearedBoard, nextPiece, gridSettings)) {
        setGameOver(true);
        setComboCount(0);
        soundCallbacksRef.current?.playGameOverSound();
      }
    }
  }, [currentPiece, board, gameOver, paused, nextPiece, lines, level, comboCount, gridSettings]);

  const handleRaritySpecialEffects = (board: TetrisBoard, piece: TetrisPiece): TetrisBoard => {
    let newBoard = [...board.map(row => [...row])];
    
    switch (piece.rarity) {
      case 'uncommon':
        for (let row = 0; row < newBoard.length; row++) {
          const blockCount = newBoard[row].filter(cell => cell !== 0).length;
          if (blockCount >= 7 && blockCount < 10) {
            const filledPositions = [];
            for (let col = 0; col < newBoard[row].length; col++) {
              if (newBoard[row][col] !== 0) {
                filledPositions.push(col);
              }
            }
            for (let i = 0; i < Math.min(2, filledPositions.length); i++) {
              const randomIndex = Math.floor(Math.random() * filledPositions.length);
              const col = filledPositions.splice(randomIndex, 1)[0];
              newBoard[row][col] = 0;
            }
          }
        }
        break;
        
      case 'rare':
        const duplicatePositions = findStrategicDuplicatePositions(newBoard, piece);
        duplicatePositions.forEach(pos => {
          if (pos.row >= 0 && pos.row < newBoard.length && 
              pos.col >= 0 && pos.col < newBoard[0].length) {
            newBoard[pos.row][pos.col] = piece.type;
          }
        });
        break;
        
      case 'legendary':
        for (let row = 1; row < newBoard.length - 1; row++) {
          for (let col = 1; col < newBoard[row].length - 1; col++) {
            if (newBoard[row][col] !== 0) {
              const neighbors = [
                newBoard[row-1][col], newBoard[row+1][col],
                newBoard[row][col-1], newBoard[row][col+1]
              ];
              const emptyNeighbors = neighbors.filter(n => n === 0).length;
              if (emptyNeighbors >= 3) {
                newBoard[row][col] = 0;
              }
            }
          }
        }
        break;
    }
    
    return newBoard;
  };

  const findStrategicDuplicatePositions = (board: TetrisBoard, piece: TetrisPiece): { row: number; col: number }[] => {
    const positions = [];
    
    for (let row = board.length - 1; row >= 0 && positions.length < 3; row--) {
      for (let col = 0; col < board[row].length && positions.length < 3; col++) {
        if (board[row][col] === 0) {
          const hasBlockBelow = row === board.length - 1 || board[row + 1][col] !== 0;
          const hasBlocksAround = (col > 0 && board[row][col - 1] !== 0) || 
                                  (col < board[row].length - 1 && board[row][col + 1] !== 0);
          
          if (hasBlockBelow && hasBlocksAround) {
            positions.push({ row, col });
          }
        }
      }
    }
    
    return positions;
  };

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || paused) return;

    // Create rotated shape
    const rotatedShape = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map(row => row[index]).reverse()
    );

    const rotatedPiece = {
      ...currentPiece,
      shape: rotatedShape
    };

    // First try the rotation at current position
    if (isValidMove(board, rotatedPiece, gridSettings)) {
      setCurrentPiece(rotatedPiece);
      soundCallbacksRef.current?.playRotateSound();
      return;
    }

    // If that fails, try wall kicks (slight position adjustments)
    const wallKicks = [
      { col: -1, row: 0 },  // Try moving left
      { col: 1, row: 0 },   // Try moving right
      { col: 0, row: -1 },  // Try moving up
      { col: -2, row: 0 },  // Try moving further left
      { col: 2, row: 0 },   // Try moving further right
    ];

    for (const kick of wallKicks) {
      const kickedPiece = {
        ...rotatedPiece,
        col: rotatedPiece.col + kick.col,
        row: rotatedPiece.row + kick.row
      };

      if (isValidMove(board, kickedPiece, gridSettings)) {
        setCurrentPiece(kickedPiece);
        soundCallbacksRef.current?.playRotateSound();
        return;
      }
    }

    // If rotation fails, just play feedback sound but don't change the piece
    soundCallbacksRef.current?.playRotateSound();
  }, [currentPiece, board, gameOver, paused, gridSettings]);

  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver || paused) return;

    let dropDistance = 0;
    let testPiece = { ...currentPiece };
    
    while (isValidMove(board, { ...testPiece, row: testPiece.row + 1 }, gridSettings)) {
      dropDistance++;
      testPiece.row++;
    }

    if (dropDistance > 0) {
      movePiece(0, dropDistance);
    }
  }, [currentPiece, board, gameOver, paused, movePiece, gridSettings]);

  // Auto-drop logic - FIXED: Constant 900ms interval for enjoyable long-term gameplay
  useEffect(() => {
    if (gameOver || paused || !currentPiece) return;

    // Constant 900ms drop interval regardless of level for better gameplay experience
    const dropInterval = 900;
    const timer = setInterval(() => {
      // Ensure the piece continues falling regardless of recent rotations
      movePiece(0, 1);
    }, dropInterval);

    return () => clearInterval(timer);
  }, [currentPiece, gameOver, paused, movePiece]);

  const purchaseAiCustomBlock = useCallback(() => {
    if (score >= 1500) {
      setScore(prev => prev - 1500);
      setAiCustomBlocks(prev => prev + 1);
      soundCallbacksRef.current?.playPowerUpSound();
    }
  }, [score]);

  const useAiCustomBlock = useCallback(() => {
    if (aiCustomBlocks > 0 && !gameOver && !paused) {
      const customPiece = createAiOptimizedPiece(board, gridSettings, level);
      setCurrentPiece(customPiece);
      setAiCustomBlocks(prev => prev - 1);
      
      setSpecialBlockActive(true);
      setTimeout(() => setSpecialBlockActive(false), 3000);
      
      setScore(prev => prev + 50);
      soundCallbacksRef.current?.playSpecialBlockSound();
    }
  }, [aiCustomBlocks, board, gameOver, paused, gridSettings, level]);

  return {
    gridSettings,
    setGridSettings,
    board,
    currentPiece,
    nextPiece,
    score,
    level,
    lines,
    gameOver,
    paused,
    clearedLines,
    specialBlockActive,
    rainbowBlocks,
    retrowaveEnabled,
    comboCount,
    aiCustomBlocks,
    gravityEffectActive,
    coffeeBonus,
    showCoffeeBonus,
    startGame,
    pauseGame,
    resetGame,
    movePiece,
    rotatePiece,
    dropPiece,
    purchaseRainbowBlock,
    toggleRetrowave,
    useRainbowBlock,
    cycleRainbowShape,
    purchaseAiCustomBlock,
    useAiCustomBlock,
    setSoundCallbacks
  };
};
