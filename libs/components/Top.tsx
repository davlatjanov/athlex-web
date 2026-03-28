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

	// Close dropdowns on outside click
	useEffect(() => {
		if (!notifOpen) return;
		const close = () => setNotifOpen(false);
		window.addEventListener('click', close);
		return () => window.removeEventListener('click', close);
	}, [notifOpen]);

	useEffect(() => {
		if (!logoutOpen) return;
		const close = () => setLogoutOpen(false);
		window.addEventListener('click', close);
		return () => window.removeEventListener('click', close);
	}, [logoutOpen]);

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
						{/* Language switcher */}
						<div className={'lang-switcher'}>
							{['en', 'kr', 'ru'].map((lang) => (
								<button
									key={lang}
									className={`lang-btn ${router.locale === lang ? 'active' : ''}`}
									onClick={() => router.push(router.asPath, router.asPath, { locale: lang })}
								>
									{lang.toUpperCase()}
								</button>
							))}
						</div>
						<Link href={'/ai-coach'} className={'nav-ai-btn'} title="AI Coach">
							<Bot className={'notification-icon'} />
						</Link>
						{user?._id ? (
							<>
								{/* Cart Drawer */}
								<CartDrawer />

								{/* Notifications */}
								<div className="relative">
									<div className="relative cursor-pointer" onClick={(e) => { e.stopPropagation(); setNotifOpen((v) => !v); }}>
										<Bell className={'notification-icon'} />
										{unreadCount > 0 && (
											<span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[10px] flex items-center justify-center text-white font-bold leading-none">
												{unreadCount}
											</span>
										)}
									</div>

									{notifOpen && (
									<>
										<div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, width: 320, maxHeight: 384, overflowY: 'auto', background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 99 }}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
												<strong style={{ fontSize: 15, color: '#fff' }}>Notifications</strong>
												{unreadCount > 0 && (
													<button onClick={handleMarkAllRead} style={{ fontSize: 11, color: '#E92C28', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
														Mark all read
													</button>
												)}
											</div>
											{notifications.length === 0 ? (
												<div style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', padding: '24px 16px' }}>No new notifications</div>
											) : (
												notifications.map((n: any) => (
													<div
														key={n._id}
														onClick={() => handleNotifClick(n)}
														style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', background: !n.isRead ? 'rgba(233,44,40,0.06)' : 'transparent' }}
													>
														<span style={{ fontSize: 18, flexShrink: 0 }}>{NOTIF_ICON[n.notificationType] ?? '🔔'}</span>
														<div style={{ flex: 1, minWidth: 0 }}>
															<div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: !n.isRead ? 600 : 400, lineHeight: 1.4 }}>{n.notificationTitle}</div>
															<div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>{n.notificationMessage}</div>
															<div style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>{moment(n.createdAt).fromNow()}</div>
														</div>
														{!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E92C28', flexShrink: 0, marginTop: 4 }} />}
													</div>
												))
											)}
											<div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px' }}>
												<a href="/notifications" onClick={() => setNotifOpen(false)} style={{ fontSize: 12, color: '#9ca3af', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
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
										onClick={(e) => { e.stopPropagation(); setLogoutOpen((v) => !v); }}
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
											<div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, minWidth: 140, background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 99 }}>
												<button
													onClick={() => logOut()}
													style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: 14, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
													onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
													onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
												>
													<LogOut size={16} color="#E92C28" />
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
