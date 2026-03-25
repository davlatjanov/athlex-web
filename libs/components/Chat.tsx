import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Minimize2, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { Messages, NEXT_PUBLIC_API_URL } from '../config';
import { sweetErrorAlert } from '../sweetAlert';

const NewMessage = (type: any) => {
	if (type === 'right') {
		return (
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', margin: '10px 0' }}>
				<div className={'msg_right'}></div>
			</div>
		);
	} else {
		return (
			<div style={{ display: 'flex', flexDirection: 'row', margin: '10px 0' }}>
				<img src="/img/profile/defaultUser.svg" alt="user" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }} />
				<div className={'msg_left'}></div>
			</div>
		);
	}
};

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member;
	action: string;
}

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const textInput = useRef(null);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	/** LIFECYCLES **/
	useEffect(() => {
		socket.onmessage = (msg) => {
			const data = JSON.parse(msg.data);
			console.log('WebSocket message:', data);

			switch (data.event) {
				case 'info':
					const newInfo: InfoPayload = data;
					setOnlineUsers(newInfo.totalClients);
					break;

				case 'getMessages':
					const list: MessagePayload[] = data.list;
					setMessagesList(list);
					break;
				case 'message':
					const newMessage: MessagePayload = data;
					messagesList.push(newMessage);
					setMessagesList([...messagesList]);
					break;
			}
		};
	}, [socket, messagesList]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	/** HANDLERS **/
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const getInputMessageHandler = useCallback(
		(e: any) => {
			const text = e.target.value;
			setMessageInput(text);
		},
		[messageInput],
	);

	const getKeyHandler = (e: any) => {
		try {
			if (e.key == 'Enter') {
				onClickHandler();
			}
		} catch (err: any) {
			console.log(err);
		}
	};

	const onClickHandler = () => {
		if (!messageInput) sweetErrorAlert(Messages.error4);
		else {
			socket.send(JSON.stringify({ event: 'message', data: messageInput }));
			setMessageInput('');
		}
	};

	return (
		<div className="chatting">
			{openButton ? (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <Minimize2 /> : <MessageCircle />}
				</button>
			) : null}
			<div className={`chat-frame ${open ? 'open' : ''}`}>
				<div className={'chat-top'}>
					<div style={{ fontFamily: 'Nunito' }}>Online Chat</div>
					{/* Online users badge with ping animation */}
					<div style={{ position: 'relative', margin: '-18px 0 0 21px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
						<span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#22c55e', opacity: 0.75, animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite' }} />
						<span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, borderRadius: 10, background: '#22c55e', color: '#fff', fontSize: 11, fontWeight: 700, padding: '0 5px' }}>
							{onlineUsers}
						</span>
					</div>
				</div>
				<div className={'chat-content'} id="chat-content" ref={chatContentRef}>
					<ScrollableFeed>
						<div className={'chat-main'}>
							<div style={{ display: 'flex', flexDirection: 'row', margin: '10px 0' }}>
								<div className={'welcome'}>Welcome to Live chat!</div>
							</div>
							{messagesList.map((ele: MessagePayload) => {
								const { text, memberData } = ele;
								const memberImage = memberData?.memberImage
									? `${NEXT_PUBLIC_API_URL}/${memberData?.memberImage}`
									: `/img/profile/defaultUser.svg`;

								return memberData?._id === user?._id ? (
									<div
										key={`${memberData._id}-${text}`}
										style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', margin: '10px 0' }}
									>
										<div className={'msg-right'}>{text}</div>
									</div>
								) : (
									<div key={`${memberData._id}-${text}`} style={{ display: 'flex', flexDirection: 'row', margin: '10px 0' }}>
										<img
											alt={memberData?.memberNick ?? 'user'}
											src={memberImage}
											onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }}
											style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
										/>
										<div className={'msg-left'}>{text}</div>
									</div>
								);
							})}
							<></>
						</div>
					</ScrollableFeed>
				</div>
				<div className={'chat-bott'}>
					<input
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={'Type message'}
						value={messageInput}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button className={'send-msg-btn'} onClick={onClickHandler}>
						<Send style={{ color: '#fff' }} size={18} />
					</button>
				</div>
			</div>
		</div>
	);
};

export default Chat;
