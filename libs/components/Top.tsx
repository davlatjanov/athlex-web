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
import CartDrawer from './common/CartDrawer';
import NavSearch from './common/NavSearch';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';

import { GET_MY_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '../../apollo/user/query';
import { MARK_ALL_NOTIFICATIONS_AS_READ, MARK_NOTIFICATION_AS_READ } from '../../apollo/user/mutation';
import moment from 'moment';

const NOTIF_ICON: Record<string, string> = {
	NEW_FOLLOWER: '👤',
	NEW_LIKE: '❤️',
	PROGRAM_JOINED: '💪',
	FEEDBACK_RECEIVED: '⭐',
	ORDER_UPDATE: '🛍️',
	COMMENT_REPLY: '💬',
	SYSTEM: '🔔',
};

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();

	const [colorChange, setColorChange] = useState(false);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
	const notifOpen = Boolean(notifAnchor);

	/** APOLLO **/
	const { data: countData, refetch: refetchCount } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
		skip: !user?._id,
		fetchPolicy: 'network-only',
		pollInterval: 30000,
	});
	const unreadCount: number = countData?.getUnreadNotificationCount ?? 0;

	const { data: notifData, refetch: refetchNotifs } = useQuery(GET_MY_NOTIFICATIONS, {
		skip: !user?._id || !notifOpen,
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 15, sort: 'createdAt', direction: 'DESC' } },
	});
	const notifications = notifData?.getMyNotifications?.list ?? [];

	const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
	const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

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

	const handleNotifClick = async (notif: any) => {
		if (!notif.isRead) {
			await markAsRead({ variables: { notificationId: notif._id } });
			refetchCount();
			refetchNotifs();
		}
		setNotifAnchor(null);
		if (notif.notificationLink) router.push(notif.notificationLink);
	};

	const handleMarkAllRead = async () => {
		await markAllRead();
		refetchCount();
		refetchNotifs();
	};

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
							<Link href={'/'}><div className={router.pathname === '/' ? 'active' : ''}>{t('Home')}</div></Link>
							<Link href={'/programs'}><div className={router.pathname.startsWith('/programs') ? 'active' : ''}>{t('Programs')}</div></Link>
							<Link href={'/trainer'}><div className={router.pathname.startsWith('/trainer') ? 'active' : ''}>{t('Trainers')}</div></Link>
							<Link href={'/products'}><div className={router.pathname.startsWith('/products') ? 'active' : ''}>{t('Shop')}</div></Link>
							<Link href={'/about'}><div className={router.pathname.startsWith('/about') ? 'active' : ''}>{t('About')}</div></Link>
							<Link href={'/cs'}><div className={router.pathname.startsWith('/cs') ? 'active' : ''}>{t('Support')}</div></Link>
							<Link href={'/mypage'}><div className={router.pathname.startsWith('/mypage') ? 'active' : ''}>{t('My Page')}</div></Link>
						</Box>
						<Box component={'div'} className={'user-box'}>
							<NavSearch />
							<Link href={'/ai-coach'} className={'nav-ai-btn'} title="AI Coach">
								<SmartToyOutlinedIcon className={'notification-icon'} />
							</Link>
							{user?._id ? (
								<>
									{/* Cart Drawer */}
									<CartDrawer />

									{/* Notifications */}
									<Badge
										badgeContent={unreadCount}
										color="error"
										invisible={unreadCount === 0}
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
												minWidth: 300,
												maxWidth: 360,
												maxHeight: 420,
												background: '#1a1f2e',
												color: '#e2e8f0',
												border: '1px solid rgba(255,255,255,0.08)',
											},
										}}
									>
										{/* Header */}
										<div style={{
											padding: '12px 16px',
											borderBottom: '1px solid rgba(255,255,255,0.08)',
											display: 'flex', alignItems: 'center', justifyContent: 'space-between',
										}}>
											<strong style={{ fontSize: 15 }}>Notifications</strong>
											{unreadCount > 0 && (
												<button
													onClick={handleMarkAllRead}
													style={{
														fontSize: 11, color: '#E92C28', background: 'none',
														border: 'none', cursor: 'pointer', fontWeight: 600,
													}}
												>
													Mark all read
												</button>
											)}
										</div>

										{/* List */}
										{notifications.length === 0 ? (
											<MenuItem disabled sx={{ color: '#6b7280 !important', fontSize: 13, justifyContent: 'center', py: 3 }}>
												No new notifications
											</MenuItem>
										) : (
											notifications.map((n: any) => (
												<MenuItem
													key={n._id}
													onClick={() => handleNotifClick(n)}
													sx={{
														alignItems: 'flex-start', gap: 1, py: 1.2, px: 2,
														background: n.isRead ? 'transparent' : 'rgba(233,44,40,0.06)',
														borderBottom: '1px solid rgba(255,255,255,0.04)',
														'&:hover': { background: 'rgba(255,255,255,0.04)' },
													}}
												>
													<span style={{ fontSize: 18, lineHeight: 1.4, flexShrink: 0 }}>
														{NOTIF_ICON[n.notificationType] ?? '🔔'}
													</span>
													<div style={{ flex: 1, minWidth: 0 }}>
														<div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: '#e2e8f0', lineHeight: 1.4 }}>
															{n.notificationTitle}
														</div>
														<div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, whiteSpace: 'normal', lineHeight: 1.3 }}>
															{n.notificationMessage}
														</div>
														<div style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>
															{moment(n.createdAt).fromNow()}
														</div>
													</div>
													{!n.isRead && (
														<span style={{
															width: 7, height: 7, borderRadius: '50%',
															background: '#E92C28', flexShrink: 0, marginTop: 5,
														}} />
													)}
												</MenuItem>
											))
										)}
									{/* View all link */}
									<div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px' }}>
										<a
											href="/notifications"
											onClick={() => setNotifAnchor(null)}
											style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none', display: 'block', textAlign: 'center' }}
										>
											View all notifications →
										</a>
									</div>
								</Menu>

									{/* User menu */}
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
