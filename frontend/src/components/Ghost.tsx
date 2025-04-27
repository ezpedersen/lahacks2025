import React, { useRef, useEffect, useState, useCallback } from 'react';
import CartoonSpeechBubble from './CartoonSpeechBubble';
import { useSingleTypingEffect } from '../hooks/useSingleTypingEffect';

// If using TypeScript in renderer, you might need this declaration:
declare global {
  interface Window {
    require: (module: 'electron') => { ipcRenderer: Electron.IpcRenderer };
  }
}

const Ghost: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Example message - replace with your actual dynamic message if needed
  const message = "This is the speech bubble content! It might be longer, causing it to wrap vertically.";

  const typedText = useSingleTypingEffect({
    text: message,
    initialDelay: 500
  });

  useEffect(() => {
    // Measure whenever typedText updates
    const ipcRenderer = window.require ? window.require('electron').ipcRenderer : null;

    // Only measure if the container exists and there's some text
    if (containerRef.current && ipcRenderer && typedText.length > 0) {
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.ceil(rect.width);
      const height = Math.ceil(rect.height);

      const buffer = 5;
      const finalWidth = width + buffer;
      const finalHeight = height + buffer;

      // Consider debouncing this call if performance is an issue
      console.log(`Measured size: ${width}x${height}. Resizing to ${finalWidth}x${finalHeight}.`);
      ipcRenderer.send('resize-ghost-window', { width: finalWidth, height: finalHeight });

    } else if (ipcRenderer && typedText.length === 0) {
      // Optional: Send a minimal size when text is empty or hasn't started
      // console.log("Text empty, potentially resizing to minimal.");
      // ipcRenderer.send('resize-ghost-window', { width: 10, height: 10 });
    }
  // Rerun this effect whenever typedText changes
  }, [typedText]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'inline-block',
        padding: '1px',
        // Optionally hide until first character to avoid 0-size flash
        visibility: typedText.length > 0 ? 'visible' : 'hidden'
      }}
    >
      {/* Pass the currently typed text down */}
      {/* REMOVED onTypingComplete prop */}
      <CartoonSpeechBubble>{typedText}</CartoonSpeechBubble>
    </div>
  );
};

export default Ghost; 