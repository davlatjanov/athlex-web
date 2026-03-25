import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';

import HeroSection from '../homepage/HeroSection';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import AICoachWidget from '../AICoachWidget';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		useReactiveVar(userVar);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Athlex — Premium Fitness Programs & Expert Trainers</title>
						<meta name={'description'} content={'Find top-rated fitness programs, expert personal trainers, and a supportive gym community on Athlex.'} />
						<meta name={'keywords'} content={'gym, fitness programs, personal trainers, workout, muscle gain, weight loss, athlex'} />
						<meta property={'og:title'} content={'Athlex — Forge Your Limits'} />
						<meta property={'og:description'} content={'Premium training programs and expert coaches on Athlex.'} />
					</Head>
					<div id="mobile-wrap">
						<div id={'top'}>
							<Top />
						</div>
						<div id={'main'}>
							<Component {...props} />
						</div>
						<div id={'footer'}>
							<Footer />
						</div>
					</div>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>Athlex — Premium Fitness Programs & Expert Trainers</title>
						<meta name={'description'} content={'Find top-rated fitness programs, expert personal trainers, and a supportive gym community on Athlex.'} />
						<meta name={'keywords'} content={'gym, fitness programs, personal trainers, workout, muscle gain, weight loss, athlex'} />
						<meta property={'og:title'} content={'Athlex — Forge Your Limits'} />
						<meta property={'og:description'} content={'Premium training programs and expert coaches on Athlex.'} />
					</Head>
					<div id="pc-wrap">
						<div id={'top'}>
							<Top />
						</div>

						<div className={'header-main'}>
							<HeroSection />
						</div>

						<div id={'main'}>
							<Component {...props} />
						</div>

						<AICoachWidget />

						<div id={'footer'}>
							<Footer />
						</div>
					</div>
				</>
			);
		}
	};
};

export default withLayoutMain;
