import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			switch (router.pathname) {
				case '/programs':
					title = 'Training Programs';
					desc = 'Expert-crafted programs for every level';
					bgImage = 'https://images.pexels.com/photos/6456128/pexels-photo-6456128.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&dpr=1';
					break;
				case '/trainer':
					title = 'Trainers';
					desc = 'Find your perfect coach and start training';
					bgImage = 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&dpr=1';
					break;
				case '/products':
					title = 'Shop';
					desc = 'Premium gear and supplements for athletes';
					bgImage = 'https://images.pexels.com/photos/5327555/pexels-photo-5327555.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&dpr=1';
					break;
				case '/community':
					title = 'Community';
					desc = 'Connect · Compete · Inspire';
					bgImage = 'https://images.pexels.com/photos/5961414/pexels-photo-5961414.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&dpr=1';
					break;
				case '/community/detail':
					title = 'Community';
					desc = 'Connect · Compete · Inspire';
					bgImage = 'https://images.pexels.com/photos/5961414/pexels-photo-5961414.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&dpr=1';
					break;
				case '/member':
					title = 'Athlete Profile';
					desc = 'Track progress · Build connections';
					bgImage = 'https://images.pexels.com/photos/4498483/pexels-photo-4498483.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&dpr=1';
					break;
				case '/cs':
					title = 'Customer Support';
					desc = 'We are here to help you';
					bgImage = 'https://images.pexels.com/photos/6389892/pexels-photo-6389892.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&dpr=1';
					break;
				case '/account/join':
					title = 'Join Athlex';
					desc = 'Start your fitness journey today';
					bgImage = 'https://images.pexels.com/photos/6389892/pexels-photo-6389892.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&dpr=1';
					setAuthHeader(true);
					break;
				default:
					break;
			}

			return { title, desc, bgImage };
		}, [router.pathname]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Athlex</title>
						<meta name={'title'} content={`Athlex`} />
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
						<title>Athlex</title>
						<meta name={'title'} content={`Athlex`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						{memoizedValues.title && (
							<div className={`header-basic ${authHeader ? 'auth' : ''}`}>
								<div className={'container hb-container'}>
									{memoizedValues.bgImage && (
										<img src={memoizedValues.bgImage} alt="" className={'hb-bg-img'} />
									)}
									<div className={'hb-overlay'} />
									<strong>{t(memoizedValues.title)}</strong>
									<span>{t(memoizedValues.desc)}</span>
								</div>
							</div>
						)}

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
