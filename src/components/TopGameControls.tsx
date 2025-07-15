
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TopGameControlsProps {
  gameOver: boolean;
  paused: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const TopGameControls = ({
  gameOver,
  paused,
  onStart,
  onPause,
  onReset
}: TopGameControlsProps) => {
  return (
    <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2">
        GAME CONTROLS
      </h3>
      
      <div className="space-y-2">
        {!gameOver ? (
          <Button
            onClick={onPause}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/50"
          >
            {paused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {paused ? 'RESUME GAME' : 'PAUSE GAME'}
          </Button>
        ) : (
          <Button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border border-green-400/50"
          >
            <Play className="w-4 h-4 mr-2" />
            START NEW GAME
          </Button>
        )}
        
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          RESET GAME
        </Button>
      </div>
    </div>
  );
};
