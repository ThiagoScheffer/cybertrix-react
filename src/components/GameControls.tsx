
import React from 'react';
import { Button } from '@/components/ui/button';
import { TetrisPiece } from '@/types/tetris';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Gamepad2, 
  ArrowLeft, 
  ArrowRight, 
  ArrowDown, 
  RotateCw,
  Zap,
  RefreshCw
} from 'lucide-react';

interface GameControlsProps {
  side: 'left' | 'right';
  gameOver: boolean;
  paused: boolean;
  rainbowBlocks: number;
  currentPiece: TetrisPiece | null;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onUseRainbowBlock: () => void;
  onCycleShape: () => void;
}

export const GameControls = ({
  side,
  gameOver,
  paused,
  rainbowBlocks,
  currentPiece,
  onStart,
  onPause,
  onReset,
  onUseRainbowBlock,
  onCycleShape
}: GameControlsProps) => {
  const isRainbowBlock = currentPiece && (currentPiece.type === 8 || currentPiece.type === 9);

  if (side === 'left') {
    return (
      <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2 flex items-center">
          <Gamepad2 className="w-5 h-5 mr-2" />
          NEURAL CONTROLS
        </h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div></div>
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 h-10"
              disabled={gameOver || paused}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div></div>
            
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 h-10"
              disabled={gameOver || paused}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 h-10"
              disabled={gameOver || paused}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 h-10"
              disabled={gameOver || paused}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            disabled={gameOver || paused}
          >
            {isRainbowBlock ? "CYCLE SHAPE (SPACE)" : "ROTATE (W)"}
          </Button>
          
          <Button
            variant="outline"
            className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
            disabled={gameOver || paused}
          >
            HARD DROP (↑)
          </Button>
        </div>
        
        <div className="mt-4 pt-3 border-t border-cyan-500/20">
          <div className="text-xs text-cyan-400/70 font-mono space-y-1">
            <div>🎮 WASD or Arrow Keys</div>
            <div>A/← Left • D/→ Right</div>
            <div>S/↓ Soft Drop • W Rotate</div>
            <div>↑ Hard Drop • P Pause</div>
            <div className="text-yellow-400">R Rainbow (Use/Buy)</div>
            <div className="text-orange-400">X AI Block (Use/Buy)</div>
            {isRainbowBlock && (
              <div className="text-yellow-400">SPACE Cycle Special Shape</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Right side controls
  return (
    <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2 flex items-center">
        <Zap className="w-5 h-5 mr-2" />
        POWER-UPS
      </h3>
      
      <div className="space-y-3">
        <Button
          onClick={onUseRainbowBlock}
          disabled={gameOver || paused || rainbowBlocks === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border border-purple-400/50"
        >
          <Zap className="w-4 h-4 mr-2" />
          USE RAINBOW (R)
          <span className="ml-2 bg-black/30 px-2 py-0.5 rounded text-xs">
            {rainbowBlocks}
          </span>
        </Button>
        
        <Button
          onClick={onCycleShape}
          disabled={gameOver || paused || !isRainbowBlock}
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white border border-yellow-400/50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          CYCLE SHAPE (C)
        </Button>
        
        {isRainbowBlock && (
          <div className="text-xs text-yellow-400 font-mono bg-black/40 p-2 rounded border border-yellow-500/30">
            🌈 Rainbow block active! Press SPACE or C to cycle shapes, W to rotate
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-cyan-500/20">
        <div className="text-xs text-cyan-400/70 font-mono">
          Smart purchasing: R/X keys buy when count is 0
        </div>
      </div>
    </div>
  );
};
