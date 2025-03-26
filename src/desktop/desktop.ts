import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import path from 'path';

let backendProcess: ReturnType<typeof spawn> | null = null;
let mainWindow: BrowserWindow | null = null;

// Check if backend is already running (optional: improves reliability)
function isBackendRunning(): Promise<boolean> {
    return new Promise((resolve) => {
        const testConnection = require('http').request(
            { hostname: 'localhost', port: 3000, timeout: 500 },
            () => resolve(true)
        );
        testConnection.on('error', () => resolve(false));
        testConnection.end();
    });
}

async function startBackend() {
    const alreadyRunning = await isBackendRunning();
    if (alreadyRunning) {
        console.log('Backend is already running, skipping startup.');
        return;
    }

    console.log('Starting backend...');

    backendProcess = spawn('node', [path.join(__dirname, '../backend/backend')], {
        stdio: 'inherit',
        env: { ...process.env, PORT: '3000' }
    });

    backendProcess.on('close', (code) => {
        if (code && code !== 0) {
            console.error(`Backend exited with code ${code}. Restarting...`);
            backendProcess = null;
            setTimeout(startBackend, 3000);
        }
        else {
            console.log(`Backend closed`);
        }
    });

    process.on('exit', () => {
        if (backendProcess) backendProcess.kill();
    });
}

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        alwaysOnTop: false,
        autoHideMenuBar: true,
        frame: true,
        transparent: false,
        webPreferences: {
            nodeIntegration: true, // Enables Node.js integration in the renderer process
        }
    });

    // Load the static Svelte build (ensure the path to the built `index.html` is correct)
    let webfile = path.join(__dirname, '../frontend/main.html');
    mainWindow.loadFile(webfile);

    // Open DevTools for debugging (optional)
    mainWindow.webContents.openDevTools();

    mainWindow.on('ready-to-show', mainWindow.show);

    // When the window is closed, set it to null
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// When Electron is ready, create the window and start the backend
app.whenReady().then(async () => {
    await startBackend(); // Start backend process
    setTimeout(createWindow, 1000); // Create the Electron window
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

app.on('quit', () => {
    // Unused
});