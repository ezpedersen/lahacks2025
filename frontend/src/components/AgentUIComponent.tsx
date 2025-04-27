import React, { useState } from 'react';

const AgentUIComponent: React.FC = () => {
  // Simple glow state for demonstration, could be removed if not needed
  const [isGlowing] = useState(true); 
  const [activeTab, setActiveTab] = useState<'Tutor' | 'Custom'>('Tutor');

  const newWidth = '267px';
  const newHeight = '200px';

  return (
    <div 
      className="fixed bottom-4 right-4 p-0 m-0" // Use fixed positioning
      style={{
        width: newWidth, 
        height: newHeight, 
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
        {/* Tab Buttons */}
        <div className="flex border-b border-purple-600 mb-2">
          <button
            onClick={() => setActiveTab('Tutor')}
            className={`px-4 py-1 text-xs font-medium rounded-t-md transition-colors duration-200 
                        ${activeTab === 'Tutor' 
                          ? 'bg-purple-700/50 text-purple-100 border-purple-500' 
                          : 'text-purple-400 hover:bg-purple-800/30'}`}
          >
            Tutor
          </button>
          <button
            onClick={() => setActiveTab('Custom')}
            className={`px-4 py-1 text-xs font-medium rounded-t-md transition-colors duration-200 
                        ${activeTab === 'Custom' 
                          ? 'bg-purple-700/50 text-purple-100 border-purple-500' 
                          : 'text-purple-400 hover:bg-purple-800/30'}`}
          >
            Custom
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-grow overflow-auto">
          {activeTab === 'Tutor' && (
            <div className="p-1">
              <h3 className="text-md font-semibold mb-2 text-purple-300">
                Ghost Tutor
              </h3>
              <p className="text-xs text-gray-400">(Features coming soon...)</p>
            </div>
          )}

          {activeTab === 'Custom' && (
            <div className="p-1">
               <h3 className="text-md font-semibold mb-2 text-purple-300">
                Custom Input
              </h3>
              <textarea 
                placeholder="Enter your custom instructions here..."
                className="w-full h-24 p-2 text-xs text-gray-100 bg-gray-800/50 border border-purple-700 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentUIComponent; 