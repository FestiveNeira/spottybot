import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import path from 'path';

let mainWindow: BrowserWindow | null = null;
let backendProcess: any;

function startBackend() {
    // Path to your backend's entry point file (adjust this to match your structure)
    const backendPath = path.join(__dirname, '../backend/src/backend.ts'); 

    // Spawn the backend process (assuming you are using TypeScript)
    // You may need to use ts-node or compile the backend to JavaScript first
    backendProcess = spawn('ts-node', [backendPath], {
        stdio: 'inherit' // Optionally attach stdio to see output in console
    });

    backendProcess.on('error', (err: any) => {
        console.error('Failed to start backend:', err);
    });

    backendProcess.on('close', (code: number) => {
        console.log(`Backend process exited with code ${code}`);
    });
}

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        transparent: false,
        frame: true,
        alwaysOnTop: false,
        webPreferences: {
            nodeIntegration: true, // Enables Node.js integration in the renderer process
        }
    });

    // Load the static Svelte build (ensure the path to the built `index.html` is correct)
    mainWindow.loadFile(path.join(__dirname, '../frontend/public/index.html'));

    // Open DevTools for debugging (optional)
    mainWindow.webContents.openDevTools();

    // When the window is closed, set it to null
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// When Electron is ready, create the window and start the backend
app.whenReady().then(() => {
    startBackend(); // Start backend as a child process
    createWindow(); // Create the Electron window
});

// Quit the app when all windows are closed (for macOS compatibility)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Re-create the window on macOS when the dock icon is clicked (optional)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Kill the backend process when Electron quits
app.on('quit', () => {
    if (backendProcess) {
        backendProcess.kill(); // Kill the backend process
    }
});