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
    <div className="relative">
      <style>
        {`
         
          @keyframes dot-grow {
            0% { transform: scale(1);}
            50% { transform: scale(1.2);}
            100% { transform: scale(1);}
          }
        `}
      </style>
      {/* Little Dot (anchor parent) */}
      <div 
        className="w-3 h-3 rounded-full border-2 border-purple-600"
        style={{
          background: 'rgba(30, 30, 40, 0.85)',
          boxShadow: `0 0 ${isGlowing ? '5px' : '2px'} rgba(170, 0, 255, ${isGlowing ? '0.4' : '0.2'})`,
          transition: 'box-shadow 0.8s ease-in-out, background 0.8s ease-in-out',
          backdropFilter: 'blur(4px)',
          animation: 'dot-grow 1.5s ease-in-out infinite',
        }}
      />

      {/* Middle Dot */}
      <div className="absolute bottom-3 -left-2">
        <div 
          className="w-4 h-4 rounded-full border-2 border-purple-600"
          style={{
            background: 'rgba(30, 30, 40, 0.85)',
            boxShadow: `0 0 ${isGlowing ? '6px' : '3px'} rgba(170, 0, 255, ${isGlowing ? '0.4' : '0.2'})`,
            transition: 'box-shadow 0.8s ease-in-out, background 0.8s ease-in-out',
            backdropFilter: 'blur(4px)',
            animation: 'dot-grow 1.5s ease-in-out infinite',
            animationDelay: '0.15s',
          }}
        />
      </div>

      {/* Big Dot */}
      <div className="absolute bottom-7 -left-2">
        <div 
          className="w-5 h-5 rounded-full border-2 border-purple-600"
          style={{
            background: 'rgba(30, 30, 40, 0.85)',
            boxShadow: `0 0 ${isGlowing ? '8px' : '4px'} rgba(170, 0, 255, ${isGlowing ? '0.4' : '0.2'})`,
            transition: 'box-shadow 0.8s ease-in-out, background 0.8s ease-in-out',
            backdropFilter: 'blur(4px)',
            animation: 'dot-grow 1.5s ease-in-out infinite',
            animationDelay: '0.3s',
          }}
        />
      </div>

      {/* Speech Bubble */}
      <div 
        className={`absolute bottom-12 -left-5 rounded-xl px-4 py-3 text-gray-100 text-sm ${className}`}
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
    </div>
  );
};

export default CartoonSpeechBubble;
