
import React from 'react';

export const GameHeader = () => {
  return (
    <header className="relative border-b border-cyan-500/30 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-cyan-500/10 to-pink-500/10" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CYBER<span className="text-cyan-300">TRIX</span>
            </h1>
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
            <span className="text-cyan-400 font-mono text-sm">v2.0.77</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-green-400 font-mono text-sm">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              ONLINE
            </div>
            <div className="text-purple-400 font-mono text-sm">
              NEURAL LINK: ACTIVE
            </div>
          </div>
        </div>
      </div>
      
      {/* Glitch effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-pulse" />
      </div>
    </header>
  );
};
