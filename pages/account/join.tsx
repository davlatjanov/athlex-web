import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { getJwtToken, logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);
	const [selectedType, setSelectedType] = useState<'USER' | 'TRAINER'>('USER');

	/** LIFECYCLES **/
	useEffect(() => {
		if (getJwtToken()) router.replace('/');
	}, []);

	/** HANDLERS **/
	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => ({ ...prev, [name]: value }));
	}, []);

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const selectType = (type: 'USER' | 'TRAINER') => {
		setSelectedType(type);
		handleInput('type', type);
	};

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	}

	return (
		<Stack className={'join-page'}>
			<Stack className={'container'}>
				<Stack className={'main'}>

					{/* ── Left: Welcome panel ── */}
					<div className={'join-welcome'}>
						<div className={'jw-overlay'} />
						<div className={'jw-content'}>
							<div className={'jw-brand'}>ATHLEX</div>
							<h1>Hello!</h1>
							<p>Welcome to Athlex.<br />Your fitness journey starts here.</p>
						</div>
					</div>

					{/* ── Right: Form panel ── */}
					<div className={'join-form'}>
						<div className={'jf-inner'}>
							<div className={'jf-brand'}>ATHLEX</div>

							<h2>{loginView ? 'Login to your account' : 'Create your account'}</h2>

							{/* Login fields */}
							{loginView ? (
								<>
									<div className={'jf-field'}>
										<input
											type="text"
											placeholder="Username"
											onChange={(e) => handleInput('nick', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doLogin(); }}
										/>
									</div>
									<div className={'jf-field'}>
										<input
											type="password"
											placeholder="Password"
											onChange={(e) => handleInput('password', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doLogin(); }}
										/>
									</div>
									<div className={'jf-forgot'}>
										<a>Forgot password?</a>
									</div>
									<button
										className={'jf-submit'}
										disabled={!input.nick || !input.password}
										onClick={doLogin}
									>
										Sign In
									</button>
								</>
							) : (
								<>
									<div className={'jf-field'}>
										<input
											type="text"
											placeholder="Username"
											onChange={(e) => handleInput('nick', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doSignUp(); }}
										/>
									</div>
									<div className={'jf-field'}>
										<input
											type="tel"
											placeholder="Phone number"
											onChange={(e) => handleInput('phone', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doSignUp(); }}
										/>
									</div>
									<div className={'jf-field'}>
										<input
											type="password"
											placeholder="Password"
											onChange={(e) => handleInput('password', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doSignUp(); }}
										/>
									</div>
									{/* Role selector */}
									<div className={'jf-roles'}>
										<button
											className={`jf-role-btn ${selectedType === 'USER' ? 'active' : ''}`}
											onClick={() => selectType('USER')}
										>
											User
										</button>
										<button
											className={`jf-role-btn ${selectedType === 'TRAINER' ? 'active' : ''}`}
											onClick={() => selectType('TRAINER')}
										>
											Trainer
										</button>
									</div>
									<button
										className={'jf-submit'}
										disabled={!input.nick || !input.password || !input.phone}
										onClick={doSignUp}
									>
										Sign Up
									</button>
								</>
							)}

							<div className={'jf-switch'}>
								{loginView ? (
									<p>Don't have an account? <b onClick={() => setLoginView(false)}>Sign Up</b></p>
								) : (
									<p>Already have an account? <b onClick={() => setLoginView(true)}>Sign In</b></p>
								)}
							</div>
						</div>
					</div>

				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(Join);
