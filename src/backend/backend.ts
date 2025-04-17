import cors from 'cors';
import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { startServer, stopServer } from './webserver.js';

const port = 8888; // todo: will be variable in prod
let serverRunning = false;

const sockets = new Map();
const app = express();

// Create a single HTTP server
const httpServer = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(httpServer, {
    cors: {
        origin: '*', // todo: Use a stricter origin in production
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

app.post('/api/data', (req: Request, res: Response) => {
    const { name } = req.body;
    res.json({ message: `Hello, ${name}!` });
});

app.get('/webserver/get-state', (req: Request, res: Response) => {
    res.json({ serverRunning });
});

app.post('/webserver/toggle-server', (req: Request, res: Response) => {
    serverRunning = !serverRunning;

    if (serverRunning) {
        startServer();
    } else {
        stopServer();

        sockets.forEach(socket => {
            if (socket.id) {
                console.log("socket found: " + socket.id);
            }
        });
    }

    io.emit('statusUpdate', serverRunning);
    res.json({ serverRunning });
});

// WebSocket

io.on('connection', (socket: any) => {
    console.log('Client connected:', socket.id);
    sockets.set(socket.handshake.headers.origin, socket);

    socket.emit('statusUpdate', serverRunning);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        sockets.delete(socket.id);
    });
});

// Serve Static Frontend
app.use(express.static('dist/frontend'));

// Fallback to server.html for any route
app.get('*', (req, res) => {
    res.sendFile('server.html', { root: 'dist/frontend' });
});

// Start Server

httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Backend + settings server running at http://localhost:${port}`);
});