import React, { useEffect } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { UserCircle, Bell, Bot, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import CartDrawer from './common/CartDrawer';
import NavSearch from './common/NavSearch';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';

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
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();

	const [colorChange, setColorChange] = useState(false);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutOpen, setLogoutOpen] = useState(false);
	const [notifOpen, setNotifOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

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

	// Close mobile menu on route change
	useEffect(() => {
		setMenuOpen(false);
	}, [router.pathname]);

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
		setNotifOpen(false);
		if (notif.notificationLink) router.push(notif.notificationLink);
	};

	const handleMarkAllRead = async () => {
		await markAllRead();
		refetchCount();
		refetchNotifs();
	};

	return (
		<div className={'navbar'}>
			<div className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}>
				<div className={'container'}>
					<div className={'logo-box'}>
						<Link href={'/'}>
							<span className={'logo-name'}>ATHLEX</span>
						</Link>
					</div>

					{/* Desktop nav links */}
					<div className={'router-box'}>
						<Link href={'/'}><div className={router.pathname === '/' ? 'active' : ''}>{t('Home')}</div></Link>
						<Link href={'/programs'}><div className={router.pathname.startsWith('/programs') ? 'active' : ''}>{t('Programs')}</div></Link>
						<Link href={'/trainer'}><div className={router.pathname.startsWith('/trainer') ? 'active' : ''}>{t('Trainers')}</div></Link>
						<Link href={'/products'}><div className={router.pathname.startsWith('/products') ? 'active' : ''}>{t('Shop')}</div></Link>
						<Link href={'/about'}><div className={router.pathname.startsWith('/about') ? 'active' : ''}>{t('About')}</div></Link>
						<Link href={'/cs'}><div className={router.pathname.startsWith('/cs') ? 'active' : ''}>{t('Support')}</div></Link>
						<Link href={'/mypage'}><div className={router.pathname.startsWith('/mypage') ? 'active' : ''}>{t('My Page')}</div></Link>
					</div>

					<div className={'user-box'}>
						<NavSearch />
						<Link href={'/ai-coach'} className={'nav-ai-btn'} title="AI Coach">
							<Bot className={'notification-icon'} />
						</Link>
						{user?._id ? (
							<>
								{/* Cart Drawer */}
								<CartDrawer />

								{/* Notifications */}
								<div className="relative">
									<div className="relative cursor-pointer" onClick={() => setNotifOpen(!notifOpen)}>
										<Bell className={'notification-icon'} />
										{unreadCount > 0 && (
											<span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E92C28] rounded-full text-[10px] flex items-center justify-center text-white font-bold leading-none">
												{unreadCount}
											</span>
										)}
									</div>

									{notifOpen && (
										<>
											<div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
											<div className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-y-auto bg-[#1a1f2e] border border-white/[0.08] rounded-lg shadow-xl z-50">
												{/* Header */}
												<div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
													<strong className="text-[15px] text-white">Notifications</strong>
													{unreadCount > 0 && (
														<button
															onClick={handleMarkAllRead}
															className="text-[11px] text-[#E92C28] font-semibold bg-transparent border-none cursor-pointer"
														>
															Mark all read
														</button>
													)}
												</div>

												{/* List */}
												{notifications.length === 0 ? (
													<div className="text-[#6b7280] text-[13px] text-center py-6">No new notifications</div>
												) : (
													notifications.map((n: any) => (
														<div
															key={n._id}
															onClick={() => handleNotifClick(n)}
															className={`flex items-start gap-2 px-4 py-3 cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.04] ${!n.isRead ? 'bg-[rgba(233,44,40,0.06)]' : ''}`}
														>
															<span className="text-[18px] leading-snug shrink-0">{NOTIF_ICON[n.notificationType] ?? '🔔'}</span>
															<div className="flex-1 min-w-0">
																<div className={`text-[13px] text-[#e2e8f0] leading-snug ${!n.isRead ? 'font-semibold' : ''}`}>
																	{n.notificationTitle}
																</div>
																<div className="text-[12px] text-[#6b7280] mt-0.5 whitespace-normal leading-snug">
																	{n.notificationMessage}
																</div>
																<div className="text-[11px] text-[#4b5563] mt-1">
																	{moment(n.createdAt).fromNow()}
																</div>
															</div>
															{!n.isRead && (
																<span className="w-2 h-2 rounded-full bg-[#E92C28] shrink-0 mt-1" />
															)}
														</div>
													))
												)}

												{/* View all */}
												<div className="border-t border-white/[0.08] px-4 py-2">
													<a
														href="/notifications"
														onClick={() => setNotifOpen(false)}
														className="text-[12px] text-[#9ca3af] block text-center"
													>
														View all notifications →
													</a>
												</div>
											</div>
										</>
									)}
								</div>

								{/* User menu */}
								<div className="relative">
									<div
										className={'login-user'}
										onClick={() => setLogoutOpen(!logoutOpen)}
									>
										{user?.memberImage ? (
											<img src={user.memberImage} alt="" />
										) : (
											<UserCircle className={'user-avatar-icon'} />
										)}
										{user?.memberNick && <span className={'user-nick'}>{user.memberNick}</span>}
									</div>

									{logoutOpen && (
										<>
											<div className="fixed inset-0 z-40" onClick={() => setLogoutOpen(false)} />
											<div className="absolute right-0 top-full mt-1 bg-[#1a1f2e] border border-white/[0.08] rounded-lg shadow-xl z-50 min-w-[140px]">
												<button
													onClick={() => logOut()}
													className="flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-white/[0.05] w-full text-left"
												>
													<LogOut size={16} className="text-[#E92C28]" />
													Logout
												</button>
											</div>
										</>
									)}
								</div>
							</>
						) : (
							<Link href={'/account/join'}>
								<div className={'join-box'}>
									<UserCircle />
									<span>
										{t('Login')} / {t('Register')}
									</span>
								</div>
							</Link>
						)}

						{/* Hamburger button — visible only on mobile */}
						<button
							className={'hamburger-btn'}
							onClick={() => setMenuOpen(!menuOpen)}
							aria-label="Toggle menu"
						>
							{menuOpen ? <X size={22} /> : <Menu size={22} />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile slide-down menu */}
			<div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
				<Link href={'/'} onClick={() => setMenuOpen(false)}>
					<div className={`mobile-menu-item ${router.pathname === '/' ? 'active' : ''}`}>{t('Home')}</div>
				</Link>
				<Link href={'/programs'} onClick={() => setMenuOpen(false)}>
					<div className={`mobile-menu-item ${router.pathname.startsWith('/programs') ? 'active' : ''}`}>{t('Programs')}</div>
				</Link>
				<Link href={'/trainer'} onClick={() => setMenuOpen(false)}>
					<div className={`mobile-menu-item ${router.pathname.startsWith('/trainer') ? 'active' : ''}`}>{t('Trainers')}</div>
				</Link>
				<Link href={'/products'} onClick={() => setMenuOpen(false)}>
					<div className={`mobile-menu-item ${router.pathname.startsWith('/products') ? 'active' : ''}`}>{t('Shop')}</div>
				</Link>
				<Link href={'/about'} onClick={() => setMenuOpen(false)}>
					<div className={`mobile-menu-item ${router.pathname.startsWith('/about') ? 'active' : ''}`}>{t('About')}</div>
				</Link>
				<Link href={'/cs'} onClick={() => setMenuOpen(false)}>
					<div className={`mobile-menu-item ${router.pathname.startsWith('/cs') ? 'active' : ''}`}>{t('Support')}</div>
				</Link>
				<Link href={'/mypage'} onClick={() => setMenuOpen(false)}>
					<div className={`mobile-menu-item ${router.pathname.startsWith('/mypage') ? 'active' : ''}`}>{t('My Page')}</div>
				</Link>
			</div>
		</div>
	);
};

export default withRouter(Top);
