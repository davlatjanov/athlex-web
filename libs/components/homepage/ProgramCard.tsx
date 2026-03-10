import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useLike } from '../../hooks/useInteractions';
import { JOIN_PROGRAM, LEAVE_PROGRAM } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';

const JOINED_KEY = 'athlex_joined_programs';

const typeIcons: Record<string, string> = {
	'MASS GAIN': '💪',
	'WEIGHT LOSS': '🔥',
	'STRENGTH': '🏋️',
	'CARDIO': '🏃',
	'YOGA': '🧘',
	'FUNCTIONAL': '⚡',
	'REHABILITATION': '🩺',
	'MOBILITY': '🤸',
};

interface ProgramCardProps {
	id: string;
	name: string;
	type: string;
	level: string;
	duration: number;
	price: number;
	views: number;
	likes: number;
	members: number;
	gradient: string;
	image?: string;
	rank?: number;
	rating?: number;
}

const ProgramCard = ({ id, name, type, level, duration, price, views, likes, members, gradient, image, rank, rating }: ProgramCardProps) => {
	const user = useReactiveVar(userVar);
	const { liked, toggle: toggleLike } = useLike('programs', id);
	const [joined, setJoined] = useState(false);
	const [loading, setLoading] = useState(false);
	const icon = typeIcons[type] ?? '🏅';

	const [joinProgram] = useMutation(JOIN_PROGRAM);
	const [leaveProgram] = useMutation(LEAVE_PROGRAM);

	useEffect(() => {
		try {
			const list: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]');
			setJoined(list.includes(id));
		} catch {}
	}, [id]);

	const enrollHandler = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (loading) return;
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			setLoading(true);
			if (joined) {
				await leaveProgram({ variables: { programId: id } });
				setJoined(false);
				const list: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]');
				localStorage.setItem(JOINED_KEY, JSON.stringify(list.filter((i) => i !== id)));
				sweetTopSmallSuccessAlert('Left program', 800);
			} else {
				await joinProgram({ variables: { programId: id } });
				setJoined(true);
				const list: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]');
				if (!list.includes(id)) localStorage.setItem(JOINED_KEY, JSON.stringify([...list, id]));
				sweetTopSmallSuccessAlert('Enrolled!', 800);
			}
		} catch (err: any) {
			const msg: string = err.message ?? '';
			if (msg.toLowerCase().includes('already')) {
				setJoined(true);
				const list: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]');
				if (!list.includes(id)) localStorage.setItem(JOINED_KEY, JSON.stringify([...list, id]));
			} else {
				sweetMixinErrorAlert(msg).then();
			}
		} finally {
			setLoading(false);
		}
	};

	const displayPrice = price === 0 ? 'FREE' : `$${price}`;
	const displayViews = views >= 1000 ? `${(views / 1000).toFixed(1)}K` : String(views);
	const displayMembers = members >= 1000 ? `${(members / 1000).toFixed(1)}K` : String(members);

	return (
		<Link href={`/programs/${id}`}>
			<div className={'program-card'}>
				<div className={'card-visual'} style={{ background: gradient }}>
					{image && (
						<img
							src={image}
							alt={name}
							className={'card-bg-img'}
							onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
						/>
					)}
					<div className={'card-visual-overlay'} />
					<div className={'card-top-row'}>
						<span className={'type-badge'}>{type}</span>
						<div className={'card-top-right'}>
							{rank ? (
								<span className={'rank-badge'}>#{rank}</span>
							) : (
								<span className={'level-top'}>{level}</span>
							)}
							<button className={`card-like-btn ${liked ? 'liked' : ''}`} onClick={toggleLike}>
								{liked ? '♥' : '♡'}
							</button>
						</div>
					</div>
					<div className={'card-center-icon'}>{icon}</div>
					<div className={'card-name-overlay'}>
						<strong className={'card-name'}>{name}</strong>
					</div>
				</div>

				<div className={'card-body'}>
					<div className={'card-price-row'}>
						<span className={'price-main'}>{displayPrice}</span>
						<span className={'duration-tag'}>{duration} Weeks</span>
					</div>

					<div className={'card-stats'}>
						<span className={'stat'}>👁 {displayViews}</span>
						<span className={'stat-sep'}>·</span>
						<span className={'stat'}>♥ {likes}</span>
						<span className={'stat-sep'}>·</span>
						<span className={'stat'}>👤 {displayMembers}</span>
					</div>

					{rating && (
						<div className={'card-rating'}>
							<span className={'stars'}>★ {rating}</span>
							<span className={'rating-label'}>Rating</span>
						</div>
					)}

					<div className={'card-bottom'}>
						<span className={'level-tag'}>{level}</span>
						<button
							className={`btn-enroll ${joined ? 'enrolled' : ''}`}
							onClick={enrollHandler}
							disabled={loading}
						>
							{loading ? '...' : joined ? '✓ Enrolled' : 'Enroll →'}
						</button>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default ProgramCard;
