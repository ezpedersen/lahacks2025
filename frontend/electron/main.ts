import { app, BrowserWindow, ipcMain, screen, desktopCapturer } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let landingWin: BrowserWindow | null
let ghostPointWindow: BrowserWindow | null
let persistentUiWin: BrowserWindow | null = null;
let currentCheckpointNumber = 0; // Add state for checkpoint number (initialized to -1)

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;
  console.log(width, height)
  win = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    hasShadow: false,
    resizable: false,
    // alwaysOnTop: true,
    transparent: true,
    focusable: false, // Make window not focusable for clickthrough
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    icon: path.join(process.env.VITE_PUBLIC, 'ghost.svg')
  })

  // Make the window clickthrough (ignore mouse events)
  win.setIgnoreMouseEvents(true, { forward: true });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}
function createLanding() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  if (!win){
    return
  }

  // Hide the persistent UI when landing page is shown
  persistentUiWin?.hide();

  landingWin = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    frame: false,
    hasShadow: false,
    resizable: false,
    // alwaysOnTop: true,
    focusable: true,
    parent: win,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    landingWin.loadURL(path.join(VITE_DEV_SERVER_URL, 'landing'));
  } else {
    landingWin.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: '/ghost' });
  }
}
function createGhostPointWindow(x: number, y: number, description: string) {
  if (ghostPointWindow) {
    ghostPointWindow.close();
  }
  if (!win){return}
  const w = 600
  const h = 600
  ghostPointWindow = new BrowserWindow({
    
    width: w,
    height: h,
    x: x - 30,
    y: y - Math.floor(h / 2),
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    transparent: true, // Make background transparent
    parent: win,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  // Allow mouse events to pass through transparent areas, but still receive clicks on opaque content
  ghostPointWindow.setIgnoreMouseEvents(true, { forward: true });

  // Send the description to the window *after* it finishes loading
  ghostPointWindow.webContents.on('did-finish-load', () => {
    console.log(`Sending description to GhostPointWindow: "${description}"`);
    ghostPointWindow?.webContents.send('set-ghost-message', description);
  });

  if (VITE_DEV_SERVER_URL) {
    ghostPointWindow.loadURL(path.join(VITE_DEV_SERVER_URL, 'ghostpoint'));
  } else {
    ghostPointWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: '/ghostpoint' });
  }
}
function createAgentUiWindow() {
  if (!win) return; // Requires the main window as parent

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.bounds;
  const uiWidth = 280; // Updated component width
  const uiHeight = 212; // Updated component height
  const borderWidth = 2; // The border width from the component CSS
  const windowWidth = uiWidth + (borderWidth * 2);
  const windowHeight = uiHeight + (borderWidth * 2);
  const padding = 16; // Match component padding (approx bottom-4 right-4)

  persistentUiWin = new BrowserWindow({
    width: windowWidth, // Use calculated width
    height: windowHeight, // Use calculated height
    x: screenWidth - windowWidth - padding, // Adjust x based on new width
    y: screenHeight - windowHeight - padding, // Adjust y based on new height
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    frame: false,
    transparent: true,
    alwaysOnTop: true, 
    skipTaskbar: true,
    focusable: false,
    resizable: false,
    parent: win,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // Prevent closing this specific window, just hide it if needed
  // persistentUiWin.on('close', (e) => {
  //   e.preventDefault();
  //   persistentUiWin?.hide(); 
  // });

  const targetUrl = VITE_DEV_SERVER_URL
    ? path.join(VITE_DEV_SERVER_URL, 'persistent-ui')
    : `file://${path.join(RENDERER_DIST, 'index.html')}#persistent-ui`;

  // Load URL slightly differently for file protocol to include hash
  persistentUiWin.loadURL(targetUrl).catch(err => {
    console.error('Failed to load Persistent UI URL:', err);
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Modify handleCapture to accept prompt AND description, and pass description to createGhostPointWindow
const handleCapture = async (prompt: string, description: string) => {
    try {
      console.log('Capturing entire screen...');
    
      // Get the primary display dimensions for capture
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.bounds;
      
      // Capture the entire screen
      const sources = await desktopCapturer.getSources({ 
        types: ['screen'], 
        thumbnailSize: { width, height }
      });
      
      // Find the primary screen source (or first available)
      const entireScreen = sources.find(source => 
        source.name === 'Entire Screen' || 
        source.name.includes('Screen') || 
        source.id.includes('screen')
      ) || sources[0];
      
      if (entireScreen && entireScreen.thumbnail) {
        
        try {
          const formData = new FormData();
          formData.append('prompt', prompt); // Use passed prompt
          const screenshotBlob = new Blob([entireScreen.thumbnail.toPNG()], { type: 'image/png' });
          formData.append('file', screenshotBlob, 'screenshot.png');
          //"top-right", "bottom-left", "bottom-right", or "center"
          formData.append('quadrant', "center");

          // Save the screenshot to disk for debugging
          const fs = await import('fs');
          const os = await import('os');
          const path = await import('path');
          const debugDir = path.join(os.homedir(), 'screenshot-debug');
          if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir, { recursive: true });
          }
          const debugFilePath = path.join(debugDir, `screenshot-${Date.now()}.png`);
          const arrayBuffer = await screenshotBlob.arrayBuffer();
          fs.writeFileSync(debugFilePath, Buffer.from(arrayBuffer));
          console.log('Screenshot saved for debugging at:', debugFilePath);
 // debug end
          const response = await fetch('http://localhost:8000/screen', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error('Failed to parse JSON from backend:', e, text);
            data = null;
          }
          console.log('Screenshot sent to backend successfully');
          console.log(data);

          // --- Add Ghost Point Window creation here ---
          if (data && typeof data.x === 'number' && typeof data.y === 'number') {
            console.log(`Received coordinates: x=${data.x}, y=${data.y}. Creating GhostPointWindow.`);
            createGhostPointWindow(data.x, data.y, description);
          } else {
            console.warn('Backend response did not contain valid x/y coordinates for GhostPointWindow.', data);
          }
          // --- End Ghost Point Window creation ---

          return { success: true, data };
        } catch (err: any) {
          console.error('Failed to send screenshot to backend:', err);
          return { success: false, error: err.message || 'Failed to send screenshot to backend' };
        }
      } else {
        console.error('Failed to capture screen: No sources available');
        return { success: false, error: 'No screen sources available' };
      }
    } catch (error: any) {
      console.error('Error capturing screen:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }
app.whenReady().then(() => {
  
  // Remove original capture-screen handler if present
  // ipcMain.handle('capture-screen', handleCapture) 

  // Add the new handler for next-checkpoint-and-capture
  ipcMain.on('next-checkpoint-and-capture', async () => {
    // Calculate the checkpoint number to fetch (current + 1)
    const checkpointToFetch = currentCheckpointNumber + 1; 
    console.log(`CMD+9 received. Attempting to fetch checkpoint ${checkpointToFetch} and capture screen.`);

    try {
      // 1. Fetch next checkpoint details from backend using checkpointToFetch
      const checkpointResponse = await fetch('http://localhost:8000/next-checkpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkpoint_number: checkpointToFetch }), // Use checkpointToFetch
      });

      if (!checkpointResponse.ok) {
        throw new Error(`HTTP error fetching checkpoint! status: ${checkpointResponse.status}`);
      }

      const checkpointData = await checkpointResponse.json();
      console.log('Received checkpoint data:', checkpointData);

      // --- Safely extract checkpoint_ui_element AND checkpoint_description ---
      let promptForCapture = 'Default UI element prompt'; // Fallback prompt
      let descriptionForGhost = 'Loading description...'; // Default description
      if (checkpointData && checkpointData.res && typeof checkpointData.res === 'object') {
         if (checkpointData.res.checkpoint_ui_element) {
            promptForCapture = checkpointData.res.checkpoint_ui_element;
            console.log(`Extracted UI element for prompt: ${promptForCapture}`);
         } else {
            console.warn('Could not find checkpoint_ui_element in response, using default prompt.', checkpointData.res);
         }

         if (checkpointData.res.checkpoint_description) {
            descriptionForGhost = checkpointData.res.checkpoint_description;
            console.log(`Extracted checkpoint description: ${descriptionForGhost}`);
         } else {
            console.warn('Could not find checkpoint_description in response, using default description.', checkpointData.res);
         }

      } else {
        console.warn('Could not find checkpoint data (res object) in response, using defaults.', checkpointData);
        // Optionally, handle the case where the tutorial might be complete
        if (checkpointData && checkpointData.res && typeof checkpointData.res === 'string' && checkpointData.res.includes('Tutorial complete')) {
           console.log('Tutorial finished.');
           // Potentially notify the user or stop further captures
           // Close the ghost window if it exists
           if (ghostPointWindow) {
             ghostPointWindow.close();
           }
           return; // Stop processing if tutorial is done
        }
      }
      // --- End extraction ---

      // 2. Call handleCapture with the extracted UI element description AND the checkpoint description
      await handleCapture(promptForCapture, descriptionForGhost); // Pass both prompt and description
      console.log(`Called handleCapture with prompt: ${promptForCapture}`);

      // --- Increment checkpoint number ONLY after successful fetch and capture ---
      currentCheckpointNumber = checkpointToFetch;
      console.log(`Successfully processed checkpoint, updated currentCheckpointNumber to: ${currentCheckpointNumber}`);
      // ----------------------------------------------------------------------------

    } catch (error) {
      console.error('Error in next-checkpoint-and-capture handler:', error);
      // Do not increment checkpoint number on error
    }
  });

  // Modify start-tutorial handler to fetch /transcript
  ipcMain.on('start-tutorial', (event, prompt: string) => { 


    // Send the prompt (assumed URL) to the backend /transcript endpoint
    fetch('http://localhost:8000/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: prompt }), // Send prompt as url
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Received response from /transcript:', data);
      // TODO: Handle the response data (e.g., show first checkpoint)
      // Reset checkpoint counter when a new tutorial starts
      currentCheckpointNumber = -1;
      console.log('Tutorial started, checkpoint number reset to -1.');
      event.reply('tutorial-analyzed', { success: true }); // Notify renderer
    })
    .catch(error => {
      console.error('Error calling /transcript endpoint:', error);
      event.reply('tutorial-analyzed', { success: false, error: error.message }); // Notify renderer about error
    });
    
    // Remove old setTimeout logic
    /* setTimeout(() => {
      handleCapture(prompt).then(result => {
        console.log(result.data.x, result.data.y)
        if (result && result.success && typeof result.data.x === 'number' && typeof result.data.y === 'number') {
          createGhostPointWindow(result.data.x, result.data.y);
        } 
      }).catch (err=> {
        console.error('Error in start-tutorial handler:', err);
      });
    }, 1000); */
    
  });

  // Add the listener for resizing the ghost window
  // ipcMain.on('resize-ghost-window', (event, size) => {
  //   if (ghostWindow && !ghostWindow.isDestroyed() && size && typeof size.width === 'number' && typeof size.height === 'number') {
  //     console.log(`Resizing ghost window to ${size.width}x${size.height}`);
  //     // Ensure integers and minimum size
  //     const width = Math.max(1, Math.ceil(size.width));
  //     const height = Math.max(1, Math.ceil(size.height));

  //     try {
  //       // Set size first
  //       ghostWindow.setSize(width, height, false); // Set false for animation if desired

  //       // You might adjust position slightly here if 'x, y' was meant to be the center
  //       // For example:
  //       // const originalPos = ghostWindow.getPosition();
  //       // ghostWindow.setPosition(originalPos[0] - Math.floor(width / 2), originalPos[1] - Math.floor(height / 2));

  //       // Then show the window
  //       ghostWindow.show();
  //     } catch (error) {
  //        console.error('Error resizing or showing ghost window:', error);
  //     }
  //   } else {
  //      console.warn('Received invalid resize request or ghost window is gone.');
  //   }
  // });

  // Add the handler for process-checkpoints
  ipcMain.handle('process-checkpoints', async () => {
    console.log('Received process-checkpoints request. Calling backend /create-tutorial...');
    try {
      const response = await fetch('http://localhost:8000/create-tutorial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // No body needed unless we want to pass parameters later
      });

      if (!response.ok) {
        // Try to get more detailed error from backend response
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.detail}`);
      }

      const result = await response.json();
      console.log('Backend /create-tutorial response:', result);

      if (landingWin){
        landingWin.close()
        landingWin = null; // Clear reference after closing
      }
      // Show persistent UI after landing page is closed
      persistentUiWin?.show();
      // Optionally notify the renderer process of success/failure
      // win?.webContents.send('checkpoints-processed', { success: true, ...result });
      return { success: true, message: result.message || 'Checkpoints processed successfully.' };

    } catch (error: any) {
      console.error('Error calling /create-tutorial endpoint:', error);
      // Optionally notify the renderer process of failure
      // win?.webContents.send('checkpoints-processed', { success: false, message: error.message });
      return { success: false, message: `Failed to process checkpoints: ${error.message}` };
    }
  });

  createWindow()
  createLanding()
  createGhostPointWindow(30, 300, 'Initial description')
  createAgentUiWindow() // Create the persistent UI window on startup
})
