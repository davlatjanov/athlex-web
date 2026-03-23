import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Typography, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
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
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;
	const currentUser = useReactiveVar(userVar);

	const [member, setMember] = useState<Member | null>(null);
	// null = use server data, true/false = optimistic override while mutation is in-flight
	const [optimisticFollow, setOptimisticFollow] = useState<boolean | null>(null);

	// Reset optimistic state when navigating to a different member
	useEffect(() => {
		setOptimisticFollow(null);
	}, [memberId]);

	/** Fetch viewed member **/
	const { refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMember(data?.getMember);
		},
	});

	/** Fetch current user's followings to derive follow state **/
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

	if (device === 'mobile') {
		return <div>MEMBER MENU MOBILE</div>;
	} else {
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
					<Typography className={'nick'}>{member?.memberNick}</Typography>
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
								<Button className="btn-unfollow" variant="outlined" onClick={handleUnfollow}>
									Unfollow
								</Button>
								<Typography className="following-label">Following</Typography>
							</>
						) : (
							<Button className="btn-follow" variant="contained" onClick={handleFollow}>
								Follow
							</Button>
						)}
					</div>
				)}
			</>
		);
	}
};

export default MemberMenu;
