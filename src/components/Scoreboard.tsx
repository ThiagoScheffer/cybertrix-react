
import React from 'react';
import { GridSettings } from '@/types/tetris';
import { Coffee } from 'lucide-react';

interface ScoreboardProps {
  score: number;
  level: number;
  lines: number;
  comboCount: number;
  rainbowBlocks: number;
  aiCustomBlocks: number;
  gridSettings: GridSettings;
  coffeeBonus: number;
}

export const Scoreboard = ({
  score,
  level,
  lines,
  comboCount,
  rainbowBlocks,
  aiCustomBlocks,
  gridSettings,
  coffeeBonus
}: ScoreboardProps) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Safe access to gridSettings with fallback
  const isWideFormat = gridSettings?.format === 'wide';
  const gridWidth = gridSettings?.width || 10;
  const gridHeight = gridSettings?.height || 20;

  return (
    <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2">
        NEURAL STATS
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-purple-400 font-mono text-sm">SCORE:</span>
          <span className="text-green-400 font-mono font-bold">{formatNumber(score)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-400 font-mono text-sm">LEVEL:</span>
          <span className="text-cyan-400 font-mono font-bold">{level}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-400 font-mono text-sm">LINES:</span>
          <span className="text-pink-400 font-mono font-bold">{lines}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-400 font-mono text-sm">GRID:</span>
          <span className={`font-mono font-bold ${isWideFormat ? 'text-yellow-400' : 'text-gray-400'}`}>
            {gridWidth}x{gridHeight}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-400 font-mono text-sm">COMBO:</span>
          <span className={`font-mono font-bold ${comboCount > 0 ? 'text-yellow-400 animate-pulse' : 'text-gray-400'}`}>
            {comboCount > 0 ? `${comboCount}x` : '0x'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-400 font-mono text-sm">RAINBOW:</span>
          <span className="text-yellow-400 font-mono font-bold">{rainbowBlocks}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-purple-400 font-mono text-sm">AI BLOCKS:</span>
          <span className="text-orange-400 font-mono font-bold">{aiCustomBlocks}</span>
        </div>
        {coffeeBonus > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-amber-400 font-mono text-sm">
              <Coffee className="w-3 h-3" />
              <span>COFFEE:</span>
            </div>
            <span className="text-amber-400 font-mono font-bold animate-pulse">+{coffeeBonus}</span>
          </div>
        )}
      </div>
      
      {isWideFormat && (
        <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
          <div className="text-yellow-400 font-mono text-xs text-center">
            WIDE MODE: 3x Line Bonus Active!
          </div>
        </div>
      )}
    </div>
  );
};
