import React from 'react';
import GhostSvg from "../assets/ghost.svg"
const Hero: React.FC = () => {
  return (
    <div className="text-center py-8 max-w-3xl mx-auto">
      <h1 className="text-white text-4xl md:text-5xl font-bold mb-3 flex items-center justify-center">
        Learn anything  <img 
        src={GhostSvg} 
        alt="icon" 
        style={{
          height: '90px',
          width: 'auto',
          pointerEvents: 'none',
          transform: "scaleX(-1)",
          padding: '10px'
        }} 
      />Ghost Guide
      </h1>
      <p className="text-gray-300 text-lg">
        Skip the tutorials, automate the learning process directly on top of your desktop
      </p>
    </div>
  );
};

export default Hero;