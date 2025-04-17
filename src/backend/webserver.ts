import cors from 'cors';
import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';

const webport = 3000;

const webapp = express();
// Create a single HTTP server
const httpServer = http.createServer(webapp);

// Attach Socket.IO to the HTTP server
const io = new Server(httpServer, {
    cors: {
        origin: '*', // todo: Use a stricter origin in production
        methods: ['GET', 'POST']
    }
});

// Enable CORS and JSON parsing for the app
webapp.use(cors());
webapp.use(express.json());

// HTTP Requests

webapp.post('/api/data', (req: Request, res: Response) => {
    const { name } = req.body;
    res.json({ message: `Hello, ${name}!` });
});

// WebSocket

io.on('connection', (socket: any) => {
    console.log('Client connected to webapp:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected from webapp:', socket.id);
    });
});

// Set up main Svelte web app
webapp.use(express.static('dist/frontend'));
webapp.get('*', (req, res) => {
    res.sendFile('main.html', { root: 'dist/frontend' });
});
let webserver: ReturnType<typeof webapp.listen> | null = null;

// Function to start the server
export function startServer() {
    webserver = httpServer.listen(webport, '0.0.0.0', () => {
        console.log(`Web server running at http://localhost:${webport}`);
    });
}

// Function to stop the server
export function stopServer() {
    // Close the server
    if (webserver) {
        webserver.close(() => {
            console.log('Web server stopped');
        });
    }
    // Sever webhooks causing clients to disconnect
    if (io) {
        io.close(() => {
            console.log('Webhooks severed');
        });
    }
}

// Listen for termination signals (In theory this will gracefully close the server in case of a crash causing fast updates for all clients and reducing confusion)
// Maybe add auto server restart?
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
    fetch("/webserver/toggle-server", {
        method: "POST",
    });
}