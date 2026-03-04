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
import MyArticles from '../../libs/components/mypage/MyArticles';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
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

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const TABS = [
	{ key: 'myProfile', label: 'Profile' },
	{ key: 'myProperties', label: 'My Programs' },
	{ key: 'myFavorites', label: 'Saved' },
	{ key: 'recentlyVisited', label: 'Recent' },
	{ key: 'myArticles', label: 'Articles' },
	{ key: 'writeArticle', label: 'Write' },
	{ key: 'followers', label: 'Followers' },
	{ key: 'followings', label: 'Following' },
];

const TRAINER_TABS = [{ key: 'addProperty', label: 'Add Program' }, ...TABS];

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category: any = router.query?.category ?? 'myProfile';

	const tabs = user?.memberType === 'AGENT' ? TRAINER_TABS : TABS;

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
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
			if (!user._id) throw new Error(Messages.error2);
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
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Liked', 800);
			await refetch({ input: query });
		} catch (err: any) {
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
				{/* ── Profile Hero ── */}
				<div className={'mp-hero'}>
					<div className={'mp-cover'} />
					<div className={'container mp-hero-inner'}>
						<div className={'mp-avatar-wrap'}>
							<img
								src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
								alt={user?.memberNick}
								className={'mp-avatar'}
								onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }}
							/>
						</div>
						<div className={'mp-hero-info'}>
							<h2 className={'mp-name'}>{user?.memberNick || 'Athlete'}</h2>
							<span className={`mp-role mp-role--${(user?.memberType || 'user').toLowerCase()}`}>
								{user?.memberType === 'AGENT' ? 'TRAINER' : user?.memberType || 'MEMBER'}
							</span>
							{user?.memberPhone && (
								<span className={'mp-phone'}>{user.memberPhone}</span>
							)}
						</div>
						<div className={'mp-hero-actions'}>
							<button className={'mp-logout-btn'} onClick={logoutHandler}>
								<LogoutIcon fontSize="small" />
								Logout
							</button>
						</div>
					</div>
				</div>

				{/* ── Tabs ── */}
				<div className={'mp-tabs-bar'}>
					<div className={'container mp-tabs-inner'}>
						{tabs.map((tab) => (
							<Link key={tab.key} href={{ pathname: '/mypage', query: { category: tab.key } }} scroll={false}>
								<div className={`mp-tab ${category === tab.key ? 'active' : ''}`}>
									{tab.label}
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* ── Content ── */}
				<div className={'container mp-content'}>
					{category === 'addProperty' && <AddProperty />}
					{category === 'myProperties' && <MyProperties />}
					{category === 'myFavorites' && <MyFavorites />}
					{category === 'recentlyVisited' && <RecentlyVisited />}
					{category === 'myArticles' && <MyArticles />}
					{category === 'writeArticle' && <WriteArticle />}
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
