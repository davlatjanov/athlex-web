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
	products: LikeGroup.PRODUCT,
};

const LIKE_STORAGE_KEY: Record<string, string> = {
	programs: 'athlex_liked_programs',
	trainers: 'athlex_liked_trainers',
	products: 'athlex_liked_products',
};

function getLikedFromStorage(key: string, id: string): boolean {
	try {
		const list: string[] = JSON.parse(localStorage.getItem(key) ?? '[]');
		return list.includes(id);
	} catch { return false; }
}

function setLikedInStorage(key: string, id: string, liked: boolean) {
	try {
		const list: string[] = JSON.parse(localStorage.getItem(key) ?? '[]');
		const updated = liked
			? Array.from(new Set([...list, id]))
			: list.filter((i) => i !== id);
		localStorage.setItem(key, JSON.stringify(updated));
	} catch {}
}

export function useLike(group: 'programs' | 'trainers' | 'products', id: string, initialLiked = false) {
	const user = useReactiveVar(userVar);
	const storageKey = LIKE_STORAGE_KEY[group];

	const [liked, setLiked] = useState(() => {
		if (typeof window === 'undefined') return initialLiked;
		return getLikedFromStorage(storageKey, id) || initialLiked;
	});

	const [likeTargetItem] = useMutation(LIKE_TARGET_ITEM);

	React.useEffect(() => {
		if (initialLiked) {
			setLiked(true);
			setLikedInStorage(storageKey, id, true);
		}
	}, [initialLiked, id, storageKey]);

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
			setLiked((prev) => {
				const next = !prev;
				setLikedInStorage(storageKey, id, next);
				return next;
			});
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
