import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import { Dumbbell, Heart, History, Users, UserPlus, UserCircle, LogOut, PlusCircle } from 'lucide-react';

const MyMenu = () => {
	const router = useRouter();
	const category: any = router.query?.category ?? 'myProfile';
	const user = useReactiveVar(userVar);

	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	const menuItem = (key: string, label: string, Icon: any) => {
		const active = category === key;
		return (
			<Link href={{ pathname: '/mypage', query: { category: key } }} scroll={false}>
				<div className={`menu-item ${active ? 'active' : ''}`}>
					<Icon className={'menu-icon'} size={18} />
					<span>{label}</span>
				</div>
			</Link>
		);
	};

	return (
		<div className={'my-menu'}>
			{/* Profile Card */}
			<div className={'mm-profile'}>
				<div className={'mm-avatar-wrap'}>
					<img
						src={user?.memberImage || '/img/profile/defaultUser.svg'}
						alt={user?.memberNick}
						className={'mm-avatar'}
						onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }}
					/>
					<div className={'mm-avatar-ring'} />
				</div>
				<div className={'mm-user-info'}>
					<span className={'mm-nick'}>{user?.memberNick || 'Athlete'}</span>
					<span className={`mm-type mm-type--${(user?.memberType || 'USER').toLowerCase()}`}>
						{user?.memberType === 'TRAINER' ? 'TRAINER' : user?.memberType || 'MEMBER'}
					</span>
				</div>
			</div>

			{/* Nav Sections */}
			<div className={'mm-sections'}>
				{/* Training section */}
				<div className={'mm-section'}>
					<span className={'mm-section-label'}>MY TRAINING</span>
					{user?.memberType === 'TRAINER' && menuItem('addProperty', 'Add Program', PlusCircle)}
					{user?.memberType === 'TRAINER' && menuItem('myProperties', 'My Programs', Dumbbell)}
					{menuItem('myFavorites', 'Saved Programs', Heart)}
					{menuItem('recentlyVisited', 'Recent Views', History)}
				</div>

				{/* Network section */}
				<div className={'mm-section'}>
					<span className={'mm-section-label'}>NETWORK</span>
					{menuItem('followers', 'Followers', Users)}
					{menuItem('followings', 'Following', UserPlus)}
				</div>

				{/* Account section */}
				<div className={'mm-section'}>
					<span className={'mm-section-label'}>ACCOUNT</span>
					{menuItem('myProfile', 'Edit Profile', UserCircle)}
					<div className={'menu-item menu-item--logout'} onClick={logoutHandler}>
						<LogOut className={'menu-icon'} size={18} />
						<span>Logout</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MyMenu;
