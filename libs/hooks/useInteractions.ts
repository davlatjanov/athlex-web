import { useEffect, useState } from 'react';
import React from 'react';

const LIKES_KEY = 'athlex_likes';
const FOLLOWS_KEY = 'athlex_follows';

function getLikes(): { programs: string[]; trainers: string[] } {
	if (typeof window === 'undefined') return { programs: [], trainers: [] };
	try {
		return { programs: [], trainers: [], ...JSON.parse(localStorage.getItem(LIKES_KEY) ?? '{}') };
	} catch {
		return { programs: [], trainers: [] };
	}
}

function getFollows(): string[] {
	if (typeof window === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(FOLLOWS_KEY) ?? '[]');
	} catch {
		return [];
	}
}

export function useLike(group: 'programs' | 'trainers', id: string) {
	const [liked, setLiked] = useState(false);

	useEffect(() => {
		if (!id) return;
		const data = getLikes();
		setLiked((data[group] ?? []).includes(id));
	}, [group, id]);

	const toggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const data = getLikes();
		const list: string[] = data[group] ?? [];
		const newList = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
		localStorage.setItem(LIKES_KEY, JSON.stringify({ ...data, [group]: newList }));
		setLiked(newList.includes(id));
	};

	return { liked, toggle };
}

export function useFollow(trainerId: string) {
	const [followed, setFollowed] = useState(false);

	useEffect(() => {
		if (!trainerId) return;
		setFollowed(getFollows().includes(trainerId));
	}, [trainerId]);

	const toggle = () => {
		if (!trainerId) return;
		const list = getFollows();
		const newList = list.includes(trainerId)
			? list.filter((x) => x !== trainerId)
			: [...list, trainerId];
		localStorage.setItem(FOLLOWS_KEY, JSON.stringify(newList));
		setFollowed(newList.includes(trainerId));
	};

	return { followed, toggle };
}
