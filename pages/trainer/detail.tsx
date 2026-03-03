import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { allTrainers } from '../../libs/data/trainers';
import { useLike, useFollow } from '../../libs/hooks/useInteractions';
import { allPrograms } from '../../libs/data/programs';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

// ── Hardcoded feedback data (mirrors Feedback entity: feedbackScale, feedbackContent) ──
const feedbacksByTrainer: Record<string, { name: string; initials: string; scale: number; content: string; date: string; plan: string }[]> = {
	STRENGTH: [
		{ name: 'Jordan M.', initials: 'JM', scale: 5, content: 'Completely transformed my squat form. Added 40kg to my max in 3 months.', date: 'Jan 2026', plan: 'PRO' },
		{ name: 'Chris R.', initials: 'CR', scale: 5, content: 'Best programming I\'ve ever followed. Periodization is on point.', date: 'Dec 2025', plan: 'ADVANCED' },
		{ name: 'Sam T.', initials: 'ST', scale: 4, content: 'Very technical and detail-oriented. Communication could be faster.', date: 'Nov 2025', plan: 'REGULAR' },
		{ name: 'Ava K.', initials: 'AK', scale: 5, content: 'First time hitting a 200kg deadlift thanks to this trainer\'s guidance.', date: 'Jan 2026', plan: 'PRO' },
	],
	MASS_GAIN: [
		{ name: 'Mike L.', initials: 'ML', scale: 5, content: 'Gained 8kg of lean mass in 16 weeks. Incredible results.', date: 'Jan 2026', plan: 'PRO' },
		{ name: 'Tom S.', initials: 'TS', scale: 5, content: 'Diet and training perfectly balanced. I finally understand progressive overload.', date: 'Dec 2025', plan: 'ADVANCED' },
		{ name: 'Lily J.', initials: 'LJ', scale: 4, content: 'Really knows the science. A bit intense but gets results.', date: 'Nov 2025', plan: 'REGULAR' },
		{ name: 'Dan W.', initials: 'DW', scale: 5, content: 'My physique goals finally became reality. Highly recommend.', date: 'Feb 2026', plan: 'PRO' },
	],
	CARDIO: [
		{ name: 'Rachel P.', initials: 'RP', scale: 5, content: 'Lost 15kg and can now run a 5K without stopping. Life-changing.', date: 'Jan 2026', plan: 'ADVANCED' },
		{ name: 'Kevin H.', initials: 'KH', scale: 4, content: 'Great energy. Programs are tough but rewarding.', date: 'Dec 2025', plan: 'REGULAR' },
		{ name: 'Nina B.', initials: 'NB', scale: 5, content: 'Fat loss was consistent every week. Science-backed approach.', date: 'Nov 2025', plan: 'PRO' },
		{ name: 'Leo C.', initials: 'LC', scale: 5, content: 'My cardiovascular endurance went from zero to marathon-ready.', date: 'Feb 2026', plan: 'PRO' },
	],
};

const defaultFeedback = [
	{ name: 'Alex W.', initials: 'AW', scale: 5, content: 'Outstanding coaching. Saw real results within the first month.', date: 'Jan 2026', plan: 'PRO' },
	{ name: 'Jamie L.', initials: 'JL', scale: 4, content: 'Very knowledgeable and approachable. Would highly recommend.', date: 'Dec 2025', plan: 'ADVANCED' },
	{ name: 'Morgan K.', initials: 'MK', scale: 5, content: 'The programming is excellent and the support is always there.', date: 'Nov 2025', plan: 'REGULAR' },
	{ name: 'Taylor R.', initials: 'TR', scale: 5, content: 'Best investment I\'ve made in my health. Period.', date: 'Feb 2026', plan: 'PRO' },
];

const planBadgeColor: Record<string, string> = {
	PRO: '#FFB800',
	ADVANCED: '#E92C28',
	REGULAR: '#4CAF50',
	BEGINNER: '#888888',
};

const StarRating = ({ scale }: { scale: number }) => (
	<span className="td-stars">
		{[1, 2, 3, 4, 5].map((s) => (
			<span key={s} className={s <= scale ? 'star filled' : 'star'}>★</span>
		))}
	</span>
);

const TrainerDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { id } = router.query;
	const trainerId = typeof id === 'string' ? id : '';
	const { followed, toggle: toggleFollow } = useFollow(trainerId);
	const { liked: trainerLiked, toggle: toggleLike } = useLike('trainers', trainerId);

	const trainer = allTrainers.find((t) => t.id === id);

	if (!trainer) {
		return (
			<div id="trainer-detail-page">
				<div className="tdp-not-found">
					<span>🏋️</span>
					<h2>Trainer not found</h2>
					<Link href="/trainer"><button>Browse Trainers</button></Link>
				</div>
			</div>
		);
	}

	if (device === 'mobile') {
		return (
			<div id="trainer-detail-page">
				<div className="tdp-not-found"><span>📱</span><p>Mobile view coming soon.</p></div>
			</div>
		);
	}

	// ── Derived data ─────────────────────────────────────────────────────────
	const feedbackKey = trainer.specialty.replace(' ', '_').toUpperCase();
	const feedbacks = feedbacksByTrainer[feedbackKey] ?? feedbacksByTrainer[trainer.specialty as keyof typeof feedbacksByTrainer] ?? defaultFeedback;
	const avgRating = feedbacks.reduce((sum, f) => sum + f.scale, 0) / feedbacks.length;

	// Programs matching this trainer's specialty (memberId will link in backend)
	const trainerPrograms = allPrograms
		.filter((p) => p.type === trainer.specialty || p.type === trainer.secondarySpecialty)
		.slice(0, 3);

	const displayClients  = trainer.clients >= 1000 ? `${(trainer.clients / 1000).toFixed(1)}K` : String(trainer.clients);
	const displayFollowers = Math.floor(trainer.clients * 1.4);
	const displayFollowersStr = displayFollowers >= 1000 ? `${(displayFollowers / 1000).toFixed(1)}K` : String(displayFollowers);

	const ratingDist = [
		{ stars: 5, count: feedbacks.filter((f) => f.scale === 5).length },
		{ stars: 4, count: feedbacks.filter((f) => f.scale === 4).length },
		{ stars: 3, count: feedbacks.filter((f) => f.scale === 3).length },
		{ stars: 2, count: feedbacks.filter((f) => f.scale === 2).length },
		{ stars: 1, count: feedbacks.filter((f) => f.scale === 1).length },
	];

	return (
		<div id="trainer-detail-page">

			{/* ─── HERO ─────────────────────────────────────────────── */}
			<div className="tdp-hero" style={{ background: trainer.gradient }}>
				<div className="tdp-hero-overlay" />
				<div className="tdp-hero-inner">
					<Link href="/trainer" className="tdp-back">← Trainers</Link>
					<div className="tdp-hero-profile">
						<div className="tdp-avatar">{trainer.icon}</div>
						<div className="tdp-hero-info">
							<div className="tdp-level-badge">{trainer.level}</div>
							<h1 className="tdp-name">{trainer.name}</h1>
							<p className="tdp-nick">@{trainer.nickname}</p>
							<div className="tdp-specialty-row">
								<span className="tdp-specialty-tag">{trainer.specialty}</span>
								{trainer.secondarySpecialty && (
									<span className="tdp-specialty-tag secondary">{trainer.secondarySpecialty}</span>
								)}
							</div>
						</div>
					</div>
					<div className="tdp-hero-stats">
						<div className="tdp-hs-item">
							<span className="ths-val">★ {trainer.rating}</span>
							<span className="ths-lbl">Rating</span>
						</div>
						<div className="tdp-hs-sep" />
						<div className="tdp-hs-item">
							<span className="ths-val">{displayClients}</span>
							<span className="ths-lbl">Clients</span>
						</div>
						<div className="tdp-hs-sep" />
						<div className="tdp-hs-item">
							<span className="ths-val">{displayFollowersStr}</span>
							<span className="ths-lbl">Followers</span>
						</div>
						<div className="tdp-hs-sep" />
						<div className="tdp-hs-item">
							<span className="ths-val">{trainer.programs}</span>
							<span className="ths-lbl">Programs</span>
						</div>
						<div className="tdp-hs-sep" />
						<div className="tdp-hs-item">
							<span className="ths-val">{trainer.experience}</span>
							<span className="ths-lbl">Experience</span>
						</div>
					</div>
				</div>
			</div>

			{/* ─── BODY ─────────────────────────────────────────────── */}
			<div className="tdp-body">

				{/* ── LEFT main ─────────────────────────────────────── */}
				<div className="tdp-main">

					{/* About */}
					<section className="tdp-section">
						<h2 className="tdp-section-title">About</h2>
						<p className="tdp-bio">{trainer.bio} With {trainer.experience} in the industry, {trainer.name.split(' ')[0]} has helped {displayClients}+ clients reach their goals through evidence-based programming and personalized coaching. Specializing in {trainer.specialty.toLowerCase()}{trainer.secondarySpecialty ? ` and ${trainer.secondarySpecialty.toLowerCase()}` : ''}, every program is designed for sustainable, long-term results.</p>
					</section>

					{/* Specialties */}
					<section className="tdp-section">
						<h2 className="tdp-section-title">Specialties</h2>
						<div className="tdp-spec-chips">
							<span className="tdp-spec-chip primary">{trainer.specialty}</span>
							{trainer.secondarySpecialty && (
								<span className="tdp-spec-chip">{trainer.secondarySpecialty}</span>
							)}
							<span className="tdp-spec-chip muted">{trainer.level} LEVEL</span>
							<span className="tdp-spec-chip muted">{trainer.experience} EXPERIENCE</span>
						</div>
					</section>

					{/* Certifications */}
					<section className="tdp-section">
						<h2 className="tdp-section-title">Certifications</h2>
						<div className="tdp-cert-list">
							{trainer.certifications.map((cert, i) => (
								<div key={i} className="tdp-cert-row">
									<span className="tdp-cert-icon">✓</span>
									<span className="tdp-cert-text">{cert}</span>
								</div>
							))}
						</div>
					</section>

					{/* Programs */}
					{trainerPrograms.length > 0 && (
						<section className="tdp-section">
							<div className="tdp-section-header">
								<h2 className="tdp-section-title">Programs</h2>
								<Link href={`/programs?type=${encodeURIComponent(trainer.specialty)}`} className="tdp-see-all">See all →</Link>
							</div>
							<div className="tdp-programs-grid">
								{trainerPrograms.map((prog) => (
									<Link href={`/programs/${prog.id}`} key={prog.id} className="tdp-prog-card">
										<div className="tpc-banner" style={{ background: prog.gradient }}>
											<div className="tpc-overlay" />
											<span className="tpc-icon">{prog.type.charAt(0)}</span>
										</div>
										<div className="tpc-body">
											<span className="tpc-type">{prog.type}</span>
											<p className="tpc-name">{prog.name}</p>
											<div className="tpc-meta">
												<span>⏱ {prog.duration}wk</span>
												<span>★ {prog.rating}</span>
												<span className="tpc-price">{prog.price === 0 ? 'FREE' : `$${prog.price}`}</span>
											</div>
										</div>
									</Link>
								))}
							</div>
						</section>
					)}

					{/* Feedback (Feedback entity: feedbackScale + feedbackContent) */}
					<section className="tdp-section">
						<div className="tdp-section-header">
							<h2 className="tdp-section-title">Client Feedback</h2>
							<span className="tdp-avg-rating">★ {avgRating.toFixed(1)} · {feedbacks.length * 60}+ reviews</span>
						</div>

						{/* Rating distribution */}
						<div className="tdp-rbar-block">
							<div className="tdp-rbar-score">
								<span className="tdp-rbar-big">{avgRating.toFixed(1)}</span>
								<StarRating scale={Math.round(avgRating)} />
								<span className="tdp-rbar-total">{feedbacks.length * 60}+ clients rated</span>
							</div>
							<div className="tdp-rbar-bars">
								{ratingDist.map(({ stars, count }) => {
									const pct = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
									return (
										<div key={stars} className="tdp-rbar-row">
											<span className="tdp-rbar-lbl">{stars} ★</span>
											<div className="tdp-rbar-track">
												<div className="tdp-rbar-fill" style={{ width: `${pct}%` }} />
											</div>
											<span className="tdp-rbar-pct">{pct}%</span>
										</div>
									);
								})}
							</div>
						</div>

						{/* Feedback cards (mirrors Feedback entity) */}
						<div className="tdp-feedback-grid">
							{feedbacks.map((fb, i) => (
								<div key={i} className="tdp-fb-card">
									<div className="tdp-fb-head">
										<div className="tdp-fb-avatar">{fb.initials}</div>
										<div className="tdp-fb-meta">
											<span className="tdp-fb-name">{fb.name}</span>
											<span className="tdp-fb-date">{fb.date}</span>
										</div>
										<div className="tdp-fb-right">
											<StarRating scale={fb.scale} />
											<span
												className="tdp-fb-plan"
												style={{ color: planBadgeColor[fb.plan] ?? '#888' }}
											>
												{fb.plan}
											</span>
										</div>
									</div>
									<p className="tdp-fb-text">{fb.content}</p>
								</div>
							))}
						</div>
					</section>
				</div>

				{/* ── RIGHT sticky sidebar ───────────────────────────── */}
				<aside className="tdp-sidebar">
					<div className="tdp-action-card">
						<div className="tdp-ac-price">
							<span className="tdp-ac-from">From</span>
							<span className="tdp-ac-amount">$49<span className="tdp-ac-per">/session</span></span>
						</div>
						<button className="tdp-ac-book">Book a Session →</button>
						<div className="tdp-ac-btn-row">
							<button
								className={`tdp-ac-follow ${followed ? 'following' : ''}`}
								onClick={toggleFollow}
							>
								{followed ? '✓ Following' : '+ Follow'}
							</button>
							<button
								className={`tdp-ac-like ${trainerLiked ? 'liked' : ''}`}
								onClick={(e) => toggleLike(e)}
							>
								{trainerLiked ? '♥' : '♡'}
							</button>
						</div>

						<div className="tdp-ac-divider" />

						{/* memberPlan equivalent */}
						<div className="tdp-ac-rows">
							<div className="tdp-ac-row">
								<span>Specialty</span>
								<span>{trainer.specialty}</span>
							</div>
							<div className="tdp-ac-row">
								<span>Level</span>
								<span>{trainer.level}</span>
							</div>
							<div className="tdp-ac-row">
								<span>Experience</span>
								<span>{trainer.experience}</span>
							</div>
							<div className="tdp-ac-row">
								<span>Clients</span>
								<span>{displayClients}</span>
							</div>
							<div className="tdp-ac-row">
								<span>Programs</span>
								<span>{trainer.programs} active</span>
							</div>
							<div className="tdp-ac-row">
								<span>Rating</span>
								<span>★ {trainer.rating}</span>
							</div>
						</div>

						<div className="tdp-ac-divider" />

						<p className="tdp-ac-label">CERTIFICATIONS</p>
						<div className="tdp-ac-certs">
							{trainer.certifications.map((c, i) => (
								<div key={i} className="tdp-ac-cert">
									<span className="tdp-cert-dot" />
									{c}
								</div>
							))}
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
};

export default withLayoutBasic(TrainerDetail);
