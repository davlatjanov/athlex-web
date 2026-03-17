import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useLazyQuery, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { ASK_AI, GET_MY_CONVERSATIONS, GET_CONVERSATION } from '../../apollo/user/query';
import { CHAT_WITH_AI, DELETE_CONVERSATION } from '../../apollo/user/mutation';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

const INITIAL_MSG: ChatMessage = {
	role: 'assistant',
	content: "Hello! I'm your Athlex AI Coach. Ask me anything about fitness, workouts, or nutrition.",
};

const AICoachPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);

	const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MSG]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [conversationId, setConversationId] = useState<string | undefined>(undefined);
	const [selectedConvId, setSelectedConvId] = useState<string | undefined>(undefined);
	const bottomRef = useRef<HTMLDivElement>(null);

	const { data: historyData, refetch: refetchHistory } = useQuery(GET_MY_CONVERSATIONS, {
		fetchPolicy: 'network-only',
		skip: !user?._id,
	});
	const conversations = historyData?.getMyConversations ?? [];

	const [loadConversation] = useLazyQuery(GET_CONVERSATION, {
		onCompleted: (data: any) => {
			const conv = data?.getConversation;
			if (conv?.messages) {
				setMessages(conv.messages.map((m: any) => ({ role: m.role, content: m.content })));
				setConversationId(conv._id);
			}
		},
	});

	const [chatWithAI] = useMutation(CHAT_WITH_AI);
	const [askAI] = useLazyQuery(ASK_AI);
	const [deleteConversation] = useMutation(DELETE_CONVERSATION);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const sendMessage = async () => {
		if (!input.trim() || isLoading) return;
		const userMsg: ChatMessage = { role: 'user', content: input.trim() };
		setMessages((prev) => [...prev, userMsg]);
		setInput('');
		setIsLoading(true);

		try {
			if (user?._id) {
				const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
				const { data } = await chatWithAI({
					variables: { input: { messages: allMessages, ...(conversationId ? { conversationId } : {}) } },
				});
				const reply = data?.chatWithAI;
				if (reply?.answer) {
					setMessages((prev) => [...prev, { role: 'assistant', content: reply.answer }]);
					if (reply.conversationId && !conversationId) {
						setConversationId(reply.conversationId);
						refetchHistory();
					}
				}
			} else {
				const { data } = await askAI({ variables: { input: { question: userMsg.content } } });
				const reply = data?.askAI;
				if (reply?.answer) {
					setMessages((prev) => [...prev, { role: 'assistant', content: reply.answer }]);
				}
			}
		} catch {
			setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
		} finally {
			setIsLoading(false);
		}
	};

	const startNewChat = () => {
		setMessages([INITIAL_MSG]);
		setConversationId(undefined);
		setSelectedConvId(undefined);
	};

	const openConversation = (id: string) => {
		setSelectedConvId(id);
		loadConversation({ variables: { conversationId: id } });
	};

	const handleDelete = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		await deleteConversation({ variables: { conversationId: id } });
		if (selectedConvId === id) startNewChat();
		refetchHistory();
	};

	return (
		<Stack id={'ai-coach-page'}>
			<Head><title>Athlex | AI Coach</title></Head>
			<Stack className={'container ac-wrap'}>
				{user?._id && (
					<aside className={'ac-sidebar'}>
						<button className={'ac-new-btn'} onClick={startNewChat}>+ New Chat</button>
						<div className={'ac-history'}>
							{conversations.map((c: any) => (
								<div
									key={c._id}
									className={`ac-conv-item ${selectedConvId === c._id ? 'active' : ''}`}
									onClick={() => openConversation(c._id)}
								>
									<span className={'ac-conv-title'}>{c.title}</span>
									<button className={'ac-conv-delete'} onClick={(e) => handleDelete(e, c._id)}>✕</button>
								</div>
							))}
						</div>
					</aside>
				)}

				<div className={'ac-chat'}>
					<div className={'ac-messages'}>
						{messages.map((msg, i) => (
							<div key={i} className={`ac-msg ${msg.role === 'user' ? 'ac-msg--user' : 'ac-msg--ai'}`}>
								{msg.role === 'assistant' && <span className={'ac-msg-icon'}>🤖</span>}
								<div className={'ac-msg-bubble'}>{msg.content}</div>
							</div>
						))}
						{isLoading && (
							<div className={'ac-msg ac-msg--ai'}>
								<span className={'ac-msg-icon'}>🤖</span>
								<div className={'ac-msg-bubble ac-typing'}>
									<span /><span /><span />
								</div>
							</div>
						)}
						<div ref={bottomRef} />
					</div>

					<div className={'ac-input-bar'}>
						<input
							className={'ac-input'}
							type="text"
							placeholder={user?._id ? 'Ask your AI coach…' : 'Ask a fitness question (log in to save history)…'}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
							disabled={isLoading}
						/>
						<button
							className={'ac-send-btn'}
							onClick={sendMessage}
							disabled={isLoading || !input.trim()}
						>
							➤
						</button>
					</div>
				</div>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(AICoachPage);
