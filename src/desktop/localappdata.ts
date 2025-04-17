import path from 'path';
import os from 'os';
import fs, { existsSync } from 'fs';
import pkg from '../../package.json' with { type: 'json' };

interface AppSettings {
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
export function loadLocalAppData() {
    if (existsSync(appFolder + '/appdata.json')) {
        // Return contents of the server settings file
        return JSON.parse(fs.readFileSync(appFolder + '/appdata.json', 'utf-8'));
    }
    else {
        // If the file doesn't exist use default settings
        let data: AppSettings = {
            ip: 'localhost',
            port: '3000'
        };
        // Create the settings file with default settings
        saveLocalAppData(data);
        // Return default settings
        return data;
    }
}

// Saves local app data for the backend and desktop app
export function saveLocalAppData(newdata: AppSettings) {
    // Fills any empty fields of newdata with old values
    if (existsSync(appFolder + '/appdata.json')) {
        let data: AppSettings = loadLocalAppData();
        for (const key in data) {
            if (!newdata[key as keyof AppSettings]) {
                newdata[key as keyof AppSettings] = data[key as keyof AppSettings];
            }
        }
    }
    // Saves new settings
    fs.writeFileSync(appFolder + '/appdata.json', JSON.stringify(newdata));
}