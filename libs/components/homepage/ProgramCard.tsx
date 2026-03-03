import React from 'react';
import { Box } from '@mui/material';
import Link from 'next/link';

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
	rank?: number;
	rating?: number;
}

const ProgramCard = ({ id, name, type, level, duration, price, views, likes, members, gradient, rank, rating }: ProgramCardProps) => {
	const icon = typeIcons[type] ?? '🏅';
	const displayPrice = price === 0 ? 'FREE' : `$${price}`;
	const displayViews = views >= 1000 ? `${(views / 1000).toFixed(1)}K` : String(views);
	const displayMembers = members >= 1000 ? `${(members / 1000).toFixed(1)}K` : String(members);

	return (
		<Link href={`/programs/${id}`}>
			<Box className={'program-card'}>
				<div className={'card-visual'} style={{ background: gradient }}>
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
						<button className={'btn-enroll'}>Enroll →</button>
					</div>
				</div>
			</Box>
		</Link>
	);
};

export default ProgramCard;
