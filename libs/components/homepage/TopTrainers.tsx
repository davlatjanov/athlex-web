import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_TRAINERS } from '../../../apollo/user/query';
import { T } from '../../types/common';

const TopTrainers = () => {
	const [trainers, setTrainers] = useState<any[]>([]);

	useQuery(GET_TRAINERS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 6, sort: 'memberViews', direction: 'DESC' },
		},
		onCompleted: (data: T) => setTrainers(data?.getTrainers?.list ?? []),
	});

	const TrainerCard = ({ trainer }: { trainer: any }) => {
		const initials = (trainer.memberFullName || trainer.memberNick || '?')
			.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
		const displayFollowers = trainer.memberFollowers >= 1000
			? `${(trainer.memberFollowers / 1000).toFixed(1)}K`
			: String(trainer.memberFollowers ?? 0);

		return (
			<Link href={`/trainer/detail?id=${String(trainer._id)}`}>
				<div className={'trainer-card'}>
					<div className={'trainer-avatar'}>
						{trainer.memberImage ? (
							<img
								src={trainer.memberImage}
								alt={trainer.memberFullName || trainer.memberNick}
								className={'trainer-avatar-img'}
								onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
							/>
						) : (
							<span className={'trainer-avatar-initials'}>{initials}</span>
						)}
					</div>
					<strong className={'trainer-name'}>{trainer.memberFullName || trainer.memberNick}</strong>
					<span className={'trainer-nick'}>@{trainer.memberNick}</span>
					<div className={'trainer-stats'}>
						<span>👤 {displayFollowers}</span>
						<span>🏋️ {trainer.memberPrograms ?? 0} programs</span>
					</div>
				</div>
			</Link>
		);
	};

	const slides = trainers.map((trainer) => (
		<SwiperSlide key={trainer._id} className={'trainer-slide'}>
			<TrainerCard trainer={trainer} />
		</SwiperSlide>
	));

	return (
		<div className={'top-trainers'}>
			<div className={'container'}>
				<div className={'info-box'}>
					<div className={'left'}>
						<span className={'section-label'}>MEET THE COACHES</span>
						<h2>Top Trainers</h2>
						<p>Expert coaches ready to guide your journey</p>
					</div>
					<div className={'right'}>
						<Link href={'/trainer'}>
							<span className={'see-all-link'}>See All Trainers →</span>
						</Link>
					</div>
				</div>
				<div className={'wrapper'}>
					<div className={'switch-btn swiper-trainers-prev'}>
						<ChevronLeft />
					</div>
					<div className={'card-wrapper'}>
						<Swiper
							className={'trainers-swiper'}
							slidesPerView={'auto'}
							spaceBetween={24}
							autoplay={{ delay: 0, disableOnInteraction: false, reverseDirection: true, pauseOnMouseEnter: true }}
							speed={3000}
							loop
							loopedSlides={3}
							modules={[Autoplay, Navigation]}
							navigation={{ nextEl: '.swiper-trainers-next', prevEl: '.swiper-trainers-prev' }}
						>
							{slides}
						</Swiper>
					</div>
					<div className={'switch-btn swiper-trainers-next'}>
						<ChevronRight />
					</div>
				</div>
			</div>
		</div>
	);
};

export default TopTrainers;
