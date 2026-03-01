import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import Link from 'next/link';

const topPrograms = [
	{ id: '1', name: 'Elite Mass Protocol', type: 'MASS GAIN', level: 'ADVANCED', duration: 16, price: 89, rank: 1, rating: 4.9, gradient: 'linear-gradient(160deg, #1a0505 0%, #3d0f0f 100%)' },
	{ id: '2', name: 'Total Body Transformation', type: 'FUNCTIONAL', level: 'INTERMEDIATE', duration: 12, price: 69, rank: 2, rating: 4.8, gradient: 'linear-gradient(160deg, #050a1a 0%, #0f1a3d 100%)' },
	{ id: '3', name: 'Olympic Strength Base', type: 'STRENGTH', level: 'ADVANCED', duration: 20, price: 99, rank: 3, rating: 4.9, gradient: 'linear-gradient(160deg, #0a0a0a 0%, #1f1f1f 100%)' },
	{ id: '4', name: 'Rapid Fat Loss System', type: 'WEIGHT LOSS', level: 'INTERMEDIATE', duration: 8, price: 49, rank: 4, rating: 4.7, gradient: 'linear-gradient(160deg, #0a1a05 0%, #1a3d0f 100%)' },
	{ id: '5', name: 'Advanced Yoga & Breath', type: 'YOGA', level: 'ADVANCED', duration: 10, price: 55, rank: 5, rating: 4.8, gradient: 'linear-gradient(160deg, #05101a 0%, #0f203d 100%)' },
	{ id: '6', name: 'Recovery & Rebuild', type: 'REHABILITATION', level: 'BEGINNER', duration: 6, price: 39, rank: 6, rating: 4.9, gradient: 'linear-gradient(160deg, #1a1005 0%, #3d250f 100%)' },
	{ id: '7', name: 'Sport Performance Edge', type: 'FUNCTIONAL', level: 'ADVANCED', duration: 14, price: 75, rank: 7, rating: 4.7, gradient: 'linear-gradient(160deg, #100a1a 0%, #1a123d 100%)' },
	{ id: '8', name: 'Beginner Blueprint', type: 'STRENGTH', level: 'BEGINNER', duration: 8, price: 0, rank: 8, rating: 4.8, gradient: 'linear-gradient(160deg, #0a0a1a 0%, #151530 100%)' },
];

const TopPrograms = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'top-programs'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span className={'section-label'}>TOP RATED</span>
						<h2>Top Programs</h2>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper className={'program-swiper'} slidesPerView={'auto'} centeredSlides spaceBetween={15} modules={[Autoplay]}>
							{topPrograms.map((prog) => (
								<SwiperSlide key={prog.id} className={'program-slide'}>
									<Link href={`/programs/${prog.id}`}>
										<Box className={'program-card top-card'}>
											<div className={'card-img'} style={{ background: prog.gradient }}>
												<span className={'rank-badge'}>#{prog.rank}</span>
												<span className={'price-tag'}>{prog.price === 0 ? 'FREE' : `$${prog.price}`}</span>
											</div>
											<div className={'card-body'}>
												<strong className={'card-title'}>{prog.name}</strong>
												<div className={'card-meta'}>
													<span className={'type-badge small'}>{prog.type}</span>
													<span className={'rating'}>★ {prog.rating}</span>
												</div>
												<div className={'card-footer'}>
													<span className={'level-badge'}>{prog.level}</span>
													<span className={'duration'}>{prog.duration}W</span>
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
		<Stack className={'top-programs'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span className={'section-label'}>TOP RATED</span>
						<h2>Top Programs</h2>
						<p>Our highest-ranked training programs</p>
					</Box>
					<Box component={'div'} className={'right'}>
						<div className={'pagination-box'}>
							<WestIcon className={'swiper-top-prev'} />
							<div className={'swiper-top-pagination'} />
							<EastIcon className={'swiper-top-next'} />
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
						navigation={{ nextEl: '.swiper-top-next', prevEl: '.swiper-top-prev' }}
						pagination={{ el: '.swiper-top-pagination' }}
					>
						{topPrograms.map((prog) => (
							<SwiperSlide key={prog.id} className={'program-slide'}>
								<Link href={`/programs/${prog.id}`}>
									<Box className={'program-card top-card'}>
										<div className={'card-img'} style={{ background: prog.gradient }}>
											<span className={'rank-badge'}>#{prog.rank}</span>
											<span className={'price-tag'}>{prog.price === 0 ? 'FREE' : `$${prog.price}`}</span>
										</div>
										<div className={'card-body'}>
											<strong className={'card-title'}>{prog.name}</strong>
											<div className={'card-meta'}>
												<span className={'type-badge small'}>{prog.type}</span>
												<span className={'rating'}>★ {prog.rating}</span>
											</div>
											<div className={'card-footer'}>
												<span className={'level-badge'}>{prog.level}</span>
												<span className={'duration'}>{prog.duration} Weeks</span>
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

export default TopPrograms;
