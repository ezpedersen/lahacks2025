import React, { useState, useEffect } from 'react';
import { Paperclip, Plus, Youtube, Eye, Play, Loader2 } from 'lucide-react';
import { useTypingEffect } from '../hooks/useTypingEffect';
import { MultiStepLoader } from './ui/multi-step-loader';

// Define loading states for analysis
const analysisLoadingStates = [
  { text: "Analyzing Youtube Video" },
  { text: "Parsing Transcript" },
  { text: "Searching Web" }, // Assuming this is part of the process
  { text: "Creating Checkpoints" },
];

interface PromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const placeholderTexts = [
    'Paste any Youtube video url to get started.',
    'Give me a crash course tutorial on how to use Figma.',
    'Give me a tutorial on how to use Cursor IDE',
    'Teach me how to make 3D models in blender'
  ];

  const animatedPlaceholder = useTypingEffect({
    texts: placeholderTexts,
    typingSpeed: 50,
    deletingSpeed: 30,
    delayBetweenTexts: 2000
  });

  const handleAnalyzeTutorial = () => {
    setIsAnalyzing(true);
    window.ipcRenderer.send('start-tutorial', prompt);
  };

  const handleCreateTutorial = () => {
    setIsCreating(true);
    window.electron.processCheckpoints();
  };

  const isProcessing = isAnalyzing || isCreating;

  useEffect(() => {
    const handleTutorialAnalyzed = (_event: any, result: { success: boolean, error?: string }) => {
      console.log('Received tutorial-analyzed:', result);
      if (!result.success) {
        console.error('Tutorial analysis failed:', result.error);
        // Optionally show an error message to the user here
      }
      setIsAnalyzing(false); // Stop loading regardless of success/failure
    };

    window.ipcRenderer.on('tutorial-analyzed', handleTutorialAnalyzed);

    // Cleanup listener on component unmount
    return () => {
      window.ipcRenderer.off('tutorial-analyzed', handleTutorialAnalyzed);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="w-11/12 md:w-9/12 lg:w-7/12 xl:w-6/12 max-w-2xl mx-auto mb-8">
      <div className="relative">
        {/* Multi-step loader for analysis */}
        <MultiStepLoader loadingStates={analysisLoadingStates} loading={isAnalyzing} duration={1500} />
        
        {/* Border animation container */}
        {isFocused && (
          <div className="absolute -inset-[3px] rounded-lg animate-border-flow z-0" />
        )}
        
        {/* Main input container */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl relative z-10">
          <textarea
            className="w-full bg-gray-900/80 text-white p-5 outline-none resize-none min-h-[240px] text-lg placeholder-gray-500"
            placeholder={animatedPlaceholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          <div className="flex items-center justify-between bg-gray-900/60 p-3">
            <div className="flex space-x-4">
              <button
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                <Paperclip className="h-4 w-4" />
                <span>Attach</span>
              </button>
              <button
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                <Youtube className="h-4 w-4" />
                <span>Import Youtube</span>
              </button>
              <button
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAnalyzeTutorial}
                disabled={isProcessing}
              >
                <Play className="h-4 w-4" />
                <span>Analyze Tutorial</span>
              </button>
              <button
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateTutorial}
                disabled={isProcessing}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{isCreating ? 'Creating...' : 'Create Tutorial'}</span>
              </button>
            </div>
            
            <div className="flex space-x-4">
              <button
                className="flex items-center space-x-2 text-gray-400 hover:text-white rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                <Eye className="h-4 w-4" />
                <span>Public</span>
              </button>
              <button
                className="bg-gray-800 p-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                <Plus className="h-4 w-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;