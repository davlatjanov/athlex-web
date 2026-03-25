import React, { SyntheticEvent, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Faq = () => {
	const [category, setCategory] = useState<string>('programs');
	const [expanded, setExpanded] = useState<string | false>('panel1');

	const handleChange = (panel: string) => () => {
		setExpanded((prev) => (prev === panel ? false : panel));
	};

	const data: any = {
		programs: [
			{ id: 'p1', subject: 'How do I find the right training program?', content: 'Use our search and filter tools to browse by fitness level, goal, duration, and coach. You can also take our quick fitness quiz to get personalized recommendations.' },
			{ id: 'p2', subject: 'Can I preview a program before purchasing?', content: 'Yes, each program page includes a full description, sample workouts, coach profile, and user reviews so you know exactly what you are getting.' },
			{ id: 'p3', subject: 'What happens after I join a program?', content: 'You will get immediate access to all program materials including workout videos, schedules, nutrition tips, and direct messaging with your coach.' },
			{ id: 'p4', subject: 'Can I do multiple programs at the same time?', content: 'Yes, you can enroll in multiple programs simultaneously. However, we recommend starting with one to ensure you can commit fully to the schedule.' },
			{ id: 'p5', subject: 'Are programs suitable for beginners?', content: 'Absolutely. We have programs for all levels — from complete beginners to advanced athletes. Each program clearly labels its required fitness level.' },
		],
		trainers: [
			{ id: 't1', subject: 'How do I become a certified trainer on Athlex?', content: 'Apply through the Trainer section with your certification documents. Our team reviews applications within 3–5 business days. Once approved, you can create and sell programs.' },
			{ id: 't2', subject: 'How do I contact my trainer?', content: 'Once enrolled in a program, you can message your trainer directly through the platform. Most trainers respond within 24 hours.' },
			{ id: 't3', subject: 'Can I follow a trainer without joining their program?', content: 'Yes, you can follow any trainer on Athlex to see their updates, new programs, and community posts without purchasing anything.' },
			{ id: 't4', subject: 'What qualifications do Athlex trainers hold?', content: 'All trainers on Athlex are verified and hold recognized certifications (e.g. NASM, ACE, ISSA). We review credentials before approving any trainer account.' },
			{ id: 't5', subject: 'Can trainers offer custom 1-on-1 coaching?', content: 'Yes, many trainers offer personalized coaching sessions in addition to their standard programs. Look for the "1-on-1" badge on their profile.' },
		],
		membership: [
			{ id: 'm1', subject: 'What membership plans does Athlex offer?', content: 'We offer four plans: Beginner (free), Regular, Advanced, and Pro. Higher plans unlock more programs, coaching sessions, and platform features.' },
			{ id: 'm2', subject: 'Can I upgrade or downgrade my plan anytime?', content: 'Yes, you can change your plan at any time from your profile settings. Changes take effect at the start of your next billing cycle.' },
			{ id: 'm3', subject: 'Is there a free trial?', content: 'Yes, all new users get a 7-day free trial of the Advanced plan. No credit card required to start.' },
			{ id: 'm4', subject: 'What happens if I cancel my subscription?', content: 'You keep access until the end of your current billing period. After that, your account reverts to the free Beginner plan and your data is preserved.' },
			{ id: 'm5', subject: 'Do you offer discounts for annual subscriptions?', content: 'Yes, annual plans come with a 20% discount compared to monthly billing. You can switch to annual at any time from account settings.' },
		],
		payment: [
			{ id: 'pay1', subject: 'What payment methods do you accept?', content: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), PayPal, and Apple/Google Pay.' },
			{ id: 'pay2', subject: 'Is my payment information secure?', content: 'Yes. All payments are processed through Stripe with industry-standard TLS encryption. We never store your full card details.' },
			{ id: 'pay3', subject: 'How do I get a refund?', content: 'If you are unsatisfied within 7 days of purchase, contact support for a full refund. After 7 days, refunds are evaluated case by case.' },
			{ id: 'pay4', subject: 'Will I be charged automatically each month?', content: 'Yes, subscriptions auto-renew monthly (or annually if on an annual plan). You can cancel anytime from your account settings.' },
			{ id: 'pay5', subject: 'Can I get an invoice for my payment?', content: 'Yes, invoices are automatically sent to your registered email after each payment. You can also download them from your account billing section.' },
		],
		other: [
			{ id: 'o1', subject: 'How do I delete my account?', content: 'Go to Settings → Account → Delete Account. This action is permanent and removes all your data from our platform.' },
			{ id: 'o2', subject: 'Is Athlex available on mobile?', content: 'Currently Athlex is web-based and optimized for desktop. A mobile app is on our roadmap for later this year.' },
			{ id: 'o3', subject: 'How do I contact Athlex support?', content: 'Use the contact form on this page or email us at support@athlex.com. We respond within 24 hours on business days.' },
			{ id: 'o4', subject: 'Does Athlex share my data with third parties?', content: 'No. We do not sell or share your personal data. See our Privacy Policy for full details on how we handle your information.' },
			{ id: 'o5', subject: 'Are there partnership or sponsorship opportunities?', content: 'Yes! We work with fitness brands and supplement companies. Reach out to partnerships@athlex.com for more information.' },
		],
	};

	return (
		<div className={'faq-content'}>
			<div className={'categories'}>
				{[
					{ key: 'programs', label: 'Programs' },
					{ key: 'trainers', label: 'Trainers' },
					{ key: 'membership', label: 'Membership' },
					{ key: 'payment', label: 'Payment' },
					{ key: 'other', label: 'Other' },
				].map((cat) => (
					<div
						key={cat.key}
						className={category === cat.key ? 'active' : ''}
						onClick={() => setCategory(cat.key)}
					>
						{cat.label}
					</div>
				))}
			</div>
			<div className={'wrap'}>
				{data[category]?.map((ele: any) => (
					<div key={ele.id} className={`faq-accordion${expanded === ele.id ? ' expanded' : ''}`}>
						<div className="question" onClick={handleChange(ele.id)}>
							<h4 className="badge">Q</h4>
							<span>{ele.subject}</span>
							<ChevronDown
								size={18}
								style={{ marginLeft: 'auto', flexShrink: 0, transition: 'transform 0.2s', transform: expanded === ele.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
							/>
						</div>
						{expanded === ele.id && (
							<div className="faq-accordion-details">
								<div className={'answer flex-box'}>
									<h4 className="badge">A</h4>
									<span>{ele.content}</span>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default Faq;
