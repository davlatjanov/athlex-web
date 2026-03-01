import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper';
import Link from 'next/link';

const topTrainers = [
	{ id: '1', fullName: 'Marcus Johnson', nick: 'marcus_j', specialty: 'Strength & Powerlifting', plan: 'PRO', followers: 2400, rating: 4.9, programs: 12, gradient: 'linear-gradient(135deg, #1a0a0a 0%, #2d1515 100%)' },
	{ id: '2', fullName: 'Sarah Chen', nick: 'sarah_fit', specialty: 'Yoga & Flexibility', plan: 'ADVANCED', followers: 1800, rating: 4.8, programs: 8, gradient: 'linear-gradient(135deg, #0a1a0a 0%, #152d15 100%)' },
	{ id: '3', fullName: 'David Park', nick: 'dpark_hiit', specialty: 'HIIT & Cardio', plan: 'ADVANCED', followers: 1500, rating: 4.9, programs: 15, gradient: 'linear-gradient(135deg, #0a0a1a 0%, #15152d 100%)' },
	{ id: '4', fullName: 'Emma Rodriguez', nick: 'emma_rehab', specialty: 'Rehabilitation', plan: 'ADVANCED', followers: 1200, rating: 4.7, programs: 6, gradient: 'linear-gradient(135deg, #1a1a0a 0%, #2d2d15 100%)' },
	{ id: '5', fullName: 'Chris Thompson', nick: 'chris_move', specialty: 'Functional Training', plan: 'ADVANCED', followers: 980, rating: 4.8, programs: 9, gradient: 'linear-gradient(135deg, #0a1a1a 0%, #152d2d 100%)' },
	{ id: '6', fullName: 'Aisha Williams', nick: 'aisha_pro', specialty: 'Weight Loss & Nutrition', plan: 'PRO', followers: 2100, rating: 4.9, programs: 11, gradient: 'linear-gradient(135deg, #1a050a 0%, #2d0f15 100%)' },
];

const TopTrainers = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'top-trainers'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span className={'section-label'}>OUR COACHES</span>
						<h2>Top Trainers</h2>
					</Stack>
					<Stack className={'wrapper'}>
						<Swiper className={'trainers-swiper'} slidesPerView={'auto'} centeredSlides spaceBetween={20} modules={[Autoplay]}>
							{topTrainers.map((trainer) => (
								<SwiperSlide key={trainer.id} className={'trainer-slide'}>
									<Link href={`/trainer/${trainer.id}`}>
										<Box className={'trainer-card'}>
											<div className={'trainer-avatar'} style={{ background: trainer.gradient }}>
												<span>{trainer.fullName.split(' ').map((n) => n[0]).join('')}</span>
											</div>
											<strong className={'trainer-name'}>{trainer.fullName}</strong>
											<span className={'trainer-specialty'}>{trainer.specialty}</span>
											<div className={'trainer-stats'}>
												<span>👤 {trainer.followers >= 1000 ? `${(trainer.followers / 1000).toFixed(1)}K` : trainer.followers}</span>
												<span>★ {trainer.rating}</span>
											</div>
										</Box>
									</Link>
								</SwiperSlide>
							))}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'top-trainers'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span className={'section-label'}>MEET THE COACHES</span>
						<h2>Top Trainers</h2>
						<p>Expert coaches ready to guide your journey</p>
					</Box>
					<Box component={'div'} className={'right'}>
						<Link href={'/trainer'}>
							<span className={'see-all-link'}>See All Trainers →</span>
						</Link>
					</Box>
				</Stack>
				<Stack className={'wrapper'}>
					<Box component={'div'} className={'switch-btn swiper-trainers-prev'}>
						<ArrowBackIosNewIcon />
					</Box>
					<Box component={'div'} className={'card-wrapper'}>
						<Swiper
							className={'trainers-swiper'}
							slidesPerView={'auto'}
							spaceBetween={24}
							modules={[Autoplay, Navigation]}
							navigation={{ nextEl: '.swiper-trainers-next', prevEl: '.swiper-trainers-prev' }}
						>
							{topTrainers.map((trainer) => (
								<SwiperSlide key={trainer.id} className={'trainer-slide'}>
									<Link href={`/trainer/${trainer.id}`}>
										<Box className={'trainer-card'}>
											<div className={'trainer-avatar'} style={{ background: trainer.gradient }}>
												<span>{trainer.fullName.split(' ').map((n) => n[0]).join('')}</span>
											</div>
											<span className={'plan-badge'}>{trainer.plan}</span>
											<strong className={'trainer-name'}>{trainer.fullName}</strong>
											<span className={'trainer-specialty'}>{trainer.specialty}</span>
											<div className={'trainer-stats'}>
												<span>👤 {trainer.followers >= 1000 ? `${(trainer.followers / 1000).toFixed(1)}K` : trainer.followers} followers</span>
												<span>★ {trainer.rating}</span>
											</div>
											<span className={'trainer-programs'}>{trainer.programs} Programs</span>
										</Box>
									</Link>
								</SwiperSlide>
							))}
						</Swiper>
					</Box>
					<Box component={'div'} className={'switch-btn swiper-trainers-next'}>
						<ArrowBackIosNewIcon />
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default TopTrainers;
