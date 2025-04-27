import React from 'react';
import Ghost from './Ghost';

const GhostPoint: React.FC = () => {
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
            /* Remove transform, use margin to center perfectly */
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
        `}
      </style>
      <div style={{ position: 'absolute', left: '30px', top: "50%", transform: 'translate(-50%, -50%)' }}>
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