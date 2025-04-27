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
let ghostWindow: BrowserWindow | null = null;
let persistentUiWin: BrowserWindow | null = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;
  console.log(width, height)
  win = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    frame: false,
    hasShadow: false,
    resizable: false,
    // alwaysOnTop: true,
    transparent: true,
    focusable: false, // Make window not focusable for clickthrough
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
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
function createGhostWindow(x: number, y: number) {
  if (ghostWindow) {
    ghostWindow.close();
  }
  if (!win){return}
  ghostWindow = new BrowserWindow({
    show: false,
    x: x,
    y: y,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    transparent: true,
    parent: win,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (VITE_DEV_SERVER_URL) {
    ghostWindow.loadURL(path.join(VITE_DEV_SERVER_URL, 'ghost'));
  } else {
    ghostWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: '/ghost' });
  }
}
function createGhostPointWindow(x: number, y: number) {
  if (ghostPointWindow) {
    ghostPointWindow.close();
  }
  if (!win){return}
  ghostPointWindow = new BrowserWindow({
    width: 50,
    height: 50,
    x: x-25,
    y: y-25,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    parent: win,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: false
    }
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
    // parent: win,
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


const handleCapture = async () => {
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
          formData.append('prompt', 'im feeling lucky button');
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
  

  ipcMain.handle('capture-screen', handleCapture)

  ipcMain.on('start-tutorial', () => {
    if (landingWin){
      landingWin.close()
      landingWin = null; // Clear reference after closing
    }
    // Show persistent UI after landing page is closed
    persistentUiWin?.show();

    setTimeout(() => {
      // Call handleCapture and get the result
      handleCapture().then(result => {
        console.log(result.data.x, result.data.y)
        if (result && result.success && typeof result.data.x === 'number' && typeof result.data.y === 'number') {
          createGhostPointWindow(result.data.x, result.data.y);
        } 
      }).catch (err=> {
        console.error('Error in start-tutorial handler:', err);
      });
    }, 1000);
    
  });

  // Add the listener for resizing the ghost window
  ipcMain.on('resize-ghost-window', (event, size) => {
    if (ghostWindow && !ghostWindow.isDestroyed() && size && typeof size.width === 'number' && typeof size.height === 'number') {
      console.log(`Resizing ghost window to ${size.width}x${size.height}`);
      // Ensure integers and minimum size
      const width = Math.max(1, Math.ceil(size.width));
      const height = Math.max(1, Math.ceil(size.height));

      try {
        // Set size first
        ghostWindow.setSize(width, height, false); // Set false for animation if desired

        // You might adjust position slightly here if 'x, y' was meant to be the center
        // For example:
        // const originalPos = ghostWindow.getPosition();
        // ghostWindow.setPosition(originalPos[0] - Math.floor(width / 2), originalPos[1] - Math.floor(height / 2));

        // Then show the window
        ghostWindow.show();
      } catch (error) {
         console.error('Error resizing or showing ghost window:', error);
      }
    } else {
       console.warn('Received invalid resize request or ghost window is gone.');
    }
  });

  createWindow()
  createLanding()
  createAgentUiWindow() // Create the persistent UI window on startup
})
