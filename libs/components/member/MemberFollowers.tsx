import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_FOLLOWERS, GET_FOLLOWINGS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface MemberFollowsProps {
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => {
	const { subscribeHandler, unsubscribeHandler, redirectToMemberPageHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [members, setMembers] = useState<T[]>([]);
	const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

	const memberId = router.query.memberId as string;
	const currentUserId = (user as any)?._id;

	// Fetch who the current user already follows → pre-populate followedIds
	useQuery(GET_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { memberId: currentUserId, input: { page: 1, limit: 100 } },
		skip: !currentUserId,
		onCompleted: (data: T) => {
			const ids = (data?.getFollowings?.list ?? []).map((m: T) => m._id as string);
			setFollowedIds(new Set(ids));
		},
	});

	const { refetch } = useQuery(GET_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { memberId, input: { page, limit: 10 } },
		skip: !memberId || !router.isReady,
		onCompleted: (data: T) => {
			setMembers(data?.getFollowers?.list ?? []);
			setTotal(data?.getFollowers?.metaCounter?.[0]?.total ?? 0);
		},
		onError: (err) => {
			console.error('getFollowers error:', err.message);
		},
	});

	const totalPages = Math.ceil(total / 10);

	const handleFollow = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		setFollowedIds((prev) => new Set(prev).add(id));
		await subscribeHandler(id, async () => {}, {});
		const result = await refetch({ memberId, input: { page, limit: 10 } });
		setMembers(result.data?.getFollowers?.list ?? []);
		setTotal(result.data?.getFollowers?.metaCounter?.[0]?.total ?? 0);
	};

	const handleUnfollow = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		setFollowedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
		await unsubscribeHandler(id, async () => {}, {});
		const result = await refetch({ memberId, input: { page, limit: 10 } });
		setMembers(result.data?.getFollowers?.list ?? []);
		setTotal(result.data?.getFollowers?.metaCounter?.[0]?.total ?? 0);
	};

	return (
		<div id="member-follows-page">
			<h3 className="follows-title">Followers <span>{total}</span></h3>
			{members.length === 0 ? (
				<div className="follows-empty">
					<p>No followers yet.</p>
				</div>
			) : (
				<div className="follows-list">
					{members.map((m: T) => {
						const isFollowing = followedIds.has(m._id);
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

export default MemberFollowers;
