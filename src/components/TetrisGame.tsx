import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameBoard } from './GameBoard';
import { GameSidebar } from './GameSidebar';
import { GameHeader } from './GameHeader';
import { OptionsMenu } from './OptionsMenu';
import { TopGameControls } from './TopGameControls';
import { Scoreboard } from './Scoreboard';
import { GameControls } from './GameControls';
import { GridSettings } from './GridSettings';
import { AiBackgroundGenerator } from './AiBackgroundGenerator';
import { useTetrisGame } from '@/hooks/useTetrisGame';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { BackgroundSettings } from '@/types/tetris';
import { AiChatCompanion } from './AiChatCompanion';

export const TetrisGame = () => {
  const {
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
    comboCount,
    aiCustomBlocks,
    purchaseAiCustomBlock,
    useAiCustomBlock,
    setSoundCallbacks,
    gravityEffectActive,
    coffeeBonus,
    showCoffeeBonus
  } = useTetrisGame();

  const { registerSoundCallbacks, playSounds } = useSoundEffects();
  const [gameStarted, setGameStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  
  // Add missing background settings state
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    type: 'default',
    effects: {
      parallax: false,
      scanlines: false,
      motionBlur: false
    }
  });

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileDevice || isTouchDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile touch controls
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (gameOver || paused) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, [gameOver, paused]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || gameOver || paused) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    const minSwipeDistance = 30;
    const maxSwipeTime = 500;
    
    if (deltaTime > maxSwipeTime) {
      touchStartRef.current = null;
      return;
    }
    
    const sounds = playSounds();
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          // Swipe right
          movePiece(1, 0);
          sounds.playRotateSound();
        } else {
          // Swipe left
          movePiece(-1, 0);
          sounds.playRotateSound();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          // Swipe down - soft drop
          movePiece(0, 1);
          sounds.playDropSound();
        } else {
          // Swipe up - hard drop
          dropPiece();
          sounds.playDropSound();
        }
      } else if (deltaTime < 200 && Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
        // Quick tap - rotate
        rotatePiece();
        sounds.playRotateSound();
      }
    }
    
    touchStartRef.current = null;
  }, [gameOver, paused, movePiece, dropPiece, rotatePiece, playSounds]);

  // Add touch event listeners for mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const gameContainer = document.querySelector('.tetris-game-container');
    if (!gameContainer) return;
    
    gameContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      gameContainer.removeEventListener('touchstart', handleTouchStart);
      gameContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, handleTouchStart, handleTouchEnd]);

  // Modified scroll prevention - only prevent during critical moments (scoring effects)
  useEffect(() => {
    const preventScrollDuringEffects = (e: Event) => {
      // Only prevent scrolling during scoring effects, not general gameplay
      if (clearedLines.length > 0 || gravityEffectActive) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const preventTouchScrollDuringEffects = (e: TouchEvent) => {
      // Only prevent touch scrolling during scoring effects
      if ((clearedLines.length > 0 || gravityEffectActive) && e.target) {
        const target = e.target as Element;
        const gameContainer = target.closest('.tetris-game-container');
        if (gameContainer) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    const preventKeyboardScrollDuringEffects = (e: KeyboardEvent) => {
      // Only prevent keyboard-induced scrolling during scoring effects
      if (clearedLines.length > 0 || gravityEffectActive) {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    // Only prevent scrolling during scoring effects
    document.addEventListener('wheel', preventScrollDuringEffects, { passive: false, capture: true });
    document.addEventListener('touchmove', preventTouchScrollDuringEffects, { passive: false, capture: true });
    document.addEventListener('keydown', preventKeyboardScrollDuringEffects, { passive: false, capture: true });

    return () => {
      document.removeEventListener('wheel', preventScrollDuringEffects, { capture: true });
      document.removeEventListener('touchmove', preventTouchScrollDuringEffects, { capture: true });
      document.removeEventListener('keydown', preventKeyboardScrollDuringEffects, { capture: true });
    };
  }, [clearedLines.length, gravityEffectActive]);

  // Lock body scroll only during scoring effects
  useEffect(() => {
    if (clearedLines.length > 0 || gravityEffectActive) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Apply body lock with current position
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Cleanup after effect duration
      const cleanup = () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
      
      // Set timeout based on effect duration (clearedLines effect is 500ms, gravity effect varies)
      const timeoutDuration = gravityEffectActive ? 600 : 550;
      const timeoutId = setTimeout(cleanup, timeoutDuration);
      
      return () => {
        clearTimeout(timeoutId);
        cleanup();
      };
    }
  }, [clearedLines.length, gravityEffectActive]);

  // Handle sound callback registration
  const handleSoundCallbacksReady = useCallback((callbacks: any) => {
    registerSoundCallbacks(callbacks);
    setSoundCallbacks?.(callbacks);
  }, [registerSoundCallbacks, setSoundCallbacks]);

  // Track game start for AI chat clearing and music auto-play
  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    startGame();
  }, [startGame]);

  // Reset game started flag when game ends
  useEffect(() => {
    if (gameOver) {
      setGameStarted(false);
    }
  }, [gameOver]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Prevent default browser behavior for arrow keys, WASD, and space during gameplay to avoid browser scroll
    // but allow the event to continue propagating to our game logic
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'a', 'd', 's', 'w', 'A', 'D', 'S', 'W'].includes(event.key)) {
      event.preventDefault();
    }

    if (gameOver) return;

    const sounds = playSounds();
    const key = event.key.toLowerCase();

    switch (key) {
      // Arrow key controls
      case 'arrowleft':
      case 'a': // WASD support: A = Left
        if (!paused) {
          movePiece(-1, 0);
          sounds.playRotateSound();
        }
        break;
      case 'arrowright':
      case 'd': // WASD support: D = Right
        if (!paused) {
          movePiece(1, 0);
          sounds.playRotateSound();
        }
        break;
      case 'arrowdown':
      case 's': // WASD support: S = Soft Drop
        if (!paused) {
          movePiece(0, 1);
          sounds.playDropSound();
        }
        break;
      case 'arrowup': // Up Arrow = Hard Drop
        if (!paused) {
          dropPiece();
          sounds.playDropSound();
        }
        break;
      case 'w': // WASD support: W = Rotate
        if (!paused) {
          rotatePiece();
          sounds.playRotateSound();
        }
        break;
      case ' ':
        if (!paused) {
          // Spacebar behavior: For rainbow blocks, cycle shape; for others, rotate
          if (currentPiece && currentPiece.type === 8) {
            cycleRainbowShape();
            sounds.playSpecialBlockSound();
          } else {
            rotatePiece();
            sounds.playRotateSound();
          }
        }
        break;
      case 'p':
        event.preventDefault();
        pauseGame();
        break;
      case 'r':
        event.preventDefault();
        if (!paused) {
          // Fixed R key behavior: If Rainbow Block is active, rotate it; otherwise buy/activate
          if (currentPiece && currentPiece.type === 8) {
            // Rainbow Block is active - rotate it
            rotatePiece();
            sounds.playRotateSound();
          } else {
            // No Rainbow Block active - try to buy and activate
            if (rainbowBlocks > 0) {
              // If we have rainbow blocks, use one
              useRainbowBlock();
              sounds.playPowerUpSound();
            } else if (score >= 1000) {
              // If we don't have any but can afford, buy and immediately use
              purchaseRainbowBlock();
              // Use a timeout to ensure state updates properly
              setTimeout(() => {
                useRainbowBlock();
              }, 10);
              sounds.playPowerUpSound();
            }
          }
        }
        break;
      case 'c':
        event.preventDefault();
        if (!paused && currentPiece && currentPiece.type === 8) {
          // C key for cycling rainbow shapes (alternative to spacebar)
          cycleRainbowShape();
          sounds.playSpecialBlockSound();
        }
        break;
      case 'x':
        event.preventDefault();
        if (!paused) {
          // Enhanced X key behavior: Use if available, buy if none and sufficient score, then use immediately after purchase
          if (aiCustomBlocks > 0) {
            useAiCustomBlock();
            sounds.playPowerUpSound();
          } else if (score >= 1500) {
            purchaseAiCustomBlock();
            // After purchase, immediately use the block
            setTimeout(() => {
              useAiCustomBlock();
            }, 50); // Small delay to ensure state updates
            sounds.playPowerUpSound();
          }
        }
        break;
    }
  }, [gameOver, paused, movePiece, rotatePiece, dropPiece, pauseGame, rainbowBlocks, useRainbowBlock, purchaseRainbowBlock, currentPiece, cycleRainbowShape, aiCustomBlocks, useAiCustomBlock, purchaseAiCustomBlock, score, playSounds]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Get background styles
  const getBackgroundStyles = () => {
    const baseStyles: React.CSSProperties = {};
    
    if (backgroundSettings.type === 'custom' && (backgroundSettings.customFile || backgroundSettings.customUrl)) {
      baseStyles.backgroundImage = `url(${backgroundSettings.customFile || backgroundSettings.customUrl})`;
      baseStyles.backgroundSize = 'cover';
      baseStyles.backgroundPosition = 'center';
      baseStyles.backgroundRepeat = 'no-repeat';
      
      if (backgroundSettings.effects.parallax) {
        baseStyles.backgroundAttachment = 'fixed';
      }
    }
    
    return baseStyles;
  };

  // Get effect classes - removed scroll containment for normal gameplay
  const getEffectClasses = () => {
    const classes = ['min-h-screen', 'transition-all', 'duration-500'];
    
    // Only add containment during scoring effects
    if (clearedLines.length > 0 || gravityEffectActive) {
      classes.push('contain-layout', 'contain-paint');
    }
    
    if (backgroundSettings.effects.motionBlur) {
      classes.push('backdrop-blur-sm');
    }
    
    return classes.join(' ');
  };

  return (
    <div 
      className={`tetris-game-container ${getEffectClasses()}`}
      style={{
        ...getBackgroundStyles(),
        // Only prevent scrolling during scoring effects
        position: 'relative',
        overflow: clearedLines.length > 0 || gravityEffectActive ? 'hidden' : 'visible',
        // Mobile-specific touch handling - allow normal touch for scrolling
        touchAction: isMobile ? 'manipulation' : 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* AI-Generated Dynamic Background */}
      <AiBackgroundGenerator
        score={score}
        level={level}
        lines={lines}
        comboCount={comboCount}
        gameActive={!gameOver && !paused}
      />
      
      <div className="absolute inset-0 pointer-events-none">
        {backgroundSettings.effects.scanlines && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent bg-repeat opacity-30"
               style={{
                 backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)',
                 animation: 'scanlines 2s linear infinite'
               }}>
          </div>
        )}
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <GameHeader />
        
        <div className={`flex items-start justify-center px-2 sm:px-4 py-1 gap-2 sm:gap-6 max-w-7xl mx-auto w-full ${
          isMobile ? 'flex-col' : ''
        }`}>
          {/* Mobile layout: Stack vertically */}
          {isMobile ? (
            <>
              {/* Game board first on mobile */}
              <div className="w-full flex justify-center mb-4">
                <GameBoard 
                  board={board}
                  currentPiece={currentPiece}
                  gameOver={gameOver}
                  paused={paused}
                  clearedLines={clearedLines}
                  specialBlockActive={specialBlockActive}
                  retrowaveEnabled={retrowaveEnabled || backgroundSettings.type === 'retrowave'}
                  comboCount={comboCount}
                  gravityEffectActive={gravityEffectActive}
                  gridSettings={gridSettings}
                  showCoffeeBonus={showCoffeeBonus}
                />
              </div>
              
              {/* Controls and info in mobile layout */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <TopGameControls
                    gameOver={gameOver}
                    paused={paused}
                    onStart={handleStartGame}
                    onPause={pauseGame}
                    onReset={resetGame}
                  />
                  
                  <Scoreboard
                    score={score}
                    level={level}
                    lines={lines}
                    comboCount={comboCount}
                    rainbowBlocks={rainbowBlocks}
                    aiCustomBlocks={aiCustomBlocks}
                    gridSettings={gridSettings}
                    coffeeBonus={coffeeBonus}
                  />
                  
                  <GameControls
                    side="left"
                    gameOver={gameOver}
                    paused={paused}
                    rainbowBlocks={rainbowBlocks}
                    currentPiece={currentPiece}
                    onStart={handleStartGame}
                    onPause={pauseGame}
                    onReset={resetGame}
                    onUseRainbowBlock={useRainbowBlock}
                    onCycleShape={cycleRainbowShape}
                  />
                </div>
                
                <div className="space-y-4">
                  <GameSidebar
                    nextPiece={nextPiece}
                    score={score}
                    level={level}
                    lines={lines}
                    gameOver={gameOver}
                    paused={paused}
                    specialBlockActive={specialBlockActive}
                    rainbowBlocks={rainbowBlocks}
                    retrowaveEnabled={retrowaveEnabled || backgroundSettings.type === 'retrowave'}
                    comboCount={comboCount}
                    aiCustomBlocks={aiCustomBlocks}
                    onStart={handleStartGame}
                    onPause={pauseGame}
                    onReset={resetGame}
                    onPurchaseRainbowBlock={purchaseRainbowBlock}
                    onToggleRetrowave={toggleRetrowave}
                    onPurchaseAiCustomBlock={purchaseAiCustomBlock}
                    onSoundCallbacksReady={handleSoundCallbacksReady}
                    gameStarted={gameStarted}
                  />
                  
                  <GridSettings
                    gridSettings={gridSettings}
                    onGridSettingsChange={setGridSettings}
                    gameOver={gameOver}
                  />
                  
                  <AiChatCompanion
                    score={score}
                    level={level}
                    comboCount={comboCount}
                    gameOver={gameOver}
                    paused={paused}
                    onCustomBlockSuggestion={purchaseAiCustomBlock}
                    board={board}
                    currentPiece={currentPiece}
                    nextPiece={nextPiece}
                    lines={lines}
                    gameStarted={gameStarted}
                    specialBlockActive={specialBlockActive}
                  />
                  
                  <OptionsMenu
                    backgroundSettings={backgroundSettings}
                    onBackgroundSettingsChange={setBackgroundSettings}
                    retrowaveEnabled={retrowaveEnabled}
                    onToggleRetrowave={toggleRetrowave}
                    rainbowBlocks={rainbowBlocks}
                    gameOver={gameOver}
                    paused={paused}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Desktop layout: Original 3-column layout */
            <>
              <div className="w-80 flex-shrink-0 flex flex-col">
                <div className="sticky top-2 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                  <Scoreboard
                    score={score}
                    level={level}
                    lines={lines}
                    comboCount={comboCount}
                    rainbowBlocks={rainbowBlocks}
                    aiCustomBlocks={aiCustomBlocks}
                    gridSettings={gridSettings}
                    coffeeBonus={coffeeBonus}
                  />
                  
                  <GridSettings
                    gridSettings={gridSettings}
                    onGridSettingsChange={setGridSettings}
                    gameOver={gameOver}
                  />
                  
                  <AiChatCompanion
                    score={score}
                    level={level}
                    comboCount={comboCount}
                    gameOver={gameOver}
                    paused={paused}
                    onCustomBlockSuggestion={purchaseAiCustomBlock}
                    board={board}
                    currentPiece={currentPiece}
                    nextPiece={nextPiece}
                    lines={lines}
                    gameStarted={gameStarted}
                    specialBlockActive={specialBlockActive}
                  />
                  
                  <OptionsMenu
                    backgroundSettings={backgroundSettings}
                    onBackgroundSettingsChange={setBackgroundSettings}
                    retrowaveEnabled={retrowaveEnabled}
                    onToggleRetrowave={toggleRetrowave}
                    rainbowBlocks={rainbowBlocks}
                    gameOver={gameOver}
                    paused={paused}
                  />
                </div>
              </div>
              
              <div className="flex-1 flex justify-center items-start">
                <div className="flex justify-center">
                  <GameBoard 
                    board={board}
                    currentPiece={currentPiece}
                    gameOver={gameOver}
                    paused={paused}
                    clearedLines={clearedLines}
                    specialBlockActive={specialBlockActive}
                    retrowaveEnabled={retrowaveEnabled || backgroundSettings.type === 'retrowave'}
                    comboCount={comboCount}
                    gravityEffectActive={gravityEffectActive}
                    gridSettings={gridSettings}
                    showCoffeeBonus={showCoffeeBonus}
                  />
                </div>
              </div>
              
              <div className="w-80 flex-shrink-0 flex flex-col">
                <div className="sticky top-2 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                  <TopGameControls
                    gameOver={gameOver}
                    paused={paused}
                    onStart={handleStartGame}
                    onPause={pauseGame}
                    onReset={resetGame}
                  />
                  
                  <GameSidebar
                    nextPiece={nextPiece}
                    score={score}
                    level={level}
                    lines={lines}
                    gameOver={gameOver}
                    paused={paused}
                    specialBlockActive={specialBlockActive}
                    rainbowBlocks={rainbowBlocks}
                    retrowaveEnabled={retrowaveEnabled || backgroundSettings.type === 'retrowave'}
                    comboCount={comboCount}
                    aiCustomBlocks={aiCustomBlocks}
                    onStart={handleStartGame}
                    onPause={pauseGame}
                    onReset={resetGame}
                    onPurchaseRainbowBlock={purchaseRainbowBlock}
                    onToggleRetrowave={toggleRetrowave}
                    onPurchaseAiCustomBlock={purchaseAiCustomBlock}
                    onSoundCallbacksReady={handleSoundCallbacksReady}
                    gameStarted={gameStarted}
                  />
                  
                  <GameControls
                    side="right"
                    gameOver={gameOver}
                    paused={paused}
                    rainbowBlocks={rainbowBlocks}
                    currentPiece={currentPiece}
                    onStart={handleStartGame}
                    onPause={pauseGame}
                    onReset={resetGame}
                    onUseRainbowBlock={useRainbowBlock}
                    onCycleShape={cycleRainbowShape}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-auto px-2 sm:px-4 py-3 text-center bg-black/20 backdrop-blur-sm border-t border-cyan-500/20">
          <div className="text-cyan-400 text-xs sm:text-sm font-mono max-w-5xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-6">
              <div className="bg-black/40 px-2 sm:px-3 py-1.5 rounded border border-cyan-500/30">
                <span className="text-cyan-400">CONTROLS:</span> {isMobile ? 'Touch/Swipe' : 'WASD/Arrows • Space Rotate • P Pause'}
              </div>
              {isMobile && (
                <div className="bg-black/40 px-2 sm:px-3 py-1.5 rounded border border-green-500/30">
                  <span className="text-green-400">MOBILE:</span> Tap=Rotate • Swipe=Move/Drop
                </div>
              )}
              <div className="bg-black/40 px-2 sm:px-3 py-1.5 rounded border border-yellow-500/30">
                <span className="text-yellow-400">RAINBOW:</span> R Buy/Rotate • Space Shape • X AI Block ({aiCustomBlocks})
              </div>
              {coffeeBonus > 0 && (
                <div className="bg-black/40 px-2 sm:px-3 py-1.5 rounded border border-amber-500/30 animate-pulse">
                  <span className="text-amber-400">COFFEE BONUS:</span> +{coffeeBonus} pts
                </div>
              )}
              {gridSettings.format === 'wide' && (
                <div className="bg-black/40 px-2 sm:px-3 py-1.5 rounded border border-yellow-500/30 animate-pulse">
                  <span className="text-yellow-400">WIDE MODE:</span> 3x Line Multiplier Active!
                </div>
              )}
              {comboCount > 0 && (
                <div className="bg-black/40 px-2 sm:px-3 py-1.5 rounded border border-purple-500/30 animate-pulse">
                  <span className="text-purple-400">COMBO:</span> {comboCount}x Multiplier Active!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scanlines {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(0, 255, 255, 0.4), rgba(147, 51, 234, 0.4));
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(0, 255, 255, 0.6), rgba(147, 51, 234, 0.6));
        }
        
        .sticky {
          filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.1));
        }
        
        /* Only apply scroll prevention during scoring effects */
        .tetris-game-container {
          contain: layout style paint;
        }
        
        .contain-layout {
          contain: layout;
        }
        
        .contain-paint {
          contain: paint;
        }
        
        /* Mobile touch optimization - allow normal scrolling */
        @media (max-width: 768px) {
          .tetris-game-container {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: auto;
          }
        }
      `}</style>
    </div>
  );
};
