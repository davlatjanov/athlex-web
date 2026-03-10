import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_ONE_PROGRAM_WITH_MEMBER, GET_COMMENTS, GET_PROGRAM_WITH_WORKOUTS } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_ITEM, JOIN_PROGRAM, LEAVE_PROGRAM } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { Program, Workout } from '../../libs/types/program/program';
import { Comment } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Message } from '../../libs/enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';
import moment from 'moment';
import { CircularProgress, Pagination as MuiPagination, Stack } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import IosShareIcon from '@mui/icons-material/IosShare';

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
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [programComments, setProgramComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PROGRAM,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO **/
	const [likeTargetItem] = useMutation(LIKE_TARGET_ITEM);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [joinProgram] = useMutation(JOIN_PROGRAM);
	const [leaveProgram] = useMutation(LEAVE_PROGRAM);

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
				setCommentInquiry((prev) => prev.search.commentRefId ? prev : { ...prev, search: { commentRefId: prog._id } });
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
		skip: !commentInquiry.search.commentRefId,
		onCompleted: (data: T) => {
			setProgramComments(data?.getComments?.list ?? []);
			setCommentTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	// Refetch after 400ms so the backend-incremented view count is picked up
	useEffect(() => {
		if (!id) return;
		const t = setTimeout(() => {
			getProgramRefetch({ programId: id }).then((res) => {
				const updated = res.data?.getOneProgramWithMember;
				if (updated) setProgram(updated);
			}).catch(() => {});
		}, 400);
		return () => clearTimeout(t);
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
	const likeProgramHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetItem({ variables: { input: { likeGroup: LikeGroup.PROGRAM, likeRefId: program?._id } } });
			getProgramRefetch({ programId: id }).then((res) => {
				const updated = res.data?.getOneProgramWithMember;
				if (updated) setProgram(updated);
			}).catch(() => {});
			sweetTopSmallSuccessAlert('Liked!', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const joinProgramHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			const programId = program?._id ?? id;
			if (joined) {
				await leaveProgram({ variables: { programId } });
				setJoined(false);
				const list: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]');
				localStorage.setItem(JOINED_KEY, JSON.stringify(list.filter((i) => i !== id)));
				sweetTopSmallSuccessAlert('Left program', 800);
			} else {
				await joinProgram({ variables: { programId } });
				setJoined(true);
				const list: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]');
				if (!list.includes(id as string)) localStorage.setItem(JOINED_KEY, JSON.stringify([...list, id]));
				sweetTopSmallSuccessAlert('Enrolled!', 800);
			}
			getProgramRefetch({ programId: id });
		} catch (err: any) {
			const msg: string = err.message ?? '';
			// Backend says already joined → silently mark as enrolled
			if (msg.toLowerCase().includes('already')) {
				setJoined(true);
				const list: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]');
				if (!list.includes(id as string)) localStorage.setItem(JOINED_KEY, JSON.stringify([...list, id]));
			} else {
				sweetMixinErrorAlert(msg).then();
			}
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

	const toggleSavedHandler = () => {
		try {
			const list: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]');
			const newList = list.includes(id as string)
				? list.filter((x) => x !== id)
				: [...list, id as string];
			localStorage.setItem(SAVED_KEY, JSON.stringify(newList));
			setSaved(newList.includes(id as string));
		} catch {}
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

	const weekSchedule = workouts.length > 0 && (
		<section className="pdp-section">
			<h2 className="pdp-section-title">Sample Week</h2>
			<div className="week-grid">
				{DAY_LABELS.map((day, i) => {
					const workout = workouts.find((w) => w.workoutDay === i + 1);
					const isRest = !workout || workout.isRestDay;
					return (
						<div key={day} className={`week-day ${isRest ? 'is-rest' : 'is-workout'}`}>
							<span className="wd-name">{day}</span>
							<span className="wd-icon">{isRest ? '😴' : '💪'}</span>
							<span className="wd-label">{isRest ? 'Rest' : workout?.workoutName}</span>
							{!isRest && (workout?.bodyParts?.length ?? 0) > 0 && (
								<span className="wd-muscles">{workout?.bodyParts?.slice(0, 2).join(', ')}</span>
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
							<div className="rc-avatar">{comment.memberId?.toString().slice(-2).toUpperCase()}</div>
							<div className="rc-meta">
								<span className="rc-date">{moment(comment.createdAt).format('MMM DD, YYYY')}</span>
							</div>
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
					{trainerSection}
					{reviewsSection}
					{leaveReviewSection}
				</div>

				<div className="mobile-sticky-cta">
					<span className="msc-price">{displayPrice}</span>
					<button className={`msc-btn ${joined ? 'enrolled' : ''}`} onClick={joinProgramHandler}>
						{joined ? '✓ ENROLLED' : 'Enroll Now →'}
					</button>
				</div>
			</div>
		);
	}

	/** DESKTOP **/
	return (
		<div id="program-detail-page">
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

					{trainerSection}
					{reviewsSection}
					{leaveReviewSection}
				</div>

				<aside className="pdp-sidebar">
					<div className="enroll-card">
						<div className="ec-price">{displayPrice}</div>

						<div className="ec-actions-row">
							<div className="ec-action-stat">
								<RemoveRedEyeIcon fontSize="small" />
								<span>{program?.programViews}</span>
							</div>
							<button className="ec-action-btn" onClick={likeProgramHandler} title="Like">
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

						<button
							className={joined ? 'ec-enrolled-btn' : 'ec-enroll-btn'}
							onClick={joinProgramHandler}
						>
							{joined ? '✓ ENROLLED' : 'Enroll Now →'}
						</button>

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
				</aside>
			</div>
		</div>
	);
};

ProgramDetailPage.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutFull(ProgramDetailPage);
