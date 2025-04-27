/// <reference types="vite/client" />

// Add this interface to declare the shape of the object exposed in preload.ts
interface Window {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
    off: (channel: string, listener: (...args: any[]) => void) => void;
    // Add other methods you might expose
  };
  electron: {
    captureScreen: () => Promise<any>;
    nextCheckpoint: () => Promise<any>;
    processCheckpoints: () => Promise<any>; // Ensure this matches preload
    // Add other exposed functions here
  };
}
