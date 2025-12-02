import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types';
import type { Target as TargetType } from './types';
import Target from './components/Target';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';

const INITIAL_TIME = 10; // seconds
const TARGET_MIN_SIZE = 40;
const TARGET_MAX_SIZE = 80;

// Custom Realistic Crosshair SVG
const CURSOR_SVG = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="13" stroke="white" stroke-opacity="0.8" stroke-width="1.5"/>
  <path d="M16 4V10" stroke="#00FF00" stroke-width="2" stroke-linecap="round"/>
  <path d="M16 22V28" stroke="#00FF00" stroke-width="2" stroke-linecap="round"/>
  <path d="M4 16H10" stroke="#00FF00" stroke-width="2" stroke-linecap="round"/>
  <path d="M22 16H28" stroke="#00FF00" stroke-width="2" stroke-linecap="round"/>
  <circle cx="16" cy="16" r="2" fill="#FF0000"/>
</svg>
`;

const CURSOR_URL = `url('data:image/svg+xml;base64,${btoa(CURSOR_SVG)}') 16 16, crosshair`;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Ready);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [target, setTarget] = useState<TargetType | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.error("Web Audio API is not supported in this browser");
      return;
    }

    // Create a new AudioContext per mount to handle React Strict Mode properly
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    return () => {
      if (ctx.state !== 'closed') {
        ctx.close().catch(console.error);
      }
    };
  }, []);

  const playGunshot = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    try {
      const now = audioContext.currentTime;

      // --- Part 1: Heavy Impact (Body) ---
      // Lower frequency triangle wave for a deep thud
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, now); // Lower start freq for weight
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.3); // Slow drop to sub-bass
      
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(1.0, now + 0.01); // Strong attack
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3); // Longer decay for weight

      osc.connect(oscGain);
      oscGain.connect(audioContext.destination);

      // --- Part 2: Muzzle Blast (Texture) ---
      // Low-passed noise for a heavy explosion sound rather than a sharp crack
      const bufferSize = audioContext.sampleRate * 0.4;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;
      
      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(2000, now); // Start with some crunch
      noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.25); // Sweep down to rumble
      
      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.8, now + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);

      // Start sounds
      osc.start(now);
      osc.stop(now + 0.35);
      noise.start(now);
      noise.stop(now + 0.35);

    } catch (error) {
      console.error("Could not play sound:", error);
    }
  }, []);

  const triggerEffects = useCallback(() => {
    playGunshot();
    setIsShaking(true);
    const timeoutId = setTimeout(() => setIsShaking(false), 150);
    return () => clearTimeout(timeoutId);
  }, [playGunshot]);

  const spawnTarget = useCallback(() => {
    const size = Math.floor(Math.random() * (TARGET_MAX_SIZE - TARGET_MIN_SIZE + 1)) + TARGET_MIN_SIZE;
    const x = Math.random() * 90 + 5; // Position from 5% to 95%
    const y = Math.random() * 85 + 10; // Position from 10% to 95% to avoid stats bar

    const newTarget: TargetType = {
      id: Date.now() + Math.random(), // Add random to ensure unique key
      x,
      y,
      size,
    };

    setTarget(newTarget);
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setTarget(null);
  }, []);

  const startGame = () => {
    resetGame();
    setGameState(GameState.Playing);
    spawnTarget();
  };

  const endGame = useCallback(() => {
    setGameState(GameState.GameOver);
    setTarget(null);
  }, []);

  const handleTargetHit = useCallback(() => {
    setScore(prevScore => prevScore + 1);
    setTimeLeft(prevTime => prevTime + 0.5); // Changed to 0.5s
    triggerEffects();
  }, [triggerEffects]);

  const handleMiss = useCallback(() => {
    setTimeLeft(prevTime => Math.max(0, prevTime - 1));
    triggerEffects();
  }, [triggerEffects]);

  const handleTargetDisappeared = useCallback(() => {
    if (gameState === GameState.Playing) {
      spawnTarget();
    }
  }, [gameState, spawnTarget]);

  useEffect(() => {
    if (gameState !== GameState.Playing) return;

    if (timeLeft <= 0) {
      endGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, endGame]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (gameState === GameState.Playing) {
      handleMiss();
    }
  };

  return (
    <main 
      className={`relative w-screen h-screen bg-gray-900 overflow-hidden font-sans select-none ${isShaking ? 'animate-shake' : ''}`}
      style={{ cursor: CURSOR_URL }}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      
      <div className="w-full h-full flex items-center justify-center">
        {gameState === GameState.Ready && <StartScreen onStart={startGame} />}
        {gameState === GameState.GameOver && <GameOverScreen score={score} onRestart={startGame} />}
      </div>

      {gameState === GameState.Playing && (
        <>
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10 bg-black bg-opacity-20 backdrop-blur-sm">
            <div className="text-2xl md:text-3xl font-bold">Score: <span className="text-red-500 tabular-nums w-24 inline-block">{score}</span></div>
            <div className="text-2xl md:text-3xl font-bold">Time: <span className="text-red-500 tabular-nums w-24 inline-block">{timeLeft.toFixed(1)}s</span></div>
          </div>
          
          <div className="w-full h-full">
            {target && (
              <Target 
                key={target.id} 
                targetData={target} 
                onHit={handleTargetHit} 
                onDisappeared={handleTargetDisappeared}
              />
            )}
          </div>
        </>
      )}
    </main>
  );
};

export default App;