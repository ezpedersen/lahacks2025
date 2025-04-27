import React, { useState, useEffect } from 'react';
import CartoonSpeechBubble from './CartoonSpeechBubble';
import { useSingleTypingEffect } from '../hooks/useSingleTypingEffect';
import GhostSvg from '../assets/ghost.svg';

const Ghost: React.FC = () => {
  // State for the message, initialized to an empty string or a default loading message
  const [message, setMessage] = useState('Loading next step...');

  // Listen for IPC messages to update the ghost's speech bubble
  useEffect(() => {
    const handleSetMessage = (event: any, receivedMessage: string) => {
      console.log('Ghost component received message:', receivedMessage);
      setMessage(receivedMessage || '...'); // Use received message or fallback
    };

    // Make sure ipcRenderer is available (in Electron context)
    if (window.ipcRenderer) {
      window.ipcRenderer.on('set-ghost-message', handleSetMessage);
      console.log('Ghost component mounted and listening for set-ghost-message');

      // Cleanup function to remove the listener when the component unmounts
      return () => {
        // Use 'off' as it might be the expected method in the current type definition
        window.ipcRenderer.off('set-ghost-message', handleSetMessage);
        console.log('Ghost component unmounted, listener removed using off()');
      };
    } else {
      console.warn('ipcRenderer not available in this context. Ghost message updates via IPC will not work.');
      // Set a fallback message if not in Electron or preload script failed
      setMessage("Hi! I'm your Ghost guide.");
      return () => {}; // Return empty cleanup function
    }
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  // Apply typing effect to the current message state
  const typedText = useSingleTypingEffect({
    text: message,
    initialDelay: 200, // Slightly shorter delay maybe
    typingSpeed: 50 // Adjust speed if needed
  });

  return (
    <div
     
    >
      <img 
        src={GhostSvg} 
        alt="icon" 
        style={{
          height: '80px',
          width: 'auto',
          display: 'block',
          transform: 'scaleX(-1)', // Flip image horizontally
          zIndex: 3,
          pointerEvents: 'none',
        }} 
      />
      <div
      // className='hidden'
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