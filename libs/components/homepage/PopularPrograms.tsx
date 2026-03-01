import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import Link from 'next/link';

const popularPrograms = [
	{ id: '1', name: 'The 6-Week Shred', type: 'WEIGHT LOSS', level: 'INTERMEDIATE', duration: 6, price: 34, views: 12400, members: 2100, gradient: 'linear-gradient(160deg, #0a1a0a 0%, #1a3d1a 100%)' },
	{ id: '2', name: 'Beginner Strength Foundation', type: 'STRENGTH', level: 'BEGINNER', duration: 8, price: 0, views: 10800, members: 3200, gradient: 'linear-gradient(160deg, #0a0a1a 0%, #1a1a3d 100%)' },
	{ id: '3', name: 'Body Recomposition Pro', type: 'FUNCTIONAL', level: 'INTERMEDIATE', duration: 12, price: 59, views: 9600, members: 1540, gradient: 'linear-gradient(160deg, #1a0a0a 0%, #2d1a1a 100%)' },
	{ id: '4', name: 'Morning Mobility Flow', type: 'MOBILITY', level: 'BEGINNER', duration: 4, price: 0, views: 8900, members: 4100, gradient: 'linear-gradient(160deg, #0a1a1a 0%, #1a2d2d 100%)' },
	{ id: '5', name: 'Powerlifting Prep', type: 'STRENGTH', level: 'ADVANCED', duration: 16, price: 79, views: 7800, members: 890, gradient: 'linear-gradient(160deg, #1a1a0a 0%, #2d2d1a 100%)' },
	{ id: '6', name: 'Cardio Kickstarter', type: 'CARDIO', level: 'BEGINNER', duration: 4, price: 15, views: 7200, members: 2780, gradient: 'linear-gradient(160deg, #1a0a1a 0%, #2d1a2d 100%)' },
	{ id: '7', name: 'Yoga for Athletes', type: 'YOGA', level: 'INTERMEDIATE', duration: 6, price: 29, views: 6500, members: 1230, gradient: 'linear-gradient(160deg, #0f1a0a 0%, #1a2d12 100%)' },
];

const PopularPrograms = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'popular-programs'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span className={'section-label'}>POPULAR</span>
						<h2>Popular Programs</h2>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper className={'program-swiper'} slidesPerView={'auto'} centeredSlides spaceBetween={25} modules={[Autoplay]}>
							{popularPrograms.map((prog) => (
								<SwiperSlide key={prog.id} className={'program-slide'}>
									<Link href={`/programs/${prog.id}`}>
										<Box className={'program-card popular-card'}>
											<div className={'card-img'} style={{ background: prog.gradient }}>
												<span className={'type-badge'}>{prog.type}</span>
												<span className={'price-tag'}>{prog.price === 0 ? 'FREE' : `$${prog.price}`}</span>
											</div>
											<div className={'card-body'}>
												<strong className={'card-title'}>{prog.name}</strong>
												<div className={'card-meta'}>
													<span className={'level-badge'}>{prog.level}</span>
													<span className={'duration'}>{prog.duration}W</span>
												</div>
												<div className={'card-footer'}>
													<span className={'views'}>👁 {(prog.views / 1000).toFixed(1)}K</span>
													<span className={'card-members'}>👤 {prog.members}</span>
												</div>
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
		<Stack className={'popular-programs'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span className={'section-label'}>MOST VIEWED</span>
						<h2>Popular Programs</h2>
						<p>Ranked by total views</p>
					</Box>
					<Box component={'div'} className={'right'}>
						<div className={'pagination-box'}>
							<WestIcon className={'swiper-popular-prev'} />
							<div className={'swiper-popular-pagination'} />
							<EastIcon className={'swiper-popular-next'} />
						</div>
						<Link href={'/programs'}>
							<span className={'see-all-link'}>See All →</span>
						</Link>
					</Box>
				</Stack>
				<Stack className={'card-box'}>
					<Swiper
						className={'program-swiper'}
						slidesPerView={'auto'}
						spaceBetween={20}
						modules={[Autoplay, Navigation, Pagination]}
						navigation={{ nextEl: '.swiper-popular-next', prevEl: '.swiper-popular-prev' }}
						pagination={{ el: '.swiper-popular-pagination' }}
					>
						{popularPrograms.map((prog) => (
							<SwiperSlide key={prog.id} className={'program-slide'}>
								<Link href={`/programs/${prog.id}`}>
									<Box className={'program-card popular-card'}>
										<div className={'card-img'} style={{ background: prog.gradient }}>
											<span className={'type-badge'}>{prog.type}</span>
											<span className={'price-tag'}>{prog.price === 0 ? 'FREE' : `$${prog.price}`}</span>
										</div>
										<div className={'card-body'}>
											<strong className={'card-title'}>{prog.name}</strong>
											<div className={'card-meta'}>
												<span className={'level-badge'}>{prog.level}</span>
												<span className={'duration'}>{prog.duration} Weeks</span>
											</div>
											<div className={'card-footer'}>
												<span className={'views'}>👁 {(prog.views / 1000).toFixed(1)}K views</span>
												<span className={'card-members'}>👤 {prog.members}</span>
											</div>
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
};

export default PopularPrograms;
