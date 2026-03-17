import React from 'react';
import { Stack, Box } from '@mui/material';
import Link from 'next/link';

const categories = [
	{ label: 'Mass Gain',      type: 'MASS GAIN',      count: '48 Programs', image: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=600&fit=crop&auto=format&q=80' },
	{ label: 'Weight Loss',    type: 'WEIGHT LOSS',    count: '62 Programs', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&fit=crop&auto=format&q=80' },
	{ label: 'Strength',       type: 'STRENGTH',       count: '35 Programs', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&fit=crop&auto=format&q=80' },
	{ label: 'Cardio',         type: 'CARDIO',         count: '54 Programs', image: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=600&fit=crop&auto=format&q=80' },
	{ label: 'Yoga',           type: 'YOGA',           count: '29 Programs', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&fit=crop&auto=format&q=80' },
	{ label: 'Functional',     type: 'FUNCTIONAL',     count: '41 Programs', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&fit=crop&auto=format&q=80' },
	{ label: 'Rehabilitation', type: 'REHABILITATION', count: '18 Programs', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&fit=crop&auto=format&q=80' },
	{ label: 'Mobility',       type: 'MOBILITY',       count: '23 Programs', image: 'https://i.pinimg.com/1200x/a6/1b/46/a61b4601f22cf2c9816fcd0bc5dcf30b.jpg' },
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
								<img src={cat.image} alt={cat.label} className={'cat-bg-img'} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
								<div className={'cat-overlay'} />
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
