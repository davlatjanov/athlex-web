import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

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
					<Icon className={'menu-icon'} />
					<span>{label}</span>
				</div>
			</Link>
		);
	};

	return (
		<Stack className={'my-menu'}>
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
					{user?.memberType === 'TRAINER' && menuItem('addProperty', 'Add Program', AddCircleOutlineIcon)}
					{user?.memberType === 'TRAINER' && menuItem('myProperties', 'My Programs', FitnessCenterIcon)}
					{menuItem('myFavorites', 'Saved Programs', FavoriteIcon)}
					{menuItem('recentlyVisited', 'Recent Views', HistoryIcon)}
				</div>

				{/* Network section */}
				<div className={'mm-section'}>
					<span className={'mm-section-label'}>NETWORK</span>
					{menuItem('followers', 'Followers', PeopleIcon)}
					{menuItem('followings', 'Following', PersonAddIcon)}
				</div>

				{/* Account section */}
				<div className={'mm-section'}>
					<span className={'mm-section-label'}>ACCOUNT</span>
					{menuItem('myProfile', 'Edit Profile', AccountCircleIcon)}
					<div className={'menu-item menu-item--logout'} onClick={logoutHandler}>
						<LogoutIcon className={'menu-icon'} />
						<span>Logout</span>
					</div>
				</div>
			</div>
		</Stack>
	);
};

export default MyMenu;
