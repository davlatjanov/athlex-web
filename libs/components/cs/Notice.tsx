import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const Notice = () => {
	const device = useDeviceDetect();

	const data = [
		{
			no: 1,
			event: true,
			title: 'Summer Challenge 2024 — Join now and win exclusive Athlex gear!',
			date: '01.06.2024',
		},
		{
			no: 2,
			event: true,
			title: 'New Trainers Onboarded — 20+ certified coaches just joined the platform',
			date: '15.05.2024',
		},
		{
			no: 3,
			title: 'Platform Update v2.1 — Improved program discovery and search filters',
			date: '10.05.2024',
		},
		{
			no: 4,
			title: 'Pro Plan launch — Unlock unlimited programs and 1-on-1 coaching sessions',
			date: '01.05.2024',
		},
		{
			no: 5,
			title: 'Community feature released — Share posts, follow athletes, and get inspired',
			date: '20.04.2024',
		},
		{
			no: 6,
			title: 'Scheduled maintenance on May 3rd, 02:00–04:00 UTC',
			date: '28.04.2024',
		},
	];

	if (device === 'mobile') {
		return <div>NOTICE MOBILE</div>;
	} else {
		return (
			<Stack className={'notice-content'}>
				<span className={'title'}>Announcements</span>
				<Stack className={'main'}>
					<Box component={'div'} className={'top'}>
						<span>No.</span>
						<span>Title</span>
						<span>Date</span>
					</Box>
					<Stack className={'bottom'}>
						{data.map((ele: any) => (
							<div className={`notice-card ${ele?.event ? 'event' : ''}`} key={ele.no}>
								{ele?.event ? <div>EVENT</div> : <span className={'notice-number'}>{ele.no}</span>}
								<span className={'notice-title'}>{ele.title}</span>
								<span className={'notice-date'}>{ele.date}</span>
							</div>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Notice;
