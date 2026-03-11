import React, { ChangeEvent, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Pagination as MuiPagination } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Program } from '../../libs/types/program/program';
import moment from 'moment';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import 'swiper/css';
import 'swiper/css/pagination';
import { GET_COMMENTS, GET_PROGRAMS, GET_ONE_PROGRAM_WITH_MEMBER } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { CREATE_COMMENT, LIKE_TARGET_ITEM, JOIN_PROGRAM, LEAVE_PROGRAM } from '../../apollo/user/mutation';
import ProgramCard from '../../libs/components/homepage/ProgramCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

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

const ProgramDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [programId, setProgramId] = useState<string | null>(null);
	const [program, setProgram] = useState<Program | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [joined, setJoined] = useState<boolean>(false);
	const [similarPrograms, setSimilarPrograms] = useState<Program[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [programComments, setProgramComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PROGRAM,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [likeTargetItem] = useMutation(LIKE_TARGET_ITEM);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [joinProgram] = useMutation(JOIN_PROGRAM);
	const [leaveProgram] = useMutation(LEAVE_PROGRAM);

	const { loading: getProgramLoading, refetch: getProgramRefetch } = useQuery(GET_ONE_PROGRAM_WITH_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { programId: programId },
		skip: !programId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getOneProgramWithMember) {
				setProgram(data.getOneProgramWithMember);
				setSlideImage(data.getOneProgramWithMember?.programImages?.[0] ?? '');
			}
		},
	});

	useQuery(GET_PROGRAMS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				...(program?.programType && { programType: program.programType }),
				programStatus: 'ACTIVE',
			},
		},
		skip: !programId && !program,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getPrograms?.list) setSimilarPrograms(data?.getPrograms?.list);
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialComment },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setProgramComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			setProgramId(router.query.id as string);
			setCommentInquiry({
				...commentInquiry,
				search: { commentRefId: router.query.id as string },
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: router.query.id as string,
			});
		}
	}, [router]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const likeProgramHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!program?._id) return;
			await likeTargetItem({
				variables: { input: { likeGroup: LikeGroup.PROGRAM, likeRefId: program._id } },
			});
			await getProgramRefetch({ programId: program._id });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const joinProgramHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!programId) return;
			if (joined) {
				await leaveProgram({ variables: { programId } });
				setJoined(false);
				await sweetTopSmallSuccessAlert('Left program', 800);
			} else {
				await joinProgram({ variables: { programId } });
				setJoined(true);
				await sweetTopSmallSuccessAlert('Joined!', 800);
			}
			await getProgramRefetch({ programId });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });
			setInsertCommentData({ ...insertCommentData, commentContent: '' });
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (getProgramLoading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '80vh' }}>
				<CircularProgress size="4rem" />
			</div>
		);
	}

	if (!program && !getProgramLoading) {
		return (
			<div id="program-detail-page">
				<div className="pdp-not-found">
					<span>🏋️</span>
					<h2>Program not found</h2>
					<p>This program may have been removed or doesn&apos;t exist.</p>
					<button onClick={() => router.push('/programs')}>Browse Programs</button>
				</div>
			</div>
		);
	}

	if (device === 'mobile') {
		return (
			<div id="program-detail-page">
				<div className="pdp-mobile-body">
					<h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 }}>{program?.programName}</h2>
					<img
						src={slideImage || '/img/banner/header1.svg'}
						alt={program?.programName}
						style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10 }}
					/>
					<p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{program?.programDesc}</p>
					<div className="mobile-sticky-cta">
						<span className="msc-price">${program?.programPrice?.toLocaleString()}</span>
						<button className={`msc-btn ${joined ? 'enrolled' : ''}`} onClick={joinProgramHandler}>
							{joined ? 'Leave Program' : 'Join Program'}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div id="program-detail-page">
			{/* ── HERO ── */}
			<div className="pdp-hero-wrap">
				<div className="pdp-hero-left">
					<a className="pdp-back" onClick={() => router.back()} style={{ cursor: 'pointer' }}>
						← Back
					</a>
					<div className="pdp-badges">
						<span className="badge-type">{program?.programType?.replace(/_/g, ' ')}</span>
						<span className="badge-level">{program?.programLevel}</span>
						{(program?.programRank ?? 0) > 0 && (
							<span className="pdp-popularity-badge">🔥 Trending</span>
						)}
					</div>
					<h1 className="pdp-hero-title">{program?.programName}</h1>
					<div className="pdp-hero-meta">
						<span className="phm-item">👁 {program?.programViews?.toLocaleString()} views</span>
						<div className="phm-dot" />
						<span className="phm-item">♥ {program?.programLikes?.toLocaleString()} likes</span>
						<div className="phm-dot" />
						<span className="phm-item">👤 {program?.programMembers?.toLocaleString()} enrolled</span>
						<div className="phm-dot" />
						<span className="phm-item">{moment(program?.createdAt).fromNow()}</span>
					</div>
				</div>
				<div className="pdp-hero-right">
					<img
						className="pdp-hero-img"
						src={slideImage || '/img/banner/header1.svg'}
						alt={program?.programName}
					/>
				</div>
			</div>

			{/* ── BODY ── */}
			<div className="pdp-body">
				{/* LEFT MAIN */}
				<div className="pdp-main">
					{/* Stat pills */}
					<div className="stat-pills">
						<div className="stat-pill">
							<span className="sp-icon">📅</span>
							<span className="sp-val">{program?.programDuration}</span>
							<span className="sp-lbl">Weeks</span>
						</div>
						<div className="stat-pill">
							<span className="sp-icon">👤</span>
							<span className="sp-val">{program?.programMembers?.toLocaleString()}</span>
							<span className="sp-lbl">Members</span>
						</div>
						<div className="stat-pill">
							<span className="sp-icon">👁</span>
							<span className="sp-val">{program?.programViews?.toLocaleString()}</span>
							<span className="sp-lbl">Views</span>
						</div>
						<div className="stat-pill">
							<span className="sp-icon">♥</span>
							<span className="sp-val">{program?.programLikes?.toLocaleString()}</span>
							<span className="sp-lbl">Likes</span>
						</div>
					</div>

					{/* Gallery */}
					{(program?.programImages?.length ?? 0) > 1 && (
						<div className="pdp-section">
							<h3 className="pdp-section-title">Gallery</h3>
							<div className="pdp-gallery">
								{program?.programImages?.map((img: string, idx: number) => (
									<img
										key={idx}
										className={`pdp-thumb ${img === slideImage ? 'active' : ''}`}
										src={img}
										alt={`img-${idx}`}
										onClick={() => setSlideImage(img)}
									/>
								))}
							</div>
						</div>
					)}

					{/* Description */}
					{program?.programDesc && (
						<div className="pdp-section">
							<h3 className="pdp-section-title">About This Program</h3>
							<p className="pdp-desc">{program.programDesc}</p>
						</div>
					)}

					{/* Trainer (in main) */}
					{program?.memberData && (
						<div className="pdp-section">
							<h3 className="pdp-section-title">Your Trainer</h3>
							<div className="ec-trainer">
								<img
									className="et-avatar-img"
									src={program.memberData.memberImage || '/img/profile/defaultUser.svg'}
									alt={program.memberData.memberNick}
								/>
								<div className="et-info">
									<Link href={`/member?memberId=${program.memberData._id}`} className="et-name">
										{program.memberData.memberNick}
									</Link>
									<p className="et-spec">{program.memberData.memberType?.toLowerCase()}</p>
								</div>
								<Link href={`/member?memberId=${program.memberData._id}`} className="et-profile-link">
									View Profile →
								</Link>
							</div>
						</div>
					)}

					{/* Reviews */}
					<div className="pdp-section">
						<div className="reviews-head">
							<h3 className="pdp-section-title">Reviews</h3>
							<span className="reviews-count">{commentTotal} reviews</span>
						</div>

						{programComments.length > 0 && (
							<div className="review-cards">
								{programComments.map((comment: Comment) => (
									<div className="review-card" key={comment._id}>
										<div className="rc-head">
											<div className="rc-avatar">
												{comment.memberData?.memberNick?.[0]?.toUpperCase() ?? '?'}
											</div>
											<div className="rc-meta">
												<span className="rc-name">{comment.memberData?.memberNick ?? 'Member'}</span>
												<span className="rc-date">{moment(comment.createdAt).format('MMM DD, YYYY')}</span>
											</div>
										</div>
										<p className="rc-text">{comment.commentContent}</p>
									</div>
								))}
							</div>
						)}

						{commentTotal > commentInquiry.limit && (
							<MuiPagination
								page={commentInquiry.page}
								count={Math.ceil(commentTotal / commentInquiry.limit)}
								onChange={(_e: ChangeEvent<unknown>, value: number) => {
									setCommentInquiry({ ...commentInquiry, page: value });
								}}
								shape="circular"
								color="primary"
							/>
						)}

						{/* Leave a review */}
						<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
							<textarea
								className="pdp-review-input"
								rows={4}
								placeholder={user._id ? 'Share your experience…' : 'Login to leave a review'}
								value={insertCommentData.commentContent}
								onChange={(e) => setInsertCommentData({ ...insertCommentData, commentContent: e.target.value })}
								disabled={!user._id}
							/>
							<button
								className="pdp-submit-btn"
								disabled={!insertCommentData.commentContent || !user._id}
								onClick={createCommentHandler}
							>
								Submit Review
							</button>
						</div>
					</div>
				</div>

				{/* RIGHT SIDEBAR */}
				<div className="pdp-sidebar">
					<div className="enroll-card">
						<span className="ec-price">${program?.programPrice?.toLocaleString()}</span>

						<div className="ec-actions-row">
							<div className="ec-action-stat">
								<span>👁 {program?.programViews?.toLocaleString()}</span>
							</div>
							<button
								className="ec-action-btn"
								onClick={likeProgramHandler}
							>
								♥ {program?.programLikes?.toLocaleString()}
							</button>
						</div>

						{joined ? (
							<>
								<button className="ec-enrolled-btn" onClick={joinProgramHandler}>
									✓ Enrolled
								</button>
								<button className="ec-leave-btn" onClick={joinProgramHandler}>
									Leave Program
								</button>
							</>
						) : (
							<button className="ec-enroll-btn" onClick={joinProgramHandler}>
								Join Program →
							</button>
						)}

						<div className="ec-divider" />

						<div className="ec-details">
							<div className="ec-row">
								<span className="ec-row-label">Type</span>
								<span className="ec-row-value">{program?.programType?.replace(/_/g, ' ')}</span>
							</div>
							<div className="ec-row">
								<span className="ec-row-label">Level</span>
								<span className="ec-row-value">{program?.programLevel}</span>
							</div>
							<div className="ec-row">
								<span className="ec-row-label">Duration</span>
								<span className="ec-row-value">{program?.programDuration} Weeks</span>
							</div>
							<div className="ec-row">
								<span className="ec-row-label">Start</span>
								<span className="ec-row-value">
									{program?.programStartDate ? moment(program.programStartDate).format('MMM DD, YYYY') : '—'}
								</span>
							</div>
							<div className="ec-row">
								<span className="ec-row-label">End</span>
								<span className="ec-row-value">
									{program?.programEndDate ? moment(program.programEndDate).format('MMM DD, YYYY') : '—'}
								</span>
							</div>
						</div>

						<div className="ec-divider" />

						<div className="trust-row">
							<div className="trust-item">Instant access on enrollment</div>
							<div className="trust-item">Money-back guarantee</div>
							<div className="trust-item">Expert-designed workouts</div>
						</div>
					</div>
				</div>
			</div>

			{/* ── SIMILAR PROGRAMS ── */}
			{similarPrograms.length > 0 && (
				<div className="pdp-related">
					<div className="pdp-related-inner">
						<p className="pdp-related-title">Similar Programs</p>
						<div className="pdp-related-grid">
							{similarPrograms
								.filter((p) => p._id !== program?._id)
								.slice(0, 3)
								.map((prog: Program) => (
									<ProgramCard
										key={prog._id}
										id={prog._id}
										name={prog.programName}
										type={prog.programType}
										level={prog.programLevel}
										duration={prog.programDuration}
										price={prog.programPrice}
										views={prog.programViews}
										likes={prog.programLikes}
										members={prog.programMembers}
										rank={prog.programRank}
										image={prog.programImages?.[0]}
										gradient={typeGradients[prog.programType] ?? typeGradients['STRENGTH']}
									/>
								))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

ProgramDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutFull(ProgramDetail);
