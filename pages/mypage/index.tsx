import React from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Link from 'next/link';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import withAuth from '../../libs/components/layout/withAuth';
import MyProperties from '../../libs/components/mypage/MyProperties';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import AddProperty from '../../libs/components/mypage/AddNewProperty';
import AddProduct from '../../libs/components/mypage/AddNewProduct';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyProgressResults from '../../libs/components/mypage/MyProgressResults';
import MyBookmarks from '../../libs/components/mypage/MyBookmarks';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { GET_MEMBER } from '../../apollo/user/query';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FOLLOW_MEMBER, LIKE_TARGET_ITEM } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import { logOut } from '../../libs/auth';
import { sweetConfirmAlert } from '../../libs/sweetAlert';
import LogoutIcon from '@mui/icons-material/Logout';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const USER_TABS = [
	{ key: 'myProfile', label: 'Profile' },
	{ key: 'myFavorites', label: 'My Joinings' },
	{ key: 'myBookmarks', label: 'Saved Items' },
	{ key: 'myProgress', label: 'My Progress' },
	{ key: 'recentlyVisited', label: 'Recently Visited' },
	{ key: 'followers', label: 'Followers' },
	{ key: 'followings', label: 'Following' },
];

const AGENT_TABS = [
	{ key: 'myProfile', label: 'Profile' },
	{ key: 'myProperties', label: 'My Programs' },
	{ key: 'addProperty', label: 'Add Program' },
	{ key: 'myFavorites', label: 'My Joinings' },
	{ key: 'myBookmarks', label: 'Saved Items' },
	{ key: 'myProgress', label: 'My Progress' },
	{ key: 'recentlyVisited', label: 'Recently Visited' },
	{ key: 'followers', label: 'Followers' },
	{ key: 'followings', label: 'Following' },
];

const ADMIN_TABS = [
	{ key: 'myProfile', label: 'Profile' },
	{ key: 'addProduct', label: 'Add Product' },
	{ key: 'myFavorites', label: 'My Joinings' },
	{ key: 'myBookmarks', label: 'Saved Items' },
	{ key: 'recentlyVisited', label: 'Recently Visited' },
	{ key: 'followers', label: 'Followers' },
	{ key: 'followings', label: 'Following' },
	{ key: 'adminPanel', label: 'Admin Panel' },
];

const PLAN_LABEL: Record<string, string> = {
	BEGINNER: 'Beginner',
	REGULAR: 'Regular',
	ADVANCED: 'Advanced',
	PRO: 'Pro',
};

const getTabIcon = (key: string) => {
	switch (key) {
		case 'myProfile': return <PersonOutlineIcon fontSize="small" />;
		case 'myFavorites': return <CheckCircleOutlineIcon fontSize="small" />;
		case 'myBookmarks': return <BookmarkBorderIcon fontSize="small" />;
		case 'recentlyVisited': return <HistoryIcon fontSize="small" />;
		case 'followers': return <PeopleOutlineIcon fontSize="small" />;
		case 'followings': return <PersonOutlineIcon fontSize="small" />;
		case 'myProperties': return <FitnessCenterIcon fontSize="small" />;
		case 'addProperty': return <AddCircleOutlineIcon fontSize="small" />;
		case 'addProduct': return <AddCircleOutlineIcon fontSize="small" />;
		case 'adminPanel': return <AdminPanelSettingsOutlinedIcon fontSize="small" />;
		default: return null;
	}
};

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category: any = router.query?.category ?? 'myFavorites';
	const u = user as any;

	const getTabs = () => {
		if (u?.memberType === 'TRAINER') return AGENT_TABS;
		if (u?.memberType === 'ADMIN') return ADMIN_TABS;
		return USER_TABS;
	};
	const tabs = getTabs();

	/** APOLLO REQUESTS **/
	const { data: memberData } = useQuery(GET_MEMBER, {
		variables: { memberId: u?._id },
		skip: !u?._id,
		fetchPolicy: 'network-only',
	});
	const liveUser = memberData?.getMember;

	const [followMember] = useMutation(FOLLOW_MEMBER);
	const [likeTargetItem] = useMutation(LIKE_TARGET_ITEM);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!u._id) throw new Error(Messages.error2);
			await followMember({ variables: { input: { followingId: id } } });
			await sweetTopSmallSuccessAlert('Subscribed', 800);
			await refetch(query);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!u._id) throw new Error(Messages.error2);
			await followMember({ variables: { input: { followingId: id } } });
			await sweetTopSmallSuccessAlert('UnSubscribed', 800);
			await refetch(query);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!u._id) throw new Error(Messages.error2);
			await likeTargetItem({ variables: { input: { likeGroup: 'MEMBER', likeRefId: id } } });
			await sweetTopSmallSuccessAlert('Liked', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === u?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	if (device === 'mobile') {
		return <div>MY PAGE</div>;
	} else {
		return (
			<div id="my-page">
				<div className={'container mp-wrap'}>

					{/* ── Profile Card ── */}
					<div className={'mp-card'}>
						<div className={'mp-avatar-wrap'}>
							{u?.memberImage ? (
								<img
									src={u.memberImage}
									alt={u?.memberNick}
									className={'mp-avatar'}
									onError={(e) => {
										(e.target as HTMLImageElement).style.display = 'none';
									}}
								/>
							) : (
								<div className={'mp-avatar-initial'}>
									{(u?.memberNick || 'A')[0].toUpperCase()}
								</div>
							)}
						</div>

						<div className={'mp-info'}>
							<div className={'mp-name-row'}>
								<h2 className={'mp-name'}>{u?.memberNick || 'Athlete'}</h2>
								<span className={`mp-role mp-role--${(u?.memberType || 'user').toLowerCase()}`}>
									{u?.memberType === 'TRAINER' ? 'TRAINER' : u?.memberType || 'USER'}
								</span>
								{u?.memberPlan && (
									<span className={`mp-plan mp-plan--${u.memberPlan.toLowerCase()}`}>
										{PLAN_LABEL[u.memberPlan] ?? u.memberPlan}
									</span>
								)}
							</div>

							{u?.memberDesc && <p className={'mp-bio'}>{u.memberDesc}</p>}

							<div className={'mp-stats-row'}>
								{u?.memberType === 'TRAINER' && (
									<div className={'mp-stat'}>
										<strong>{liveUser?.memberPrograms ?? u?.memberPrograms ?? 0}</strong>
										<span>PROGRAMS</span>
									</div>
								)}
								<div className={'mp-stat'}>
									<strong>{liveUser?.memberFollowers ?? u?.memberFollowers ?? 0}</strong>
									<span>FOLLOWERS</span>
								</div>
								<div className={'mp-stat'}>
									<strong>{liveUser?.memberFollowings ?? u?.memberFollowings ?? 0}</strong>
									<span>FOLLOWING</span>
								</div>
								<div className={'mp-stat'}>
									<strong>{liveUser?.memberPoints ?? u?.memberPoints ?? 0}</strong>
									<span>POINTS</span>
								</div>
							</div>
						</div>

						<div className={'mp-card-actions'}>
							<Link href={{ pathname: '/mypage', query: { category: 'myProfile' } }} scroll={false}>
								<button className={'mp-edit-btn'}>
									<EditOutlinedIcon fontSize="small" />
									Edit Profile
								</button>
							</Link>
							<button className={'mp-logout-btn'} onClick={logoutHandler}>
								<LogoutIcon fontSize="small" />
								Logout
							</button>
						</div>
					</div>

					{/* ── Tab Bar ── */}
					<div className={'mp-tabs-bar'}>
						{tabs.map((tab) => (
							<Link
								key={tab.key}
								href={
									tab.key === 'adminPanel'
										? '/_admin'
										: { pathname: '/mypage', query: { category: tab.key } }
								}
								scroll={false}
							>
								<div
									className={`mp-tab ${category === tab.key ? 'active' : ''} ${
										tab.key === 'adminPanel' ? 'mp-tab--admin' : ''
									}`}
								>
									{getTabIcon(tab.key)}
									<span>{tab.label}</span>
								</div>
							</Link>
						))}
					</div>

					{/* ── Content ── */}
					<div className={'mp-content'}>
						{category === 'addProperty' && <AddProperty />}
					{category === 'addProduct' && <AddProduct />}
						{category === 'myProperties' && <MyProperties />}
						{category === 'myFavorites' && <MyFavorites />}
						{category === 'myBookmarks' && <MyBookmarks />}
						{category === 'myProgress' && <MyProgressResults />}
						{category === 'recentlyVisited' && <RecentlyVisited />}
						{category === 'myProfile' && <MyProfile />}
						{category === 'followers' && u?._id && (
							<MemberFollowers
								subscribeHandler={subscribeHandler}
								unsubscribeHandler={unsubscribeHandler}
								likeMemberHandler={likeMemberHandler}
								redirectToMemberPageHandler={redirectToMemberPageHandler}
							/>
						)}
						{category === 'followings' && u?._id && (
							<MemberFollowings
								subscribeHandler={subscribeHandler}
								unsubscribeHandler={unsubscribeHandler}
								likeMemberHandler={likeMemberHandler}
								redirectToMemberPageHandler={redirectToMemberPageHandler}
							/>
						)}
					</div>

				</div>
			</div>
		);
	}
};

export default withAuth(withLayoutBasic(MyPage));
