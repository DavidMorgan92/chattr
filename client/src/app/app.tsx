import React, {
	FormEvent,
	useState,
	useRef,
	useEffect,
	MutableRefObject,
} from 'react';
import Message from 'common/message';
import './app.scss';

export default function App() {
	const [chatLog, setChatLog] = useState([] as Message[]);
	const [nickname, setNickname] = useState('');
	const [message, setMessage] = useState('');

	const socket: MutableRefObject<WebSocket | null> = useRef(null);

	// On mount
	useEffect(() => {
		// Close any existing socket
		if (socket.current) socket.current.close();

		// Open a websocket to the server
		socket.current = new WebSocket(process.env.REACT_APP_WS_SERVER || '');

		// On socket opened
		socket.current.addEventListener('open', event => {
			console.log('Socket open', event);
		});

		// On socket error
		socket.current.addEventListener('error', event => {
			console.log('Socket error', event);
		});

		// On socket closed
		socket.current.addEventListener('close', event => {
			console.log('Socket closed', event);
		});

		// On message received
		socket.current.addEventListener('message', event => {
			console.log('Message received', event);

			try {
				// Add received message to chat log
				const json = JSON.parse(event.data.toString());
				setChatLog(prev => [
					...prev,
					{ sender: json.sender, message: json.message },
				]);
			} catch (error) {
				console.log('Failed to parse message', error);
			}
		});
	}, []);

	// On message form submit
	function onSubmit(event: FormEvent<HTMLFormElement>) {
		// Prevent page refresh
		event.preventDefault();

		// Do nothing more if there is no socket or the socket isn't open
		if (!socket.current || socket.current.readyState !== WebSocket.OPEN) return;

		// Construct the data to send
		const data: Message = { sender: nickname.trim(), message: message.trim() };

		// Do nothing more if the message is empty
		if (!data.message) return;

		// Send the data
		socket.current.send(JSON.stringify(data));

		// Clear the message input
		setMessage('');

		// Add the sent message to the chat log
		setChatLog(prev => [...prev, data]);
	}

	return (
		<div className='app'>
			<div className='chat-log'>
				{chatLog.map((message, index) => {
					return (
						<div key={index}>
							<span className='nickname'>{message.sender}</span>:&nbsp;
							<span className='message'>{message.message}</span>
						</div>
					);
				})}
			</div>
			<form className='message-form' onSubmit={onSubmit}>
				<input
					className='nickname-input'
					type='text'
					placeholder='Nickname'
					value={nickname}
					onChange={e => setNickname(e.target.value)}
				/>
				<input
					className='message-input'
					type='text'
					placeholder='Type your message'
					value={message}
					onChange={e => setMessage(e.target.value)}
				/>
				<input type='submit' value='Send' />
			</form>
		</div>
	);
}
