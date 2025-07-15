
import React from 'react';
import { TetrisGame } from '@/components/TetrisGame';

const Index = () => {
  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Cyberpunk background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(255,0,255,0.03)_25px,rgba(255,0,255,0.03)_26px,transparent_27px,transparent_74px,rgba(255,0,255,0.03)_75px,rgba(255,0,255,0.03)_76px,transparent_77px,transparent_99px,rgba(255,0,255,0.03)_100px)] bg-[100px_100px]" />
      
      {/* Scan lines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.03)_50%)] bg-[length:100%_4px] animate-pulse" />
      
      <div className="relative z-10">
        <TetrisGame />
      </div>
    </div>
  );
};

export default Index;
