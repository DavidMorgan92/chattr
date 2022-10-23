import React, { FormEvent, useEffect, useState } from 'react';
import Message from 'common/message';
import './app.scss';

export default function App() {
	const [chatLog, setChatLog] = useState([] as Message[]);
	const [currentMessage, setCurrentMessage] = useState('');

	useEffect(() => {
		const controller = new AbortController();

		fetch('/api/chat', { signal: controller.signal })
			.then(response => response.json())
			.then(json => setChatLog(json));

		return () => controller.abort();
	}, []);

	function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const message = {
			sender: 'me',
			message: currentMessage.trim(),
		};

		if (!message.message) {
			return;
		}

		setCurrentMessage('');

		fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(message),
		})
			.then(response => response.json())
			.then(json => setChatLog(prev => [...prev, json]));
	}

	return (
		<div className='app'>
			<div className='chat-log'>
				{chatLog.map((message, index) => {
					return (
						<div key={index}>
							<span>{message.sender}</span>: <span>{message.message}</span>
						</div>
					);
				})}
			</div>
			<form className='chat-input' onSubmit={onSubmit}>
				<input
					type='text'
					name='text'
					value={currentMessage}
					onChange={e => setCurrentMessage(e.target.value)}
				/>
				<input type='submit' value='Send' />
			</form>
		</div>
	);
}
