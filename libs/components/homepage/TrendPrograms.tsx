import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import Link from 'next/link';

const trendPrograms = [
	{ id: '1', name: 'Alpha Muscle Builder', type: 'MASS GAIN', level: 'ADVANCED', duration: 12, price: 49, likes: 342, members: 1240, gradient: 'linear-gradient(160deg, #1a0a0a 0%, #3d1212 100%)' },
	{ id: '2', name: 'Fat Torch Express', type: 'WEIGHT LOSS', level: 'BEGINNER', duration: 8, price: 29, likes: 289, members: 980, gradient: 'linear-gradient(160deg, #0a1a0a 0%, #123d12 100%)' },
	{ id: '3', name: 'Power Lift Fundamentals', type: 'STRENGTH', level: 'INTERMEDIATE', duration: 10, price: 39, likes: 256, members: 870, gradient: 'linear-gradient(160deg, #0a0a1a 0%, #12123d 100%)' },
	{ id: '4', name: 'HIIT Cardio Blast', type: 'CARDIO', level: 'BEGINNER', duration: 6, price: 19, likes: 234, members: 1560, gradient: 'linear-gradient(160deg, #1a0a1a 0%, #3d123d 100%)' },
	{ id: '5', name: 'Zen Flow Yoga', type: 'YOGA', level: 'BEGINNER', duration: 8, price: 25, likes: 198, members: 720, gradient: 'linear-gradient(160deg, #0a1a1a 0%, #123d3d 100%)' },
	{ id: '6', name: 'Athletic Movement Lab', type: 'FUNCTIONAL', level: 'INTERMEDIATE', duration: 10, price: 35, likes: 187, members: 640, gradient: 'linear-gradient(160deg, #1a1a0a 0%, #3d3d12 100%)' },
	{ id: '7', name: 'Comeback Program', type: 'REHABILITATION', level: 'BEGINNER', duration: 6, price: 45, likes: 156, members: 430, gradient: 'linear-gradient(160deg, #1a0f0a 0%, #3d2512 100%)' },
	{ id: '8', name: 'Mobility & Flexibility Pro', type: 'MOBILITY', level: 'INTERMEDIATE', duration: 8, price: 30, likes: 145, members: 510, gradient: 'linear-gradient(160deg, #0f0a1a 0%, #25123d 100%)' },
];

const TrendPrograms = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'trend-programs'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span className={'section-label'}>TRENDING</span>
						<h2>Trending Programs</h2>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper className={'program-swiper'} slidesPerView={'auto'} centeredSlides spaceBetween={15} modules={[Autoplay]}>
							{trendPrograms.map((prog) => (
								<SwiperSlide key={prog.id} className={'program-slide'}>
									<Link href={`/programs/${prog.id}`}>
										<Box className={'program-card'}>
											<div className={'card-img'} style={{ background: prog.gradient }}>
												<span className={'type-badge'}>{prog.type}</span>
												<span className={'price-tag'}>${prog.price}</span>
											</div>
											<div className={'card-body'}>
												<strong className={'card-title'}>{prog.name}</strong>
												<div className={'card-meta'}>
													<span className={'level-badge'}>{prog.level}</span>
													<span className={'duration'}>{prog.duration}W</span>
												</div>
												<div className={'card-footer'}>
													<span className={'likes'}>♥ {prog.likes}</span>
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
		<Stack className={'trend-programs'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span className={'section-label'}>TRENDING NOW</span>
						<h2>Trending Programs</h2>
						<p>Ranked by community likes</p>
					</Box>
					<Box component={'div'} className={'right'}>
						<div className={'pagination-box'}>
							<WestIcon className={'swiper-trend-prev'} />
							<div className={'swiper-trend-pagination'} />
							<EastIcon className={'swiper-trend-next'} />
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
						navigation={{ nextEl: '.swiper-trend-next', prevEl: '.swiper-trend-prev' }}
						pagination={{ el: '.swiper-trend-pagination' }}
					>
						{trendPrograms.map((prog) => (
							<SwiperSlide key={prog.id} className={'program-slide'}>
								<Link href={`/programs/${prog.id}`}>
									<Box className={'program-card'}>
										<div className={'card-img'} style={{ background: prog.gradient }}>
											<span className={'type-badge'}>{prog.type}</span>
											<span className={'price-tag'}>${prog.price}</span>
										</div>
										<div className={'card-body'}>
											<strong className={'card-title'}>{prog.name}</strong>
											<div className={'card-meta'}>
												<span className={'level-badge'}>{prog.level}</span>
												<span className={'duration'}>{prog.duration} Weeks</span>
											</div>
											<div className={'card-footer'}>
												<span className={'likes'}>♥ {prog.likes}</span>
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

export default TrendPrograms;
