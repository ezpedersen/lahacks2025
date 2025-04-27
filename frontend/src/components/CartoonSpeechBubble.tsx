 import React, { useState, useEffect } from 'react';

type CartoonSpeechBubbleProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * CartoonSpeechBubble
 * 
 * When the text is beginning to roll out (i.e., children is a string and not yet fully revealed),
 * animate the three dots popping out one by one, then show the speech bubble.
 * 
 * Usage: The parent should pass in the rolling text (e.g., from a typing effect hook).
 * This component will detect if the text is still rolling out by checking if children is a string
 * and ends with a cursor or is shorter than the final message.
 */
const CartoonSpeechBubble: React.FC<CartoonSpeechBubbleProps> = ({ children, className = "" }) => {
  const [isGlowing, setIsGlowing] = useState(true);
  const [showDot1, setShowDot1] = useState(false);
  const [showDot2, setShowDot2] = useState(false);
  const [showDot3, setShowDot3] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  // Detect if the text is rolling out (typing effect in progress)
  // Heuristic: if children is a string and ends with a blinking cursor or is not empty but not the final message
  // For generality, we just animate the pop-out sequence on mount, and show the bubble after.
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    setShowDot1(false);
    setShowDot2(false);
    setShowDot3(false);
    setShowBubble(false);

    timers.push(setTimeout(() => setShowDot1(true), 80));
    timers.push(setTimeout(() => setShowDot2(true), 280));
    timers.push(setTimeout(() => setShowDot3(true), 480));
    timers.push(setTimeout(() => setShowBubble(true), 500));

    return () => timers.forEach(clearTimeout);
  }, []); // re-run pop animation if children changes (e.g., new message)

  // Glowing effect for all dots and bubble
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
          @keyframes dot-pop {
            0% { transform: scale(0.2); opacity: 0; }
            60% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes dot-grow {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          @keyframes bubble-pop {
            0% { transform: scale(0.7) rotate(-3deg); opacity: 0; }
            60% { transform: scale(1.05) rotate(-2deg); opacity: 1; }
            100% { transform: scale(1) rotate(-1deg); opacity: 1; }
          }
        `}
      </style>
      {/* Little Dot (anchor parent) */}
      {showDot1 && (
        <div
          className="w-3 h-3 rounded-full border-2 border-purple-600"
          style={{
            background: 'rgba(30, 30, 40, 0.85)',
            boxShadow: `0 0 ${isGlowing ? '5px' : '2px'} rgba(170, 0, 255, ${isGlowing ? '0.4' : '0.2'})`,
            transition: 'box-shadow 0.8s ease-in-out, background 0.8s ease-in-out',
            backdropFilter: 'blur(4px)',
            animation: 'dot-pop 0.22s cubic-bezier(0.5,1.5,0.7,1) 0s both, dot-grow 1.5s ease-in-out infinite 0.22s',
            zIndex: 2,
          }}
        />
      )}

      {/* Middle Dot */}
      {showDot2 && (
        <div className="absolute bottom-3 -left-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-purple-600"
            style={{
              background: 'rgba(30, 30, 40, 0.85)',
              boxShadow: `0 0 ${isGlowing ? '6px' : '3px'} rgba(170, 0, 255, ${isGlowing ? '0.4' : '0.2'})`,
              transition: 'box-shadow 0.8s ease-in-out, background 0.8s ease-in-out',
              backdropFilter: 'blur(4px)',
              animation: 'dot-pop 0.22s cubic-bezier(0.5,1.5,0.7,1) 0s both, dot-grow 1.5s ease-in-out infinite 0.37s',
              animationDelay: '0s, 0.37s',
              zIndex: 2,
            }}
          />
        </div>
      )}

      {/* Big Dot */}
      {showDot3 && (
        <div className="absolute bottom-7 -left-2">
          <div
            className="w-5 h-5 rounded-full border-2 border-purple-600"
            style={{
              background: 'rgba(30, 30, 40, 0.85)',
              boxShadow: `0 0 ${isGlowing ? '8px' : '4px'} rgba(170, 0, 255, ${isGlowing ? '0.4' : '0.2'})`,
              transition: 'box-shadow 0.8s ease-in-out, background 0.8s ease-in-out',
              backdropFilter: 'blur(4px)',
              animation: 'dot-pop 0.22s cubic-bezier(0.5,1.5,0.7,1) 0s both, dot-grow 1.5s ease-in-out infinite 0.52s',
              animationDelay: '0s, 0.52s',
              zIndex: 2,
            }}
          />
        </div>
      )}

      {/* Speech Bubble */}
      {showBubble && (
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
            animation: 'bubble-pop 0.28s cubic-bezier(0.5,1.5,0.7,1) 0s both',
            zIndex: 3,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default CartoonSpeechBubble; 