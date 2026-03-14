import React, { useEffect, useRef, useState } from 'react';
import { useLazyQuery, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { ASK_AI, GET_MY_CONVERSATIONS } from '../../apollo/user/query';
import { CHAT_WITH_AI } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { T } from '../types/common';

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

const INITIAL_MSG: ChatMessage = {
	role: 'assistant',
	content: "Hello! I'm your Athlex AI Coach. Ask me anything about fitness, workouts, or nutrition.",
};

const AICoachWidget = () => {
	const user = useReactiveVar(userVar);
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MSG]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [conversationId, setConversationId] = useState<string | undefined>(undefined);
	const bottomRef = useRef<HTMLDivElement>(null);

	const { refetch: refetchHistory } = useQuery(GET_MY_CONVERSATIONS, {
		fetchPolicy: 'network-only',
		skip: !user._id,
	});

	const [chatWithAI] = useMutation(CHAT_WITH_AI);
	const [askAI] = useLazyQuery(ASK_AI);

	useEffect(() => {
		if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, open]);

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
			setMessages((prev) => [
				...prev,
				{ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="ai-widget">
			{/* Chat Panel */}
			{open && (
				<div className="ai-widget-panel">
					<div className="ai-widget-head">
						<div className="ai-widget-title">
							<span className="ai-widget-icon">🤖</span>
							<div>
								<strong>Athlex AI Coach</strong>
								<span className="ai-widget-online">● Online</span>
							</div>
						</div>
						<button className="ai-widget-close" onClick={() => setOpen(false)}>✕</button>
					</div>

					<div className="ai-widget-messages">
						{messages.map((msg, i) => (
							<div key={i} className={`ai-msg ${msg.role === 'user' ? 'ai-msg--user' : 'ai-msg--ai'}`}>
								{msg.role === 'assistant' && <span className="ai-msg-icon">🤖</span>}
								<div className="ai-msg-bubble">{msg.content}</div>
							</div>
						))}
						{isLoading && (
							<div className="ai-msg ai-msg--ai">
								<span className="ai-msg-icon">🤖</span>
								<div className="ai-msg-bubble ai-typing">
									<span /><span /><span />
								</div>
							</div>
						)}
						<div ref={bottomRef} />
					</div>

					<div className="ai-widget-input-bar">
						<input
							className="ai-widget-input"
							type="text"
							placeholder="Ask your AI coach…"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
							disabled={isLoading}
						/>
						<button
							className="ai-widget-send"
							onClick={sendMessage}
							disabled={isLoading || !input.trim()}
						>
							➤
						</button>
					</div>
				</div>
			)}

			{/* Floating Button */}
			<button className={`ai-widget-btn${open ? ' active' : ''}`} onClick={() => setOpen((v) => !v)}>
				<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
					<path d="M22 6.98V16c0 1.1-.9 2-2 2H6l-4 4V4c0-1.1.9-2 2-2h10.1c-.06.32-.1.66-.1 1 0 2.76 2.24 5 5 5 1.13 0 2.16-.39 3-1.02zM16 3c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z" />
				</svg>
			</button>
		</div>
	);
};

export default AICoachWidget;
