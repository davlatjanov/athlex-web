import React, { useState } from 'react';
import { NextPage } from 'next';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { GET_MY_NOTIFICATIONS } from '../../apollo/user/query';
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from '../../apollo/user/mutation';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { T } from '../../libs/types/common';
import moment from 'moment';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const NOTIF_META: Record<string, { icon: string; color: string; bg: string }> = {
	NEW_FOLLOWER:     { icon: '👤', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
	NEW_LIKE:         { icon: '❤️', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
	PROGRAM_JOINED:   { icon: '💪', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
	FEEDBACK_RECEIVED:{ icon: '⭐', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
	ORDER_UPDATE:     { icon: '🛍️', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
	COMMENT_REPLY:    { icon: '💬', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
	SYSTEM:           { icon: '🔔', color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)' },
};

const NotificationsPage: NextPage = () => {
	const user = useReactiveVar(userVar) as any;
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [notifications, setNotifications] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [unread, setUnread] = useState(0);

	const { refetch } = useQuery(GET_MY_NOTIFICATIONS, {
		fetchPolicy: 'network-only',
		skip: !user?._id,
		variables: { input: { page, limit: 20, sort: 'createdAt', direction: 'DESC' } },
		onCompleted: (data: T) => {
			const list = data?.getMyNotifications?.list ?? [];
			setNotifications(list);
			setTotal(data?.getMyNotifications?.metaCounter?.[0]?.total ?? 0);
			setUnread(list.filter((n: T) => !n.isRead).length);
		},
	});

	const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
	const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

	const refetchInquiry = { input: { page, limit: 20, sort: 'createdAt', direction: 'DESC' } };

	const handleClick = async (notif: T) => {
		if (!notif.isRead) {
			await markAsRead({ variables: { notificationId: notif._id } });
			const result = await refetch(refetchInquiry);
			const list = result.data?.getMyNotifications?.list ?? [];
			setNotifications(list);
			setUnread(list.filter((n: T) => !n.isRead).length);
		}
		if (notif.notificationLink) router.push(notif.notificationLink);
	};

	const handleMarkAll = async () => {
		await markAllRead();
		const result = await refetch(refetchInquiry);
		const list = result.data?.getMyNotifications?.list ?? [];
		setNotifications(list);
		setUnread(0);
	};

	const handlePageChange = async (p: number) => {
		setPage(p);
		const result = await refetch({ input: { page: p, limit: 20, sort: 'createdAt', direction: 'DESC' } });
		const list = result.data?.getMyNotifications?.list ?? [];
		setNotifications(list);
		setTotal(result.data?.getMyNotifications?.metaCounter?.[0]?.total ?? 0);
		setUnread(list.filter((n: T) => !n.isRead).length);
	};

	const totalPages = Math.ceil(total / 20);

	return (
		<div id="notifications-page">
			<div className="nf-container">

				{/* Header */}
				<div className="nf-header">
					<div className="nf-header-left">
						<h1 className="nf-title">Notifications</h1>
						<div className="nf-meta">
							<span className="nf-total">{total} total</span>
							{unread > 0 && <span className="nf-unread-badge">{unread} unread</span>}
						</div>
					</div>
					{unread > 0 && (
						<button className="nf-mark-all-btn" onClick={handleMarkAll}>
							Mark all as read
						</button>
					)}
				</div>

				{/* List */}
				{notifications.length === 0 ? (
					<div className="nf-empty">
						<span>🔔</span>
						<p>You're all caught up!</p>
					</div>
				) : (
					<div className="nf-list">
						{notifications.map((n: T) => {
							const meta = NOTIF_META[n.notificationType] ?? NOTIF_META.SYSTEM;
							return (
								<div
									key={n._id}
									className={`nf-card${!n.isRead ? ' nf-card--unread' : ''}${n.notificationLink ? ' nf-card--clickable' : ''}`}
									onClick={() => handleClick(n)}
								>
									{/* Unread left bar */}
									{!n.isRead && <div className="nf-unread-bar" />}

									{/* Icon */}
									<div className="nf-icon-wrap" style={{ background: meta.bg }}>
										<span>{meta.icon}</span>
									</div>

									{/* Body */}
									<div className="nf-body">
										<p className="nf-card-title">{n.notificationTitle}</p>
										<p className="nf-card-msg">{n.notificationMessage}</p>
										<span className="nf-card-time">{moment(n.createdAt).fromNow()}</span>
									</div>

									{/* Right side */}
									<div className="nf-right">
										{!n.isRead && <div className="nf-dot" style={{ background: meta.color }} />}
										{n.notificationLink && <span className="nf-arrow">→</span>}
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="nf-pagination">
						<button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>Prev</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<button key={p} className={page === p ? 'active' : ''} onClick={() => handlePageChange(p)}>{p}</button>
						))}
						<button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>Next</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(NotificationsPage);
