import { spawn } from 'child_process';
import { app, BrowserWindow, ipcMain } from 'electron';
import http from 'http';
import { io } from 'socket.io-client';
import { loadLocalAppData, saveLocalAppData } from './localappdata.js'; // still need to implement data saving (only default settings available rn)

let backendProcess: ReturnType<typeof spawn> | null = null;
let mainWindow: BrowserWindow | null = null;

// Loads locally stored data needed to configure the app (rn just connecting to the right address)
let appdata = loadLocalAppData();

// todo: either disconnect backend from here or import the server data loader (backend) instead of hardcoding
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

const socket = io(`http://${appdata.ip}:${appdata.port}`, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000, // Start retrying after 1s
    timeout: 5000
});

socket.on('connect_error', (err) => {
    console.log('Connect error:', err.message);
});

socket.on('reconnect_attempt', (attempt) => {
    console.log(`Reconnect attempt ${attempt}`);
});

// On server connection load the app page
socket.on('connect', () => {
    console.log('🟢 Connected to server!');
    mainWindow?.loadURL(`http://${appdata.ip}:${appdata.port}`);
});

// On disconnect from server load the loading screen
socket.on('disconnect', () => {
    console.log('🔴 Disconnected from server.');
    mainWindow?.loadFile('../frontend/loading.html');
});

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
            preload: './preload.js', // Link to the preload script note: may need to be absolute path honestly this goes for most of the app
            nodeIntegration: false,  // Disable nodeIntegration for security reasons
        },
    });

    // Load the loading page first
    mainWindow.loadFile('../frontend/loading.html');

    // Open DevTools for debugging
    mainWindow.webContents.openDevTools();

    mainWindow.on('ready-to-show', mainWindow.show);

    // When the window is closed, set it to null
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

ipcMain.handle('load-window', (event, local?) => {
    if (local) {
        mainWindow?.loadFile('../frontend/local-settings.html');
    }
    else {
        mainWindow?.loadURL(`http://${appdata.ip}:${appdata.port}`);
    }
});

// Respond to get-settings requests from the renderer process
ipcMain.handle('get-settings', () => {
    if (!appdata) {
        appdata = loadLocalAppData();
    }
    return appdata;
});

// Respond to save-settings requests from the renderer process
ipcMain.handle('save-settings', (event, settings) => {
    saveLocalAppData(settings);
    appdata = loadLocalAppData();
});

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

// Re-create the window on macOS when the dock icon is clicked
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('quit', () => {
    // Unused
});