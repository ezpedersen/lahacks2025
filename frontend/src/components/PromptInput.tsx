import React, { useState } from 'react';
import { Paperclip, Plus, Youtube, Eye } from 'lucide-react';
import { useTypingEffect } from '../hooks/useTypingEffect';

interface PromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt }) => {
  const [isFocused, setIsFocused] = useState(false);
  
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

  return (
    <div className="max-w-3xl mx-auto mb-10">
      <div className="relative">
        {/* Border animation container */}
        {isFocused && (
          <div className="absolute -inset-[2px] rounded-lg animate-border-flow z-0" />
        )}
        
        {/* Main input container */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl relative z-10">
          <textarea
            className="w-full bg-gray-900/80 text-white p-5 outline-none resize-none min-h-[100px]"
            placeholder={animatedPlaceholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          <div className="flex items-center justify-between bg-gray-900/60 p-3">
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm">Attach</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-4 w-4" />
                <span className="text-sm">Import Youtube</span>
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white rounded-md transition-colors">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Public</span>
              </button>
              <button className="bg-gray-800 p-1 rounded-md hover:bg-gray-700 transition-colors">
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