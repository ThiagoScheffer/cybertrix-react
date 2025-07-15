
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music, Play, Pause } from 'lucide-react';
import { SoundEffects } from '@/hooks/useSoundEffects';

interface AudioManagerProps {
  onSoundCallbacksReady: (callbacks: SoundEffects) => void;
  gameStarted?: boolean;
}

export const AudioManager = ({ onSoundCallbacksReady, gameStarted }: AudioManagerProps) => {
  const defaultYoutubeUrl = 'https://youtu.be/BFEEgfJoqjg?list=PL5ns33t2DKyESZBt9iFaCglerwdKrWPIy&t=2139';
  const [youtubeUrl, setYoutubeUrl] = useState(defaultYoutubeUrl);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-load default music when game starts
  useEffect(() => {
    if (gameStarted && !videoId) {
      const id = extractVideoId(defaultYoutubeUrl);
      if (id) {
        setVideoId(id);
        setMusicPlaying(true);
      }
    }
  }, [gameStarted, videoId]);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playCyberpunkSound = (config: {
    frequency: number;
    duration: number;
    type?: OscillatorType;
    volume?: number;
    fade?: boolean;
    detune?: number;
  }) => {
    if (!soundEnabled) return;
    
    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filterNode = audioContext.createBiquadFilter();
    
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(config.frequency * 2, audioContext.currentTime);
    
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = config.frequency;
    oscillator.type = config.type || 'sawtooth';
    if (config.detune) oscillator.detune.value = config.detune;
    
    const volume = (config.volume || 0.1) * 0.3;
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    
    if (config.fade) {
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + config.duration);
    } else {
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime + config.duration - 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + config.duration);
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + config.duration);
  };

  const playMultiToneSound = (tones: Array<{frequency: number, delay?: number}>, baseDuration: number, type: OscillatorType = 'sawtooth') => {
    tones.forEach((tone, index) => {
      setTimeout(() => {
        playCyberpunkSound({
          frequency: tone.frequency,
          duration: baseDuration,
          type,
          volume: 0.08,
          fade: true
        });
      }, tone.delay || index * 50);
    });
  };

  // Enhanced cyberpunk sound effects
  const blockDropSound = () => {
    playCyberpunkSound({
      frequency: 150,
      duration: 0.15,
      type: 'sawtooth',
      volume: 0.12,
      fade: true,
      detune: -200
    });
  };

  const blockRotateSound = () => {
    playCyberpunkSound({
      frequency: 400,
      duration: 0.08,
      type: 'square',
      volume: 0.08,
      detune: 100
    });
  };

  const lineClearSound = () => {
    playMultiToneSound([
      { frequency: 523 },
      { frequency: 659, delay: 80 },
      { frequency: 784, delay: 160 },
      { frequency: 1047, delay: 240 }
    ], 0.3, 'triangle');
  };

  const comboSound = () => {
    playMultiToneSound([
      { frequency: 200 },
      { frequency: 400, delay: 50 },
      { frequency: 800, delay: 100 },
      { frequency: 1200, delay: 150 }
    ], 0.4, 'sawtooth');
  };

  const scoreSound = () => {
    playMultiToneSound([
      { frequency: 392 },
      { frequency: 523, delay: 100 },
      { frequency: 659, delay: 200 },
      { frequency: 523, delay: 300 },
      { frequency: 784, delay: 400 }
    ], 0.25, 'triangle');
  };

  const gameOverSound = () => {
    playMultiToneSound([
      { frequency: 659 },
      { frequency: 523, delay: 200 },
      { frequency: 392, delay: 400 },
      { frequency: 294, delay: 600 },
      { frequency: 196, delay: 800 }
    ], 0.6, 'sawtooth');
  };

  const powerUpSound = () => {
    playMultiToneSound([
      { frequency: 330 },
      { frequency: 415, delay: 60 },
      { frequency: 523, delay: 120 },
      { frequency: 659, delay: 180 },
      { frequency: 880, delay: 240 }
    ], 0.2, 'square');
  };

  const specialBlockSound = () => {
    playCyberpunkSound({
      frequency: 440,
      duration: 0.5,
      type: 'sine',
      volume: 0.15,
      fade: true
    });
    
    setTimeout(() => {
      playCyberpunkSound({
        frequency: 880,
        duration: 0.3,
        type: 'triangle',
        volume: 0.1,
        fade: true,
        detune: 50
      });
    }, 200);
  };

  const raritySound = (rarity: 'uncommon' | 'rare' | 'legendary') => {
    switch (rarity) {
      case 'uncommon':
        playMultiToneSound([
          { frequency: 440 },
          { frequency: 554, delay: 100 },
          { frequency: 659, delay: 200 }
        ], 0.4, 'sine');
        break;
      case 'rare':
        playMultiToneSound([
          { frequency: 523 },
          { frequency: 659, delay: 80 },
          { frequency: 784, delay: 160 },
          { frequency: 1047, delay: 240 },
          { frequency: 1319, delay: 320 }
        ], 0.5, 'triangle');
        break;
      case 'legendary':
        // Epic legendary sound with multiple layers
        playMultiToneSound([
          { frequency: 329 },
          { frequency: 415, delay: 100 },
          { frequency: 523, delay: 200 },
          { frequency: 659, delay: 300 },
          { frequency: 830, delay: 400 },
          { frequency: 1047, delay: 500 }
        ], 0.6, 'sine');
        
        setTimeout(() => {
          playMultiToneSound([
            { frequency: 220 },
            { frequency: 277, delay: 100 },
            { frequency: 349, delay: 200 }
          ], 0.8, 'sawtooth');
        }, 200);
        break;
    }
  };

  useEffect(() => {
    // Create sound callbacks object
    const soundCallbacks: SoundEffects = {
      playDropSound: blockDropSound,
      playRotateSound: blockRotateSound,
      playLineClearSound: lineClearSound,
      playComboSound: comboSound,
      playScoreSound: scoreSound,
      playGameOverSound: gameOverSound,
      playPowerUpSound: powerUpSound,
      playSpecialBlockSound: specialBlockSound,
      playRaritySound: raritySound,
    };

    onSoundCallbacksReady(soundCallbacks);
  }, [soundEnabled, onSoundCallbacksReady]);

  const extractVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleYoutubeLoad = () => {
    if (youtubeUrl) {
      const id = extractVideoId(youtubeUrl);
      if (id) {
        setVideoId(id);
        setMusicPlaying(true);
      }
    }
  };

  const toggleMusic = () => {
    setMusicPlaying(!musicPlaying);
  };

  const stopMusic = () => {
    setVideoId(null);
    setMusicPlaying(false);
    // Force iframe reload to completely stop music
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  };

  return (
    <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2">
        AUDIO CONTROL
      </h3>
      
      <div className="space-y-4">
        {/* YouTube Music Input */}
        <div>
          <label className="text-purple-400 font-mono text-sm block mb-2">
            YouTube Music URL:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 bg-black/60 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded text-sm font-mono"
            />
            <Button
              onClick={handleYoutubeLoad}
              disabled={!youtubeUrl}
              size="sm"
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              <Music className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-cyan-400/70 mt-1 font-mono">
            Default: Cyberpunk music auto-loads on game start
          </div>
        </div>

        {/* YouTube Player */}
        {videoId && (
          <div className="space-y-2">
            <div className="aspect-video w-full max-h-32">
              <iframe
                ref={iframeRef}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=${musicPlaying ? 1 : 0}&controls=1&modestbranding=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded border border-cyan-500/30"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={toggleMusic}
                size="sm"
                className="bg-purple-600 hover:bg-purple-500 text-white"
              >
                {musicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                onClick={stopMusic}
                size="sm"
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Stop
              </Button>
            </div>
          </div>
        )}

        {/* Sound Controls */}
        <div className="flex justify-between items-center">
          <span className="text-purple-400 font-mono text-sm">Sound Effects:</span>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="sm"
            className={`border-cyan-500/50 ${soundEnabled ? 'text-green-400' : 'text-red-400'}`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>

        <div className="text-xs font-mono text-cyan-400/70 space-y-1">
          <div>• <span className="text-yellow-400">Drop:</span> Cyberpunk bass hit</div>
          <div>• <span className="text-green-400">Rotate:</span> Digital click</div>
          <div>• <span className="text-purple-400">Line clear:</span> Ascending synth</div>
          <div>• <span className="text-orange-400">Combo:</span> Power surge</div>
          <div>• <span className="text-cyan-400">Power-up:</span> Retro chime</div>
          <div>• <span className="text-pink-400">Special:</span> Mystical tone</div>
          <div>• <span className="text-emerald-400">Uncommon:</span> Ethereal chime</div>
          <div>• <span className="text-indigo-400">Rare:</span> Divine cascade</div>
          <div>• <span className="text-amber-400">Legendary:</span> Epic fanfare</div>
          <div>• <span className="text-amber-400">Coffee:</span> Legendary combo bonus</div>
        </div>
      </div>
    </div>
  );
};
