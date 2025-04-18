import path from 'path';
import os from 'os';
import fs, { existsSync } from 'fs';
import pkg from '../../package.json' with { type: 'json' };

interface ServerSettings {
    ip?: string;
    port?: string;
}

const appDataPath = (() => {
    switch (process.platform) {
        case 'win32':
            return process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
        case 'darwin':
            return path.join(os.homedir(), 'Library', 'Application Support');
        case 'linux':
            return path.join(os.homedir(), '.config');
        default:
            throw new Error('Unsupported platform');
    }
})();

const appFolder = path.join(appDataPath, pkg.name);
if (!fs.existsSync(appFolder)) {
    fs.mkdirSync(appFolder, { recursive: true });
}

// Loads local app data for the backend and desktop app
export function loadLocalServerData() {
    if (existsSync(appFolder + '/serverdata.json')) {
        // Return contents of the server settings file
        return JSON.parse(fs.readFileSync(appFolder + '/serverdata.json', 'utf-8'));
    }
    else {
        // If the file doesn't exist use default settings
        let data = {
            ip: '0.0.0.0',
            port: '8888'
        };
        // Create the settings file with default settings
        saveLocalServerData(data);
        // Return default settings
        return data;
    }
}

// Saves local app data for the backend and desktop app
export function saveLocalServerData(newdata: ServerSettings) {
    let data: ServerSettings = loadLocalServerData();
    for (const key in data) {
        if (newdata[key as keyof ServerSettings] !== undefined) {
            data[key as keyof ServerSettings] = newdata[key as keyof ServerSettings];
        }
    }
    // Will need to ensure all data is present before writing
    fs.writeFileSync(appFolder + '/serverdata.json', JSON.stringify(data));
}