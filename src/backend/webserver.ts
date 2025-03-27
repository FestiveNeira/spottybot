import express, { Express } from 'express';  // Import express and the Express type
import path from 'path';  // Import path module for handling file paths
import cors from 'cors';  // Import cors module for handling cross-origin requests

const webapp: Express = express();  // Define the express app with the correct type
const webport: number = 3000;  // Port number for the web server

// Enable CORS and JSON parsing for the app
webapp.use(cors());
webapp.use(express.json());

// Serve the Svelte app from the dist folder
webapp.use(express.static(path.join(__dirname, '../frontend')));
webapp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/main.html'));
});

let webserver: ReturnType<typeof webapp.listen> | null = null;

// Function to start the server
export function startServer() {
    webserver = webapp.listen(webport, () => {
        console.log(`Web server running at http://localhost:${webport}`);
    });
}

// Function to stop the server
export function stopServer() {
    if (webserver) {
        webserver.close(() => {
            console.log('Web server stopped');
        });
    }
}

module.exports = { startServer, stopServer };