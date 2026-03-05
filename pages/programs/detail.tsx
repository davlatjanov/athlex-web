import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import Review from '../../libs/components/property/Review';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Program } from '../../libs/types/program/program';
import moment from 'moment';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Pagination as MuiPagination } from '@mui/material';
import Link from 'next/link';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import 'swiper/css';
import 'swiper/css/pagination';
import { GET_COMMENTS, GET_PROGRAMS, GET_ONE_PROGRAM_WITH_MEMBER } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { CREATE_COMMENT, LIKE_TARGET_ITEM } from '../../apollo/user/mutation';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProgramDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [programId, setProgramId] = useState<string | null>(null);
	const [program, setProgram] = useState<Program | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
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

	const {
		loading: getProgramLoading,
		data: getProgramData,
		error: getProgramError,
		refetch: getProgramRefetch,
	} = useQuery(GET_ONE_PROGRAM_WITH_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { programId: programId },
		skip: !programId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getOneProgramWithMember) setProgram(data.getOneProgramWithMember);
			if (data?.getOneProgramWithMember) setSlideImage(data.getOneProgramWithMember?.programImages?.[0]);
		},
	});

	const {
		loading: getProgramsLoading,
		data: getProgramsData,
		error: getProgramsError,
		refetch: getProgramsRefetch,
	} = useQuery(GET_PROGRAMS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					programType: program?.programType ? [program?.programType] : [],
				},
			},
		},
		skip: !programId && !program,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getPrograms?.list) setSimilarPrograms(data?.getPrograms?.list);
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
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
				search: {
					commentRefId: router.query.id as string,
				},
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
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const likeProgramHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetItem({
				variables: {
					input: {
						likeGroup: LikeGroup.PROGRAM,
						likeRefId: id,
					},
				},
			});
			await getProgramRefetch({ programId: id });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeProgramHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
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
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '1080px' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}
	if (device === 'mobile') {
		return <div>PROGRAM DETAIL PAGE</div>;
	} else {
		return (
			<div id={'property-detail-page'}>
				<div className={'container'}>
					<Stack className={'property-detail-config'}>
						<Stack className={'property-info-config'}>
							<Stack className={'info'}>
								<Stack className={'left-box'}>
									<Typography className={'title-main'}>{program?.programName}</Typography>
									<Stack className={'top-box'}>
										<Typography className={'city'}>{program?.programType}</Typography>
										<Stack className={'divider'}></Stack>
										<Typography className={'date'}>{moment().diff(program?.createdAt, 'days')} days ago</Typography>
									</Stack>
									<Stack className={'bottom-box'}>
										<Stack className="option">
											<Typography>{program?.programLevel}</Typography>
										</Stack>
										<Stack className="option">
											<Typography>{program?.programDuration} days</Typography>
										</Stack>
										<Stack className="option">
											<Typography>{program?.programMembers} enrolled</Typography>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'right-box'}>
									<Stack className="buttons">
										<Stack className="button-box">
											<RemoveRedEyeIcon fontSize="medium" />
											<Typography>{program?.programViews}</Typography>
										</Stack>
										<Stack className="button-box">
											<FavoriteBorderIcon
												fontSize={'medium'}
												// @ts-ignore
												onClick={() => likeProgramHandler(user, program?._id)}
											/>
											<Typography>{program?.programLikes}</Typography>
										</Stack>
									</Stack>
									<Typography>${program?.programPrice?.toLocaleString()}</Typography>
								</Stack>
							</Stack>
							<Stack className={'images'}>
								<Stack className={'main-image'}>
									<img
										src={slideImage || '/img/banner/header1.svg'}
										alt={'main-image'}
									/>
								</Stack>
								<Stack className={'sub-images'}>
									{program?.programImages?.map((subImg: string) => {
										return (
											<Stack className={'sub-img-box'} onClick={() => changeImageHandler(subImg)} key={subImg}>
												<img src={subImg} alt={'sub-image'} />
											</Stack>
										);
									})}
								</Stack>
							</Stack>
						</Stack>
						<Stack className={'property-desc-config'}>
							<Stack className={'left-config'}>
								<Stack className={'options-config'}>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Type</Typography>
											<Typography className={'option-data'}>{program?.programType}</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Level</Typography>
											<Typography className={'option-data'}>{program?.programLevel}</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Duration</Typography>
											<Typography className={'option-data'}>{program?.programDuration} days</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Members</Typography>
											<Typography className={'option-data'}>{program?.programMembers} enrolled</Typography>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'prop-desc-config'}>
									<Stack className={'top'}>
										<Typography className={'title'}>Program Description</Typography>
										<Typography className={'desc'}>{program?.programDesc ?? 'No Description!'}</Typography>
									</Stack>
									<Stack className={'bottom'}>
										<Typography className={'title'}>Program Details</Typography>
										<Stack className={'info-box'}>
											<Stack className={'left'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Price</Typography>
													<Typography className={'data'}>${program?.programPrice?.toLocaleString()}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Duration</Typography>
													<Typography className={'data'}>{program?.programDuration} days</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Level</Typography>
													<Typography className={'data'}>{program?.programLevel}</Typography>
												</Box>
											</Stack>
											<Stack className={'right'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Start Date</Typography>
													<Typography className={'data'}>{moment(program?.programStartDate).format('MMM DD, YYYY')}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>End Date</Typography>
													<Typography className={'data'}>{moment(program?.programEndDate).format('MMM DD, YYYY')}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Type</Typography>
													<Typography className={'data'}>{program?.programType}</Typography>
												</Box>
											</Stack>
										</Stack>
									</Stack>
								</Stack>

								{commentTotal !== 0 && (
									<Stack className={'reviews-config'}>
										<Stack className={'filter-box'}>
											<Stack className={'review-cnt'}>
												<Typography className={'reviews'}>{commentTotal} reviews</Typography>
											</Stack>
										</Stack>
										<Stack className={'review-list'}>
											{programComments?.map((comment: Comment) => {
												return <Review comment={comment} key={comment?._id} />;
											})}
											<Box component={'div'} className={'pagination-box'}>
												<MuiPagination
													page={commentInquiry.page}
													count={Math.ceil(commentTotal / commentInquiry.limit)}
													onChange={commentPaginationChangeHandler}
													shape="circular"
													color="primary"
												/>
											</Box>
										</Stack>
									</Stack>
								)}
								<Stack className={'leave-review-config'}>
									<Typography className={'main-title'}>Leave A Review</Typography>
									<Typography className={'review-title'}>Review</Typography>
									<textarea
										onChange={({ target: { value } }: any) => {
											setInsertCommentData({ ...insertCommentData, commentContent: value });
										}}
										value={insertCommentData.commentContent}
									></textarea>
									<Box className={'submit-btn'} component={'div'}>
										<Button
											className={'submit-review'}
											disabled={insertCommentData.commentContent === '' || user?._id === ''}
											onClick={createCommentHandler}
										>
											<Typography className={'title'}>Submit Review</Typography>
										</Button>
									</Box>
								</Stack>
							</Stack>
							<Stack className={'right-config'}>
								<Stack className={'info-box'}>
									<Typography className={'main-title'}>About The Trainer</Typography>
									<Stack className={'image-info'}>
										<img
											className={'member-image'}
											src={program?.memberData?.memberImage || '/img/profile/avatar-placeholder.png'}
										/>
										<Stack className={'name-phone-listings'}>
											<Link href={`/member?memberId=${program?.memberData?._id}`}>
												<Typography className={'name'}>{program?.memberData?.memberNick}</Typography>
											</Link>
											<Typography className={'listings'}>View Profile</Typography>
										</Stack>
									</Stack>
								</Stack>
							</Stack>
						</Stack>
						{similarPrograms.length !== 0 && (
							<Stack className={'similar-properties-config'}>
								<Stack className={'title-pagination-box'}>
									<Stack className={'title-box'}>
										<Typography className={'main-title'}>Similar Programs</Typography>
									</Stack>
									<Stack className={'pagination-box'}>
										<WestIcon className={'swiper-similar-prev'} />
										<div className={'swiper-similar-pagination'}></div>
										<EastIcon className={'swiper-similar-next'} />
									</Stack>
								</Stack>
								<Stack className={'cards-box'}>
									<Swiper
										className={'similar-homes-swiper'}
										slidesPerView={'auto'}
										spaceBetween={35}
										modules={[Autoplay, Navigation, Pagination]}
										navigation={{
											nextEl: '.swiper-similar-next',
											prevEl: '.swiper-similar-prev',
										}}
										pagination={{
											el: '.swiper-similar-pagination',
										}}
									>
										{similarPrograms.map((prog: Program) => {
											return (
												<SwiperSlide className={'similar-homes-slide'} key={prog._id}>
													<Stack className={'similar-program-card'}>
														<img src={prog?.programImages?.[0] || '/img/banner/header1.svg'} alt={prog.programName} />
														<Typography>{prog.programName}</Typography>
													</Stack>
												</SwiperSlide>
											);
										})}
									</Swiper>
								</Stack>
							</Stack>
						)}
					</Stack>
				</div>
			</div>
		);
	}
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
