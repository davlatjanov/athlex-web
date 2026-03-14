import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const gymEvents = [
	{
		title: 'Iron Classic Championship',
		category: 'COMPETITION',
		date: 'MAR 15',
		location: 'Los Angeles, CA',
		desc: 'The biggest natural bodybuilding championship of the year. Open to all Athlex members. Cash prizes and trophies.',
		gradient: 'linear-gradient(160deg, #1a0505 0%, #3d0f0f 80%, #1a0505 100%)',
	},
	{
		title: "Beginner's Boot Camp",
		category: 'WORKSHOP',
		date: 'APR 02',
		location: 'Online — Zoom',
		desc: 'A 3-day intensive workshop for beginners. Learn the fundamentals of training, nutrition, and recovery.',
		gradient: 'linear-gradient(160deg, #05051a 0%, #0f0f3d 80%, #05051a 100%)',
	},
	{
		title: 'CrossFit Open 2025',
		category: 'COMPETITION',
		date: 'APR 20',
		location: 'New York, NY',
		desc: 'Join thousands of athletes worldwide in the annual CrossFit Open. Register through Athlex and track your scores.',
		gradient: 'linear-gradient(160deg, #0a1a05 0%, #1a3d0f 80%, #0a1a05 100%)',
	},
	{
		title: 'Nutrition & Performance Summit',
		category: 'SEMINAR',
		date: 'MAY 10',
		location: 'Chicago, IL',
		desc: 'Industry experts share cutting-edge research on sports nutrition, supplementation, and performance optimization.',
		gradient: 'linear-gradient(160deg, #1a0a05 0%, #3d200f 80%, #1a0a05 100%)',
	},
];

const Events = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'gym-events'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span className={'section-label'}>UPCOMING</span>
						<h2>Events</h2>
					</Stack>
					<Stack className={'event-cards'}>
						{gymEvents.map((event) => (
							<div key={event.title} className={'event-card'} style={{ background: event.gradient }}>
								<div className={'event-top'}>
									<span className={'event-category'}>{event.category}</span>
									<span className={'event-date'}>{event.date}</span>
								</div>
								<strong className={'event-title'}>{event.title}</strong>
								<span className={'event-location'}>📍 {event.location}</span>
							</div>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'gym-events'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span className={'section-label'}>UPCOMING EVENTS</span>
						<h2 className={'white'}>Events & Competitions</h2>
						<p className={'white'}>Don&apos;t miss what&apos;s coming next</p>
					</Box>
				</Stack>
				<Stack className={'event-cards'}>
					{gymEvents.map((event) => (
						<div key={event.title} className={'event-card'} style={{ background: event.gradient }}>
							<div className={'event-top'}>
								<span className={'event-category'}>{event.category}</span>
								<span className={'event-date'}>{event.date}</span>
							</div>
							<strong className={'event-title'}>{event.title}</strong>
							<span className={'event-location'}>📍 {event.location}</span>
							<p className={'event-desc'}>{event.desc}</p>
							<button className={'btn-event'}>Learn More</button>
						</div>
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Events;
