import { spawn } from 'child_process';
import { app, BrowserWindow } from 'electron';
import http from 'http';

let backendProcess: ReturnType<typeof spawn> | null = null;
let mainWindow: BrowserWindow | null = null;

// Send an http request to backend to see if it's running
function isBackendRunning(): Promise<boolean> {
    return new Promise((resolve) => {
        const testConnection = http.request(
            { hostname: 'localhost', port: 8888, timeout: 500 },
            () => resolve(true)
        );
        testConnection.on('error', () => resolve(false));
        testConnection.end();
    });
}

// Start the backend process
async function startBackend() {
    const alreadyRunning = await isBackendRunning();
    if (alreadyRunning) {
        console.log('Backend is already running, skipping startup.');
        return;
    }

    console.log('Starting backend...');

    // Using path relative to root because spawn defaults to working directory (works in dev may not work in prod, needs research/testing)
    backendProcess = spawn('node', ['dist/backend/backend.js'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: '8888' }
    });

    backendProcess.on('close', (code) => {
        if (code && code !== 0) {
            console.error(`Backend exited with code ${code}. Restarting...`);
            backendProcess = null;
            setTimeout(startBackend, 2500);
        }
        else {
            console.log(`Backend closed`);
        }
    });

    process.on('exit', () => {
        if (backendProcess) backendProcess.kill();
    });
}

// Create the browser window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        alwaysOnTop: false,
        autoHideMenuBar: true,
        frame: true,
        transparent: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Load the static Svelte build
    mainWindow.loadFile('../frontend/main.html');

    // Open DevTools for debugging
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