import { app, BrowserWindow, ipcMain, screen, desktopCapturer } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
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

let windowTransparent = false;
let win: BrowserWindow | null

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  win = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    frame: false,
    transparent: windowTransparent,
    // When transparent, don't set backgroundColor (for true transparency)
    // When not transparent, use black background
    backgroundColor: windowTransparent ? undefined : '#000000',
    hasShadow: false,
    resizable: false,
    // alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
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

app.whenReady().then(() => {
  ipcMain.handle('toggle-transparency', () => {
    if (win) {
      windowTransparent = !windowTransparent;
      
      const bounds = win.getBounds();
      const url = win.webContents.getURL();
      
      win.close();
      win = null;
      
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.bounds;
      
      win = new BrowserWindow({
        width: width,
        height: height,
        x: 0,
        y: 0,
        frame: false,
        transparent: windowTransparent,
        // When transparent, don't set backgroundColor (for true transparency)
        // When not transparent, use black background
        backgroundColor: windowTransparent ? undefined : '#000000',
        hasShadow: false,
        resizable: false,
        // alwaysOnTop: true,
        webPreferences: {
          preload: path.join(__dirname, 'preload.mjs'),
        },
      });
      
      // Load the same URL
      if (VITE_DEV_SERVER_URL && url.includes(VITE_DEV_SERVER_URL)) {
        win.loadURL(VITE_DEV_SERVER_URL)
      } else {
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
      }
      
      return windowTransparent;
    }
    return false;
  })

  ipcMain.handle('capture-screen', async () => {
    try {
      console.log('Capturing entire screen...');
      
      // Create the ElectronSS directory in user's home directory if it doesn't exist
      // // const homeDir = app.getPath('home');
      // // const screenshotsDir = path.join(homeDir, 'ElectronSS');
      
      // if (!fs.existsSync(screenshotsDir)) {
      //   fs.mkdirSync(screenshotsDir, { recursive: true });
      // }
      
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
        // Generate a timestamp for the filename
        // const timestamp = new Date().toISOString()
        //   .replace(/:/g, '-')
        //   .replace(/\..+/, '')
        //   .replace('T', '_');
        
        // Create the filepath
        // const filePath = path.join(screenshotsDir, `screenshot_${timestamp}.png`);
        
        // Save the screenshot as PNG
        // fs.writeFileSync(filePath, entireScreen.thumbnail.toPNG());
        
        // console.log(`Screenshot saved to: ${filePath}`);
        // Send the PNG buffer to the backend
        try {
          const formData = new FormData();
          formData.append('prompt', 'the file button');
          formData.append('file', new Blob([entireScreen.thumbnail.toPNG()], { type: 'image/png' }), 'screenshot.png');

          const response = await fetch('http://localhost:8000/screen', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.text();
          console.log('Screenshot sent to backend successfully');
          console.log(data);
        } catch (err) {
          console.error('Failed to send screenshot to backend:', err);
        }
        return { success: true, path: "yes" };
      } else {
        console.error('Failed to capture screen: No sources available');
        return { success: false, error: 'No screen sources available' };
      }
    } catch (error: any) {
      console.error('Error capturing screen:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  })

  createWindow()
})
