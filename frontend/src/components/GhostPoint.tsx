import React, { useState, useRef, useEffect } from 'react';
import Ghost from './Ghost';

const DEFAULT_POSITION = { left: '47%', top: '13.5%' };


const GhostPoint: React.FC = () => {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const dotRef = useRef<HTMLDivElement>(null);

  // Listen for IPC event to update the ghost point position (and set initial position if main has something to say)
  useEffect(() => {
    // Handler for IPC event
    const handleSetGhostPointPosition = (_event: unknown, newPosition: { left: string; top: string }) => {
      alert("HANDLING NEW POSITION")
      if (
        newPosition &&
        typeof newPosition.left === 'string' &&
        typeof newPosition.top === 'string'
      ) {
        setPosition(newPosition);
      }
    };

    // Only add listener if ipcRenderer is available (Electron context)
    if (window.ipcRenderer && window.ipcRenderer.on) {
      window.ipcRenderer.on('set-ghost-point-position', handleSetGhostPointPosition);
    }

    // On mount, ask main process if it has a position for us
    if (window.ipcRenderer && window.ipcRenderer.invoke) {
      window.ipcRenderer.invoke('get-ghost-point-position').then((mainPosition: { left: string; top: string } | null) => {
        if (
          mainPosition &&
          typeof mainPosition.left === 'string' &&
          typeof mainPosition.top === 'string'
        ) {
          setPosition(mainPosition);
        }
      }).catch(() => {
        // ignore if not implemented
      });
    }

    // Cleanup
    return () => {
      if (window.ipcRenderer && window.ipcRenderer.off) {
        window.ipcRenderer.off('set-ghost-point-position', handleSetGhostPointPosition);
      }
    };
  }, []);

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