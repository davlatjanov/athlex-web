import React from 'react';

const Notice = () => {
	const data = [
		{
			no: 1,
			event: true,
			title: 'Spring Shred Challenge 2026 — 8-week transformation. Top 3 win premium memberships + Athlex gear.',
			date: '10.03.2026',
		},
		{
			no: 2,
			event: true,
			title: '1-on-1 Coaching Launch — Book a private session with a certified trainer directly on Athlex.',
			date: '01.03.2026',
		},
		{
			no: 3,
			title: 'Platform Update v3.0 — AI Coach, order system, and notifications are now live.',
			date: '17.03.2026',
		},
		{
			no: 4,
			title: 'New Trainer Verification Process — All trainers are now required to submit credentials for review.',
			date: '05.03.2026',
		},
		{
			no: 5,
			title: 'Shop is open — Browse supplements, equipment, and apparel from verified fitness brands.',
			date: '20.02.2026',
		},
		{
			no: 6,
			title: 'Progress Posts are live — Share your fitness journey, follow athletes, and get inspired.',
			date: '14.02.2026',
		},
		{
			no: 7,
			title: 'Membership Plans updated — Beginner, Regular, Advanced, and Pro tiers now available.',
			date: '01.02.2026',
		},
		{
			no: 8,
			title: 'Scheduled maintenance on March 20th, 02:00–04:00 UTC. Some features may be unavailable.',
			date: '18.03.2026',
		},
		{
			no: 9,
			title: 'Privacy Policy updated — Review the changes to how we handle your personal data.',
			date: '28.01.2026',
		},
		{
			no: 10,
			title: 'Athlex mobile app — Coming later in 2026. Sign up for early access notifications.',
			date: '15.01.2026',
		},
	];

	return (
		<div className={'notice-content'}>
			<span className={'title'}>Announcements</span>
			<div className={'main'}>
				<div className={'top'}>
					<span>No.</span>
					<span>Title</span>
					<span>Date</span>
				</div>
				<div className={'bottom'}>
					{data.map((ele: any) => (
						<div className={`notice-card ${ele?.event ? 'event' : ''}`} key={ele.no}>
							{ele?.event ? <div>EVENT</div> : <span className={'notice-number'}>{ele.no}</span>}
							<span className={'notice-title'}>{ele.title}</span>
							<span className={'notice-date'}>{ele.date}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Notice;
