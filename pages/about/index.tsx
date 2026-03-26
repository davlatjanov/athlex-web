import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Link from 'next/link';

const About: NextPage = () => {
	return (
		<div className={'about-page'}>
				<Head><title>Athlex | About</title></Head>

				{/* ── Welcome / Intro ── */}
				<section className={'ab-intro'}>
					<div className={'container ab-intro-inner'}>
						<div className={'ab-intro-left'}>
							<span className={'ab-eyebrow'}>ABOUT ATHLEX</span>
							<h2 className={'ab-heading'}>Welcome to Athlex</h2>
							<div className={'ab-accent-bar'} />
							<p className={'ab-intro-lead'}>
								We believe every athlete deserves world-class training, expert guidance, and a community that drives
								them forward — regardless of where they start.
							</p>
							<p className={'ab-intro-body'}>
								Athlex is a premium fitness platform that connects athletes with certified coaches, elite training
								programs, and a global community built around performance. Whether you're just starting out or
								competing at the highest level, we have the tools to get you there.
							</p>
							<Link href={'/programs'}>
								<button className={'ab-cta-btn'}>Explore Programs</button>
							</Link>
						</div>
						<div className={'ab-intro-right'}>
							<div className={'ab-img-main'}>
								<img
									src="https://images.pexels.com/photos/6456128/pexels-photo-6456128.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&dpr=1"
									alt="Athlete training"
								/>
							</div>
							<div className={'ab-img-thumbs'}>
								<img
									src="https://images.pexels.com/photos/6388382/pexels-photo-6388382.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1"
									alt="Programs"
								/>
								<img
									src="https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1"
									alt="Gear"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* ── Stats Bar ── */}
				<section className={'ab-stats'}>
					<div className={'container ab-stats-inner'}>
						<div className={'ab-stat'}>
							<strong>10K+</strong>
							<span>Active Members</span>
						</div>
						<div className={'ab-stat-divider'} />
						<div className={'ab-stat'}>
							<strong>500+</strong>
							<span>Training Programs</span>
						</div>
						<div className={'ab-stat-divider'} />
						<div className={'ab-stat'}>
							<strong>200+</strong>
							<span>Expert Coaches</span>
						</div>
						<div className={'ab-stat-divider'} />
						<div className={'ab-stat'}>
							<strong>4.9★</strong>
							<span>Avg. Rating</span>
						</div>
					</div>
				</section>

				{/* ── Offers / What We Do ── */}
				<section className={'ab-offers'}>
					<div className={'container ab-offers-inner'}>
						<div className={'ab-offers-img'}>
							<img
								src="https://images.pexels.com/photos/6296002/pexels-photo-6296002.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&dpr=1"
								alt="Training"
							/>
						</div>
						<div className={'ab-offers-content'}>
							<span className={'ab-eyebrow'}>WHAT WE OFFER</span>
							<h2 className={'ab-heading'}>Everything You Need to Perform</h2>
							<div className={'ab-accent-bar'} />
							<div className={'ab-offer-list'}>
								<div className={'ab-offer-item'}>
									<div className={'ab-offer-icon'}>🏋️</div>
									<div className={'ab-offer-text'}>
										<strong>Elite Training Programs</strong>
										<p>Structured plans built by certified coaches for every fitness level — beginner to pro.</p>
									</div>
								</div>
								<div className={'ab-offer-item'}>
									<div className={'ab-offer-icon'}>👤</div>
									<div className={'ab-offer-text'}>
										<strong>Expert Coaching</strong>
										<p>Connect directly with certified trainers who personalize your journey and track your progress.</p>
									</div>
								</div>
								<div className={'ab-offer-item'}>
									<div className={'ab-offer-icon'}>🤝</div>
									<div className={'ab-offer-text'}>
										<strong>Athlete Community</strong>
										<p>Train alongside thousands of athletes worldwide. Share progress, compete, and inspire others.</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* ── CTA ── */}
				<section className={'ab-cta'}>
					<img
						src="https://images.pexels.com/photos/5327555/pexels-photo-5327555.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&dpr=1"
						alt=""
						className={'ab-cta-bg'}
					/>
					<div className={'ab-cta-overlay'} />
					<div className={'container ab-cta-content'}>
						<span className={'ab-eyebrow'}>GET STARTED TODAY</span>
						<h2 className={'ab-cta-title'}>Ready to Forge Your Limits?</h2>
						<p className={'ab-cta-desc'}>Join 10,000+ athletes already training on Athlex.</p>
						<div className={'ab-cta-actions'}>
							<Link href={'/account/join'}>
								<button className={'ab-cta-btn'}>Start Free Trial</button>
							</Link>
							<Link href={'/trainer'}>
								<button className={'ab-cta-btn-outline'}>Find a Trainer</button>
							</Link>
						</div>
					</div>
				</section>

			</div>
	);
};

export default withLayoutBasic(About);
