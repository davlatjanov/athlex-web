import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import Link from 'next/link';
import ProgramCard from './ProgramCard';

const topPrograms = [
	{
		id: '1',
		name: 'Elite Mass Protocol',
		type: 'MASS GAIN',
		level: 'ADVANCED',
		duration: 16,
		price: 89,
		rank: 1,
		rating: 4.9,
		views: 18400,
		likes: 920,
		members: 3100,
		gradient: 'linear-gradient(160deg, #1a0505 0%, #3d0f0f 100%)',
			image: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&fit=crop&auto=format&q=80',
	},
	{
		id: '2',
		name: 'Total Body Transformation',
		type: 'FUNCTIONAL',
		level: 'INTERMEDIATE',
		duration: 12,
		price: 69,
		rank: 2,
		rating: 4.8,
		views: 15200,
		likes: 740,
		members: 2600,
		gradient: 'linear-gradient(160deg, #050a1a 0%, #0f1a3d 100%)',
			image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&fit=crop&auto=format&q=80',
	},
	{
		id: '3',
		name: 'Olympic Strength Base',
		type: 'STRENGTH',
		level: 'ADVANCED',
		duration: 20,
		price: 99,
		rank: 3,
		rating: 4.9,
		views: 13800,
		likes: 680,
		members: 2200,
		gradient: 'linear-gradient(160deg, #0a0a0a 0%, #1f1f1f 100%)',
			image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&fit=crop&auto=format&q=80',
	},
	{
		id: '4',
		name: 'Rapid Fat Loss System',
		type: 'WEIGHT LOSS',
		level: 'INTERMEDIATE',
		duration: 8,
		price: 49,
		rank: 4,
		rating: 4.7,
		views: 11600,
		likes: 590,
		members: 1950,
		gradient: 'linear-gradient(160deg, #0a1a05 0%, #1a3d0f 100%)',
			image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&fit=crop&auto=format&q=80',
	},
	{
		id: '5',
		name: 'Advanced Yoga & Breath',
		type: 'YOGA',
		level: 'ADVANCED',
		duration: 10,
		price: 55,
		rank: 5,
		rating: 4.8,
		views: 9200,
		likes: 480,
		members: 1400,
		gradient: 'linear-gradient(160deg, #05101a 0%, #0f203d 100%)',
			image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&fit=crop&auto=format&q=80',
	},
	{
		id: '6',
		name: 'Recovery & Rebuild',
		type: 'REHABILITATION',
		level: 'BEGINNER',
		duration: 6,
		price: 39,
		rank: 6,
		rating: 4.9,
		views: 7800,
		likes: 430,
		members: 1100,
		gradient: 'linear-gradient(160deg, #1a1005 0%, #3d250f 100%)',
			image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&fit=crop&auto=format&q=80',
	},
	{
		id: '7',
		name: 'Sport Performance Edge',
		type: 'FUNCTIONAL',
		level: 'ADVANCED',
		duration: 14,
		price: 75,
		rank: 7,
		rating: 4.7,
		views: 6400,
		likes: 360,
		members: 890,
		gradient: 'linear-gradient(160deg, #100a1a 0%, #1a123d 100%)',
			image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&fit=crop&auto=format&q=80',
	},
	{
		id: '8',
		name: 'Beginner Blueprint',
		type: 'STRENGTH',
		level: 'BEGINNER',
		duration: 8,
		price: 0,
		rank: 8,
		rating: 4.8,
		views: 14600,
		likes: 820,
		members: 4200,
		gradient: 'linear-gradient(160deg, #0a0a1a 0%, #151530 100%)',
			image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&fit=crop&auto=format&q=80',
	},
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
						<Swiper
							className={'program-swiper'}
							slidesPerView={'auto'}
							centeredSlides
							spaceBetween={15}
							modules={[Autoplay]}
						>
							{topPrograms.map((prog) => (
								<SwiperSlide key={prog.id} className={'program-slide'}>
									<ProgramCard {...prog} />
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
						autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
						speed={3400}
						loop
						loopedSlides={4}
						navigation={{ nextEl: '.swiper-top-next', prevEl: '.swiper-top-prev' }}
						pagination={{ el: '.swiper-top-pagination' }}
					>
						{topPrograms.map((prog) => (
							<SwiperSlide key={prog.id} className={'program-slide'}>
								<ProgramCard {...prog} />
							</SwiperSlide>
						))}
					</Swiper>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default TopPrograms;
