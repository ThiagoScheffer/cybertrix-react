
import { useCallback, useRef } from 'react';

export interface SoundEffects {
  playDropSound: () => void;
  playRotateSound: () => void;
  playLineClearSound: () => void;
  playComboSound: () => void;
  playScoreSound: () => void;
  playGameOverSound: () => void;
  playPowerUpSound: () => void;
  playSpecialBlockSound: () => void;
  playRaritySound: (rarity: 'uncommon' | 'rare' | 'legendary') => void;
}

export const useSoundEffects = () => {
  const soundCallbacksRef = useRef<SoundEffects>({
    playDropSound: () => {},
    playRotateSound: () => {},
    playLineClearSound: () => {},
    playComboSound: () => {},
    playScoreSound: () => {},
    playGameOverSound: () => {},
    playPowerUpSound: () => {},
    playSpecialBlockSound: () => {},
    playRaritySound: () => {},
  });

  const registerSoundCallbacks = useCallback((callbacks: SoundEffects) => {
    soundCallbacksRef.current = callbacks;
  }, []);

  const playSounds = useCallback(() => soundCallbacksRef.current, []);

  return {
    registerSoundCallbacks,
    playSounds
  };
};
