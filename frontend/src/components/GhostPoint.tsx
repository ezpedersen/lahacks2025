import React, { useState, useRef, useEffect } from 'react';
import Ghost from './Ghost';

// Default position if hash params are missing or invalid
const FALLBACK_POSITION = { left: '50%', top: '50%' }; 

const GhostPoint: React.FC = () => {
  // Initialize state with fallback, update from hash in useEffect
  const [position, setPosition] = useState(FALLBACK_POSITION);
  const [transitioning, setTransitioning] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to parse hash parameters
    const getHashParams = () => {
      const hash = window.location.hash.substring(1); // Remove leading #
      const params = new URLSearchParams(hash);
      const x = params.get('x');
      const y = params.get('y');
      return { x, y };
    };

    const params = getHashParams();
    const xCoord = params.x ? parseInt(params.x, 10) : null;
    const yCoord = params.y ? parseInt(params.y, 10) : null;

    console.log(`GhostPoint received hash params: x=${params.x}, y=${params.y}`);

    // Update position state if coordinates are valid numbers
    if (xCoord !== null && !isNaN(xCoord) && yCoord !== null && !isNaN(yCoord)) {
      setPosition({ left: `${xCoord}px`, top: `${yCoord}px` });
      console.log(`Set initial position to: x=${xCoord}px, y=${yCoord}px`);
    } else {
      console.warn('Invalid or missing coordinates in hash, using fallback position.');
      setPosition(FALLBACK_POSITION); // Use fallback if params invalid
    }

  }, []); // Empty dependency array ensures this runs only once on mount

  // Example: Move to new location after 1s (for demo) - COMMENTED OUT
  /*
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTransitioning(true);
      setPosition(TARGET_POSITION);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  */

  // Optionally, you can expose setPosition for external control

  return (
    <div
      className="ghost-point-bg"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>
        {`
          .ghost-dot-center {
            position: relative;
            width: 22px;
            height: 22px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .ghost-dot {
            width: 18px;
            height: 18px;
            background: #fff;
            border-radius: 50%;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.5;
            box-shadow: 0 0 3px 3px rgba(180,180,255,0.2);
            z-index: 2;
          }
          .ghost-ring {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 22px;
            height: 22px;
            border: 2px solid #bfcfff;
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
            animation: ghost-ring-expand 2.8s cubic-bezier(0.4,0,0.2,0.8) infinite;
            pointer-events: none;
            z-index: 1;
          }
          .ghost-ring.ring2 {
            animation-delay: 1.4s;
          }
          @keyframes ghost-ring-expand {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.6;
            }
            60% {
              opacity: 0.5;
            }
            100% {
              transform: translate(-50%, -50%) scale(2.2);
              opacity: 0;
            }
          }
          .ghost-point-animated {
            transition: left 0.8s cubic-bezier(0.4,0,0.2,1), top 0.8s cubic-bezier(0.4,0,0.2,1);
            will-change: left, top;
          }
        `}
      </style>
      <div
        ref={dotRef}
        className="ghost-point-animated"
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="ghost-dot-center" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="ghost-ring" />
          <div className="ghost-ring ring2" />
          <div className="ghost-dot" />
          <div style={{ position: 'absolute', top: '30px', left: '50px' }}>
            <Ghost />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GhostPoint; 