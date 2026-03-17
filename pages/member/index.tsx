import React, { useEffect } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import MemberMenu from '../../libs/components/member/MemberMenu';
import MemberPrograms from '../../libs/components/member/MemberPrograms';
import { useRouter } from 'next/router';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import MemberProgressPosts from '../../libs/components/member/MemberProgressPosts';
import MemberReviews from '../../libs/components/member/MemberReviews';
import MemberActivity from '../../libs/components/member/MemberActivity';
import MemberJoinedPrograms from '../../libs/components/member/MemberJoinedPrograms';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FOLLOW_MEMBER, LIKE_TARGET_ITEM } from '../../apollo/user/mutation';
import { GET_MEMBER } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import Link from 'next/link';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MemberPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const category: any = router.query?.category;
	const memberId = router.query?.memberId as string;
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [followMember] = useMutation(FOLLOW_MEMBER);
	const [likeTargetItem] = useMutation(LIKE_TARGET_ITEM);
	const { data: memberData } = useQuery(GET_MEMBER, { variables: { memberId }, skip: !memberId });
	const m = memberData?.getMember;
	const isTrainer = m?.memberType === 'TRAINER';

	const getRank = (points: number) => {
		if (points >= 10000) return { label: 'Elite', color: '#FFD700', next: null, progress: 100 };
		if (points >= 5000) return { label: 'Platinum', color: '#E5E4E2', next: 10000, progress: ((points - 5000) / 5000) * 100 };
		if (points >= 1000) return { label: 'Gold', color: '#FFA500', next: 5000, progress: ((points - 1000) / 4000) * 100 };
		if (points >= 300) return { label: 'Silver', color: '#C0C0C0', next: 1000, progress: ((points - 300) / 700) * 100 };
		return { label: 'Bronze', color: '#CD7F32', next: 300, progress: (points / 300) * 100 };
	};
	const rank = getRank(m?.memberPoints ?? 0);


	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		if (!category) {
			router.replace(
				{
					pathname: router.pathname,
					query: { ...router.query, category: isTrainer ? 'programs' : 'followers' },
				},
				undefined,
				{ shallow: true },
			);
		}
	}, [category, router, isTrainer]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await followMember({
				variables: {
					input: { followingId: id },
				},
			});
			await sweetTopSmallSuccessAlert('Followed', 800);
			await refetch(query);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await followMember({
				variables: {
					input: { followingId: id },
				},
			});
			await sweetTopSmallSuccessAlert('Unfollowed', 800);
			await refetch(query);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetItem({
				variables: {
					input: { likeGroup: 'MEMBER', likeRefId: id },
				},
			});
			await sweetTopSmallSuccessAlert('Liked', 800);
			await refetch(query);
		} catch (err: any) {
			console.log('ERROR likeMemberHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	if (device === 'mobile') {
		return <>MEMBER PAGE MOBILE</>;
	} else {
		return (
			<div id="member-page" style={{ position: 'relative' }}>
				{/* Hero — same structure as other pages */}
				<div className="header-basic member-header">
					<div className="container hb-container">
						<img
							src="https://i.pinimg.com/1200x/9b/8a/28/9b8a28b9f215bc6d85b1b8ff4c33cde4.jpg"
							alt=""
							className="hb-bg-img"
						/>
						<div className="hb-overlay" />
						<div className="hb-text">
							<strong className="hb-title">Athlete Profile</strong>
							<span className="hb-desc">Track progress · Build connections</span>
						</div>
					</div>
				</div>

				{/* Profile Strip */}
				<div className="member-profile-strip">
					<div className="container">
						<MemberMenu subscribeHandler={subscribeHandler} unsubscribeHandler={unsubscribeHandler} />
					</div>
				</div>

				{/* Stats + Rank Dashboard */}
				{m && (
					<div className="member-dashboard">
						<div className="container">
							{/* Stats Row */}
							<div className="md-stats">
								<div className="md-stat">
									<span className="md-stat-value">{m.memberPrograms ?? 0}</span>
									<span className="md-stat-label">Programs</span>
								</div>
								<div className="md-stat">
									<span className="md-stat-value">{m.memberFollowers ?? 0}</span>
									<span className="md-stat-label">Followers</span>
								</div>
								<div className="md-stat">
									<span className="md-stat-value">{m.memberFollowings ?? 0}</span>
									<span className="md-stat-label">Following</span>
								</div>
								<div className="md-stat">
									<span className="md-stat-value">{m.memberLikes ?? 0}</span>
									<span className="md-stat-label">Likes</span>
								</div>
								<div className="md-stat">
									<span className="md-stat-value">{m.memberViews ?? 0}</span>
									<span className="md-stat-label">Profile Views</span>
								</div>
							</div>

							{/* Rank Card */}
							<div className="md-rank-card">
								<div className="md-rank-left">
									<span className="md-rank-badge" style={{ color: rank.color, borderColor: rank.color }}>
										{rank.label}
									</span>
									<div className="md-rank-info">
										<span className="md-points">{(m.memberPoints ?? 0).toLocaleString()} pts</span>
										{rank.next && (
											<span className="md-rank-next">{rank.next.toLocaleString()} pts to next tier</span>
										)}
									</div>
								</div>
								<div className="md-rank-bar-wrap">
									<div className="md-rank-bar">
										<div className="md-rank-bar-fill" style={{ width: `${rank.progress}%`, background: rank.color }} />
									</div>
									{rank.next && <span className="md-rank-pct">{Math.round(rank.progress)}%</span>}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Tab Navigation */}
				<nav className="member-tabs">
					<div className="container">
						{isTrainer && (
							<Link
								href={{ pathname: '/member', query: { ...router.query, category: 'programs' } }}
								scroll={false}
								className={category === 'programs' ? 'active' : ''}
							>
								Programs
							</Link>
						)}
						<Link
							href={{ pathname: '/member', query: { ...router.query, category: 'followers' } }}
							scroll={false}
							className={category === 'followers' ? 'active' : ''}
						>
							Followers
						</Link>
						<Link
							href={{ pathname: '/member', query: { ...router.query, category: 'followings' } }}
							scroll={false}
							className={category === 'followings' ? 'active' : ''}
						>
							Followings
						</Link>
						<Link
							href={{ pathname: '/member', query: { ...router.query, category: 'progress' } }}
							scroll={false}
							className={category === 'progress' ? 'active' : ''}
						>
							Progress
						</Link>
						<Link
							href={{ pathname: '/member', query: { ...router.query, category: 'reviews' } }}
							scroll={false}
							className={category === 'reviews' ? 'active' : ''}
						>
							Reviews
						</Link>
						<Link
							href={{ pathname: '/member', query: { ...router.query, category: 'activity' } }}
							scroll={false}
							className={category === 'activity' ? 'active' : ''}
						>
							Activity
						</Link>
						<Link
							href={{ pathname: '/member', query: { ...router.query, category: 'joined' } }}
							scroll={false}
							className={category === 'joined' ? 'active' : ''}
						>
							Joined Programs
						</Link>
					</div>
				</nav>

				{/* Content */}
				<div className="container">
					<Stack className={'member-page'}>
						<div className="member-content">
							<div className="list-config">
								{category === 'programs' && isTrainer && <MemberPrograms />}
								{category === 'followers' && (
									<MemberFollowers
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
								{category === 'followings' && (
									<MemberFollowings
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
								{category === 'progress' && <MemberProgressPosts />}
								{category === 'reviews' && <MemberReviews />}
								{category === 'activity' && <MemberActivity />}
								{category === 'joined' && <MemberJoinedPrograms />}
							</div>
						</div>
					</Stack>
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(MemberPage);
