import React, { useState, useEffect } from 'react';

type CartoonSpeechBubbleProps = {
  children: React.ReactNode;
  className?: string;
};

const CartoonSpeechBubble: React.FC<CartoonSpeechBubbleProps> = ({ children, className = "" }) => {
  const [isGlowing, setIsGlowing] = useState(true);

  useEffect(() => {
    const glowInterval = setInterval(() => {
      setIsGlowing(prev => !prev);
    }, 1500);
    return () => clearInterval(glowInterval);
  }, []);

  return (
    <div className="relative mx-auto my-8 mb-12">
      {/* Speech bubble */}
      <div 
        className={`relative rounded-xl px-4 py-3 text-gray-100 text-sm ${className}`}
        style={{
          minWidth: '100px',
          width: 'fit-content',
          background: 'rgba(30, 30, 40, 0.85)',
          boxShadow: `0 0 ${isGlowing ? '14px' : '8px'} ${isGlowing ? '2px' : '1px'} rgba(170, 0, 255, ${isGlowing ? '0.4' : '0.2'}), 
                      0 0 ${isGlowing ? '28px' : '14px'} ${isGlowing ? '4px' : '2px'} rgba(170, 0, 255, ${isGlowing ? '0.2' : '0.1'})`,
          border: '3px solid #9500ff',
          transition: 'box-shadow 0.8s ease-in-out, background 0.8s ease-in-out',
          transform: 'rotate(-1deg)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {children}
      </div>

      {/* Dots */}
      <div className="absolute -bottom-2 left-3">
        <div className="w-5 h-5 rounded-full border-2 border-purple-600"
          style={{
            background: 'rgba(30, 30, 40, 0.85)',
            boxShadow: `0 0 ${isGlowing ? '8px' : '4px'} rgba(170, 0, 255, ${isGlowing ? '0.4' : '0.2'})`,
            transition: 'box-shadow 0.8s ease-in-out, background 0.8s ease-in-out',
            backdropFilter: 'blur(4px)',
          }}></div>
      </div>
      <div className="absolute -bottom-5 left-0">
        <div className="w-3 h-3 rounded-full border-2 border-purple-600"
          style={{
            background: 'rgba(30, 30, 40, 0.85)',
            boxShadow: `0 0 ${isGlowing ? '6px' : '3px'} rgba(170, 0, 255, ${isGlowing ? '0.4' : '0.2'})`,
            transition: 'box-shadow 0.8s ease-in-out, background 0.8s ease-in-out',
            backdropFilter: 'blur(4px)',
          }}></div>
      </div>
      <div className="absolute -bottom-8 left-1">
        <div className="w-2 h-2 rounded-full border-2 border-purple-600"
          style={{
            background: 'rgba(30, 30, 40, 0.85)',
            boxShadow: `0 0 ${isGlowing ? '5px' : '2px'} rgba(170, 0, 255, ${isGlowing ? '0.4' : '0.2'})`,
            transition: 'box-shadow 0.8s ease-in-out, background 0.8s ease-in-out',
            backdropFilter: 'blur(4px)',
          }}></div>
      </div>
    </div>
  );
};

export default CartoonSpeechBubble;

