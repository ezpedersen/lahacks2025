import { app, BrowserWindow, ipcMain, screen, desktopCapturer } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
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
    // When transparent, don't set backgroundColor (for true transparency)
    // When not transparent, use black background
    backgroundColor: windowTransparent ? void 0 : "#000000",
    hasShadow: false,
    resizable: false,
    // alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
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
        // When transparent, don't set backgroundColor (for true transparency)
        // When not transparent, use black background
        backgroundColor: windowTransparent ? void 0 : "#000000",
        hasShadow: false,
        resizable: false,
        // alwaysOnTop: true,
        webPreferences: {
          preload: path.join(__dirname, "preload.mjs")
        }
      });
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
      const homeDir = app.getPath("home");
      const screenshotsDir = path.join(homeDir, "ElectronSS");
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
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
        const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-").replace(/\..+/, "").replace("T", "_");
        const filePath = path.join(screenshotsDir, `screenshot_${timestamp}.png`);
        fs.writeFileSync(filePath, entireScreen.thumbnail.toPNG());
        console.log(`Screenshot saved to: ${filePath}`);
        return { success: true, path: filePath };
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
