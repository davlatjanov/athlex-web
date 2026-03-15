import React, { useState } from 'react';
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
	const [isFollowing, setIsFollowing] = useState<boolean>(false);

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

	/** Check if current user already follows this member **/
	useQuery(GET_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { memberId: currentUser._id, input: { page: 1, limit: 100 } },
		skip: !currentUser._id || !memberId,
		onCompleted: (data: T) => {
			const list: Member[] = data?.getFollowings?.list ?? [];
			setIsFollowing(list.some((m: any) => m._id === memberId));
		},
	});

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
								<Button
									className="btn-unfollow"
									variant="outlined"
									onClick={async () => {
										setIsFollowing(false);
										await unsubscribeHandler(member?._id, getMemberRefetch, { memberId });
									}}
								>
									Unfollow
								</Button>
								<Typography className="following-label">Following</Typography>
							</>
						) : (
							<Button
								className="btn-follow"
								variant="contained"
								onClick={async () => {
									setIsFollowing(true);
									await subscribeHandler(member?._id, getMemberRefetch, { memberId });
								}}
							>
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
