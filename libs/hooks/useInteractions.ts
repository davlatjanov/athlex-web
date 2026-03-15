import { useState } from 'react';
import React from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { LIKE_TARGET_ITEM, FOLLOW_MEMBER } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LikeGroup } from '../enums/like.enum';
import { Message } from '../enums/common.enum';

const LIKE_GROUP_MAP: Record<string, LikeGroup> = {
	programs: LikeGroup.PROGRAM,
	trainers: LikeGroup.MEMBER,
};

export function useLike(group: 'programs' | 'trainers', id: string, initialLiked = false) {
	const user = useReactiveVar(userVar);
	const [liked, setLiked] = useState(initialLiked);
	const [likeTargetItem] = useMutation(LIKE_TARGET_ITEM);

	React.useEffect(() => { setLiked(initialLiked); }, [initialLiked]);

	const toggle = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!id) return;
			await likeTargetItem({
				variables: {
					input: {
						likeGroup: LIKE_GROUP_MAP[group],
						likeRefId: id,
					},
				},
			});
			setLiked((prev) => !prev);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return { liked, toggle };
}

export function useFollow(trainerId: string) {
	const user = useReactiveVar(userVar);
	const [followed, setFollowed] = useState(false);
	const [followMember] = useMutation(FOLLOW_MEMBER);

	const toggle = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!trainerId) return;
			await followMember({
				variables: { input: { followingId: trainerId } },
			});
			setFollowed((prev) => !prev);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return { followed, toggle };
}
