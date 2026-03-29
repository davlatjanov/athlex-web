import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_FOLLOWINGS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface MemberFollowingsProps {
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowings = (props: MemberFollowingsProps) => {
	const { subscribeHandler, unsubscribeHandler, redirectToMemberPageHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [members, setMembers] = useState<T[]>([]);
	const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

	const currentUserId = (user as any)?._id;
	const memberId = router.isReady
		? ((router.query.memberId as string) || currentUserId)
		: undefined;
	const isOwnPage = !router.query.memberId || router.query.memberId === currentUserId;

	// Fetch current user's own followings to know which buttons to show
	useQuery(GET_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { memberId: currentUserId, input: { page: 1, limit: 100 } },
		skip: !currentUserId || isOwnPage,
		onCompleted: (data: T) => {
			const ids = (data?.getFollowings?.list ?? []).map((m: T) => m._id as string);
			setFollowedIds(new Set(ids));
		},
	});

	const { refetch } = useQuery(GET_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { memberId, input: { page, limit: 10 } },
		skip: !memberId,
		onCompleted: (data: T) => {
			setMembers(data?.getFollowings?.list ?? []);
			setTotal(data?.getFollowings?.metaCounter?.[0]?.total ?? 0);
			// If viewing own page, all listed members are ones we follow
			if (isOwnPage) {
				const ids = (data?.getFollowings?.list ?? []).map((m: T) => m._id as string);
				setFollowedIds(new Set(ids));
			}
		},
		onError: (err) => {
			console.error('getFollowings error:', err.message);
		},
	});

	const totalPages = Math.ceil(total / 10);

	const handleFollow = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		setFollowedIds((prev) => new Set(prev).add(id));
		await subscribeHandler(id, async () => {}, {});
	};

	const handleUnfollow = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		if (isOwnPage) {
			setMembers((prev) => prev.filter((m) => m._id !== id));
			setTotal((prev) => prev - 1);
		}
		setFollowedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
		await unsubscribeHandler(id, async () => {}, {});
	};

	return (
		<div id="member-follows-page">
			<h3 className="follows-title">Following <span>{total}</span></h3>
			{members.length === 0 ? (
				<div className="follows-empty">
					<p>No followings yet.</p>
				</div>
			) : (
				<div className="follows-list">
					{members.map((m: T) => {
						const isFollowing = isOwnPage || followedIds.has(m._id);
						return (
							<div className="follows-card" key={m._id} onClick={() => redirectToMemberPageHandler(m._id)}>
								<div className="follows-avatar">
									{m.memberImage ? (
										<img src={m.memberImage} alt={m.memberNick} />
									) : (
										<div className="follows-avatar-initial">{(m.memberNick || 'A')[0].toUpperCase()}</div>
									)}
								</div>
								<div className="follows-info">
									<p className="follows-nick">{m.memberNick}</p>
									<p className="follows-meta">
										<span>{m.memberFollowers ?? 0} followers</span>
										<span>{m.memberFollowings ?? 0} following</span>
									</p>
								</div>
								{currentUserId && currentUserId !== m._id && (
									isFollowing ? (
										<button className="follows-btn follows-btn--unfollow" onClick={(e) => handleUnfollow(e, m._id)}>
											Unfollow
										</button>
									) : (
										<button className="follows-btn follows-btn--follow" onClick={(e) => handleFollow(e, m._id)}>
											Follow
										</button>
									)
								)}
							</div>
						);
					})}
				</div>
			)}
			{totalPages > 1 && (
				<div className="follows-pagination">
					<button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
						<button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
					))}
					<button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
				</div>
			)}
		</div>
	);
};

export default MemberFollowings;
