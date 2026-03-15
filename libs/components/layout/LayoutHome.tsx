import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
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
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>
						<Stack id={'main'}>
							<Component {...props} />
						</Stack>
						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
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
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack className={'header-main'}>
							<HeroSection />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<AICoachWidget />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutMain;
