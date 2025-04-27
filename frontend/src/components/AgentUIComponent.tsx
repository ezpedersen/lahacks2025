import React from 'react';

const AgentUIComponent: React.FC = () => {
  // Simple glow state for demonstration, could be removed if not needed
  const [isGlowing] = React.useState(true); 

  return (
    <div 
      className="fixed bottom-4 right-4 p-0 m-0" // Use fixed positioning
      style={{
        // Adjust width/height as needed
        width: '200px', 
        height: '150px', 
      }}
    >
      <div
        className="w-full h-full rounded-lg p-3 text-gray-100 text-sm flex flex-col"
        style={{
          background: 'rgba(30, 30, 40, 0.9)', // Slightly less transparent maybe
          boxShadow: `0 0 ${isGlowing ? '10px' : '6px'} ${isGlowing ? '1px' : '0px'} rgba(170, 0, 255, ${isGlowing ? '0.3' : '0.15'}), 
                      0 0 ${isGlowing ? '20px' : '10px'} ${isGlowing ? '2px' : '1px'} rgba(170, 0, 255, ${isGlowing ? '0.15' : '0.05'})`,
          border: '2px solid #9500ff', // Slightly thinner border?
          transition: 'box-shadow 0.8s ease-in-out',
          // transform: 'rotate(-1deg)', // Optional: Keep rotation?
          backdropFilter: 'blur(3px)', // Slightly less blur?
        }}
      >
        <h3 className="text-md font-semibold mb-2 text-purple-300 border-b border-purple-500 pb-1">
          Ghost Guide
        </h3>
        <div className="flex-grow">
          {/* Content area - currently blank */}
          <p className="text-xs text-gray-400">(Features coming soon...)</p>
        </div>
      </div>
    </div>
  );
};

export default AgentUIComponent; 