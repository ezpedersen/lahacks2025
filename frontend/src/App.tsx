import './App.css'
import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PromptInput from './components/PromptInput';
import QuickActions from './components/QuickActions';
import CommunityProjects from './components/CommunityProjects';


// Define the electron interface from preload
declare global {
  interface Window {
    electron: {
      toggleTransparency: () => Promise<boolean>;
    }
  }
}

// function App() {
//   const handleClick = async () => {
//     try {
//       const isTransparent = await window.electron.toggleTransparency();
//       console.log('Window transparency:', isTransparent ? 'transparent' : 'opaque');
//     } catch (error) {
//       console.error('Failed to toggle transparency:', error);
//     }
//   };

//   return (
//     <>
//       <h1 className="text-red-500">Hello World</h1>
//       <button onClick={handleClick}>toggle visibility</button>
//     </>
//   )
// }

// export default App

function App() {
  const [prompt, setPrompt] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-orange-600/40 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-full h-[600px] bg-orange-500/20 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Hero />
          <PromptInput prompt={prompt} setPrompt={setPrompt} />
          <QuickActions />
          <CommunityProjects />
        </main>
      </div>
    </div>
  );
}

export default App;
