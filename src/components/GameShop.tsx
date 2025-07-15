
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Sparkles } from 'lucide-react';

interface GameShopProps {
  score: number;
  rainbowBlocks: number;
  onPurchaseRainbowBlock: () => void;
}

export const GameShop = ({ score, rainbowBlocks, onPurchaseRainbowBlock }: GameShopProps) => {
  const canAffordRainbowBlock = score >= 1000;
  const availablePurchases = Math.floor(score / 1000);

  return (
    <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-cyan-400 font-mono text-lg mb-4 border-b border-cyan-500/30 pb-2 flex items-center">
        <ShoppingCart className="w-5 h-5 mr-2" />
        NEURAL SHOP
      </h3>
      
      <div className="space-y-4">
        {/* Rainbow Block Item */}
        <div className="border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded mr-2 animate-pulse" />
              <span className="text-purple-400 font-mono text-sm font-bold">Rainbow Block</span>
            </div>
            <span className="text-green-400 font-mono text-sm">1000 pts</span>
          </div>
          
          <p className="text-cyan-400/70 font-mono text-xs mb-3">
            Universal shape adapter - matches any needed configuration
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono">
              <span className="text-purple-400">Owned: </span>
              <span className="text-green-400">{rainbowBlocks}</span>
            </div>
            <Button
              onClick={onPurchaseRainbowBlock}
              disabled={!canAffordRainbowBlock}
              size="sm"
              className={`font-mono text-xs ${
                canAffordRainbowBlock 
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white' 
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              BUY
            </Button>
          </div>
        </div>

        {/* Purchase Info */}
        <div className="text-xs font-mono space-y-1">
          <div className="text-cyan-400/70">
            Available purchases: <span className="text-green-400">{availablePurchases}</span>
          </div>
          <div className="text-purple-400/70">
            • Rainbow blocks adapt to any shape
          </div>
          <div className="text-purple-400/70">
            • Automatically used when needed
          </div>
        </div>
      </div>
    </div>
  );
};
