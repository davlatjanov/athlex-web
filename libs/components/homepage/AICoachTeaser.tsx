import React from 'react';
import Link from 'next/link';

const mockMessages = [
	{ role: 'user', text: 'What is the best program for building muscle?' },
	{
		role: 'ai',
		text: 'For muscle building, I recommend starting with a 3-day full body program focusing on compound lifts — squats, deadlifts, and bench press. Aim for progressive overload each week.',
	},
	{ role: 'user', text: 'How much protein should I eat daily?' },
	{ role: 'ai', text: 'Target 1.6–2.2g of protein per kg of bodyweight. For a 80kg person that is roughly 130–176g per day.' },
];

const AICoachTeaser = () => {
	return (
		<div className={'ai-coach-teaser'}>
			<div className={'container'}>
				<div className={'ai-left'}>
					<span className={'section-label'}>POWERED BY AI</span>
					<h2 className={'section-title'}>MEET YOUR AI COACH</h2>
					<p className={'ai-desc'}>
						Get personalized workout advice, nutrition guidance, and form tips — available 24/7. Our AI coach is trained
						on thousands of fitness programs and scientific research.
					</p>
					<div className={'ai-features'}>
						<div className={'ai-feature'}>
							<span className={'feature-dot'} />
							<span>Personalized program recommendations</span>
						</div>
						<div className={'ai-feature'}>
							<span className={'feature-dot'} />
							<span>Nutrition & supplement guidance</span>
						</div>
						<div className={'ai-feature'}>
							<span className={'feature-dot'} />
							<span>Form correction & injury prevention</span>
						</div>
						<div className={'ai-feature'}>
							<span className={'feature-dot'} />
							<span>Progress analysis & adjustments</span>
						</div>
					</div>
					<Link href={'/ai-coach'}>
						<button className={'btn-primary'}>Try AI Coach Free</button>
					</Link>
				</div>
				<div className={'ai-right'}>
					<div className={'chat-window'}>
						<div className={'chat-header'}>
							<div className={'chat-avatar'}>🤖</div>
							<div className={'chat-info'}>
								<strong>Athlex AI Coach</strong>
								<span className={'online-dot'}>● Online</span>
							</div>
						</div>
						<div className={'chat-messages'}>
							{mockMessages.map((msg, i) => (
								<div key={i} className={`chat-msg ${msg.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
									{msg.role === 'ai' && <span className={'msg-avatar'}>🤖</span>}
									<span className={'msg-text'}>{msg.text}</span>
								</div>
							))}
						</div>
						<div className={'chat-input-bar'}>
							<input type="text" placeholder="Ask your AI coach..." readOnly />
							<button className={'send-btn'}>➤</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AICoachTeaser;
