import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CircularProgress } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_MEMBER, GET_PROGRAMS, GET_FEEDBACKS } from '../../apollo/user/query';
import { FOLLOW_MEMBER, LIKE_TARGET_ITEM, CREATE_FEEDBACK } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Message } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Feedback, FeedbackGroup } from '../../libs/types/feedback/feedback';
import { Program } from '../../libs/types/program/program';
import moment from 'moment';

export const getServerSideProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const planBadgeColor: Record<string, string> = {
	PRO: '#FFB800', ADVANCED: '#E92C28', REGULAR: '#4CAF50', BEGINNER: '#888888',
};

const typeGradients: Record<string, string> = {
	MASS_GAIN: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
	WEIGHT_LOSS: 'linear-gradient(135deg, #0f3460 0%, #e94560 100%)',
	STRENGTH: 'linear-gradient(135deg, #1a1a2e 0%, #e92c28 100%)',
	CARDIO: 'linear-gradient(135deg, #0f3460 0%, #533483 100%)',
	YOGA: 'linear-gradient(135deg, #1b4332 0%, #40916c 100%)',
	FUNCTIONAL: 'linear-gradient(135deg, #212529 0%, #495057 100%)',
	REHABILITATION: 'linear-gradient(135deg, #003566 0%, #0077b6 100%)',
	MOBILITY: 'linear-gradient(135deg, #370617 0%, #e85d04 100%)',
	BEGINNERS: 'linear-gradient(135deg, #1b263b 0%, #415a77 100%)',
	ADVANCED: 'linear-gradient(135deg, #10002b 0%, #5a189a 100%)',
};

const StarRating = ({ scale }: { scale: number }) => (
	<span className="td-stars">
		{[1, 2, 3, 4, 5].map((s) => (
			<span key={s} className={s <= scale ? 'star filled' : 'star'}>★</span>
		))}
	</span>
);

const InteractiveStars = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
	<span style={{ fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>
		{[1, 2, 3, 4, 5].map((s) => (
			<span
				key={s}
				onClick={() => onChange(s)}
				style={{ color: s <= value ? '#FFB800' : '#333', marginRight: 4 }}
			>★</span>
		))}
	</span>
);

const TrainerDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { id } = router.query;
	const trainerId = typeof id === 'string' ? id : '';

	const [followed, setFollowed] = useState(false);
	const [feedbackContent, setFeedbackContent] = useState('');
	const [feedbackScale, setFeedbackScale] = useState(5);
	const [trainerPrograms, setTrainerPrograms] = useState<Program[]>([]);
	const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

	const [followMember] = useMutation(FOLLOW_MEMBER);
	const [likeTargetItem] = useMutation(LIKE_TARGET_ITEM);
	const [createFeedback] = useMutation(CREATE_FEEDBACK);

	const { data: memberData, loading: memberLoading } = useQuery(GET_MEMBER, {
		variables: { memberId: trainerId },
		skip: !trainerId,
		fetchPolicy: 'network-only',
	});

	const trainer = memberData?.getMember;

	useQuery(GET_PROGRAMS, {
		variables: {
			input: { page: 1, limit: 3, sort: 'createdAt', direction: 'DESC', search: { memberId: trainerId, programStatus: 'ACTIVE' } },
		},
		skip: !trainerId,
		fetchPolicy: 'cache-and-network',
		onCompleted: (data: T) => setTrainerPrograms(data?.getPrograms?.list ?? []),
	});

	useQuery(GET_FEEDBACKS, {
		variables: { input: { page: 1, limit: 20, search: { feedbackRefId: trainerId, feedbackGroup: FeedbackGroup.TRAINER } } },
		skip: !trainerId,
		fetchPolicy: 'cache-and-network',
		onCompleted: (data: T) => setFeedbacks(data?.getFeedbacks?.list ?? []),
	});

	const handleFollow = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await followMember({ variables: { input: { followingId: trainerId } } });
			setFollowed(!followed);
			await sweetTopSmallSuccessAlert(followed ? 'Unfollowed' : 'Following!', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handleLike = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetItem({ variables: { input: { likeGroup: LikeGroup.MEMBER, likeRefId: trainerId } } });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handleFeedbackSubmit = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!feedbackContent.trim()) return;
			await createFeedback({
				variables: {
					input: {
						feedbackRefId: trainerId,
						feedbackGroup: FeedbackGroup.TRAINER,
						feedbackScale,
						feedbackContent,
					},
				},
			});
			setFeedbackContent('');
			setFeedbackScale(5);
			await sweetTopSmallSuccessAlert('Feedback submitted!', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (memberLoading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
				<CircularProgress size="4rem" />
			</div>
		);
	}

	if (!trainer && !memberLoading) {
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

	const avgRating = feedbacks.length > 0
		? feedbacks.reduce((sum, f) => sum + f.feedbackScale, 0) / feedbacks.length
		: 0;
	const ratingDist = [5, 4, 3, 2, 1].map((s) => ({
		stars: s,
		count: feedbacks.filter((f) => f.feedbackScale === s).length,
	}));
	const displayFollowers = trainer.memberFollowers >= 1000
		? `${(trainer.memberFollowers / 1000).toFixed(1)}K` : String(trainer.memberFollowers);

	return (
		<div id="trainer-detail-page">

			{/* ─── HERO ─────────────────────────────────────────────── */}
			<div className="tdp-hero" style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' }}>
				{trainer.memberImage && (
					<img
						src={trainer.memberImage}
						alt={trainer.memberNick}
						className="tdp-hero-bg-img"
						onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
					/>
				)}
				<div className="tdp-hero-overlay" />
				<div className="tdp-hero-inner">
					<Link href="/trainer" className="tdp-back">← Trainers</Link>
					<div className="tdp-hero-profile">
						<img
							src={trainer.memberImage || '/img/profile/defaultUser.svg'}
							alt={trainer.memberNick}
							className="tdp-avatar"
							onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
						/>
						<div className="tdp-hero-info">
							<div className="tdp-level-badge">{trainer.memberPlan ?? 'TRAINER'}</div>
							<h1 className="tdp-name">{trainer.memberFullName || trainer.memberNick}</h1>
							<p className="tdp-nick">@{trainer.memberNick}</p>
							{trainer.memberDesc && (
								<p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6, maxWidth: 440 }}>
									{trainer.memberDesc}
								</p>
							)}
						</div>
					</div>
					<div className="tdp-hero-stats">
						{avgRating > 0 && (
							<>
								<div className="tdp-hs-item">
									<span className="ths-val">★ {avgRating.toFixed(1)}</span>
									<span className="ths-lbl">Rating</span>
								</div>
								<div className="tdp-hs-sep" />
							</>
						)}
						<div className="tdp-hs-item">
							<span className="ths-val">{displayFollowers}</span>
							<span className="ths-lbl">Followers</span>
						</div>
						<div className="tdp-hs-sep" />
						<div className="tdp-hs-item">
							<span className="ths-val">{trainer.memberFollowings}</span>
							<span className="ths-lbl">Following</span>
						</div>
						<div className="tdp-hs-sep" />
						<div className="tdp-hs-item">
							<span className="ths-val">{trainer.memberPrograms}</span>
							<span className="ths-lbl">Programs</span>
						</div>
						<div className="tdp-hs-sep" />
						<div className="tdp-hs-item">
							<span className="ths-val">{trainer.memberPoints}</span>
							<span className="ths-lbl">Points</span>
						</div>
					</div>
				</div>
			</div>

			{/* ─── BODY ─────────────────────────────────────────────── */}
			<div className="tdp-body">

				{/* ── LEFT main ─────────────────────────────────────── */}
				<div className="tdp-main">

					{/* About */}
					{trainer.memberDesc && (
						<section className="tdp-section">
							<h2 className="tdp-section-title">About</h2>
							<p className="tdp-bio">{trainer.memberDesc}</p>
						</section>
					)}

					{/* Programs */}
					{trainerPrograms.length > 0 && (
						<section className="tdp-section">
							<div className="tdp-section-header">
								<h2 className="tdp-section-title">Programs</h2>
								<Link href={`/programs`} className="tdp-see-all">See all →</Link>
							</div>
							<div className="tdp-programs-grid">
								{trainerPrograms.map((prog: Program) => (
									<Link href={{ pathname: '/programs/detail', query: { id: prog._id } }} key={prog._id} className="tdp-prog-card">
										<div className="tpc-banner" style={{ background: typeGradients[prog.programType] ?? typeGradients['STRENGTH'] }}>
											<div className="tpc-overlay" />
											{prog.programImages?.[0] && (
												<img src={prog.programImages[0]} alt={prog.programName} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
											)}
										</div>
										<div className="tpc-body">
											<span className="tpc-type">{prog.programType?.replace(/_/g, ' ')}</span>
											<p className="tpc-name">{prog.programName}</p>
											<div className="tpc-meta">
												<span>⏱ {prog.programDuration}wk</span>
												<span className="tpc-price">{prog.programPrice === 0 ? 'FREE' : `$${prog.programPrice}`}</span>
											</div>
										</div>
									</Link>
								))}
							</div>
						</section>
					)}

					{/* Feedbacks */}
					<section className="tdp-section">
						<div className="tdp-section-header">
							<h2 className="tdp-section-title">Client Feedback</h2>
							{avgRating > 0 && (
								<span className="tdp-avg-rating">★ {avgRating.toFixed(1)} · {feedbacks.length} reviews</span>
							)}
						</div>

						{feedbacks.length > 0 && (
							<>
								{avgRating > 0 && (
									<div className="tdp-rbar-block">
										<div className="tdp-rbar-score">
											<span className="tdp-rbar-big">{avgRating.toFixed(1)}</span>
											<StarRating scale={Math.round(avgRating)} />
											<span className="tdp-rbar-total">{feedbacks.length} clients rated</span>
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
								)}
								<div className="tdp-feedback-grid">
									{feedbacks.map((fb: Feedback) => (
										<div key={fb._id} className="tdp-fb-card">
											<div className="tdp-fb-head">
												<div className="tdp-fb-avatar">
													{fb.memberData?.memberNick?.[0]?.toUpperCase() ?? '?'}
												</div>
												<div className="tdp-fb-meta">
													<span className="tdp-fb-name">{fb.memberData?.memberNick ?? 'Member'}</span>
													<span className="tdp-fb-date">{moment(fb.createdAt).format('MMM DD, YYYY')}</span>
												</div>
												<div className="tdp-fb-right">
													<StarRating scale={fb.feedbackScale} />
												</div>
											</div>
											<p className="tdp-fb-text">{fb.feedbackContent}</p>
										</div>
									))}
								</div>
							</>
						)}

						{/* Submit feedback */}
						<div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
							<p style={{ color: '#aaa', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
								Leave Feedback
							</p>
							<InteractiveStars value={feedbackScale} onChange={setFeedbackScale} />
							<textarea
								rows={3}
								placeholder={user._id ? 'Share your experience with this trainer…' : 'Login to leave feedback'}
								value={feedbackContent}
								onChange={(e) => setFeedbackContent(e.target.value)}
								disabled={!user._id}
								style={{
									width: '100%', padding: '10px 14px', background: '#1f2937',
									border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
									color: '#e2e8f0', fontSize: 13, resize: 'vertical', outline: 'none',
									fontFamily: 'inherit', boxSizing: 'border-box',
								}}
							/>
							<button
								onClick={handleFeedbackSubmit}
								disabled={!feedbackContent.trim() || !user._id}
								style={{
									alignSelf: 'flex-start', padding: '10px 24px',
									background: feedbackContent.trim() && user._id ? '#E92C28' : '#333',
									border: 'none', borderRadius: 7, color: '#fff',
									fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
									cursor: feedbackContent.trim() && user._id ? 'pointer' : 'not-allowed',
								}}
							>
								Submit Feedback
							</button>
						</div>
					</section>
				</div>

				{/* ── RIGHT sticky sidebar ───────────────────────────── */}
				<aside className="tdp-sidebar">
					<div className="tdp-action-card">
						<div className="tdp-ac-price">
							<span className="tdp-ac-from">Trainer</span>
							<span className="tdp-ac-amount" style={{ fontSize: 20 }}>{trainer.memberNick}</span>
						</div>

						<div className="tdp-ac-btn-row">
							<button
								className={`tdp-ac-follow ${followed ? 'following' : ''}`}
								onClick={handleFollow}
							>
								{followed ? '✓ Following' : '+ Follow'}
							</button>
							<button className="tdp-ac-like" onClick={handleLike}>♡</button>
						</div>

						<div className="tdp-ac-divider" />

						<div className="tdp-ac-rows">
							<div className="tdp-ac-row"><span>Type</span><span>{trainer.memberType}</span></div>
							{trainer.memberPlan && (
								<div className="tdp-ac-row">
									<span>Plan</span>
									<span style={{ color: planBadgeColor[trainer.memberPlan] ?? '#fff' }}>{trainer.memberPlan}</span>
								</div>
							)}
							<div className="tdp-ac-row"><span>Programs</span><span>{trainer.memberPrograms} active</span></div>
							<div className="tdp-ac-row"><span>Followers</span><span>{displayFollowers}</span></div>
							<div className="tdp-ac-row"><span>Points</span><span>{trainer.memberPoints}</span></div>
							{avgRating > 0 && (
								<div className="tdp-ac-row"><span>Rating</span><span>★ {avgRating.toFixed(1)}</span></div>
							)}
						</div>

						{trainer.memberEmail && (
							<>
								<div className="tdp-ac-divider" />
								<div className="tdp-ac-rows">
									<div className="tdp-ac-row"><span>Email</span><span style={{ fontSize: 11 }}>{trainer.memberEmail}</span></div>
								</div>
							</>
						)}

						<div className="tdp-ac-divider" />
						<p style={{ color: '#E92C28', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>MEMBER SINCE</p>
						<p style={{ color: '#9ca3af', fontSize: 12 }}>{moment(trainer.createdAt).format('MMMM YYYY')}</p>
					</div>
				</aside>
			</div>
		</div>
	);
};

export default withLayoutBasic(TrainerDetail);
