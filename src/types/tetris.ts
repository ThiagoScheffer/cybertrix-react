export interface TetrisPiece {
  shape: number[][];
  row: number;
  col: number;
  type: number;
  rarity?: 'uncommon' | 'rare' | 'legendary';
  isNeutrino?: boolean;
  aiGenerated?: boolean;
  fireColor?: number; // For fire blocks - stores which color they will burn, also used for color cleaner target
  isAdvanced?: boolean; // For advanced level blocks
  isNuclear?: boolean; // For nuclear blocks
  isAcid?: boolean; // For acid blocks
  isColorCleaner?: boolean; // For color cleaner blocks
}

export type TetrisBoard = number[][];

export interface GameState {
  board: TetrisBoard;
  currentPiece: TetrisPiece | null;
  nextPiece: TetrisPiece | null;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  paused: boolean;
  clearedLines: number[];
  specialBlockActive: boolean;
  rainbowBlocks: number;
  retrowaveEnabled: boolean;
  comboCount: number;
  aiCustomBlocks: number;
}

export interface AudioSettings {
  youtubeUrl: string;
  volume: number;
  soundEffects: boolean;
}

export interface BackgroundSettings {
  type: 'retrowave' | 'custom' | 'default';
  customUrl?: string;
  customFile?: string;
  effects: {
    parallax: boolean;
    scanlines: boolean;
    motionBlur: boolean;
  };
}

export interface AiMessage {
  id: string;
  text: string;
  timestamp: number;
  type: 'greeting' | 'encouragement' | 'combo' | 'achievement' | 'ambient' | 'custom_block';
}

export interface GridSettings {
  width: number;
  height: number;
  format: 'standard' | 'wide';
}
