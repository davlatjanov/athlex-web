import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Member } from '../../types/member/member';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_MEMBER, GET_FOLLOWINGS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { userVar } from '../../../apollo/store';

interface MemberMenuProps {
	subscribeHandler: any;
	unsubscribeHandler: any;
}

const MemberMenu = (props: MemberMenuProps) => {
	const { subscribeHandler, unsubscribeHandler } = props;
	const router = useRouter();
	const { memberId } = router.query;
	const currentUser = useReactiveVar(userVar);

	const [member, setMember] = useState<Member | null>(null);
	const [optimisticFollow, setOptimisticFollow] = useState<boolean | null>(null);

	useEffect(() => {
		setOptimisticFollow(null);
	}, [memberId]);

	const { refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMember(data?.getMember);
		},
	});

	const { data: followingsData, refetch: refetchFollowings } = useQuery(GET_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { memberId: currentUser._id, input: { page: 1, limit: 100 } },
		skip: !currentUser._id || !memberId,
	});

	const followedIds = new Set((followingsData?.getFollowings?.list ?? []).map((m: any) => m._id));
	const isFollowing = optimisticFollow !== null ? optimisticFollow : followedIds.has(memberId as string);

	const handleFollow = async () => {
		setOptimisticFollow(true);
		await subscribeHandler(member?._id, getMemberRefetch, { memberId });
		const result = await refetchFollowings();
		const ids = new Set((result.data?.getFollowings?.list ?? []).map((m: any) => m._id));
		setOptimisticFollow(ids.has(memberId as string) ? true : null);
	};

	const handleUnfollow = async () => {
		setOptimisticFollow(false);
		await unsubscribeHandler(member?._id, getMemberRefetch, { memberId });
		const result = await refetchFollowings();
		const ids = new Set((result.data?.getFollowings?.list ?? []).map((m: any) => m._id));
		setOptimisticFollow(ids.has(memberId as string) ? true : null);
	};

	return (
		<>
			{/* Avatar */}
			<div className={'avatar-wrap'}>
				<img
					src={
						member?.memberImage
							? member.memberImage
							: `https://ui-avatars.com/api/?name=${encodeURIComponent(member?.memberNick ?? 'User')}&background=1F2937&color=ffffff&size=112&bold=true`
					}
					alt={'member-photo'}
				/>
			</div>

			{/* Profile info */}
			<div className={'profile-info'}>
				<span className={'nick'}>{member?.memberNick}</span>
				<div className={'meta-row'}>
					{member?.memberType && <span className={'member-type'}>{member?.memberType}</span>}
					{member?.memberPrograms !== undefined && (
						<span className={'stat'}><span>{member?.memberPrograms}</span>Programs</span>
					)}
					<span className={'stat'}><span>{member?.memberFollowers ?? 0}</span>Followers</span>
					<span className={'stat'}><span>{member?.memberFollowings ?? 0}</span>Following</span>
				</div>
			</div>

			{/* Follow / Unfollow */}
			{currentUser._id && currentUser._id !== memberId && (
				<div className={'follow-action'}>
					{isFollowing ? (
						<>
							<button className="btn-unfollow" onClick={handleUnfollow}>
								Unfollow
							</button>
							<span className="following-label">Following</span>
						</>
					) : (
						<button className="btn-follow" onClick={handleFollow}>
							Follow
						</button>
					)}
				</div>
			)}
		</>
	);
};

export default MemberMenu;
