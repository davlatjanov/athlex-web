import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';

import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutFull = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

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
						<title>Athlex</title>
						<meta name={'title'} content={`Athlex`} />
					</Head>
					<div id="pc-wrap">
						<div id={'top'}>
							<Top />
						</div>

						<div id={'main'}>
							<Component {...props} />
						</div>

						<Chat />

						<div id={'footer'}>
							<Footer />
						</div>
					</div>
				</>
			);
		}
	};
};

export default withLayoutFull;
