import React from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import withAuth from '../../libs/components/layout/withAuth';
import MyPrograms from '../../libs/components/mypage/MyPrograms';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import AddProgram from '../../libs/components/mypage/AddNewProgram';
import AddProduct from '../../libs/components/mypage/AddNewProduct';
import AdminUsers from '../../libs/components/mypage/AdminUsers';
import AdminPrograms from '../../libs/components/mypage/AdminPrograms';
import AdminProductsList from '../../libs/components/mypage/AdminProductsList';
import MyOrders from '../../libs/components/mypage/MyOrders';
import AdminOrders from '../../libs/components/mypage/AdminOrders';
import AdminComments from '../../libs/components/mypage/AdminComments';
import AdminFeedback from '../../libs/components/mypage/AdminFeedback';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyProgressResults from '../../libs/components/mypage/MyProgressResults';
import MyBookmarks from '../../libs/components/mypage/MyBookmarks';
import MyStudents from '../../libs/components/mypage/MyStudents';
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
import { LogOut as LogoutIcon, Pencil as EditOutlinedIcon, Dumbbell as FitnessCenterIcon, Bookmark as BookmarkBorderIcon, CheckCircle as CheckCircleOutlineIcon, History as HistoryIcon, Users as PeopleOutlineIcon, User as PersonOutlineIcon, PlusCircle as AddCircleOutlineIcon, ShieldCheck as AdminPanelSettingsOutlinedIcon, PlayCircle as PlayCircleOutlineIcon, Store as StorefrontOutlinedIcon, ShoppingCart as ShoppingCartOutlinedIcon } from 'lucide-react';


export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const USER_TABS = [
	{ key: 'myProfile', label: 'Profile' },
	{ key: 'myFavorites', label: 'My Joinings' },
	{ key: 'myOrders', label: 'My Orders' },
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
	{ key: 'myStudents', label: 'My Students' },
	{ key: 'myOrders', label: 'My Orders' },
	{ key: 'myBookmarks', label: 'Saved Items' },
	{ key: 'myProgress', label: 'My Progress' },
	{ key: 'recentlyVisited', label: 'Recently Visited' },
	{ key: 'followers', label: 'Followers' },
	{ key: 'followings', label: 'Following' },
];

const ADMIN_TABS = [
	{ key: 'myProfile', label: 'Profile' },
	{ key: 'addProduct', label: 'Add Product' },
	{ key: 'adminUsers', label: 'Users' },
	{ key: 'adminPrograms', label: 'Programs' },
	{ key: 'adminProducts', label: 'Products' },
	{ key: 'adminOrders', label: 'Orders' },
	{ key: 'adminComments', label: 'Comments' },
	{ key: 'adminFeedback', label: 'Reviews' },
	{ key: 'followers', label: 'Followers' },
	{ key: 'followings', label: 'Following' },
];

const PLAN_LABEL: Record<string, string> = {
	BEGINNER: 'Beginner',
	REGULAR: 'Regular',
	ADVANCED: 'Advanced',
	PRO: 'Pro',
};

const getTabIcon = (key: string) => {
	switch (key) {
		case 'myProfile':
			return <PersonOutlineIcon size={16} />;
		case 'myFavorites':
			return <CheckCircleOutlineIcon size={16} />;
		case 'myStudents':
			return <PeopleOutlineIcon size={16} />;
		case 'myBookmarks':
			return <BookmarkBorderIcon size={16} />;
		case 'recentlyVisited':
			return <HistoryIcon size={16} />;
		case 'followers':
			return <PeopleOutlineIcon size={16} />;
		case 'followings':
			return <PersonOutlineIcon size={16} />;
		case 'myProperties':
			return <FitnessCenterIcon size={16} />;
		case 'addProperty':
			return <AddCircleOutlineIcon size={16} />;
		case 'addProduct':
			return <AddCircleOutlineIcon size={16} />;
		case 'adminUsers':
			return <PeopleOutlineIcon size={16} />;
		case 'adminPrograms':
			return <PlayCircleOutlineIcon size={16} />;
		case 'adminProducts':
			return <StorefrontOutlinedIcon size={16} />;
		case 'adminPanel':
			return <AdminPanelSettingsOutlinedIcon size={16} />;
		case 'myOrders':
			return <ShoppingCartOutlinedIcon size={16} />;
		case 'adminOrders':
			return <ShoppingCartOutlinedIcon size={16} />;
		case 'adminComments':
			return <PeopleOutlineIcon size={16} />;
		case 'adminFeedback':
			return <StorefrontOutlinedIcon size={16} />;
		default:
			return null;
	}
};

const MyPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const u = user as any;
	const rawCategory = router.query?.category as string | undefined;
	const category: string = rawCategory ?? (u?.memberType === 'ADMIN' ? 'adminUsers' : 'myFavorites');

	const getTabs = () => {
		if (u?.memberType === 'TRAINER') return AGENT_TABS;
		if (u?.memberType === 'ADMIN') return ADMIN_TABS;
		return USER_TABS;
	};
	const tabs = getTabs();

	/** APOLLO REQUESTS **/
	const { data: memberData, refetch: refetchMember } = useQuery(GET_MEMBER, {
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
			refetchMember();
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
			refetchMember();
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

	return (
			<div id="my-page">
				<Head><title>Athlex | My Dashboard</title></Head>
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
								<div className={'mp-avatar-initial'}>{(u?.memberNick || 'A')[0].toUpperCase()}</div>
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
									<EditOutlinedIcon size={16} />
									Edit Profile
								</button>
							</Link>
							<button className={'mp-logout-btn'} onClick={logoutHandler}>
								<LogoutIcon size={16} />
								Logout
							</button>
						</div>
					</div>

					{/* ── Tab Bar ── */}
					<div className={'mp-tabs-bar'}>
						{tabs.map((tab) => (
							<Link key={tab.key} href={{ pathname: '/mypage', query: { category: tab.key } }} scroll={false}>
								<div className={`mp-tab ${category === tab.key ? 'active' : ''}`}>
									{getTabIcon(tab.key)}
									<span>{tab.label}</span>
								</div>
							</Link>
						))}
					</div>

					{/* ── Content ── */}
					<div className={'mp-content'}>
						{category === 'addProperty' && <AddProgram />}
						{category === 'addProduct' && <AddProduct />}
						{category === 'myProperties' && <MyPrograms />}
						{category === 'myFavorites' && <MyFavorites />}
						{category === 'myStudents' && <MyStudents />}
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
						{category === 'myOrders' && <MyOrders />}
						{category === 'adminUsers' && <AdminUsers />}
						{category === 'adminPrograms' && <AdminPrograms />}
						{category === 'adminProducts' && <AdminProductsList />}
						{category === 'adminOrders' && <AdminOrders />}
						{category === 'adminComments' && <AdminComments />}
						{category === 'adminFeedback' && <AdminFeedback />}
					</div>
				</div>
			</div>
	);
};

export default withAuth(withLayoutBasic(MyPage));
