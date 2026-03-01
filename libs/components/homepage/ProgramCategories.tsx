import React from 'react';
import { Stack, Box } from '@mui/material';
import Link from 'next/link';

const categories = [
	{ icon: '💪', label: 'Mass Gain', type: 'MASS_GAIN', count: '48 Programs' },
	{ icon: '🔥', label: 'Weight Loss', type: 'WEIGHT_LOSS', count: '62 Programs' },
	{ icon: '🏋️', label: 'Strength', type: 'STRENGTH', count: '35 Programs' },
	{ icon: '🏃', label: 'Cardio', type: 'CARDIO', count: '54 Programs' },
	{ icon: '🧘', label: 'Yoga', type: 'YOGA', count: '29 Programs' },
	{ icon: '⚡', label: 'Functional', type: 'FUNCTIONAL', count: '41 Programs' },
	{ icon: '🩺', label: 'Rehabilitation', type: 'REHABILITATION', count: '18 Programs' },
	{ icon: '🤸', label: 'Mobility', type: 'MOBILITY', count: '23 Programs' },
];

const ProgramCategories = () => {
	return (
		<Stack className={'program-categories'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'section-header'}>
					<span className={'section-label'}>EXPLORE BY TYPE</span>
					<h2 className={'section-title'}>FIND YOUR PROGRAM</h2>
				</Box>
				<Box component={'div'} className={'categories-grid'}>
					{categories.map((cat) => (
						<Link href={`/programs?type=${cat.type}`} key={cat.type}>
							<Box component={'div'} className={'category-card'}>
								<span className={'cat-icon'}>{cat.icon}</span>
								<strong className={'cat-name'}>{cat.label}</strong>
								<span className={'cat-count'}>{cat.count}</span>
							</Box>
						</Link>
					))}
				</Box>
			</Stack>
		</Stack>
	);
};

export default ProgramCategories;
