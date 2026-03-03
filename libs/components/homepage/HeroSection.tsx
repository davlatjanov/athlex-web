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
			<Box component={'div'} className={'hero-visual'}>
				<div className={'hero-img-frame'}>
					<img
						src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&fit=crop&auto=format&q=85"
						alt="Athlete training"
						className={'hero-athlete-img'}
					/>
					<div className={'hero-img-overlay'} />
				</div>
				<div className={'hero-floating-stat hero-stat-1'}>
					<span className={'hfs-val'}>4.9★</span>
					<span className={'hfs-lbl'}>Avg Rating</span>
				</div>
				<div className={'hero-floating-stat hero-stat-2'}>
					<span className={'hfs-val'}>10K+</span>
					<span className={'hfs-lbl'}>Active Members</span>
				</div>
				<div className={'hero-floating-stat hero-stat-3'}>
					<span className={'hfs-val'}>500+</span>
					<span className={'hfs-lbl'}>Programs</span>
				</div>
			</Box>
		</Stack>
	);
};

export default HeroSection;
