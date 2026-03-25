import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_ONE_PROGRAM_WITH_MEMBER, GET_COMMENTS, GET_PROGRAM_WITH_WORKOUTS, GET_FEEDBACKS, CHECK_IF_USER_LIKED } from '../../apollo/user/query';
import { CREATE_COMMENT, DELETE_COMMENT, JOIN_PROGRAM, LEAVE_PROGRAM, TOGGLE_BOOKMARK, CREATE_FEEDBACK, UPDATE_FEEDBACK } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { Program, Workout } from '../../libs/types/program/program';
import { Comment } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Message } from '../../libs/enums/common.enum';
import { useLike } from '../../libs/hooks/useInteractions';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';
import moment from 'moment';
import { CircularProgress, Pagination as MuiPagination, Stack } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import IosShareIcon from '@mui/icons-material/IosShare';
import DateRangeIcon from '@mui/icons-material/DateRange';
import GroupIcon from '@mui/icons-material/Group';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { trackProgramVisit } from '../../libs/components/mypage/RecentlyVisited';
import CheckoutModal from '../../libs/components/common/CheckoutModal';

const SAVED_KEY = 'athlex_saved_programs';
const JOINED_KEY = 'athlex_joined_programs';
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const getServerSideProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProgramDetailPage: NextPage = ({ initialComment }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { id } = router.query;
	const user = useReactiveVar(userVar);

	const [program, setProgram] = useState<Program | null>(null);
	const [workouts, setWorkouts] = useState<Workout[]>([]);
	const [slideImage, setSlideImage] = useState<string>('');
	const [joined, setJoined] = useState(false);
	const [saved, setSaved] = useState(false);
	const [showCheckout, setShowCheckout] = useState(false);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [programComments, setProgramComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PROGRAM,
		commentContent: '',
		commentRefId: '',
	});
	const [feedbackScale, setFeedbackScale] = useState(0);
	const SCALE_MAP: Record<number, string> = { 1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE' };
	const REV_SCALE: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
	const [feedbackHover, setFeedbackHover] = useState(0);
	const [feedbackContent, setFeedbackContent] = useState('');
	const [averageRating, setAverageRating] = useState(0);
	const [ratingCount, setRatingCount] = useState(0);
	const [ratingDist, setRatingDist] = useState<Record<number,number>>({ 1:0, 2:0, 3:0, 4:0, 5:0 });
	const [myFeedbackId, setMyFeedbackId] = useState<string | null>(null);
	const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
	const toggleWorkout = (id: string) => setExpandedWorkouts((prev) => {
		const next = new Set(prev);
		next.has(id) ? next.delete(id) : next.add(id);
		return next;
	});

	/** HOOKS **/
	const { data: likedData } = useQuery(CHECK_IF_USER_LIKED, {
		fetchPolicy: 'network-only',
		skip: !id || !user?._id,
		variables: { likeRefId: id },
	});
	const { liked: programLiked, toggle: toggleLike } = useLike('programs', id as string, likedData?.checkIfUserLiked ?? false);

	/** APOLLO **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [deleteComment] = useMutation(DELETE_COMMENT);
	const [joinProgram] = useMutation(JOIN_PROGRAM);
	const [leaveProgram] = useMutation(LEAVE_PROGRAM);
	const [toggleBookmark] = useMutation(TOGGLE_BOOKMARK);
	const [createFeedback] = useMutation(CREATE_FEEDBACK);
	const [updateFeedback] = useMutation(UPDATE_FEEDBACK);

	const { data: feedbacksData, refetch: refetchFeedbacks } = useQuery(GET_FEEDBACKS, {
		fetchPolicy: 'network-only',
		skip: !id,
		variables: { input: { page: 1, limit: 100, feedbackRefId: id, feedbackGroup: 'TRAINING_PROGRAM' } },
	});

	useEffect(() => {
		const list: T[] = feedbacksData?.getFeedbacks?.list ?? [];
		if (!list.length) return;
		const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		list.forEach((fb: T) => {
			const num = REV_SCALE[fb.feedbackScale] ?? 0;
			if (num >= 1 && num <= 5) dist[num]++;
		});
		const total = list.length;
		const sum = Object.entries(dist).reduce((acc, [k, v]) => acc + Number(k) * v, 0);
		setRatingDist(dist);
		setRatingCount(total);
		setAverageRating(total > 0 ? sum / total : 0);
		if (user?._id) {
			const mine = list.find((fb: T) => fb.memberId === (user as any)._id);
			if (mine) { setFeedbackScale(REV_SCALE[mine.feedbackScale] ?? 0); setMyFeedbackId(mine._id); }
		}
	}, [feedbacksData]);

	const { loading, refetch: getProgramRefetch } = useQuery(GET_ONE_PROGRAM_WITH_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { programId: id },
		skip: !id,
		onCompleted: (data: T) => {
			const prog = data?.getOneProgramWithMember;
			if (prog) {
				setProgram(prog);
				// Only set initial values once — skip on every subsequent refetch
				setSlideImage((prev) => prev || prog.programImages?.[0] || '');
				setInsertCommentData((prev) => prev.commentRefId ? prev : { ...prev, commentRefId: prog._id });
				setCommentInquiry((prev) => prev.commentRefId ? prev : { ...prev, commentRefId: prog._id, commentGroup: CommentGroup.PROGRAM });
			}
		},
	});

	useQuery(GET_PROGRAM_WITH_WORKOUTS, {
		fetchPolicy: 'cache-and-network',
		variables: { programId: id },
		skip: !id,
		onCompleted: (data: T) => {
			setWorkouts(data?.getProgramWithWorkouts?.workouts ?? []);
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInquiry },
		skip: !commentInquiry.commentRefId,
		onCompleted: (data: T) => {
			setProgramComments(data?.getComments?.list ?? []);
			setCommentTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (commentInquiry.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	useEffect(() => {
		if (!id) return;
		trackProgramVisit(id as string);
	}, [id]);

	useEffect(() => {
		if (!id) return;
		try {
			const saved: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]');
			setSaved(saved.includes(id as string));
			const joined: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]');
			setJoined(joined.includes(id as string));
		} catch {}
	}, [id]);

	/** HANDLERS **/

	const joinProgramHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			if ((program?.programPrice ?? 0) > 0) {
				setShowCheckout(true);
			} else {
				await enrollAfterPayment();
			}
		} catch (err: any) {
			const msg: string = err.message ?? '';
			if (msg.toLowerCase().includes('already')) {
				setJoined(true);
				const list: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]');
				if (!list.includes(id as string)) localStorage.setItem(JOINED_KEY, JSON.stringify([...list, id]));
			} else {
				sweetMixinErrorAlert(msg).then();
			}
		}
	};

	const leaveProgramHandler = async () => {
		try {
			await sweetConfirmAlert('Do you want to leave this program?');
			const programId = program?._id ?? id;
			await leaveProgram({ variables: { programId } });
			setJoined(false);
			const list: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]');
			localStorage.setItem(JOINED_KEY, JSON.stringify(list.filter((i) => i !== id)));
			sweetTopSmallSuccessAlert('You have left the program', 800);
			getProgramRefetch({ programId: id }).then((res) => {
				const updated = res.data?.getOneProgramWithMember;
				if (updated) setProgram(updated);
			}).catch(() => {});
		} catch {
			// user cancelled or error — do nothing
		}
	};

	const enrollAfterPayment = async () => {
		try {
			const programId = program?._id ?? id;
			await joinProgram({ variables: { programId } });
			setJoined(true);
			setShowCheckout(false);
			const list: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]');
			if (!list.includes(id as string)) localStorage.setItem(JOINED_KEY, JSON.stringify([...list, id]));
			sweetTopSmallSuccessAlert('Enrolled! Welcome to the program.', 1200);
			getProgramRefetch({ programId: id }).then((res) => {
				const updated = res.data?.getOneProgramWithMember;
				if (updated) setProgram(updated);
			}).catch(() => {});
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });
			setInsertCommentData((prev) => ({ ...prev, commentContent: '' }));
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const toggleSavedHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await toggleBookmark({ variables: { input: { bookmarkGroup: 'PROGRAM', bookmarkRefId: id } } });
			setSaved((prev) => {
				const next = !prev;
				try {
					const list: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]');
					const updated = next ? Array.from(new Set([...list, id as string])) : list.filter((i) => i !== id);
					localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
				} catch {}
				return next;
			});
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const shareHandler = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			await sweetTopSmallSuccessAlert('Link copied!', 800);
		} catch {}
	};

	const commentPaginationChangeHandler = async (_: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry((prev) => ({ ...prev, page: value }));
	};

	if (loading) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '80vh' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	if (!program && !loading) {
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

	const displayPrice = program?.programPrice === 0 ? 'FREE' : `$${program?.programPrice?.toLocaleString()}`;
	const isPopular = (program?.programRank ?? 99) <= 10;

	/** Shared UI blocks **/
	const heroBlock = (
		<div className="pdp-hero-wrap">
			<div className="pdp-hero-left">
				<Link href="/programs" className="pdp-back">← Back to Programs</Link>
				<div className="pdp-badges">
					<span className="badge-type">{program?.programType}</span>
					<span className="badge-level">{program?.programLevel}</span>
					{isPopular && <span className="pdp-popularity-badge">🔥 Top Ranked</span>}
				</div>
				<h1 className="pdp-hero-title">{program?.programName}</h1>
				<div className="pdp-hero-meta">
					<span className="phm-item">{program?.programMembers} enrolled</span>
					<span className="phm-dot" />
					<span className="phm-item">{program?.programDuration} weeks</span>
					<span className="phm-dot" />
					<span className="phm-item">{moment(program?.createdAt).fromNow()}</span>
				</div>
			</div>
			{slideImage && (
				<div className="pdp-hero-right">
					<img
						src={slideImage}
						alt={program?.programName}
						className="pdp-hero-img"
						onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
					/>
				</div>
			)}
		</div>
	);

	const statPills = (
		<div className="stat-pills">
			{[
				{ icon: '🗓', val: program?.programDuration, lbl: 'WEEKS' },
				{ icon: '👥', val: program?.programMembers, lbl: 'ENROLLED' },
				{ icon: '💬', val: program?.programComments, lbl: 'REVIEWS' },
				{ icon: '🏆', val: program?.programRank, lbl: 'RANK' },
			].map(({ icon, val, lbl }) => (
				<div key={lbl} className="stat-pill">
					<span className="sp-icon">{icon}</span>
					<span className="sp-val">{val}</span>
					<span className="sp-lbl">{lbl}</span>
				</div>
			))}
		</div>
	);

	const enrolledWorkoutPlan = joined && (
		<section className="pdp-section">
			<h2 className="pdp-section-title">Your Workout Plan</h2>
			{workouts.length === 0 ? (
				<p className="pdp-desc" style={{ color: '#4B5563' }}>
					Your trainer is preparing the workout plan. Check back soon!
				</p>
			) : (
				<div className="wplan-days">
					{workouts
						.slice()
						.sort((a, b) => a.workoutDay - b.workoutDay)
						.map((workout) => {
							const dayLabel = DAY_LABELS[workout.workoutDay - 1] ?? `Day ${workout.workoutDay}`;
						const isExpanded = expandedWorkouts.has(workout._id);
						return (
								<div key={workout._id} className={`wday-card ${workout.isRestDay ? 'is-rest' : ''}`}>
									<div className="wday-header" onClick={() => !workout.isRestDay && toggleWorkout(workout._id)} style={!workout.isRestDay ? { cursor: 'pointer' } : undefined}>
										<div className="wday-title-row">
											<span className="wday-label">{dayLabel}</span>
											<span className="wday-name">{workout.isRestDay ? 'Rest Day' : workout.workoutName}</span>
											{!workout.isRestDay && (workout.workoutDuration ?? 0) > 0 && (
												<span className="wday-duration">{workout.workoutDuration} min</span>
											)}
											{!workout.isRestDay && (
												<span className={`wday-toggle-arrow ${isExpanded ? 'open' : ''}`}>▼</span>
											)}
										</div>
										{!workout.isRestDay && (workout.bodyParts?.length ?? 0) > 0 && (
											<div className="wday-muscles">
												{workout.bodyParts?.map((bp) => (
													<span key={bp} className="wday-muscle-tag">{bp.replace(/_/g, ' ')}</span>
												))}
											</div>
										)}
									</div>

									{workout.isRestDay ? (
										<div className="wday-rest-msg">
											😴 Rest and recover — your muscles grow during downtime.
										</div>
									) : isExpanded ? (
										<div className="wday-exercises">
											{(workout.exercises ?? []).length === 0 ? (
												<p style={{ color: '#4B5563', fontSize: 13, margin: 0 }}>Exercises are being added. Check back soon.</p>
											) : (
												workout.exercises!
													.slice()
													.sort((a, b) => a.orderInWorkout - b.orderInWorkout)
													.map((ex, idx) => (
														<div key={ex._id} className="ex-item">
															<div className="ex-top">
																<span className="ex-num">{idx + 1}</span>
																<div className="ex-info">
																	<span className="ex-name">{ex.exerciseName}</span>
																	<div className="ex-params">
																		<span>{ex.sets} sets × {ex.reps} reps</span>
																		{(ex.restTime ?? 0) > 0 && <span>· {ex.restTime}s rest</span>}
																		{ex.primaryMuscle && <span>· {ex.primaryMuscle.replace(/_/g, ' ')}</span>}
																	</div>
																</div>
																<div className="ex-top-right">
																	{ex.difficulty && (
																		<span className={`ex-diff-badge diff-${ex.difficulty.toLowerCase()}`}>{ex.difficulty}</span>
																	)}
																	{ex.exerciseVideo && (
																		<a
																			href={ex.exerciseVideo}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="ex-video-btn"
																		>
																			▶ Watch Tutorial
																		</a>
																	)}
																</div>
															</div>
																						{(ex.equipment?.length ?? 0) > 0 && (
																<div className="ex-equipment">
																	{ex.equipment?.map((eq) => (
																		<span key={eq} className="eq-tag">{eq.replace(/_/g, ' ')}</span>
																	))}
																</div>
															)}
															{(ex.instructions?.length ?? 0) > 0 && (
																<ol className="ex-instructions">
																	{ex.instructions?.map((inst, i) => <li key={i}>{inst}</li>)}
																</ol>
															)}
															{(ex.tips?.length ?? 0) > 0 && (
																<div className="ex-tips">
																	{ex.tips?.map((tip, i) => <p key={i} className="ex-tip">💡 {tip}</p>)}
																</div>
															)}
														</div>
													))
											)}
										</div>
									) : null}
								</div>
							);
						})}
				</div>
			)}
		</section>
	);

	const weekSchedule = workouts.length > 0 && (
		<section className="pdp-section">
			<h2 className="pdp-section-title">Sample Week</h2>
			<div className="week-list">
				{DAY_LABELS.map((day, i) => {
					const workout = workouts.find((w) => w.workoutDay === i + 1);
					const isRest = !workout || workout.isRestDay;
					return (
						<div key={day} className={`wl-row ${isRest ? 'is-rest' : 'is-workout'}`}>
							<span className="wl-day">{day}</span>
							<span className={`wl-dot ${isRest ? 'dot-rest' : 'dot-active'}`} />
							<span className="wl-name">{isRest ? 'Rest & Recovery' : workout?.workoutName}</span>
							{!isRest && (workout?.bodyParts?.length ?? 0) > 0 && (
								<div className="wl-tags">
									{workout?.bodyParts?.slice(0, 3).map((bp) => (
										<span key={bp} className="wl-tag">{bp.replace(/_/g, ' ')}</span>
									))}
								</div>
							)}
							{!isRest && (workout?.workoutDuration ?? 0) > 0 && (
								<span className="wl-duration">{workout?.workoutDuration} min</span>
							)}
						</div>
					);
				})}
			</div>
		</section>
	);

	const trainerSection = program?.memberData && (
		<section className="pdp-section">
			<h2 className="pdp-section-title">About The Trainer</h2>
			<div className="ec-trainer">
				<img
					src={program.memberData.memberImage || ''}
					alt={program.memberData.memberNick}
					className="et-avatar-img"
					onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.style.display = 'none'; }}
				/>
				<div className="et-info">
					<Link href={`/member?memberId=${program.memberData._id}`}>
						<div className="et-name">{program.memberData.memberNick}</div>
					</Link>
					<div className="et-spec">{program.memberData.memberType}</div>
				</div>
				<Link href={`/member?memberId=${program.memberData._id}`} className="et-profile-link">
					View Profile →
				</Link>
			</div>
		</section>
	);

	const reviewsSection = commentTotal > 0 && (
		<section className="pdp-section">
			<h2 className="pdp-section-title">Reviews ({commentTotal})</h2>
			<div className="review-cards">
				{programComments.map((comment: Comment) => (
					<div key={comment._id} className="review-card">
						<div className="rc-head">
							<div className="rc-avatar">
								{comment.memberData?.memberImage
									? <img src={comment.memberData.memberImage} alt="" />
									: (comment.memberData?.memberNick?.[0] ?? 'A').toUpperCase()}
								</div>
							<div className="rc-meta">
								<span className="rc-nick">{comment.memberData?.memberNick ?? 'Member'}</span>
								<span className="rc-date">{moment(comment.createdAt).format('MMM DD, YYYY')}</span>
							</div>
							{(user as any)?._id === comment.memberId?.toString() && (
								<button
									className="rc-delete-btn"
									title="Delete comment"
									onClick={async () => {
										try {
											await deleteComment({ variables: { commentId: comment._id } });
											await getCommentsRefetch({ input: commentInquiry });
											await sweetTopSmallSuccessAlert('Comment deleted', 800);
										} catch (err: any) { sweetMixinErrorAlert(err.message); }
									}}
								>✕</button>
							)}
						</div>
						<p className="rc-text">{comment.commentContent}</p>
					</div>
				))}
			</div>
			{commentTotal > commentInquiry.limit && (
				<MuiPagination
					page={commentInquiry.page}
					count={Math.ceil(commentTotal / commentInquiry.limit)}
					onChange={commentPaginationChangeHandler}
					shape="circular"
					color="primary"
				/>
			)}
		</section>
	);

	const leaveReviewSection = (
		<section className="pdp-section">
			<h2 className="pdp-section-title">Leave A Review</h2>
			<textarea
				className="pdp-review-input"
				rows={4}
				placeholder="Share your experience with this program..."
				value={insertCommentData.commentContent}
				onChange={({ target: { value } }) => setInsertCommentData((prev) => ({ ...prev, commentContent: value }))}
			/>
			<button
				className="pdp-submit-btn"
				disabled={!insertCommentData.commentContent || !user._id}
				onClick={createCommentHandler}
			>
				Submit Review
			</button>
		</section>
	);

	/** MOBILE **/
	if (device === 'mobile') {
		return (
			<div id="program-detail-page">
				<Head><title>Athlex | {program?.programName ?? 'Program'}</title></Head>
				{heroBlock}
				<div className="pdp-mobile-body">
					{statPills}

					{program?.programDesc && (
						<section className="pdp-section">
							<h2 className="pdp-section-title">About This Program</h2>
							<p className="pdp-desc">{program.programDesc}</p>
						</section>
					)}

					{(program?.targetAudience?.length ?? 0) > 0 && (
						<section className="pdp-section">
							<h2 className="pdp-section-title">Who Is This For?</h2>
							<div className="req-list">
								{program?.targetAudience?.map((t, i) => (
									<div key={i} className="req-item"><span className="req-dot" />{t}</div>
								))}
							</div>
						</section>
					)}

					{(program?.requirements?.length ?? 0) > 0 && (
						<section className="pdp-section">
							<h2 className="pdp-section-title">Requirements</h2>
							<div className="req-list">
								{program?.requirements?.map((r, i) => (
									<div key={i} className="req-item"><span className="req-dot" />{r}</div>
								))}
							</div>
						</section>
					)}

					{weekSchedule}
					{enrolledWorkoutPlan}
					{trainerSection}
					{reviewsSection}
					{leaveReviewSection}
				</div>

				<div className="mobile-sticky-cta">
					<span className="msc-price">{displayPrice}</span>
					{joined ? (
						<>
							<button className="msc-btn enrolled" disabled>✓ ENROLLED</button>
							<button className="msc-leave-btn" onClick={leaveProgramHandler}>Leave</button>
						</>
					) : (
						<button className="msc-btn" onClick={joinProgramHandler}>Enroll Now →</button>
					)}
				</div>
			</div>
		);
	}

	/** DESKTOP **/
	return (
		<div id="program-detail-page">
			<Head><title>Athlex | {program?.programName ?? 'Program'}</title></Head>
			{heroBlock}

			<div className="pdp-body">
				<div className="pdp-main">
					{(program?.programImages?.length ?? 0) > 1 && (
						<div className="pdp-gallery">
							{program?.programImages?.map((img) => (
								<img
									key={img}
									src={img}
									alt=""
									className={`pdp-thumb ${img === slideImage ? 'active' : ''}`}
									onClick={() => setSlideImage(img)}
								/>
							))}
						</div>
					)}

					{program?.programDesc && (
						<section className="pdp-section">
							<h2 className="pdp-section-title">About This Program</h2>
							<p className="pdp-desc">{program.programDesc}</p>
						</section>
					)}

					{(program?.targetAudience?.length ?? 0) > 0 && (
						<section className="pdp-section">
							<h2 className="pdp-section-title">Who Is This For?</h2>
							<div className="req-list">
								{program?.targetAudience?.map((t, i) => (
									<div key={i} className="req-item"><span className="req-dot" />{t}</div>
								))}
							</div>
						</section>
					)}

					{(program?.requirements?.length ?? 0) > 0 && (
						<section className="pdp-section">
							<h2 className="pdp-section-title">Requirements</h2>
							<div className="req-list">
								{program?.requirements?.map((r, i) => (
									<div key={i} className="req-item"><span className="req-dot" />{r}</div>
								))}
							</div>
						</section>
					)}

					{weekSchedule}

					{(program?.programTags?.length ?? 0) > 0 && (
						<section className="pdp-section">
							<h2 className="pdp-section-title">Tags</h2>
							<div className="muscle-chips">
								{program?.programTags?.map((tag) => (
									<span key={tag} className="muscle-chip">{tag}</span>
								))}
							</div>
						</section>
					)}
				</div>

				<aside className="pdp-sidebar">
					<div className="enroll-card">
						<div className="ec-price">{displayPrice}</div>

						<div className="ec-actions-row">
							<div className="ec-action-stat">
								<RemoveRedEyeIcon fontSize="small" />
								<span>{program?.programViews}</span>
							</div>
							<button className={`ec-action-btn ${programLiked ? 'liked' : ''}`} onClick={async (e) => { await toggleLike(e); getProgramRefetch({ programId: id }).then((res) => { const u = res.data?.getOneProgramWithMember; if (u) setProgram(u); }).catch(() => {}); }} title="Like">
								<FavoriteBorderIcon fontSize="small" />
								<span>{program?.programLikes}</span>
							</button>
							<button className={`ec-action-btn ${saved ? 'saved' : ''}`} onClick={toggleSavedHandler} title="Save">
								{saved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
							</button>
							<button className="ec-action-btn" onClick={shareHandler} title="Share">
								<IosShareIcon fontSize="small" />
							</button>
						</div>

						{joined ? (
							<>
								<div className="ec-enrolled-btn">✓ ENROLLED</div>
								<button className="ec-leave-btn" onClick={leaveProgramHandler}>Leave Program</button>
							</>
						) : (
							<button className="ec-enroll-btn" onClick={joinProgramHandler}>Enroll Now →</button>
						)}

						<div className="trust-row">
							<div className="trust-item">Instant access after enrollment</div>
							<div className="trust-item">Cancel anytime</div>
							<div className="trust-item">Trainer support included</div>
						</div>

						<div className="ec-divider" />

						<div className="ec-details">
							{[
								{ label: 'Level', value: program?.programLevel },
								{ label: 'Duration', value: `${program?.programDuration} weeks` },
								{ label: 'Members', value: program?.programMembers },
								{ label: 'Type', value: program?.programType },
								{ label: 'Start', value: moment(program?.programStartDate).format('MMM DD, YYYY') },
								{ label: 'End', value: moment(program?.programEndDate).format('MMM DD, YYYY') },
							].map(({ label, value }) => (
								<div key={label} className="ec-row">
									<span className="ec-row-label">{label}</span>
									<span className="ec-row-value">{value}</span>
								</div>
							))}
						</div>
					</div>

					{/* Quick stats 2×2 */}
					<div className="sidebar-stats">
						{[
							{ icon: <DateRangeIcon />, val: program?.programDuration, lbl: 'WEEKS' },
							{ icon: <GroupIcon />, val: program?.programMembers, lbl: 'ENROLLED' },
							{ icon: <ChatBubbleOutlineIcon />, val: commentTotal, lbl: 'REVIEWS' },
							{ icon: <EmojiEventsIcon />, val: program?.programRank, lbl: 'RANK' },
						].map(({ icon, val, lbl }) => (
							<div key={lbl} className="sidebar-stat-pill">
								<span className="sp-icon">{icon}</span>
								<span className="sp-val">{val}</span>
								<span className="sp-lbl">{lbl}</span>
							</div>
						))}
					</div>

					{/* Trainer mini-card */}
					{program?.memberData && (
						<div className="sidebar-trainer">
							<span className="sidebar-section-label">Trainer</span>
							<div className="ec-trainer">
								<img
									src={program.memberData.memberImage || ''}
									alt={program.memberData.memberNick}
									className="et-avatar-img"
									onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.style.display = 'none'; }}
								/>
								<div className="et-info">
									<Link href={`/member?memberId=${program.memberData._id}`}>
										<div className="et-name">{program.memberData.memberNick}</div>
									</Link>
									<div className="et-spec">{program.memberData.memberType}</div>
								</div>
								<Link href={`/member?memberId=${program.memberData._id}`} className="et-profile-link">
									View →
								</Link>
							</div>
						</div>
					)}

				</aside>
			</div>

			{/* ── Full-width: Reviews + Rating ── */}
			<div className="pdp-full-width">
				{enrolledWorkoutPlan}
				{reviewsSection}
				{leaveReviewSection}

				<section className="pdp-section">
					<h2 className="pdp-section-title">Rate This Program</h2>

					<div className="pdp-rating-overview">
						<div className="pdp-rating-score">
							<span className="pdp-rating-big">{ratingCount > 0 ? averageRating.toFixed(1) : '—'}</span>
							<div className="pdp-rating-stars">
								{[1,2,3,4,5].map((s) => (
									<span key={s} style={{ color: s <= Math.round(averageRating) ? '#FFB800' : '#374151' }}>★</span>
								))}
							</div>
							<span className="pdp-rating-count">{ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}</span>
						</div>
						<div className="pdp-rating-bars">
							{[5,4,3,2,1].map((star) => {
								const count = ratingDist[star] ?? 0;
								const pct = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
								return (
									<div key={star} className="pdp-bar-row">
										<span className="pdp-bar-label">{star} ★</span>
										<div className="pdp-bar-track">
											<div className="pdp-bar-fill" style={{ width: `${pct}%` }} />
										</div>
										<span className="pdp-bar-count">{count}</span>
									</div>
								);
							})}
						</div>
					</div>

					<div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
						{[1, 2, 3, 4, 5].map((star) => (
							<span
								key={star}
								style={{
									fontSize: 32,
									cursor: user._id ? 'pointer' : 'default',
									color: star <= (feedbackHover || feedbackScale) ? '#FFB800' : '#4b5563',
									transition: 'color 0.15s',
								}}
								onMouseEnter={() => user._id && setFeedbackHover(star)}
								onMouseLeave={() => setFeedbackHover(0)}
								onClick={() => user._id && setFeedbackScale(star)}
							>
								★
							</span>
						))}
					</div>
					{feedbackScale > 0 && (
						<>
							<textarea
								className="pdp-review-input"
								rows={3}
								placeholder="Tell us more about your rating (optional)..."
								value={feedbackContent}
								onChange={(e) => setFeedbackContent(e.target.value)}
							/>
							<button
								className="pdp-submit-btn"
								disabled={!user._id}
								onClick={async () => {
									try {
										if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
										if (myFeedbackId) {
											await updateFeedback({ variables: { input: { _id: myFeedbackId, feedbackScale: SCALE_MAP[feedbackScale], ...(feedbackContent && { feedbackContent }) } } });
										} else {
											await createFeedback({ variables: { input: { feedbackGroup: 'TRAINING_PROGRAM', feedbackRefId: id, feedbackScale: SCALE_MAP[feedbackScale], feedbackContent: feedbackContent || `Rated ${feedbackScale} out of 5 stars` } } });
										}
										setFeedbackContent('');
										await refetchFeedbacks();
										await sweetTopSmallSuccessAlert('Rating submitted!', 800);
									} catch (err: any) {
										await sweetErrorHandling(err);
									}
								}}
							>
								Submit Rating
							</button>
						</>
					)}
				</section>
			</div>

			{showCheckout && program && (
				<CheckoutModal
					programId={String(program._id ?? id)}
					programName={program.programName}
					price={program.programPrice}
					onClose={() => setShowCheckout(false)}
					onSuccess={enrollAfterPayment}
				/>
			)}
		</div>
	);
};

ProgramDetailPage.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		commentRefId: '',
		commentGroup: CommentGroup.PROGRAM,
	},
};

export default withLayoutFull(ProgramDetailPage);
