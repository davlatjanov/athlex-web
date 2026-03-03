import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import ProgramCard from '../../libs/components/homepage/ProgramCard';
import {
	allPrograms,
	typeIcons,
	typeTrainers,
	typeMuscles,
	typeEquipment,
	typeWeeklySchedule,
	levelRequirements,
	getReviews,
} from '../../libs/data/programs';

export const getServerSideProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const StarRating = ({ rating }: { rating: number }) => (
	<span className="star-rating">
		{[1, 2, 3, 4, 5].map((s) => (
			<span key={s} className={s <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
		))}
	</span>
);

const ProgramDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { id } = router.query;

	const program = allPrograms.find((p) => p.id === id);

	if (!program) {
		return (
			<div id="program-detail-page">
				<div className="pdp-not-found">
					<span>🏋️</span>
					<h2>Program not found</h2>
					<Link href="/programs"><button>Browse All Programs</button></Link>
				</div>
			</div>
		);
	}

	if (device === 'mobile') {
		return (
			<div id="program-detail-page">
				<div className="pdp-not-found">
					<span>📱</span><p>Mobile view coming soon.</p>
				</div>
			</div>
		);
	}

	const icon           = typeIcons[program.type] ?? '🏅';
	const trainer        = typeTrainers[program.type];
	const muscles        = typeMuscles[program.type] ?? [];
	const equipment      = typeEquipment[program.type] ?? [];
	const weekSchedule   = typeWeeklySchedule[program.type] ?? typeWeeklySchedule['STRENGTH'];
	const requirements   = levelRequirements[program.level] ?? [];
	const reviews        = getReviews(program.type);
	const displayPrice   = program.price === 0 ? 'FREE' : `$${program.price}`;
	const displayMembers = program.members >= 1000 ? `${(program.members / 1000).toFixed(1)}K` : String(program.members);
	const related        = allPrograms.filter((p) => p.type === program.type && p.id !== program.id).slice(0, 3);
	const weeks          = Array.from({ length: program.duration }, (_, i) => i + 1);
	const phaseLabels    = ['Foundation', 'Foundation', 'Development', 'Development', 'Amplification', 'Amplification', 'Peak', 'Peak', 'Advanced', 'Advanced', 'Power Peak', 'Power Peak', 'Elite', 'Elite', 'Final Push', 'Final Push', 'Deload', 'Deload', 'Mastery', 'Mastery'];
	const ratingDist     = [{ stars: 5, pct: 65 }, { stars: 4, pct: 22 }, { stars: 3, pct: 8 }, { stars: 2, pct: 3 }, { stars: 1, pct: 2 }];
	const workoutDays    = weekSchedule.filter((d) => !d.isRest).length;

	return (
		<div id="program-detail-page">

			{/* ─── HERO ─────────────────────────────────────────────── */}
			<div className="pdp-hero" style={{ background: program.gradient }}>
				{program.image && (
					<img
						src={program.image}
						alt={program.name}
						className="pdp-hero-bg-img"
						onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
					/>
				)}
				<div className="pdp-hero-overlay" />
				<div className="pdp-hero-inner">
					<Link href="/programs" className="pdp-back">← Programs</Link>
					<div className="pdp-badges">
						<span className="badge-type">{program.type}</span>
						<span className="badge-level">{program.level}</span>
					</div>
					<div className="pdp-hero-icon">{icon}</div>
					<h1 className="pdp-hero-title">{program.name}</h1>
					<div className="pdp-hero-meta">
						<span className="phm-item">★ {program.rating}</span>
						<span className="phm-dot" />
						<span className="phm-item">{displayMembers} enrolled</span>
						<span className="phm-dot" />
						<span className="phm-item">{program.duration} weeks</span>
						<span className="phm-dot" />
						<span className="phm-item">{workoutDays}x / week</span>
					</div>
				</div>
			</div>

			{/* ─── BODY — 2-column ──────────────────────────────────── */}
			<div className="pdp-body">

				{/* ── LEFT: main scrollable content ─────────────────── */}
				<div className="pdp-main">

					{/* Stat pills */}
					<div className="stat-pills">
						{[
							{ icon: '🗓', val: program.duration, lbl: 'WEEKS' },
							{ icon: '💪', val: program.duration * 3, lbl: 'SESSIONS' },
							{ icon: '👥', val: displayMembers, lbl: 'ENROLLED' },
							{ icon: '⭐', val: program.rating, lbl: 'RATING' },
						].map(({ icon: i, val, lbl }) => (
							<div key={lbl} className="stat-pill">
								<span className="sp-icon">{i}</span>
								<span className="sp-val">{val}</span>
								<span className="sp-lbl">{lbl}</span>
							</div>
						))}
					</div>

					{/* Muscles */}
					<section className="pdp-section">
						<h2 className="pdp-section-title">Muscles Targeted</h2>
						<div className="muscle-chips">
							{muscles.map((m) => (
								<span key={m} className="muscle-chip">{m}</span>
							))}
						</div>
					</section>

					{/* Requirements */}
					<section className="pdp-section">
						<h2 className="pdp-section-title">Requirements</h2>
						<div className="req-list">
							{requirements.map((r, i) => (
								<div key={i} className="req-item">
									<span className="req-dot" />{r}
								</div>
							))}
						</div>
					</section>

					{/* Weekly schedule */}
					<section className="pdp-section">
						<h2 className="pdp-section-title">Weekly Schedule</h2>
						<div className="week-grid">
							{weekSchedule.map((day) => (
								<div key={day.day} className={`week-day ${day.isRest ? 'is-rest' : 'is-workout'}`}>
									<div className="wd-name">{day.day}</div>
									<div className="wd-icon">{day.isRest ? '😴' : icon}</div>
									<div className="wd-label">{day.label}</div>
									{!day.isRest && <div className="wd-muscles">{day.muscles}</div>}
								</div>
							))}
						</div>
						<p className="week-note">Pattern repeats {program.duration} weeks · intensity increases each phase</p>
					</section>

					{/* Program phases */}
					<section className="pdp-section">
						<h2 className="pdp-section-title">Program Phases</h2>
						<div className="phases-list">
							{weeks.map((w) => (
								<div key={w} className="phase-row">
									<span className="pr-week">WK {w}</span>
									<div className="pr-bar-wrap">
										<div className="pr-bar-fill" style={{ width: `${Math.min(100, 20 + w * 4)}%` }} />
									</div>
									<span className="pr-name">{phaseLabels[w - 1] ?? 'Advanced'}</span>
									<span className="pr-sess">{workoutDays}x/wk</span>
								</div>
							))}
						</div>
					</section>

					{/* Reviews */}
					<section className="pdp-section">
						<div className="reviews-head">
							<h2 className="pdp-section-title">Reviews</h2>
							<span className="reviews-count">★ {program.rating} · {reviews.length * 80}+ reviews</span>
						</div>
						<div className="rbar-list">
							{ratingDist.map(({ stars, pct }) => (
								<div key={stars} className="rbar-row">
									<span className="rbar-stars">{stars} ★</span>
									<div className="rbar-track">
										<div className="rbar-fill" style={{ width: `${pct}%` }} />
									</div>
									<span className="rbar-pct">{pct}%</span>
								</div>
							))}
						</div>
						<div className="review-cards">
							{reviews.slice(0, 4).map((review, i) => (
								<div key={i} className="review-card">
									<div className="rc-head">
										<div className="rc-avatar">{review.initials}</div>
										<div className="rc-meta">
											<span className="rc-name">{review.name}</span>
											<span className="rc-date">{review.date}</span>
										</div>
										<StarRating rating={review.rating} />
									</div>
									<p className="rc-text">{review.text}</p>
								</div>
							))}
						</div>
					</section>
				</div>

				{/* ── RIGHT: sticky enrollment sidebar ──────────────── */}
				<aside className="pdp-sidebar">
					<div className="enroll-card">
						<div className="ec-price">{displayPrice}</div>
						<button className="ec-enroll-btn">Enroll Now →</button>

						<div className="ec-details">
							{[
								{ label: 'Duration', value: `${program.duration} weeks` },
								{ label: 'Sessions', value: `${program.duration * 3} total` },
								{ label: 'Level', value: program.level },
								{ label: 'Members', value: displayMembers },
								{ label: 'Rating', value: `★ ${program.rating}` },
							].map(({ label, value }) => (
								<div key={label} className="ec-row">
									<span className="ec-row-label">{label}</span>
									<span className="ec-row-value">{value}</span>
								</div>
							))}
						</div>

						<div className="ec-divider" />

						<p className="ec-section-label">EQUIPMENT</p>
						<div className="ec-equip">
							{equipment.map((e) => (
								<span key={e} className="equip-tag">{e}</span>
							))}
						</div>

						{trainer && (
							<>
								<div className="ec-divider" />
								<p className="ec-section-label">TRAINER</p>
								<div className="ec-trainer">
									<div className="et-avatar">{icon}</div>
									<div className="et-info">
										<div className="et-name">{trainer.name}</div>
										<div className="et-spec">{trainer.specialty}</div>
										<div className="et-stats">
											<span>{trainer.experience}</span>
											<span className="et-sep" />
											<span>★ {trainer.rating}</span>
										</div>
									</div>
								</div>
								<Link href="/trainer">
									<button className="ec-trainer-btn">View Trainer Profile →</button>
								</Link>
							</>
						)}
					</div>
				</aside>
			</div>

			{/* ─── RELATED ──────────────────────────────────────────── */}
			{related.length > 0 && (
				<div className="pdp-related">
					<div className="pdp-related-inner">
						<h2 className="pdp-related-title">More {program.type} Programs</h2>
						<div className="pdp-related-grid">
							{related.map((p) => <ProgramCard key={p.id} {...p} />)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default withLayoutFull(ProgramDetail);
