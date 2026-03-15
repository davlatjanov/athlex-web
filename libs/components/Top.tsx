import React, { useEffect } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box, Badge } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { useCart } from '../context/CartContext';


const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const cart = useCart();
	const [colorChange, setColorChange] = useState(false);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
	const notifOpen = Boolean(notifAnchor);

	/** LIFECYCLES **/
	useEffect(() => {
		switch (router.pathname) {
			case '/programs/[id]':
				setBgColor(true);
				break;
			default:
				break;
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	/** HANDLERS **/
	const changeNavbarColor = () => {
		if (window.scrollY >= 50) {
			setColorChange(true);
		} else {
			setColorChange(false);
		}
	};

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', changeNavbarColor);
	}

	if (device == 'mobile') {
		return (
			<Stack className={'top'}>
				<Link href={'/'}>
					<div>{t('Home')}</div>
				</Link>
				<Link href={'/programs'}>
					<div>{t('Programs')}</div>
				</Link>
				<Link href={'/products'}>
					<div>{t('Shop')}</div>
				</Link>
				{user?._id ? (
					<Link href={'/mypage'}>
						<div>{t('My Page')}</div>
					</Link>
				) : (
					<Link href={'/account/join'}>
						<div>
							{t('Login')} / {t('Register')}
						</div>
					</Link>
				)}
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar'}>
				<Stack className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}>
					<Stack className={'container'}>
						<Box component={'div'} className={'logo-box'}>
							<Link href={'/'}>
								<span className={'logo-name'}>ATHLEX</span>
							</Link>
						</Box>
						<Box component={'div'} className={'router-box'}>
							<Link href={'/'}>
								<div>{t('Home')}</div>
							</Link>
							<Link href={'/programs'}>
								<div>{t('Programs')}</div>
							</Link>
							<Link href={'/trainer'}>
								<div>{t('Trainers')}</div>
							</Link>
							<Link href={'/products'}>
								<div>{t('Shop')}</div>
							</Link>
							<Link href={'/about'}>
								<div>{t('About')}</div>
							</Link>
							<Link href={'/cs'}>
								<div>{t('Support')}</div>
							</Link>
							<Link href={'/mypage'}>
								<div>{t('My Page')}</div>
							</Link>
						</Box>
						<Box component={'div'} className={'user-box'}>
							<Link href={'/ai-coach'} className={'nav-ai-btn'} title="AI Coach">
								<SmartToyOutlinedIcon className={'notification-icon'} />
							</Link>
							{user?._id ? (
								<>
									{/* Cart icon with badge */}
									<Badge
										badgeContent={cart.totalItems}
										color="error"
										sx={{ cursor: 'pointer', mr: 1 }}
										onClick={() => router.push('/products')}
									>
										<ShoppingBagOutlinedIcon className={'notification-icon'} />
									</Badge>

									{/* Notifications icon with dropdown */}
									<Badge
										badgeContent={0}
										color="error"
										variant="dot"
										invisible={true}
										sx={{ cursor: 'pointer' }}
									>
										<NotificationsOutlinedIcon
											className={'notification-icon'}
											onClick={(e: any) => setNotifAnchor(e.currentTarget)}
										/>
									</Badge>
									<Menu
										anchorEl={notifAnchor}
										open={notifOpen}
										onClose={() => setNotifAnchor(null)}
										sx={{ mt: '5px' }}
										PaperProps={{
											sx: {
												minWidth: 280,
												maxWidth: 340,
												maxHeight: 360,
												background: '#1a1f2e',
												color: '#e2e8f0',
												border: '1px solid rgba(255,255,255,0.08)',
											},
										}}
									>
										<div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
											<strong style={{ fontSize: 15 }}>Notifications</strong>
										</div>
										<MenuItem disabled sx={{ color: '#6b7280 !important', fontSize: 13, justifyContent: 'center', py: 3 }}>
											No new notifications
										</MenuItem>
									</Menu>

									<div
										className={'login-user'}
										onClick={(event: any) => setLogoutAnchor(event.currentTarget)}
									>
										{user?.memberImage ? (
											<img src={user.memberImage} alt="" />
										) : (
											<AccountCircleOutlinedIcon className={'user-avatar-icon'} />
										)}
										{user?.memberNick && <span className={'user-nick'}>{user.memberNick}</span>}
									</div>
									<Menu
										id="basic-menu"
										anchorEl={logoutAnchor}
										open={logoutOpen}
										onClose={() => setLogoutAnchor(null)}
										sx={{ mt: '5px' }}
									>
										<MenuItem onClick={() => logOut()}>
											<Logout fontSize="small" style={{ color: '#E92C28', marginRight: '10px' }} />
											Logout
										</MenuItem>
									</Menu>
								</>
							) : (
								<Link href={'/account/join'}>
									<div className={'join-box'}>
										<AccountCircleOutlinedIcon />
										<span>
											{t('Login')} / {t('Register')}
										</span>
									</div>
								</Link>
							)}
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withRouter(Top);
