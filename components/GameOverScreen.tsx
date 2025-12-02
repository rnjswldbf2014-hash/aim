import React from 'react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-white p-8 bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-md">
      <h2 className="text-5xl md:text-6xl font-bold mb-2">Game Over!</h2>
      <p className="text-2xl text-gray-300 mb-6">Your final score is:</p>
      <p className="text-7xl font-bold text-red-500 mb-8 drop-shadow-lg">{score}</p>
      <button
        onClick={onRestart}
        className="px-10 py-4 bg-red-600 text-white font-bold text-2xl rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
      >
        다시하기
      </button>
    </div>
  );
};

export default GameOverScreen;