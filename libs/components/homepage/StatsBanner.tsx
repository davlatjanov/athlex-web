import React from 'react';
import { Stack, Box } from '@mui/material';

const stats = [
	{ value: '500+', label: 'Training Programs' },
	{ value: '200+', label: 'Expert Trainers' },
	{ value: '10K+', label: 'Active Members' },
	{ value: '4.9★', label: 'Average Rating' },
];

const StatsBanner = () => {
	return (
		<Stack className={'stats-banner'}>
			<Stack className={'container'}>
				{stats.map((stat, index) => (
					<Box key={index} className={'stat-item'}>
						<strong>{stat.value}</strong>
						<span>{stat.label}</span>
					</Box>
				))}
			</Stack>
		</Stack>
	);
};

export default StatsBanner;
