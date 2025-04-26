import './App.css'
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PromptInput from './components/PromptInput';
import QuickActions from './components/QuickActions';

// Define the electron interface from preload
declare global {
  interface Window {
    electron: {
      captureScreen: () => Promise<{ success: boolean, path?: string, error?: string }>;
    }
  }
}

function App() {
  const [prompt, setPrompt] = useState<string>('');
  
  // Handle screen capture
  const handleCaptureScreen = async () => {
    try {
      console.log('Capturing screen...');
      const result = await window.electron.captureScreen();
      
      if (result.success) {
        console.log('Screen captured and saved to:', result.path);
      } else {
        console.error('Failed to capture screen:', result.error);
      }
    } catch (error) {
      console.error('Error while capturing screen:', error);
    }
  };

  // Set up keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      
      
   
      // Check for CMD + 9 for screen capture
      if ((event.metaKey || event.ctrlKey) && event.key === '9') {
        handleCaptureScreen();
        event.preventDefault();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  return (
    <div className="h-screen w-screen fixed overflow-hidden">
      {/* Background gradient and effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900 to-orange-600/40">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-full h-[600px] bg-orange-500/20 rounded-full blur-[120px]" />
        </div>
      </div>
      
      <div className="relative z-10 h-full w-full flex flex-col">
        <main className="flex-1 w-full px-4 py-2 overflow-hidden flex flex-col">
          <div className="mt-24">
            <Hero />
            <PromptInput prompt={prompt} setPrompt={setPrompt} />
            <QuickActions />
            <div className="flex-1 overflow-hidden">
              {/* <CommunityProjects /> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
