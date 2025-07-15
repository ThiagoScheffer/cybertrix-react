
import React from 'react';
import { Button } from '@/components/ui/button';
import { TetrisPiece } from '@/types/tetris';
import { AudioManager } from './AudioManager';
import { SoundEffects } from '@/hooks/useSoundEffects';

interface GameSidebarProps {
  nextPiece: TetrisPiece | null;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  paused: boolean;
  specialBlockActive: boolean;
  rainbowBlocks: number;
  retrowaveEnabled: boolean;
  comboCount: number;
  aiCustomBlocks: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onPurchaseRainbowBlock: () => void;
  onToggleRetrowave: () => void;
  onPurchaseAiCustomBlock: () => void;
  onSoundCallbacksReady: (callbacks: SoundEffects) => void;
  gameStarted?: boolean;
}

export const GameSidebar = ({
  nextPiece,
  score,
  level,
  lines,
  gameOver,
  paused,
  specialBlockActive,
  rainbowBlocks,
  retrowaveEnabled,
  comboCount,
  aiCustomBlocks,
  onStart,
  onPause,
  onReset,
  onPurchaseRainbowBlock,
  onToggleRetrowave,
  onPurchaseAiCustomBlock,
  onSoundCallbacksReady,
  gameStarted
}: GameSidebarProps) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;

    const getCellColor = (type: number) => {
      const colors = {
        1: "bg-cyan-500",
        2: "bg-yellow-500", 
        3: "bg-purple-500",
        4: "bg-green-500",
        5: "bg-red-500",
        6: "bg-blue-500",
        7: "bg-orange-500",
        8: "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
        9: "bg-gradient-to-r from-pink-500 via-cyan-500 via-yellow-500 to-purple-500",
        11: "bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600",
        12: "bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600",
        13: "bg-gradient-to-r from-amber-400 via-orange-500 to-red-600",
        99: "bg-gradient-to-r from-red-400 via-red-500 to-red-600" // AI Custom Block - glowing red
      };
      return colors[type as keyof typeof colors] || "bg-gray-500";
    };

    // Create a 4x4 grid to center the piece properly
    const gridSize = 4;
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    
    // Calculate offset to center the piece
    const pieceHeight = nextPiece.shape.length;
    const pieceWidth = nextPiece.shape[0].length;
    const offsetRow = Math.floor((gridSize - pieceHeight) / 2);
    const offsetCol = Math.floor((gridSize - pieceWidth) / 2);
    
    // Place the piece in the centered position
    nextPiece.shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell && offsetRow + rowIndex < gridSize && offsetCol + colIndex < gridSize) {
          grid[offsetRow + rowIndex][offsetCol + colIndex] = nextPiece.type;
        }
      });
    });

    return (
      <div className="grid grid-cols-4 gap-0.5 p-2">
        {grid.flat().map((cell, index) => (
          <div
            key={index}
            className={`w-4 h-4 border border-cyan-900/30 ${
              cell ? getCellColor(cell) + " shadow-lg" + (cell >= 8 ? " animate-pulse" : "") : "bg-black/40"
            }`}
          >
            {cell && (
              <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Enhanced sound effect callbacks - these will be properly connected
  const handleScoreSound = () => {};
  const handleDropSound = () => {};
  const handleRotateSound = () => {};
  const handleLineClearSound = () => {};
  const handleComboSound = () => {};
  const handleGameOverSound = () => {};
  const handlePowerUpSound = () => {};
  const handleSpecialBlockSound = () => {};

  return (
    <div className="space-y-4">
      {/* Next Piece Panel */}
      <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2">
          NEXT BLOCK
          {specialBlockActive && (
            <span className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent animate-pulse">
              SPECIAL!
            </span>
          )}
          {nextPiece?.rarity && (
            <span className={`ml-2 text-xs animate-pulse ${
              nextPiece.rarity === 'uncommon' ? 'text-emerald-400' :
              nextPiece.rarity === 'rare' ? 'text-indigo-400' :
              'text-amber-400'
            }`}>
              {nextPiece.rarity.toUpperCase()}!
            </span>
          )}
          {nextPiece?.aiGenerated && (
            <span className="ml-2 text-xs text-red-400 animate-pulse">
              AI-GENERATED!
            </span>
          )}
        </h3>
        <div className="flex justify-center">
          <div className="bg-black/80 rounded border border-cyan-900/30">
            {renderNextPiece()}
          </div>
        </div>
      </div>

      {/* Enhanced Shop Panel */}
      <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2">
          NEURAL SHOP
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={onPurchaseRainbowBlock}
            disabled={score < 1000}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white border border-purple-400/50 rounded px-3 py-2 text-sm font-mono transition-all"
            title="Shapeshifting block that can cycle through all piece types. Use R to rotate, Spacebar to change shape."
          >
            🌈 RAINBOW BLOCK
            <div className="text-xs opacity-80">Cost: 1,000 pts</div>
            <div className="text-xs opacity-60 mt-1">R=Rotate • Space=Shape</div>
          </button>
          
          <button
            onClick={onPurchaseAiCustomBlock}
            disabled={score < 1500}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white border border-red-400/50 rounded px-3 py-2 text-sm font-mono transition-all"
            title="AI analyzes the top of your board and generates optimal pieces to fill missing block patterns."
          >
            🤖 AI CUSTOM BLOCK
            <div className="text-xs opacity-80">Cost: 1,500 pts</div>
            <div className="text-xs opacity-60 mt-1">Smart gap-filling pieces</div>
          </button>
        </div>
      </div>

      {/* Enhanced Audio Manager */}
      <AudioManager onSoundCallbacksReady={onSoundCallbacksReady} gameStarted={gameStarted} />

      {/* Enhanced AI Assistant Panel with CORRECTED descriptions */}
      <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2">
          SPECIAL BLOCKS INFO
        </h3>
        <div className="text-green-400 font-mono text-xs space-y-2">
          <div className="text-cyan-400 border-b border-cyan-500/20 pb-1 mb-2">
            💡 Block Types:
          </div>
          <div className="text-yellow-400">
            🌈 <span className="text-white">Rainbow:</span> Cycles through all 7 standard Tetris piece shapes
          </div>
          <div className="text-orange-400">
            🔥 <span className="text-white">Fire:</span> Burns surrounding blocks of same color in 1-block radius
          </div>
          <div className="text-green-400">
            ☢️ <span className="text-white">Nuclear:</span> Single block that instantly clears entire board
          </div>
          <div className="text-lime-400">
            🧪 <span className="text-white">Acid:</span> Dissolves 4 blocks below and applies gravity to all blocks
          </div>
          <div className="text-blue-400">
            👻 <span className="text-white">Neutrino:</span> Phases through all blocks to fill lowest empty spot in column
          </div>
          <div className="text-purple-400">
            ✨ <span className="text-white">Color Cleaner:</span> Single glowing white block that removes all blocks of target color when touching any block
          </div>
          <div className="text-red-400">
            🤖 <span className="text-white">AI Custom:</span> Glowing red block that analyzes board gaps and generates optimal filling shapes
          </div>
          {level >= 3 && (
            <div className="text-yellow-400 mt-2 pt-1 border-t border-cyan-500/20">
              🌟 Special blocks unlocked at Level 3+!
            </div>
          )}
          {level >= 5 && (
            <div className="text-emerald-400">
              ✨ Rarity blocks active at Level 5+!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
