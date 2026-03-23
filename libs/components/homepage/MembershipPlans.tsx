import React from 'react';
import { Stack, Box } from '@mui/material';
import Link from 'next/link';

const plans = [
	{
		name: 'BEGINNER',
		price: 0,
		period: 'Free forever',
		highlight: false,
		features: [
			'5 free programs',
			'Community access',
			'Progress tracking',
			'Mobile app access',
			'Basic AI coach (5/day)',
		],
		cta: 'Get Started Free',
		href: '/account/join',
	},
	{
		name: 'REGULAR',
		price: 19,
		period: 'per month',
		highlight: false,
		features: [
			'20 programs/month',
			'Community access',
			'Progress tracking',
			'AI coach (50/day)',
			'Video tutorials',
			'Email support',
		],
		cta: 'Start Regular',
		href: '/account/join',
	},
	{
		name: 'ADVANCED',
		price: 39,
		period: 'per month',
		highlight: false,
		badge: 'MOST POPULAR',
		features: [
			'Unlimited programs',
			'1 trainer session/month',
			'Detailed analytics',
			'AI coach (unlimited)',
			'Nutrition guidance',
			'Priority support',
		],
		cta: 'Go Advanced',
		href: '/account/join',
	},
	{
		name: 'PRO',
		price: 79,
		period: 'per month',
		highlight: false,
		features: [
			'Everything in Advanced',
			'4 trainer sessions/month',
			'Custom nutrition plan',
			'1:1 coaching calls',
			'Body composition analysis',
			'24/7 coach availability',
		],
		cta: 'Go Pro',
		href: '/account/join',
	},
];

const MembershipPlans = () => {
	return (
		<Stack className={'membership-plans'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'section-header'}>
					<span className={'section-label'}>PRICING</span>
					<h2 className={'section-title'}>CHOOSE YOUR PLAN</h2>
					<p className={'section-desc'}>Start free, upgrade when you are ready. No hidden fees.</p>
				</Box>
				<Box component={'div'} className={'plans-grid'}>
					{plans.map((plan) => (
						<Box key={plan.name} className={'plan-card'}>
							{plan.badge && <span className={'plan-badge'}>{plan.badge}</span>}
							<div className={'plan-header'}>
								<strong className={'plan-name'}>{plan.name}</strong>
								<div className={'plan-price'}>
									<span className={'price-currency'}>$</span>
									<span className={'price-value'}>{plan.price}</span>
								</div>
								<span className={'price-period'}>{plan.period}</span>
							</div>
							<ul className={'plan-features'}>
								{plan.features.map((feature, i) => (
									<li key={i}>
										<span className={'check'}>✓</span>
										{feature}
									</li>
								))}
							</ul>
							<Link href={plan.href}>
								<button className={'btn-outline'}>{plan.cta}</button>
							</Link>
						</Box>
					))}
				</Box>
			</Stack>
		</Stack>
	);
};

export default MembershipPlans;
