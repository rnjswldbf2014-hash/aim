import React, { useState, useEffect, memo } from 'react';
import type { Target as TargetType } from '../types';

interface TargetProps {
  targetData: TargetType;
  onHit: () => void;
  onDisappeared: () => void;
}

const Target: React.FC<TargetProps> = ({ targetData, onHit, onDisappeared }) => {
  const [isHit, setIsHit] = useState(false);
  const [isGone, setIsGone] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the main container
    if (isHit) return;
    setIsHit(true);
    onHit();
  };

  useEffect(() => {
    if (isHit) {
      const timer = setTimeout(() => {
        setIsGone(true);
        onDisappeared();
      }, 150); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isHit, onDisappeared]);

  if (isGone) {
    return null;
  }

  return (
    <div
      className={`absolute flex items-center justify-center rounded-full transition-all duration-150 ease-in-out ${
        isHit ? 'scale-125 opacity-0' : 'scale-100 opacity-100'
      }`}
      style={{
        left: `${targetData.x}%`,
        top: `${targetData.y}%`,
        width: `${targetData.size}px`,
        height: `${targetData.size}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={handleClick} // onMouseDown feels more responsive for shooting games
    >
      <div className="w-full h-full bg-red-500 rounded-full border-2 md:border-4 border-white shadow-lg shadow-red-500/50 flex items-center justify-center p-1">
        <div className="w-2/3 h-2/3 bg-white rounded-full flex items-center justify-center p-1">
          <div className="w-1/2 h-1/2 bg-red-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default memo(Target);
