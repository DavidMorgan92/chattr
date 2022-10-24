import path from 'path';
import express from 'express';
import * as dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import Message from 'common/message';

// Load .env variables
dotenv.config();

// Create the Express app
const app = express();

// Use JSON body parser
app.use(express.json());

// Serve the React app
app.use(express.static(path.join(__dirname, '../../client/build')));

// Begin server listening
const server = app.listen(process.env.PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`);
});

// Create the Web Socket server
const wsServer = new WebSocketServer({ server });

// On client connected
wsServer.on('connection', socket => {
	// On message received
	socket.on('message', data => {
		try {
			// Parse JSON data
			const json = JSON.parse(data.toString());

			// Construct message to send to other clients
			const message: Message = {
				sender: json.sender,
				message: json.message,
			};

			// Send message to all clients except the sender
			wsServer.clients.forEach(client => {
				if (client !== socket && client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(message));
				}
			});
		} catch (error) {
			console.log(`Failed to broadcast message: ${error}`);
		}
	});
});
