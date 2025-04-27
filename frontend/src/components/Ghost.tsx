import React from 'react';
import CartoonSpeechBubble from './CartoonSpeechBubble';
import { useSingleTypingEffect } from '../hooks/useSingleTypingEffect';
import GhostSvg from '../assets/ghost.svg';

const Ghost: React.FC = () => {
  // Example message - replace with your actual dynamic message if needed
  const message = "This is the speech bubble content! It might be longer, causing it to wrap vertically.";

  const typedText = useSingleTypingEffect({
    text: message,
    initialDelay: 500
  });

  return (
    <div
     
    >
      <img 
        src={GhostSvg} 
        alt="icon" 
        style={{
          height: '100px',
          width: 'auto',
          display: 'block',
          transform: 'scaleX(-1)', // Flip image horizontally
          zIndex: 3,
          pointerEvents: 'none',
        }} 
      />
      <div
        style={{
          position: 'absolute',
          left: '10px', // right next to the ghost SVG
          top: '-10%',
          transform: 'translateY(-50%)',
          zIndex: 4,
          width: '300px'
        }}
      >
        <CartoonSpeechBubble>
          {typedText}
        </CartoonSpeechBubble>
      </div>
    </div>
  );
};

export default Ghost; 