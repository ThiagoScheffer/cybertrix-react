
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bot, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import { AiMessage, TetrisPiece, TetrisBoard } from '@/types/tetris';

interface AiChatCompanionProps {
  score: number;
  level: number;
  comboCount: number;
  gameOver: boolean;
  paused: boolean;
  board: TetrisBoard;
  currentPiece: TetrisPiece | null;
  nextPiece: TetrisPiece | null;
  lines: number;
  onCustomBlockSuggestion: () => void;
  gameStarted?: boolean;
  specialBlockActive: boolean;
}

type PersonalityMode = 'encouraging' | 'strategic' | 'teasing' | 'supportive';
type PerformanceTrend = 'improving' | 'struggling' | 'stable' | 'declining';

interface PerformanceMetrics {
  recentScores: number[];
  recentLineCounts: number[];
  recentCombos: number[];
  nearMissCount: number;
  perfectPlacements: number;
  riskTaking: number;
}

export const AiChatCompanion = ({
  score,
  level,
  comboCount,
  gameOver,
  paused,
  board,
  currentPiece,
  nextPiece,
  lines,
  onCustomBlockSuggestion,
  gameStarted = false,
  specialBlockActive
}: AiChatCompanionProps) => {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [personalityMode, setPersonalityMode] = useState<PersonalityMode>('encouraging');
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrend>('stable');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    recentScores: [],
    recentLineCounts: [],
    recentCombos: [],
    nearMissCount: 0,
    perfectPlacements: 0,
    riskTaking: 0
  });
  
  const [lastCombo, setLastCombo] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [lastLevel, setLastLevel] = useState(1);
  const [lastLines, setLastLines] = useState(0);
  const [lastGameStarted, setLastGameStarted] = useState(false);
  const [consecutiveNearMisses, setConsecutiveNearMisses] = useState(0);
  const [lastBoardHeight, setLastBoardHeight] = useState(0);
  const [lastNextPieceType, setLastNextPieceType] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Memoized adaptive personality object to prevent recreation
  const adaptivePersonality = useMemo(() => ({
    greetings: {
      encouraging: [
        "Ready to show this grid who's boss? Let's do this!",
        "Neural pathways optimized for success. You've got this!",
        "Time to create some digital magic. I believe in you!",
        "The matrix awaits your mastery. Let's make it legendary!"
      ],
      strategic: [
        "Tactical analysis initialized. Precision mode engaged.",
        "Grid warfare protocols active. Calculate every move.",
        "Strategic dominance subroutines online. Think three moves ahead.",
        "Advanced pattern recognition ready. Let's optimize your play."
      ],
      teasing: [
        "Think you can handle the pressure this time?",
        "The grid remembers your last performance... let's see improvement.",
        "Confidence detected. Let's see if you can back it up.",
        "Ready to prove that last game wasn't just beginner's luck?"
      ],
      supportive: [
        "No pressure here, just focus on having fun.",
        "Every master was once a beginner. You're improving!",
        "Remember, it's about progress, not perfection.",
        "Take your time. The grid isn't going anywhere."
      ]
    },
    
    realTimeAnalysis: {
      tSpin: {
        encouraging: "INCREDIBLE T-SPIN! You're absolutely crushing it!",
        strategic: "Masterful T-spin execution. Tactical superiority confirmed.",
        teasing: "Not bad! Maybe you do know what you're doing after all.",
        supportive: "Beautiful T-spin! You're really getting the hang of this!"
      },
      
      nearMiss: {
        encouraging: "Whoa! That was close, but you pulled through like a champion!",
        strategic: "Critical threshold breach avoided. Defensive protocols recommended.",
        teasing: "Cutting it a bit close there, aren't we? Heart still beating?",
        supportive: "That was scary, but you handled it perfectly. Stay calm!"
      },
      
      perfectClear: {
        encouraging: "PERFECT CLEAR! You absolute legend! The grid bows to you!",
        strategic: "Flawless execution achieved. Maximum efficiency protocols successful.",
        teasing: "Well, well... looks like someone's been practicing in secret.",
        supportive: "Amazing perfect clear! You should be so proud of that!"
      },
      
      risky: {
        encouraging: "Bold move! Fortune favors the brave!",
        strategic: "High-risk maneuver detected. Calculated aggression noted.",
        teasing: "Living dangerously, I see. Hope you know what you're doing!",
        supportive: "That's a brave choice! Trust your instincts!"
      }
    },
    
    emotionalFeedback: {
      celebrating: {
        encouraging: [
          "You're absolutely ON FIRE! This is incredible!",
          "UNSTOPPABLE! The matrix can't contain your power!",
          "LEGENDARY performance! You're rewriting the rules!"
        ],
        strategic: [
          "Peak performance metrics achieved. Maintaining momentum.",
          "Optimal efficiency patterns detected. Continue current strategy.",
          "Superior tactical execution. Victory protocols engaged."
        ],
        teasing: [
          "Okay, okay, I'm impressed. Don't let it go to your head!",
          "Show off! But I have to admit, that was pretty good.",
          "Alright, you've earned some bragging rights this time."
        ],
        supportive: [
          "You're doing amazing! Keep up this fantastic momentum!",
          "What a wonderful streak! You should feel proud!",
          "This is exactly what I hoped to see from you!"
        ]
      },
      
      struggling: {
        encouraging: [
          "Tough break! Champions are made in moments like these!",
          "Shake it off! You've got the skills to turn this around!",
          "This is just a setup for an epic comeback!"
        ],
        strategic: [
          "Analyzing failure patterns. Tactical adjustment recommended.",
          "Current strategy requires modification. Adapting approach.",
          "Performance metrics declining. Implementing recovery protocols."
        ],
        teasing: [
          "Rough patch? Don't worry, even the pros have off days.",
          "Ouch! That one stung. Ready to show me you can bounce back?",
          "The grid's getting feisty. Time to put it in its place!"
        ],
        supportive: [
          "It's okay, everyone has tough moments. You're still learning!",
          "Don't worry about it. Focus on the next piece.",
          "These challenges make victory even sweeter. Keep going!"
        ]
      }
    },
    
    adaptiveComments: {
      improving: [
        "I can see your skills evolving in real-time! Impressive growth!",
        "Your pattern recognition is sharpening beautifully!",
        "That's the kind of improvement I love to see!"
      ],
      declining: [
        "Let's refocus those neural pathways. You've got this!",
        "Sometimes we need to slow down to speed up. Take your time.",
        "The grid's testing you. Show it your determination!"
      ]
    }
  }), []);

  const addMessage = useCallback((text: string, type: AiMessage['type']) => {
    const newMessage: AiMessage = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now(),
      type
    };
    
    setMessages(prev => [...prev.slice(-5), newMessage]);
  }, []);

  // Clear messages when a new game starts - FIXED: Prevent infinite loop
  useEffect(() => {
    if (gameStarted && !lastGameStarted && !gameOver) {
      setMessages([]);
      setPerformanceMetrics({
        recentScores: [],
        recentLineCounts: [],
        recentCombos: [],
        nearMissCount: 0,
        perfectPlacements: 0,
        riskTaking: 0
      });
      setConsecutiveNearMisses(0);
      setPersonalityMode('encouraging');
      setPerformanceTrend('stable');
      
      const greeting = adaptivePersonality.greetings.encouraging[0];
      addMessage(greeting, 'greeting');
    }
    setLastGameStarted(gameStarted);
  }, [gameStarted, lastGameStarted, gameOver, addMessage, adaptivePersonality.greetings.encouraging]);

  // Special block detection - FIXED: Only check type change to prevent infinite loop
  useEffect(() => {
    if (!nextPiece) {
      setLastNextPieceType(null);
      return;
    }

    const currentType = nextPiece.type;
    if (currentType !== lastNextPieceType && lastNextPieceType !== null) {
      let specialMessage = '';
      let messageType: AiMessage['type'] = 'ambient';

      // Fire block detection
      if (currentType === 13) {
        specialMessage = '🔥 FIRE BLOCK incoming! Burns surrounding blocks in 1-block radius!';
        messageType = 'custom_block';
      }
      // Neutrino block detection
      else if (nextPiece.isNeutrino) {
        specialMessage = '⚡ NEUTRINO BLOCK detected! Phases through blocks to lowest empty spot!';
        messageType = 'custom_block';
      }
      // Advanced block detection
      else if (nextPiece.isAdvanced) {
        const advancedNames = {
          9: 'T-ADVANCED',
          10: 'F-ADVANCED', 
          11: 'U-ADVANCED',
          12: 'E-ADVANCED'
        };
        const blockName = advancedNames[currentType as keyof typeof advancedNames] || 'ADVANCED';
        specialMessage = `🔮 ${blockName} BLOCK approaching! Complex shape with 25% score bonus!`;
        messageType = 'custom_block';
      }
      // Rainbow block detection
      else if (currentType === 8) {
        specialMessage = '🌈 RAINBOW BLOCK ready! Shape-shift with SPACE key - ultimate versatility!';
        messageType = 'custom_block';
      }
      // Rarity-based blocks
      else if (nextPiece.rarity) {
        const rarityEffects = {
          uncommon: '💎 UNCOMMON BLOCK spotted! Removes 2 random blocks from nearly-full rows.',
          rare: '💠 RARE BLOCK incoming! Duplicates itself in strategic positions for combo potential!',
          legendary: '⭐ LEGENDARY BLOCK detected! Triggers gravity effect - all blocks fall down!'
        };
        specialMessage = rarityEffects[nextPiece.rarity];
        messageType = 'custom_block';
      }

      if (specialMessage) {
        addMessage(specialMessage, messageType);
      }
    }

    setLastNextPieceType(currentType);
  }, [nextPiece?.type, nextPiece?.isNeutrino, nextPiece?.isAdvanced, nextPiece?.rarity, lastNextPieceType, addMessage]);

  // Analyze board state - MEMOIZED to prevent recalculation
  const analyzeGameState = useCallback(() => {
    if (!board || !currentPiece) return null;

    let heightSum = 0;
    let maxHeight = 0;
    let holes = 0;
    let riskyAreas = 0;
    let topRowBlocks = 0;

    // Calculate board metrics
    for (let col = 0; col < board[0].length; col++) {
      let colHeight = 0;
      let foundBlock = false;
      
      for (let row = board.length - 1; row >= 0; row--) {
        if (board[row][col] !== 0) {
          if (!foundBlock) {
            colHeight = board.length - row;
            foundBlock = true;
          }
        } else if (foundBlock) {
          holes++;
        }
      }
      
      heightSum += colHeight;
      maxHeight = Math.max(maxHeight, colHeight);
      
      if (colHeight > 15) riskyAreas++;
      if (board[2][col] !== 0) topRowBlocks++; // Check top area
    }

    const avgHeight = heightSum / board[0].length;
    const isNearMiss = maxHeight >= 18 || topRowBlocks > 3;
    const isPerfectClear = heightSum === 0;
    const isRisky = riskyAreas > 2 || avgHeight > 12;

    return { avgHeight, maxHeight, holes, riskyAreas, isNearMiss, isPerfectClear, isRisky, topRowBlocks };
  }, [board, currentPiece]);

  // Update personality mode - MEMOIZED to prevent infinite recalculation
  const updatePersonalityMode = useCallback(() => {
    const recentPerformance = performanceMetrics.recentScores.slice(-3);
    const avgRecent = recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length || 0;
    const isImproving = recentPerformance.length >= 2 && recentPerformance[recentPerformance.length - 1] > recentPerformance[0];
    
    if (consecutiveNearMisses >= 3 || performanceMetrics.nearMissCount > 5) {
      setPersonalityMode('supportive');
      setPerformanceTrend('struggling');
    } else if (avgRecent > score * 1.2 || performanceMetrics.perfectPlacements > 2) {
      setPersonalityMode('teasing');
      setPerformanceTrend('improving');
    } else if (isImproving && comboCount > 3) {
      setPersonalityMode('encouraging');
      setPerformanceTrend('improving');
    } else if (level >= 5 && performanceMetrics.riskTaking > 3) {
      setPersonalityMode('strategic');
      setPerformanceTrend('stable');
    } else {
      setPersonalityMode('encouraging');
      setPerformanceTrend('stable');
    }
  }, [performanceMetrics, consecutiveNearMisses, score, comboCount, level]);

  // Real-time game analysis - THROTTLED to prevent excessive updates
  useEffect(() => {
    if (gameOver || paused) return;
    
    const gameState = analyzeGameState();
    if (!gameState) return;

    // Update performance metrics
    setPerformanceMetrics(prev => ({
      ...prev,
      recentScores: [...prev.recentScores.slice(-4), score],
      riskTaking: gameState.isRisky ? prev.riskTaking + 1 : prev.riskTaking,
      nearMissCount: gameState.isNearMiss ? prev.nearMissCount + 1 : prev.nearMissCount,
      perfectPlacements: gameState.isPerfectClear ? prev.perfectPlacements + 1 : prev.perfectPlacements
    }));

    // Track consecutive near misses
    if (gameState.isNearMiss) {
      setConsecutiveNearMisses(prev => prev + 1);
    } else if (gameState.avgHeight < 8) {
      setConsecutiveNearMisses(0);
    }

    // Near-miss save detection
    if (lastBoardHeight >= 18 && gameState.maxHeight < 15) {
      const message = adaptivePersonality.realTimeAnalysis.nearMiss[personalityMode];
      addMessage(message, 'combo');
    }

    // Perfect clear detection
    if (gameState.isPerfectClear && lastBoardHeight > 0) {
      const message = adaptivePersonality.realTimeAnalysis.perfectClear[personalityMode];
      addMessage(message, 'combo');
    }

    // Risky placement detection - THROTTLED
    if (gameState.isRisky && Math.random() < 0.1) { // Reduced from 0.3 to 0.1
      const message = adaptivePersonality.realTimeAnalysis.risky[personalityMode];
      addMessage(message, 'ambient');
    }

    setLastBoardHeight(gameState.maxHeight);
  }, [gameOver, paused, analyzeGameState, personalityMode, lastBoardHeight, adaptivePersonality, addMessage]);

  // Enhanced combo detection - FIXED dependencies
  useEffect(() => {
    if (comboCount > lastCombo && comboCount >= 2) {
      // Detect potential T-spin (simplified detection)
      const isPotentialTSpin = currentPiece?.type === 7 && comboCount >= 2; // T-piece with combo
      
      if (isPotentialTSpin) {
        const message = adaptivePersonality.realTimeAnalysis.tSpin[personalityMode];
        addMessage(message, 'combo');
      } else {
        const comboMessages = [
          `${comboCount}x COMBO! ${personalityMode === 'teasing' ? "Not bad for a human!" : "Neural pathways synchronizing!"}`,
          `Chain reaction! Combo multiplier: ${comboCount}x`,
          `Consecutive elimination protocol: ${comboCount}x efficiency!`
        ];
        addMessage(comboMessages[Math.floor(Math.random() * comboMessages.length)], 'combo');
      }
    }
    setLastCombo(comboCount);
  }, [comboCount, lastCombo, personalityMode, currentPiece?.type, adaptivePersonality, addMessage]);

  // Emotional feedback system - THROTTLED
  useEffect(() => {
    if (score > lastScore && score > 0) {
      const scoreDiff = score - lastScore;
      updatePersonalityMode();
      
      // Celebrating high scores - THROTTLED
      if (scoreDiff >= 2000 || (score > 0 && score % 5000 === 0)) {
        const messages = adaptivePersonality.emotionalFeedback.celebrating[personalityMode];
        addMessage(messages[Math.floor(Math.random() * messages.length)], 'combo');
      }
      
      setLastScore(score);
    }
  }, [score, lastScore, personalityMode, updatePersonalityMode, adaptivePersonality, addMessage]);

  // Performance trend analysis - THROTTLED
  useEffect(() => {
    if (lines > lastLines && performanceMetrics.recentLineCounts.length >= 3) {
      const trend = performanceMetrics.recentLineCounts;
      const isImproving = trend[trend.length - 1] > trend[0];
      const isDeclining = trend[trend.length - 1] < trend[0] && trend.every((v, i) => i === 0 || v <= trend[i - 1]);
      
      if (isImproving && Math.random() < 0.2) { // Reduced from 0.4 to 0.2
        const messages = adaptivePersonality.adaptiveComments.improving;
        addMessage(messages[Math.floor(Math.random() * messages.length)], 'ambient');
      } else if (isDeclining && Math.random() < 0.15) { // Reduced from 0.3 to 0.15
        const messages = adaptivePersonality.adaptiveComments.declining;
        addMessage(messages[Math.floor(Math.random() * messages.length)], 'ambient');
      }
    }
    
    setPerformanceMetrics(prev => ({
      ...prev,
      recentLineCounts: [...prev.recentLineCounts.slice(-4), lines]
    }));
    setLastLines(lines);
  }, [lines, lastLines, performanceMetrics.recentLineCounts, adaptivePersonality, addMessage]);

  // Level up with personality-aware messages - FIXED
  useEffect(() => {
    if (level > lastLevel) {
      const levelMessages = {
        encouraging: "Level up! You're unstoppable!",
        strategic: "Level advancement confirmed. Difficulty parameters increased.",
        teasing: "Level up! Think you can handle the heat?",
        supportive: "Great job leveling up! You're doing wonderfully!"
      };
      addMessage(levelMessages[personalityMode], 'greeting');
      setLastLevel(level);
    }
  }, [level, lastLevel, personalityMode, addMessage]);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-cyan-600/80 hover:bg-cyan-500/80 backdrop-blur-sm border border-cyan-400/50 rounded-full p-3 text-white shadow-lg transition-all"
        >
          <Bot className="w-6 h-6" />
        </button>
      </div>
    );
  }

  const getPersonalityColor = () => {
    switch (personalityMode) {
      case 'encouraging': return 'text-green-400 border-green-500/30';
      case 'strategic': return 'text-blue-400 border-blue-500/30';
      case 'teasing': return 'text-orange-400 border-orange-500/30';
      case 'supportive': return 'text-purple-400 border-purple-500/30';
      default: return 'text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="border border-cyan-500/30 bg-black/80 backdrop-blur-sm rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Bot className="w-5 h-5 mr-2 text-cyan-400" />
          <div className="flex flex-col">
            <h3 className="text-cyan-400 font-mono text-sm">AI COMPANION</h3>
            <span className={`text-xs font-mono ${getPersonalityColor()}`}>
              {personalityMode.toUpperCase()} • {performanceTrend.toUpperCase()}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-cyan-400/60 hover:text-cyan-400 transition-colors"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 min-h-[120px] max-h-[180px] overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`text-xs font-mono p-2 rounded border ${
              message.type === 'combo' 
                ? `bg-purple-900/30 border-purple-500/30 text-purple-300 ${personalityMode === 'encouraging' ? 'animate-pulse' : ''}`
                : message.type === 'custom_block'
                ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/50 text-yellow-200 animate-pulse'
                : message.type === 'greeting'
                ? `bg-green-900/30 border-green-500/30 text-green-300`
                : 'bg-cyan-900/20 border-cyan-500/20 text-cyan-300'
            }`}
          >
            <div className="flex items-start">
              <MessageCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
              <span>{message.text}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {score >= 1500 && (
        <button
          onClick={onCustomBlockSuggestion}
          className="w-full mt-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white border border-yellow-400/50 rounded px-3 py-2 text-xs font-mono transition-all"
        >
          REQUEST AI BLOCK (1500 pts)
        </button>
      )}
    </div>
  );
};
