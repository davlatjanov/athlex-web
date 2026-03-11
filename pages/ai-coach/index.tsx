import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useLazyQuery, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { ASK_AI, GET_MY_CONVERSATIONS } from '../../apollo/user/query';
import { CHAT_WITH_AI } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import moment from 'moment';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

const AICoachPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			role: 'assistant',
			content: "Hello! I'm your Athlex AI Coach. Ask me anything about fitness, workouts, nutrition, or your training programs.",
		},
	]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [conversationId, setConversationId] = useState<string | undefined>(undefined);
	const [showHistory, setShowHistory] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	const { data: historyData, refetch: refetchHistory } = useQuery(GET_MY_CONVERSATIONS, {
		fetchPolicy: 'network-only',
		skip: !user._id,
	});

	const [chatWithAI] = useMutation(CHAT_WITH_AI);
	const [askAI] = useLazyQuery(ASK_AI);

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
			if (user._id) {
				const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
				const { data } = await chatWithAI({
					variables: {
						input: {
							messages: allMessages,
							...(conversationId ? { conversationId } : {}),
						},
					},
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
				const { data } = await askAI({
					variables: { input: { question: userMsg.content } },
				});
				const reply = data?.askAI;
				if (reply?.answer) {
					setMessages((prev) => [...prev, { role: 'assistant', content: reply.answer }]);
				}
			}
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
			setMessages((prev) => [
				...prev,
				{ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const loadConversation = (conv: T) => {
		const msgs: ChatMessage[] = (conv.messages ?? []).map((m: T) => ({ role: m.role, content: m.content }));
		if (msgs.length > 0) setMessages(msgs);
		setConversationId(conv._id);
		setShowHistory(false);
	};

	const startNewChat = () => {
		setMessages([
			{
				role: 'assistant',
				content: "Hello! I'm your Athlex AI Coach. Ask me anything about fitness, workouts, nutrition, or your training programs.",
			},
		]);
		setConversationId(undefined);
	};

	const conversations: T[] = historyData?.getMyConversations ?? [];

	return (
		<div id="ai-coach-page">
			<div className="acp-layout">

				{/* Sidebar: conversation history */}
				{user._id && (
					<aside className={`acp-sidebar ${showHistory ? 'visible' : ''}`}>
						<div className="acp-sidebar-head">
							<span>Conversations</span>
							<button className="acp-new-btn" onClick={startNewChat}>
								+ New
							</button>
						</div>
						{conversations.length === 0 ? (
							<p className="acp-no-history">No conversations yet</p>
						) : (
							<div className="acp-conv-list">
								{conversations.map((conv: T) => (
									<div
										key={conv._id}
										className={`acp-conv-item ${conv._id === conversationId ? 'active' : ''}`}
										onClick={() => loadConversation(conv)}
									>
										<span className="acp-conv-topic">{conv.topic || 'Conversation'}</span>
										<span className="acp-conv-date">{moment(conv.updatedAt).fromNow()}</span>
									</div>
								))}
							</div>
						)}
					</aside>
				)}

				{/* Chat area */}
				<div className="acp-chat">
					<div className="acp-chat-header">
						<div className="acp-bot-info">
							<span className="acp-bot-icon">🤖</span>
							<div>
								<strong>Athlex AI Coach</strong>
								<span className="acp-online">● Online</span>
							</div>
						</div>
						{user._id && (
							<button className="acp-history-toggle" onClick={() => setShowHistory((v) => !v)}>
								📋 History
							</button>
						)}
					</div>

					<div className="acp-messages">
						{messages.map((msg, i) => (
							<div key={i} className={`acp-msg ${msg.role === 'user' ? 'acp-msg--user' : 'acp-msg--ai'}`}>
								{msg.role === 'assistant' && <span className="acp-msg-icon">🤖</span>}
								<div className="acp-msg-bubble">{msg.content}</div>
							</div>
						))}
						{isLoading && (
							<div className="acp-msg acp-msg--ai">
								<span className="acp-msg-icon">🤖</span>
								<div className="acp-msg-bubble acp-typing">
									<span />
									<span />
									<span />
								</div>
							</div>
						)}
						<div ref={bottomRef} />
					</div>

					<div className="acp-input-bar">
						<input
							className="acp-input"
							type="text"
							placeholder="Ask your AI coach…"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
							disabled={isLoading}
						/>
						<button className="acp-send-btn" onClick={sendMessage} disabled={isLoading || !input.trim()}>
							➤
						</button>
					</div>

					{!user._id && (
						<p className="acp-guest-note">
							💡 <a href="/account/join">Sign in</a> to save your conversation history.
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(AICoachPage);
