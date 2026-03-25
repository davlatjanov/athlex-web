import React from 'react';

const stats = [
	{ value: '500+', label: 'Training Programs' },
	{ value: '200+', label: 'Expert Trainers' },
	{ value: '10K+', label: 'Active Members' },
	{ value: '4.9★', label: 'Average Rating' },
];

const StatsBanner = () => {
	return (
		<div className={'stats-banner'}>
			<div className={'container'}>
				{stats.map((stat, index) => (
					<div key={index} className={'stat-item'}>
						<strong>{stat.value}</strong>
						<span>{stat.label}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default StatsBanner;
