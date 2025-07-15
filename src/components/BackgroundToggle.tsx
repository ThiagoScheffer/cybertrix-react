
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface BackgroundToggleProps {
  retrowaveEnabled: boolean;
  onToggle: () => void;
}

export const BackgroundToggle = ({ retrowaveEnabled, onToggle }: BackgroundToggleProps) => {
  return (
    <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2">
        RETRO MODE
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-purple-400 font-mono text-sm">Classic Retrowave:</span>
          <Button
            onClick={onToggle}
            variant="outline"
            size="sm"
            className={`border-cyan-500/50 ${retrowaveEnabled ? 'text-green-400' : 'text-red-400'}`}
          >
            {retrowaveEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>

        <div className="text-xs font-mono text-cyan-400/70">
          <div>• Animated grid background</div>
          <div>• Enhanced neon effects</div>
          <div>• 80s aesthetic vibes</div>
        </div>
      </div>
    </div>
  );
};
