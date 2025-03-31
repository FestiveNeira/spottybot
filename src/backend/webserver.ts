import cors from 'cors';
import express from 'express';

const webapp = express();
const webport = 3000;

// Enable CORS and JSON parsing for the app
webapp.use(cors());
webapp.use(express.json());

// Set up main Svelte web app
webapp.use(express.static('../frontend'));
webapp.get('*', (req, res) => {
    res.sendFile('../frontend/main.html');
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