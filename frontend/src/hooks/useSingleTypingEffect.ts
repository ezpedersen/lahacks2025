import { useState, useEffect, useCallback } from 'react';

interface UseSingleTypingEffectProps {
  text: string;
  typingSpeed?: number;
  initialDelay?: number;
  onComplete?: () => void;
}

export const useSingleTypingEffect = ({
  text,
  typingSpeed = 50,
  initialDelay = 0,
  onComplete,
}: UseSingleTypingEffectProps) => {
  const [currentText, setCurrentText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const handleTyping = useCallback(() => {
    if (!hasStarted) {
      const startTimeout = setTimeout(() => {
        setHasStarted(true);
      }, initialDelay);
      return () => clearTimeout(startTimeout);
    }

    if (currentText.length < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(text.slice(0, currentText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      onComplete?.();
    }
  }, [currentText, text, typingSpeed, initialDelay, hasStarted, onComplete]);

  useEffect(() => {
    const cleanup = handleTyping();
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [handleTyping]);

  return currentText;
}; 