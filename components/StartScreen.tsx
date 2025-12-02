import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-white p-8 bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-md">
      <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter text-shadow-lg">Aim Trainer</h1>
      <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-md">
        타겟을 맞히면 0.5초가 추가되고, 빗나가면 1초가 감소합니다. 최대한 오래 버텨보세요!
      </p>
      <button
        onClick={onStart}
        className="px-10 py-4 bg-red-600 text-white font-bold text-2xl rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
      >
        게임 시작
      </button>
    </div>
  );
};

export default StartScreen;