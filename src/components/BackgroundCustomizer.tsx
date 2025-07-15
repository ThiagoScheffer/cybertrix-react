
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Upload, Link, Image } from 'lucide-react';
import { BackgroundSettings } from '@/types/tetris';

interface BackgroundCustomizerProps {
  settings: BackgroundSettings;
  onSettingsChange: (settings: BackgroundSettings) => void;
}

export const BackgroundCustomizer = ({ settings, onSettingsChange }: BackgroundCustomizerProps) => {
  const [urlInput, setUrlInput] = useState(settings.customUrl || '');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onSettingsChange({
          ...settings,
          type: 'custom',
          customFile: result,
          customUrl: undefined
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onSettingsChange({
        ...settings,
        type: 'custom',
        customUrl: urlInput.trim(),
        customFile: undefined
      });
    }
  };

  const handleEffectToggle = (effect: keyof BackgroundSettings['effects']) => {
    onSettingsChange({
      ...settings,
      effects: {
        ...settings.effects,
        [effect]: !settings.effects[effect]
      }
    });
  };

  return (
    <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2">
        BACKGROUND
      </h3>
      
      <div className="space-y-4">
        {/* Background Type Selection */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={() => onSettingsChange({ ...settings, type: 'default' })}
              variant={settings.type === 'default' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 font-mono text-xs"
            >
              Default
            </Button>
            <Button
              onClick={() => onSettingsChange({ ...settings, type: 'retrowave' })}
              variant={settings.type === 'retrowave' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 font-mono text-xs"
            >
              Retrowave
            </Button>
          </div>
        </div>

        {/* Custom Background Options */}
        <div className="space-y-3">
          <div className="text-sm font-mono text-purple-400">Custom Image:</div>
          
          {/* File Upload */}
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-3 py-2 border border-cyan-500/50 rounded bg-black/40 hover:bg-cyan-500/10 text-cyan-400 font-mono text-sm">
                <Upload className="w-4 h-4" />
                Upload File
              </div>
            </label>
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Image URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-black/40 border-cyan-500/50 text-cyan-400 font-mono text-sm"
            />
            <Button
              onClick={handleUrlSubmit}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-500"
            >
              <Link className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Visual Effects */}
        <div className="space-y-3 pt-2 border-t border-cyan-500/30">
          <div className="text-sm font-mono text-purple-400">Visual Effects:</div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-cyan-400 font-mono text-xs">Parallax Scroll</span>
              <Switch
                checked={settings.effects.parallax}
                onCheckedChange={() => handleEffectToggle('parallax')}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-cyan-400 font-mono text-xs">Scanlines</span>
              <Switch
                checked={settings.effects.scanlines}
                onCheckedChange={() => handleEffectToggle('scanlines')}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-cyan-400 font-mono text-xs">Motion Blur</span>
              <Switch
                checked={settings.effects.motionBlur}
                onCheckedChange={() => handleEffectToggle('motionBlur')}
              />
            </div>
          </div>
        </div>

        {/* Current Background Preview */}
        {(settings.customFile || settings.customUrl) && (
          <div className="pt-2 border-t border-cyan-500/30">
            <div className="text-xs font-mono text-cyan-400 mb-2">Preview:</div>
            <div className="w-full h-16 rounded border border-cyan-500/30 overflow-hidden">
              <img
                src={settings.customFile || settings.customUrl}
                alt="Background preview"
                className="w-full h-full object-cover opacity-60"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
