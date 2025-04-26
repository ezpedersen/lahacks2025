import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Landing from './components/Landing';
import Ghost from './components/Ghost';
import { useEffect } from 'react';
// Define the electron interface from preload
declare global {
  interface Window {
    electron: {
      captureScreen: () => Promise<{ success: boolean, path?: string, error?: string }>;
    }
  }
}
const App = () => {

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
    <Router>
      <Routes>
        <Route path="/" element={<div></div>} />
        <Route path="/ghost" element={<Ghost />} />
        <Route path="/landing" element={<Landing />} />
      </Routes>
    </Router>
  )
}
export default App