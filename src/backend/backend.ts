// Switch over to import syntax?
import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

import { startServer, stopServer } from './webserver';

const app = express();
const cors = require('cors');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (configure this for production)
        methods: ["GET", "POST"]
    }
});

// Enable CORS if frontend and backend are on different ports
app.use(cors());
// Allows json parsing in post endpoints
app.use(express.json());

let serverRunning = false;
const sockets = new Map();

/*/ Example GET endpoint
app.get('/api/data', (req: Request, res: Response): void => {
    const name = req.query.name as string;
    res.json({ message: `Hello, ${name}!` });
});
*/

// Example POST endpoint
app.post('/api/data', (req: Request, res: Response) => {
    const name = req.body.name;
    // Return the received data as a response
    res.json({ message: `Hello, ${name}!` });
});

//------------------------------------------------------------------------------------------
app.get('/webserver/get-state', (req: Request, res: Response): void => {
    res.json({ serverRunning: serverRunning });
});

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
    sockets.set(socket.id, socket);

    // socket.handshake.headers.origin = host address (how I can tell the ports apart)
    // Tomorrow implement a way to update the site immediately before the server is closed so the closed server can't issue webhook requests

    // Send initial server status when a new client connects
    socket.emit('statusUpdate', serverRunning);

    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
        sockets.delete(socket.id);
    });
});
//------------------------------------------------------------------------------------------

//server.use('/spotify', spotifyRouter);

// Start backend server
const port = 8888;
server.listen(port, '0.0.0.0', () => {
    console.log(`Backend server running on http://localhost:${port}`);
});