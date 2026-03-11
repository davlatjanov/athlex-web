import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import Link from 'next/link';
import ProgramCard from './ProgramCard';
import { useQuery } from '@apollo/client';
import { GET_PROGRAMS } from '../../../apollo/user/query';
import { T } from '../../types/common';

const typeGradients: Record<string, string> = {
	MASS_GAIN: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
	WEIGHT_LOSS: 'linear-gradient(135deg, #0f3460 0%, #e94560 100%)',
	STRENGTH: 'linear-gradient(135deg, #1a1a2e 0%, #e92c28 100%)',
	CARDIO: 'linear-gradient(135deg, #0f3460 0%, #533483 100%)',
	YOGA: 'linear-gradient(135deg, #1b4332 0%, #40916c 100%)',
	FUNCTIONAL: 'linear-gradient(135deg, #212529 0%, #495057 100%)',
	REHABILITATION: 'linear-gradient(135deg, #003566 0%, #0077b6 100%)',
	MOBILITY: 'linear-gradient(135deg, #370617 0%, #e85d04 100%)',
	BEGINNERS: 'linear-gradient(135deg, #1b263b 0%, #415a77 100%)',
};

const PopularPrograms = () => {
	const device = useDeviceDetect();
	const [programs, setPrograms] = useState<any[]>([]);

	useQuery(GET_PROGRAMS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 8, sort: 'programViews', direction: 'DESC', programStatus: 'ACTIVE' },
		},
		onCompleted: (data: T) => setPrograms(data?.getPrograms?.list ?? []),
	});

	const slides = programs.map((prog) => (
		<SwiperSlide key={prog._id} className={'program-slide'}>
			<ProgramCard
				id={prog._id}
				name={prog.programName}
				type={prog.programType}
				level={prog.programLevel}
				duration={prog.programDuration}
				price={prog.programPrice}
				views={prog.programViews}
				likes={prog.programLikes}
				members={prog.programMembers}
				image={prog.programImages?.[0]}
				gradient={typeGradients[prog.programType] ?? typeGradients['STRENGTH']}
			/>
		</SwiperSlide>
	));

	if (device === 'mobile') {
		return (
			<Stack className={'popular-programs'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span className={'section-label'}>POPULAR</span>
						<h2>Popular Programs</h2>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'program-swiper'}
							slidesPerView={'auto'}
							centeredSlides
							spaceBetween={25}
							modules={[Autoplay]}
						>
							{slides}
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
						autoplay={{ delay: 0, disableOnInteraction: false, reverseDirection: true, pauseOnMouseEnter: true }}
						speed={3200}
						loop
						loopedSlides={4}
						navigation={{ nextEl: '.swiper-popular-next', prevEl: '.swiper-popular-prev' }}
						pagination={{ el: '.swiper-popular-pagination' }}
					>
						{slides}
					</Swiper>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default PopularPrograms;
