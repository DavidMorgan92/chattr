import path from 'path';
import express from 'express';
import * as dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import Message from 'common/message';

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, '../../client/build')));

app.locals.chatLog = [] as Message[];

app.get('/api/chat', (_, res) => {
	res.json(app.locals.chatLog);
});

app.post('/api/chat', (req, res) => {
	const message: Message = {
		sender: req.body.sender,
		message: req.body.message,
	};
	app.locals.chatLog.push(message);
	res.json(message);
});

const server = app.listen(process.env.PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`);
});

const wsServer = new WebSocketServer({ server });

wsServer.on('connection', socket => {
	socket.on('message', message => console.log(message));
});
