import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

const TopPrograms = () => {
	const [programs, setPrograms] = useState<any[]>([]);

	useQuery(GET_PROGRAMS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 8, sort: 'programRank', direction: 'DESC', programStatus: 'ACTIVE' },
		},
		onCompleted: (data: T) => setPrograms(data?.getPrograms?.list ?? []),
	});

	const slides = programs.map((prog, idx) => (
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
				rank={idx + 1}
				image={prog.programImages?.[0]}
				gradient={typeGradients[prog.programType] ?? typeGradients['STRENGTH']}
				meLiked={prog.meLiked}
			/>
		</SwiperSlide>
	));

	return (
		<div className={'top-programs'}>
			<div className={'container'}>
				<div className={'info-box'}>
					<div className={'left'}>
						<span className={'section-label'}>TOP RATED</span>
						<h2>Top Programs</h2>
						<p>Our highest-ranked training programs</p>
					</div>
					<div className={'right'}>
						<div className={'pagination-box'}>
							<ChevronLeft className={'swiper-top-prev'} />
							<div className={'swiper-top-pagination'} />
							<ChevronRight className={'swiper-top-next'} />
						</div>
						<Link href={'/programs'}>
							<span className={'see-all-link'}>See All →</span>
						</Link>
					</div>
				</div>
				<div className={'card-box'}>
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
						{slides}
					</Swiper>
				</div>
			</div>
		</div>
	);
};

export default TopPrograms;
