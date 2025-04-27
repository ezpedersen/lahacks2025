import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Landing from './components/Landing';
import Ghost from './components/Ghost';
import GhostPoint from './components/GhostPoint';
import AgentUIComponent from './components/AgentUIComponent';
import { useEffect } from 'react';

const App = () => {

  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     // Check for CMD + 8
  //     if (event.metaKey && event.key === '8') {
  //       console.log("RAAARAAARAA")
  //       // handleToggleTransparency();
  //       event.preventDefault();
  //     }
  //   };

  //   // Add event listener
  //   window.addEventListener('keydown', handleKeyDown);

  //   // Clean up
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, []);

  // Set up keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      
      
   
      // Check for CMD + 9 for screen capture - change to send IPC message
      if ((event.metaKey || event.ctrlKey) && event.key === '9') {
        // handleCaptureScreen(); // Remove this call
        window.ipcRenderer.send('next-checkpoint-and-capture'); // Add this call
        console.log("CMD+9 pressed, sending next-checkpoint-and-capture"); // Optional logging
        event.preventDefault();
      }
      // Add test shortcut for CMD + 8
      else if ((event.metaKey || event.ctrlKey) && event.key === '8') {
        console.log("CMD+8 pressed for testing.");
        event.preventDefault(); // Prevent default behavior if any
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
                <Route path="/ghostpoint" element={<GhostPoint />} />

        <Route path="/landing" element={<Landing />} />
        <Route path="/persistent-ui" element={<AgentUIComponent />} />
      </Routes>
    </Router>
  )
}
export default App