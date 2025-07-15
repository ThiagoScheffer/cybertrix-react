import React from 'react';
import { Settings, Gamepad2 } from 'lucide-react';
import { BackgroundCustomizer } from './BackgroundCustomizer';
import { BackgroundToggle } from './BackgroundToggle';
import { BackgroundSettings } from '@/types/tetris';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface OptionsMenuProps {
  backgroundSettings: BackgroundSettings;
  onBackgroundSettingsChange: (settings: BackgroundSettings) => void;
  retrowaveEnabled: boolean;
  onToggleRetrowave: () => void;
  rainbowBlocks: number;
  gameOver: boolean;
  paused: boolean;
}

export const OptionsMenu = ({
  backgroundSettings,
  onBackgroundSettingsChange,
  retrowaveEnabled,
  onToggleRetrowave,
  rainbowBlocks,
  gameOver,
  paused
}: OptionsMenuProps) => {
  return (
    <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Settings className="w-5 h-5 mr-2 text-cyan-400" />
            <h3 className="text-cyan-400 font-mono text-lg">OPTIONS</h3>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Background Customizer */}
          <BackgroundCustomizer
            settings={backgroundSettings}
            onSettingsChange={onBackgroundSettingsChange}
          />
          
          {/* Retro Mode Toggle */}
          <BackgroundToggle
            retrowaveEnabled={retrowaveEnabled}
            onToggle={onToggleRetrowave}
          />
          
          {/* Movement Controls Info */}
          <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Gamepad2 className="w-5 h-5 mr-2 text-cyan-400" />
              <h4 className="text-cyan-400 font-mono text-sm">MOVEMENT CONTROLS</h4>
            </div>
            
            <div className="text-cyan-400 text-xs font-mono space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="text-purple-300 font-semibold">ARROW KEYS:</div>
                  <div className="flex justify-between">
                    <span>Move Left:</span>
                    <span className="text-purple-400">←</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Right:</span>
                    <span className="text-purple-400">→</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soft Drop:</span>
                    <span className="text-purple-400">↓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hard Drop:</span>
                    <span className="text-purple-400">↑</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-cyan-300 font-semibold">WASD KEYS:</div>
                  <div className="flex justify-between">
                    <span>Move Left:</span>
                    <span className="text-cyan-400">A</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Right:</span>
                    <span className="text-cyan-400">D</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soft Drop:</span>
                    <span className="text-cyan-400">S</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hard Drop:</span>
                    <span className="text-cyan-400">W</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-cyan-500/20 pt-2 space-y-1">
                <div className="text-yellow-300 font-semibold">SPECIAL ACTIONS:</div>
                <div className="flex justify-between">
                  <span>Rotate:</span>
                  <span className="text-orange-400">SPACE</span>
                </div>
                <div className="flex justify-between">
                  <span>Pause/Resume:</span>
                  <span className="text-orange-400">P</span>
                </div>
                <div className="flex justify-between">
                  <span>Rainbow Block:</span>
                  <span className="text-yellow-400">R ({rainbowBlocks})</span>
                </div>
                <div className="flex justify-between">
                  <span>Cycle Shape:</span>
                  <span className="text-yellow-400">C</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Block:</span>
                  <span className="text-orange-400">X</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
