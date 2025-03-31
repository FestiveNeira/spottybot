import cors from 'cors';
import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { startServer, stopServer } from './webserver.js';

const port = 8888;
const sockets = new Map();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (configure this for production)
        methods: ["GET", "POST"]
    }
});
let serverRunning = false;

// Enable CORS and JSON parsing for the app
app.use(cors());
app.use(express.json());

// Example POST endpoint
app.post('/api/data', (req: Request, res: Response) => {
    const name = req.body.name;
    // Return the received data as a response
    res.json({ message: `Hello, ${name}!` });
});

// Example GET endpoint (actually useful though)
app.get('/webserver/get-state', (req: Request, res: Response): void => {
    res.json({ serverRunning: serverRunning });
});

// Example POST endpoint (again) (actually useful though)
app.post('/webserver/toggle-server', (req: Request, res: Response) => {
    serverRunning = !serverRunning;
    if (serverRunning) {
        startServer();
    }
    else {
        stopServer();
        sockets.forEach(socket => {
            if (socket.id) {
                console.log("socket found")
            }
        });
    }
    io.emit('statusUpdate', serverRunning); // Emit new status to all clients
    res.json({ serverRunning });
});

// WebSocket connection
io.on('connection', (socket: any) => {
    console.log('A client connected:', socket.id);
    // Sockets array tracks connections, just in case we need them for something, currently unused
    sockets.set(socket.handshake.headers.origin, socket);

    // socket.handshake.headers.origin = host address (how I can tell the ports apart)
    // todo: Implement a way to update the site immediately before the server is closed so the closed server can't issue webhook requests

    // Send initial server status when a new client connects
    socket.emit('statusUpdate', serverRunning);

    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
        sockets.delete(socket.id);
    });
});

// Start backend server
server.listen(port, '0.0.0.0', () => {
    console.log(`Backend server running on http://localhost:${port}`);
});

// Serve the server settings app on the server port (will be used for configuring server)
app.use(express.static('../frontend'));
app.get('*', (req, res) => {
    res.sendFile('../frontend/server.html');
});
app.listen(port, () => {
    console.log(`Web server running at http://localhost:${port}`);
});