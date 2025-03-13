// Switch over to import syntax?
const express = require('express');
const { Request: ExpressRequest, Response: ExpressResponse } = express;
const { exec } = require('child_process');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const cors = require('cors');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (configure this for production)
        methods: ["GET", "POST"]
    }
});

const { startServer, stopServer } = require('./webserver.ts');

// Enable CORS if frontend and backend are on different ports
app.use(cors());
// Allows json parsing in post endpoints
app.use(express.json());

let serverRunning = false;
const sockets = new Map();

// Start Neutralino app when backend starts
function launchNeutralinoApp() {
    const neutralinoAppPath = path.resolve(__dirname, '../../desktop/');
    exec('neu run > neutralino.log 2>&1', { cwd: neutralinoAppPath }, (error: Error, stdout: string, stderr: string) => {
        if (error) {
            console.error(`Error starting Neutralino: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Neutralino error: ${stderr}`);
            return;
        }
        console.log(`Neutralino started: ${stdout}`);
    });
}

/*/ Example GET endpoint
app.get('/api/data', (req: Request, res: Response): void => {
    const name = req.query.name as string;
    res.json({ message: `Hello, ${name}!` });
});
*/

// Example POST endpoint
app.post('/api/data', (req: typeof ExpressRequest, res: typeof ExpressResponse) => {
    const name = req.body.name;
    // Return the received data as a response
    res.json({ message: `Hello, ${name}!` });
});

//------------------------------------------------------------------------------------------
app.post('/webserver/toggle-server', (req: typeof ExpressRequest, res: typeof ExpressResponse) => {
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
const port = 3000;
server.listen(port, '0.0.0.0', () => {
    console.log(`Backend server running on http://localhost:${port}`);
    launchNeutralinoApp(); // Launch the Neutralino app when backend starts
});