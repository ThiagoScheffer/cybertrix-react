
import React from 'react';
import { TetrisBoard, TetrisPiece, GridSettings } from '@/types/tetris';

interface GameBoardProps {
  gridSettings: GridSettings;
  board: TetrisBoard;
  currentPiece: TetrisPiece | null;
  gameOver: boolean;
  paused: boolean;
  clearedLines: number[];
  specialBlockActive: boolean;
  retrowaveEnabled: boolean;
  comboCount: number;
  gravityEffectActive: boolean;
  showCoffeeBonus: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  gridSettings,
  board,
  currentPiece,
  gameOver,
  paused,
  clearedLines,
  specialBlockActive,
  retrowaveEnabled,
  comboCount,
  gravityEffectActive,
  showCoffeeBonus
}) => {
  const getCellColor = (type: number) => {
    const colors = {
      1: "bg-cyan-500",
      2: "bg-yellow-500", 
      3: "bg-purple-500",
      4: "bg-green-500",
      5: "bg-red-500",
      6: "bg-blue-500",
      7: "bg-orange-500",
      8: "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
      9: "bg-gradient-to-r from-pink-500 via-cyan-500 via-yellow-500 to-purple-500",
      11: "bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600",
      12: "bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600",
      13: "bg-gradient-to-r from-amber-400 via-orange-500 to-red-600",
      15: "bg-gradient-to-r from-lime-400 via-green-500 to-emerald-600",
      16: "bg-gradient-to-r from-white via-gray-100 to-white",
      50: "bg-gradient-to-r from-white via-blue-200 to-cyan-300",
      99: "bg-gradient-to-r from-red-400 via-red-500 to-red-600" // AI Custom Block - glowing red
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  const renderBoard = () => {
    return board.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((cell, colIndex) => {
          const isClearedLine = clearedLines.includes(rowIndex);
          const isCurrentPiece = currentPiece &&
            rowIndex >= currentPiece.row &&
            rowIndex < currentPiece.row + currentPiece.shape.length &&
            colIndex >= currentPiece.col &&
            colIndex < currentPiece.col + currentPiece.shape[0].length &&
            currentPiece.shape[rowIndex - currentPiece.row][colIndex - currentPiece.col] !== 0;

          let cellType = cell;
          if (isCurrentPiece) {
            cellType = currentPiece.shape[rowIndex - currentPiece.row][colIndex - currentPiece.col];
          }

          return (
            <div
              key={colIndex}
              className={`
                w-6 h-6 border border-cyan-500/30
                ${cellType === 0 ? 'bg-black/20' : getCellColor(cellType)}
                ${isClearedLine ? 'opacity-0 transition-opacity duration-500' : ''}
                ${gravityEffectActive ? 'animate-bounce' : ''}
                ${cellType >= 8 ? 'shadow-lg animate-pulse' : ''}
                ${cellType === 0 ? 'shadow-inner' : ''}
              `}
              style={{
                boxShadow: cellType === 0 
                  ? 'inset 0 0 8px rgba(0, 255, 255, 0.1)' 
                  : cellType >= 8 
                    ? '0 0 12px rgba(0, 255, 255, 0.4)' 
                    : '0 0 4px rgba(0, 255, 255, 0.2)'
              }}
            >
              {cellType !== 0 && (
                <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
              )}
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div 
      className="relative bg-black/90 rounded-lg border-2 border-cyan-500/50 shadow-2xl overflow-hidden"
      style={{
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)'
      }}
    >
      {/* Paused overlay */}
      {paused && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-4xl font-mono text-cyan-400 animate-pulse">
            PAUSED
          </div>
        </div>
      )}
      
      {/* Game over overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center z-10">
          <div className="text-4xl font-mono text-red-400 animate-pulse">
            GAME OVER
          </div>
        </div>
      )}
      
      {/* Neon glow border effect */}
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 255, 0.1) 50%, transparent 70%)',
          animation: 'neon-pulse 2s ease-in-out infinite alternate'
        }}
      />
      
      <div className="p-2">
        {renderBoard()}
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes neon-pulse {
            0% {
              box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
            }
            100% {
              box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
            }
          }
        `
      }} />
    </div>
  );
};
