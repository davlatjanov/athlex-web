import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import AICoachWidget from '../AICoachWidget';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			switch (router.pathname) {
				case '/programs':
					title = 'Programs Built to Perform';
					desc = 'From beginner to elite — find the program that transforms you.';
					bgImage = 'https://i.pinimg.com/736x/e7/7e/30/e77e3098a5bf5d630418d7c7cc133092.jpg';
					break;
				case '/trainer':
					title = 'Train Under the Best';
					desc = 'Connect with certified coaches who push you further than you thought possible.';
					bgImage = 'https://i.pinimg.com/1200x/6d/10/d1/6d10d1e5cc21d22bf513221855b572a1.jpg';
					break;
				case '/products':
					title = 'Gear Up. Perform More.';
					desc = 'Premium supplements, equipment and gear built for serious athletes.';
					bgImage = 'https://i.pinimg.com/736x/13/c8/34/13c83449624a1a9ea2672a5ebdaf97ec.jpg';
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
					bgImage = 'https://i.pinimg.com/1200x/01/96/59/019659b0cdc8c3869ee47a138bfd87b1.jpg';
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
									<div className={'hb-text'}>
										<strong className={'hb-title'}>{t(memoizedValues.title)}</strong>
										<span className={'hb-desc'}>{t(memoizedValues.desc)}</span>
									</div>
								</div>
							</div>
						)}

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

export default withLayoutBasic;
