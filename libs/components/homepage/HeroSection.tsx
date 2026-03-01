import React from 'react';
import { Stack, Box } from '@mui/material';
import Link from 'next/link';

const HeroSection = () => {
	return (
		<Stack className={'container hero-content-wrapper'}>
			<Box component={'div'} className={'hero-inner'}>
				<span className={'hero-eyebrow'}>PREMIUM FITNESS PLATFORM</span>
				<h1 className={'hero-title'}>
					FORGE YOUR
					<br />
					<span className={'hero-accent'}>LIMITS</span>
				</h1>
				<p className={'hero-desc'}>
					Premium training programs, expert coaches, and a community that pushes you further. Start your transformation
					today.
				</p>
				<div className={'hero-cta'}>
					<Link href={'/programs'}>
						<button className={'btn-primary'}>Browse Programs</button>
					</Link>
					<Link href={'/trainer'}>
						<button className={'btn-outline'}>Find a Trainer</button>
					</Link>
				</div>
				<div className={'hero-badges'}>
					<span>✓ No commitment</span>
					<span>✓ Cancel anytime</span>
					<span>✓ 7-day free trial</span>
				</div>
			</Box>
		</Stack>
	);
};

export default HeroSection;
