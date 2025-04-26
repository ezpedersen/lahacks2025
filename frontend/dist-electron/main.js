import { app, BrowserWindow, ipcMain, screen, desktopCapturer } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let windowTransparent = false;
let win;
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;
  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    frame: false,
    transparent: windowTransparent,
    backgroundColor: windowTransparent ? void 0 : "#000000",
    hasShadow: false,
    resizable: false,
    alwaysOnTop: true,
    focusable: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  if (windowTransparent) {
    win.setIgnoreMouseEvents(true, { forward: true });
    win.setAlwaysOnTop(true, "screen-saver");
    win.setVisibleOnAllWorkspaces(true);
    win.on("blur", () => {
      if (win) {
        win.focus();
        win.setAlwaysOnTop(true, "screen-saver");
      }
    });
  }
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  ipcMain.handle("toggle-transparency", () => {
    if (win) {
      windowTransparent = !windowTransparent;
      win.getBounds();
      const url = win.webContents.getURL();
      win.close();
      win = null;
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.bounds;
      win = new BrowserWindow({
        width,
        height,
        x: 0,
        y: 0,
        frame: false,
        transparent: windowTransparent,
        backgroundColor: windowTransparent ? void 0 : "#000000",
        hasShadow: false,
        resizable: false,
        alwaysOnTop: true,
        focusable: true,
        skipTaskbar: true,
        webPreferences: {
          preload: path.join(__dirname, "preload.mjs")
        }
      });
      if (windowTransparent) {
        win.setIgnoreMouseEvents(true, { forward: true });
        win.setAlwaysOnTop(true, "screen-saver");
        win.setVisibleOnAllWorkspaces(true);
        win.on("blur", () => {
          if (win) {
            win.focus();
            win.setAlwaysOnTop(true, "screen-saver");
          }
        });
      }
      if (VITE_DEV_SERVER_URL && url.includes(VITE_DEV_SERVER_URL)) {
        win.loadURL(VITE_DEV_SERVER_URL);
      } else {
        win.loadFile(path.join(RENDERER_DIST, "index.html"));
      }
      return windowTransparent;
    }
    return false;
  });
  ipcMain.handle("capture-screen", async () => {
    try {
      console.log("Capturing entire screen...");
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.bounds;
      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width, height }
      });
      const entireScreen = sources.find(
        (source) => source.name === "Entire Screen" || source.name.includes("Screen") || source.id.includes("screen")
      ) || sources[0];
      if (entireScreen && entireScreen.thumbnail) {
        try {
          const formData = new FormData();
          formData.append("prompt", "the file button");
          formData.append("file", new Blob([entireScreen.thumbnail.toPNG()], { type: "image/png" }), "screenshot.png");
          const response = await fetch("http://localhost:8000/screen", {
            method: "POST",
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
            console.error("Failed to parse JSON from backend:", e, text);
            data = null;
          }
          console.log("Screenshot sent to backend successfully");
          console.log(data);
        } catch (err) {
          console.error("Failed to send screenshot to backend:", err);
        }
        return { success: true, path: "yes" };
      } else {
        console.error("Failed to capture screen: No sources available");
        return { success: false, error: "No screen sources available" };
      }
    } catch (error) {
      console.error("Error capturing screen:", error);
      return { success: false, error: error.message || "Unknown error" };
    }
  });
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
