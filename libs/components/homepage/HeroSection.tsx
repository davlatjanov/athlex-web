import React from 'react';
import Link from 'next/link';

const HeroSection = () => {
	return (
		<div className={'hero-root'}>
			<img
				src="https://i.pinimg.com/736x/b4/af/45/b4af45aa415fad2f0399bc69477a06a2.jpg"
				alt=""
				className={'hero-bg-img'}
			/>
			<div className={'hero-bg-overlay'} />
			<div className={'container hero-content-wrapper'}>
				<div className={'hero-inner'}>
					<span className={'hero-eyebrow'}>PREMIUM FITNESS PLATFORM</span>
					<h1 className={'hero-title'}>
						FORGE YOUR
						<br />
						<span className={'hero-accent'}>LIMITS</span>
					</h1>
					<p className={'hero-desc'}>
						Premium training programs, expert coaches, and a community that pushes you further. Start your
						transformation today.
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
				</div>
				<div className={'hero-stats-row'}>
					<div className={'hero-stat-item'}>
						<span className={'hsi-val'}>10K+</span>
						<span className={'hsi-lbl'}>Active Members</span>
					</div>
					<div className={'hero-stat-divider'} />
					<div className={'hero-stat-item'}>
						<span className={'hsi-val'}>500+</span>
						<span className={'hsi-lbl'}>Programs</span>
					</div>
					<div className={'hero-stat-divider'} />
					<div className={'hero-stat-item'}>
						<span className={'hsi-val'}>4.9★</span>
						<span className={'hsi-lbl'}>Avg Rating</span>
					</div>
					<div className={'hero-stat-divider'} />
					<div className={'hero-stat-item'}>
						<span className={'hsi-val'}>200+</span>
						<span className={'hsi-lbl'}>Expert Coaches</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HeroSection;
