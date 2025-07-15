
import React from 'react';
import { Button } from '@/components/ui/button';
import { GridSettings as GridSettingsType } from '@/types/tetris';
import { Monitor, Maximize2 } from 'lucide-react';

interface GridSettingsProps {
  gridSettings: GridSettingsType;
  onGridSettingsChange: (settings: GridSettingsType) => void;
  gameOver: boolean;
}

export const GridSettings = ({
  gridSettings,
  onGridSettingsChange,
  gameOver
}: GridSettingsProps) => {
  const handleFormatChange = (format: 'standard' | 'wide') => {
    const newSettings = format === 'wide' 
      ? { width: 40, height: 20, format: 'wide' as const }
      : { width: 10, height: 20, format: 'standard' as const };
    
    onGridSettingsChange(newSettings);
  };

  return (
    <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2 flex items-center">
        <Monitor className="w-5 h-5 mr-2" />
        GRID MATRIX
      </h3>
      
      <div className="space-y-3">
        <div className="text-xs text-cyan-400/70 font-mono mb-3">
          Neural grid configuration - change requires restart
        </div>
        
        <Button
          onClick={() => handleFormatChange('standard')}
          disabled={!gameOver}
          className={`w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 ${
            gridSettings.format === 'standard' 
              ? 'bg-cyan-500/20 border-cyan-400' 
              : 'bg-transparent'
          }`}
          variant="outline"
        >
          <Monitor className="w-4 h-4 mr-2" />
          STANDARD (20×10)
        </Button>
        
        <Button
          onClick={() => handleFormatChange('wide')}
          disabled={!gameOver}
          className={`w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10 ${
            gridSettings.format === 'wide' 
              ? 'bg-purple-500/20 border-purple-400' 
              : 'bg-transparent'
          }`}
          variant="outline"
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          WIDE MATRIX (20×40)
        </Button>
        
        <div className="text-xs text-cyan-400/50 font-mono bg-black/40 p-2 rounded border border-cyan-500/20">
          Current: {gridSettings.width}×{gridSettings.height} | {gridSettings.format.toUpperCase()}
        </div>
        
        {!gameOver && (
          <div className="text-xs text-orange-400 font-mono bg-black/40 p-2 rounded border border-orange-500/30">
            ⚠ Grid changes only apply when starting a new game
          </div>
        )}
      </div>
    </div>
  );
};
