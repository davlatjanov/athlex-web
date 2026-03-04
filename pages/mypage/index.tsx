import React from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Link from 'next/link';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyProperties from '../../libs/components/mypage/MyProperties';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import AddProperty from '../../libs/components/mypage/AddNewProperty';
import MyProfile from '../../libs/components/mypage/MyProfile';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import { REACT_APP_API_URL } from '../../libs/config';
import { logOut } from '../../libs/auth';
import { sweetConfirmAlert } from '../../libs/sweetAlert';
import LogoutIcon from '@mui/icons-material/Logout';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import HistoryIcon from '@mui/icons-material/History';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

// ── Tab definitions per role ──────────────────────────────
const USER_TABS = [
	{ key: 'myProfile', label: 'Profile' },
	{ key: 'myFavorites', label: 'Saved Programs' },
	{ key: 'recentlyVisited', label: 'Recent' },
	{ key: 'followers', label: 'Followers' },
	{ key: 'followings', label: 'Following' },
];

const AGENT_TABS = [
	{ key: 'myProfile', label: 'Profile' },
	{ key: 'myProperties', label: 'My Programs' },
	{ key: 'addProperty', label: 'Add Program' },
	{ key: 'myFavorites', label: 'Saved' },
	{ key: 'recentlyVisited', label: 'Recent' },
	{ key: 'followers', label: 'Followers' },
	{ key: 'followings', label: 'Following' },
];

const ADMIN_TABS = [
	{ key: 'myProfile', label: 'Profile' },
	{ key: 'myFavorites', label: 'Saved' },
	{ key: 'recentlyVisited', label: 'Recent' },
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

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category: any = router.query?.category ?? 'dashboard';
	const u = user as any;

	const getTabs = () => {
		if (u?.memberType === 'AGENT') return AGENT_TABS;
		if (u?.memberType === 'ADMIN') return ADMIN_TABS;
		return USER_TABS;
	};
	const tabs = getTabs();

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!u._id) throw new Error(Messages.error2);
			await subscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Subscribed', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!u._id) throw new Error(Messages.error2);
			await unsubscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('UnSubscribed', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!u._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
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

	// ── Role-based bento grids ────────────────────────────

	const UserBento = () => (
		<div className={'mp-bento'}>
			{/* Saved Programs — 2×2 hero tile (teal accent) */}
			<Link href={{ pathname: '/mypage', query: { category: 'myFavorites' } }} scroll={false}>
				<div className={'mp-tile mp-tile--saved-big'}>
					<BookmarkBorderIcon className={'tile-icon'} />
					<div className={'tile-body'}>
						<span className={'tile-label'}>SAVED PROGRAMS</span>
						<strong className={'tile-count'}>0</strong>
						<p className={'tile-desc'}>Your bookmarked training programs</p>
					</div>
					<ArrowForwardIosIcon className={'tile-arrow'} />
				</div>
			</Link>

			{/* Followers */}
			<Link href={{ pathname: '/mypage', query: { category: 'followers' } }} scroll={false}>
				<div className={'mp-tile mp-tile--followers'}>
					<PeopleOutlineIcon className={'tile-icon'} />
					<span className={'tile-label'}>FOLLOWERS</span>
					<strong className={'tile-count'}>{u?.memberFollowers ?? 0}</strong>
					<p className={'tile-desc'}>People following you</p>
				</div>
			</Link>

			{/* Following */}
			<Link href={{ pathname: '/mypage', query: { category: 'followings' } }} scroll={false}>
				<div className={'mp-tile mp-tile--following'}>
					<PersonOutlineIcon className={'tile-icon'} />
					<span className={'tile-label'}>FOLLOWING</span>
					<strong className={'tile-count'}>{u?.memberFollowings ?? 0}</strong>
					<p className={'tile-desc'}>Trainers you follow</p>
				</div>
			</Link>

			{/* Recent */}
			<Link href={{ pathname: '/mypage', query: { category: 'recentlyVisited' } }} scroll={false}>
				<div className={'mp-tile mp-tile--recent'}>
					<HistoryIcon className={'tile-icon'} />
					<span className={'tile-label'}>RECENT</span>
					<strong className={'tile-count'}>0</strong>
					<p className={'tile-desc'}>Recently viewed</p>
				</div>
			</Link>

			{/* Points */}
			<Link href={{ pathname: '/mypage', query: { category: 'myProfile' } }} scroll={false}>
				<div className={'mp-tile mp-tile--points'}>
					<EmojiEventsOutlinedIcon className={'tile-icon'} />
					<span className={'tile-label'}>POINTS</span>
					<strong className={'tile-count'}>{u?.memberPoints ?? 0}</strong>
					<p className={'tile-desc'}>Rank #{u?.memberRank ?? '—'}</p>
				</div>
			</Link>
		</div>
	);

	const AgentBento = () => (
		<div className={'mp-bento'}>
			{/* My Programs — 2×2 hero tile (green accent) */}
			<Link href={{ pathname: '/mypage', query: { category: 'myProperties' } }} scroll={false}>
				<div className={'mp-tile mp-tile--programs'}>
					<FitnessCenterIcon className={'tile-icon'} />
					<div className={'tile-body'}>
						<span className={'tile-label'}>MY PROGRAMS</span>
						<strong className={'tile-count'}>{u?.memberProperties ?? 0}</strong>
						<p className={'tile-desc'}>Training programs you manage</p>
					</div>
					<ArrowForwardIosIcon className={'tile-arrow'} />
				</div>
			</Link>

			{/* Add Program — 1×1 green CTA */}
			<Link href={{ pathname: '/mypage', query: { category: 'addProperty' } }} scroll={false}>
				<div className={'mp-tile mp-tile--add-program'}>
					<AddCircleOutlineIcon className={'tile-icon'} />
					<span className={'tile-label'}>ADD PROGRAM</span>
					<p className={'tile-desc'}>Create a new training program</p>
				</div>
			</Link>

			{/* Followers / Students */}
			<Link href={{ pathname: '/mypage', query: { category: 'followers' } }} scroll={false}>
				<div className={'mp-tile mp-tile--followers'}>
					<PeopleOutlineIcon className={'tile-icon'} />
					<span className={'tile-label'}>STUDENTS</span>
					<strong className={'tile-count'}>{u?.memberFollowers ?? 0}</strong>
					<p className={'tile-desc'}>People following you</p>
				</div>
			</Link>

			{/* Following */}
			<Link href={{ pathname: '/mypage', query: { category: 'followings' } }} scroll={false}>
				<div className={'mp-tile mp-tile--following'}>
					<PersonOutlineIcon className={'tile-icon'} />
					<span className={'tile-label'}>FOLLOWING</span>
					<strong className={'tile-count'}>{u?.memberFollowings ?? 0}</strong>
					<p className={'tile-desc'}>Trainers you follow</p>
				</div>
			</Link>

			{/* Points */}
			<Link href={{ pathname: '/mypage', query: { category: 'myProfile' } }} scroll={false}>
				<div className={'mp-tile mp-tile--points'}>
					<EmojiEventsOutlinedIcon className={'tile-icon'} />
					<span className={'tile-label'}>POINTS</span>
					<strong className={'tile-count'}>{u?.memberPoints ?? 0}</strong>
					<p className={'tile-desc'}>Rank #{u?.memberRank ?? '—'}</p>
				</div>
			</Link>
		</div>
	);

	const AdminBento = () => (
		<div className={'mp-bento'}>
			{/* Admin Panel — 2×2 hero tile (blue accent) */}
			<Link href={'/_admin'}>
				<div className={'mp-tile mp-tile--admin-panel'}>
					<AdminPanelSettingsOutlinedIcon className={'tile-icon'} />
					<div className={'tile-body'}>
						<span className={'tile-label'}>ADMIN PANEL</span>
						<p className={'tile-desc'}>Manage users, programs, and platform settings</p>
					</div>
					<ArrowForwardIosIcon className={'tile-arrow'} />
				</div>
			</Link>

			{/* Followers */}
			<Link href={{ pathname: '/mypage', query: { category: 'followers' } }} scroll={false}>
				<div className={'mp-tile mp-tile--followers'}>
					<PeopleOutlineIcon className={'tile-icon'} />
					<span className={'tile-label'}>FOLLOWERS</span>
					<strong className={'tile-count'}>{u?.memberFollowers ?? 0}</strong>
					<p className={'tile-desc'}>People following you</p>
				</div>
			</Link>

			{/* Following */}
			<Link href={{ pathname: '/mypage', query: { category: 'followings' } }} scroll={false}>
				<div className={'mp-tile mp-tile--following'}>
					<PersonOutlineIcon className={'tile-icon'} />
					<span className={'tile-label'}>FOLLOWING</span>
					<strong className={'tile-count'}>{u?.memberFollowings ?? 0}</strong>
					<p className={'tile-desc'}>Trainers you follow</p>
				</div>
			</Link>

			{/* Saved */}
			<Link href={{ pathname: '/mypage', query: { category: 'myFavorites' } }} scroll={false}>
				<div className={'mp-tile mp-tile--saved'}>
					<BookmarkBorderIcon className={'tile-icon'} />
					<span className={'tile-label'}>SAVED</span>
					<strong className={'tile-count'}>0</strong>
					<p className={'tile-desc'}>Bookmarked programs</p>
				</div>
			</Link>

			{/* Points */}
			<Link href={{ pathname: '/mypage', query: { category: 'myProfile' } }} scroll={false}>
				<div className={'mp-tile mp-tile--points'}>
					<EmojiEventsOutlinedIcon className={'tile-icon'} />
					<span className={'tile-label'}>POINTS</span>
					<strong className={'tile-count'}>{u?.memberPoints ?? 0}</strong>
					<p className={'tile-desc'}>Rank #{u?.memberRank ?? '—'}</p>
				</div>
			</Link>
		</div>
	);

	const renderBento = () => {
		if (u?.memberType === 'AGENT') return <AgentBento />;
		if (u?.memberType === 'ADMIN') return <AdminBento />;
		return <UserBento />;
	};

	if (device === 'mobile') {
		return <div>MY PAGE</div>;
	} else {
		return (
			<div id="my-page">
				{/* ── Profile Hero ── */}
				<div className={'mp-hero'}>
					<div
					className={'mp-cover'}
					style={{
						backgroundImage: `url('https://images.pexels.com/photos/4498483/pexels-photo-4498483.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&dpr=1')`,
						backgroundSize: 'cover',
						backgroundPosition: 'center 30%',
					}}
				/>
					<div className={'container mp-hero-inner'}>
						<div className={'mp-avatar-wrap'}>
							<img
								src={u?.memberImage ? `${REACT_APP_API_URL}/${u?.memberImage}` : '/img/profile/defaultUser.svg'}
								alt={u?.memberNick}
								className={'mp-avatar'}
								onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }}
							/>
						</div>

						<div className={'mp-hero-info'}>
							<div className={'mp-name-row'}>
								<h2 className={'mp-name'}>{u?.memberNick || 'Athlete'}</h2>
								<span className={`mp-role mp-role--${(u?.memberType || 'user').toLowerCase()}`}>
									{u?.memberType === 'AGENT' ? 'TRAINER' : u?.memberType || 'MEMBER'}
								</span>
								{u?.memberPlan && (
									<span className={`mp-plan mp-plan--${u.memberPlan.toLowerCase()}`}>
										{PLAN_LABEL[u.memberPlan] ?? u.memberPlan}
									</span>
								)}
							</div>

							{u?.memberDesc && (
								<p className={'mp-bio'}>{u.memberDesc}</p>
							)}

							<div className={'mp-stats-row'}>
								{u?.memberType === 'AGENT' && (
									<>
										<div className={'mp-stat'}>
											<strong>{u?.memberProperties ?? 0}</strong>
											<span>Programs</span>
										</div>
										<div className={'mp-stat-divider'} />
									</>
								)}
								<div className={'mp-stat'}>
									<strong>{u?.memberFollowers ?? 0}</strong>
									<span>Followers</span>
								</div>
								<div className={'mp-stat-divider'} />
								<div className={'mp-stat'}>
									<strong>{u?.memberFollowings ?? 0}</strong>
									<span>Following</span>
								</div>
								<div className={'mp-stat-divider'} />
								<div className={'mp-stat'}>
									<strong>{u?.memberPoints ?? 0}</strong>
									<span>Points</span>
								</div>
							</div>
						</div>

						<div className={'mp-hero-actions'}>
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
				</div>

				{/* ── Tabs (role-specific) ── */}
				<div className={'mp-tabs-bar'}>
					<div className={'container mp-tabs-inner'}>
						{tabs.map((tab) => (
							<Link
								key={tab.key}
								href={tab.key === 'adminPanel' ? '/_admin' : { pathname: '/mypage', query: { category: tab.key } }}
								scroll={false}
							>
								<div className={`mp-tab ${category === tab.key ? 'active' : ''} ${tab.key === 'adminPanel' ? 'mp-tab--admin' : ''}`}>
									{tab.label}
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* ── Content ── */}
				<div className={'container mp-content'}>
					{category === 'dashboard' && renderBento()}
					{category === 'addProperty' && <AddProperty />}
					{category === 'myProperties' && <MyProperties />}
					{category === 'myFavorites' && <MyFavorites />}
					{category === 'recentlyVisited' && <RecentlyVisited />}
					{category === 'myProfile' && <MyProfile />}
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
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(MyPage);
