
import React, { useEffect, useState, useMemo } from 'react';

interface AiBackgroundGeneratorProps {
  score: number;
  level: number;
  lines: number;
  comboCount: number;
  gameActive: boolean;
}

interface BackgroundLayer {
  id: string;
  type: 'grid' | 'glitch' | 'neon' | 'particles';
  intensity: number;
  color: string;
  speed: number;
  opacity: number;
}

export const AiBackgroundGenerator = ({ 
  score, 
  level, 
  lines, 
  comboCount, 
  gameActive 
}: AiBackgroundGeneratorProps) => {
  const [layers, setLayers] = useState<BackgroundLayer[]>([]);

  // AI-driven color palette generation based on game metrics
  const generateColorPalette = useMemo(() => {
    const baseHue = (score / 1000) % 360;
    const saturation = Math.min(70 + (level * 2), 100);
    const lightness = Math.max(30, 50 - (comboCount * 2));
    
    return {
      primary: `hsl(${baseHue}, ${saturation}%, ${lightness}%)`,
      secondary: `hsl(${(baseHue + 120) % 360}, ${saturation - 10}%, ${lightness + 10}%)`,
      accent: `hsl(${(baseHue + 240) % 360}, ${saturation + 10}%, ${lightness - 5}%)`,
      glow: `hsl(${baseHue}, 100%, 70%)`
    };
  }, [score, level, comboCount]);

  // Generate dynamic background layers based on game state
  useEffect(() => {
    const newLayers: BackgroundLayer[] = [];

    // Base grid layer - intensity based on level
    newLayers.push({
      id: 'grid-base',
      type: 'grid',
      intensity: Math.min(0.3 + (level * 0.05), 1),
      color: generateColorPalette.primary,
      speed: 1 + (level * 0.1),
      opacity: 0.2 + (level * 0.02)
    });

    // Glitch layer - triggered by high scores or combos
    if (score > 5000 || comboCount > 2) {
      newLayers.push({
        id: 'glitch-overlay',
        type: 'glitch',
        intensity: Math.min((score / 10000) + (comboCount * 0.3), 1),
        color: generateColorPalette.accent,
        speed: 2 + (comboCount * 0.5),
        opacity: 0.1 + (comboCount * 0.05)
      });
    }

    // Neon layer - evolves with gameplay progression
    newLayers.push({
      id: 'neon-glow',
      type: 'neon',
      intensity: Math.min(0.4 + (lines * 0.01), 0.8),
      color: generateColorPalette.glow,
      speed: 0.5 + (level * 0.05),
      opacity: 0.15 + (lines * 0.002)
    });

    // Particle layer - active during high performance
    if (comboCount > 1 || score > 2000) {
      newLayers.push({
        id: 'particles',
        type: 'particles',
        intensity: Math.min((comboCount * 0.4) + (score / 20000), 0.6),
        color: generateColorPalette.secondary,
        speed: 1.5 + (comboCount * 0.3),
        opacity: 0.3
      });
    }

    setLayers(newLayers);
  }, [score, level, lines, comboCount, generateColorPalette]);

  const renderGridLayer = (layer: BackgroundLayer) => (
    <div
      key={layer.id}
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: layer.opacity,
        background: `
          linear-gradient(90deg, transparent 24px, ${layer.color}${Math.floor(layer.intensity * 255).toString(16).padStart(2, '0')} 25px, ${layer.color}${Math.floor(layer.intensity * 255).toString(16).padStart(2, '0')} 26px, transparent 27px),
          linear-gradient(${layer.color}${Math.floor(layer.intensity * 255).toString(16).padStart(2, '0')} 24px, transparent 25px, transparent 26px, ${layer.color}${Math.floor(layer.intensity * 255).toString(16).padStart(2, '0')} 27px)
        `,
        backgroundSize: `${50 / layer.speed}px ${50 / layer.speed}px`,
        animation: `gridMove ${20 / layer.speed}s linear infinite`
      }}
    />
  );

  const renderGlitchLayer = (layer: BackgroundLayer) => (
    <div
      key={layer.id}
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: layer.opacity,
        background: `
          repeating-linear-gradient(
            ${Math.random() * 360}deg,
            transparent,
            transparent ${10 + Math.random() * 20}px,
            ${layer.color}${Math.floor(layer.intensity * 100).toString(16).padStart(2, '0')} ${10 + Math.random() * 20}px,
            ${layer.color}${Math.floor(layer.intensity * 100).toString(16).padStart(2, '0')} ${20 + Math.random() * 30}px
          )
        `,
        animation: `glitchFlicker ${2 / layer.speed}s ease-in-out infinite alternate`
      }}
    />
  );

  const renderNeonLayer = (layer: BackgroundLayer) => (
    <div
      key={layer.id}
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: layer.opacity,
        background: `radial-gradient(ellipse at center, ${layer.color}${Math.floor(layer.intensity * 150).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        animation: `neonPulse ${4 / layer.speed}s ease-in-out infinite alternate`
      }}
    />
  );

  const renderParticleLayer = (layer: BackgroundLayer) => (
    <div
      key={layer.id}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity: layer.opacity }}
    >
      {Array.from({ length: Math.floor(layer.intensity * 20) }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: layer.color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `particleFloat ${5 + Math.random() * 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: `0 0 ${2 + Math.random() * 4}px ${layer.color}`
          }}
        />
      ))}
    </div>
  );

  const renderLayer = (layer: BackgroundLayer) => {
    switch (layer.type) {
      case 'grid': return renderGridLayer(layer);
      case 'glitch': return renderGlitchLayer(layer);
      case 'neon': return renderNeonLayer(layer);
      case 'particles': return renderParticleLayer(layer);
      default: return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {layers.map(renderLayer)}
      
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes glitchFlicker {
          0% { filter: hue-rotate(0deg) brightness(1); }
          25% { filter: hue-rotate(90deg) brightness(1.2); }
          50% { filter: hue-rotate(180deg) brightness(0.8); }
          75% { filter: hue-rotate(270deg) brightness(1.1); }
          100% { filter: hue-rotate(360deg) brightness(1); }
        }
        
        @keyframes neonPulse {
          0% { transform: scale(1) rotate(0deg); filter: brightness(1); }
          100% { transform: scale(1.1) rotate(180deg); filter: brightness(1.3); }
        }
        
        @keyframes particleFloat {
          0% { 
            transform: translateY(100vh) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateY(-10vh) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
