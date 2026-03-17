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

const NOTIF_ICON: Record<string, string> = {
	NEW_FOLLOWER: '👤',
	NEW_LIKE: '❤️',
	PROGRAM_JOINED: '💪',
	FEEDBACK_RECEIVED: '⭐',
	ORDER_UPDATE: '🛍️',
	COMMENT_REPLY: '💬',
	SYSTEM: '🔔',
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

	const handleClick = async (notif: T) => {
		if (!notif.isRead) {
			await markAsRead({ variables: { notificationId: notif._id } });
			const result = await refetch({ input: { page, limit: 20, sort: 'createdAt', direction: 'DESC' } });
			const list = result.data?.getMyNotifications?.list ?? [];
			setNotifications(list);
			setUnread(list.filter((n: T) => !n.isRead).length);
		}
		if (notif.notificationLink) router.push(notif.notificationLink);
	};

	const handleMarkAll = async () => {
		await markAllRead();
		const result = await refetch({ input: { page, limit: 20, sort: 'createdAt', direction: 'DESC' } });
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
			<div className="notif-wrap container">
				<div className="notif-header">
					<div>
						<h1 className="notif-title">Notifications</h1>
						<p className="notif-sub">{total} total {unread > 0 && <span className="notif-unread-count">{unread} unread</span>}</p>
					</div>
					{unread > 0 && (
						<button className="notif-mark-all-btn" onClick={handleMarkAll}>
							Mark all as read
						</button>
					)}
				</div>

				{notifications.length === 0 ? (
					<div className="notif-empty">
						<span>🔔</span>
						<p>No notifications yet.</p>
					</div>
				) : (
					<div className="notif-list">
						{notifications.map((n: T) => (
							<div
								key={n._id}
								className={`notif-card ${!n.isRead ? 'unread' : ''} ${n.notificationLink ? 'clickable' : ''}`}
								onClick={() => handleClick(n)}
							>
								<div className="notif-icon">{NOTIF_ICON[n.notificationType] ?? '🔔'}</div>
								<div className="notif-body">
									<p className="notif-msg-title">{n.notificationTitle}</p>
									<p className="notif-msg">{n.notificationMessage}</p>
									<span className="notif-time">{moment(n.createdAt).fromNow()}</span>
								</div>
								{!n.isRead && <div className="notif-dot" />}
							</div>
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="notif-pagination">
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
