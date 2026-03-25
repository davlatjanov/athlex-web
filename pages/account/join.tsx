import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
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
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loginView, setLoginView] = useState<boolean>(true);
	const [selectedType, setSelectedType] = useState<'USER' | 'TRAINER'>('USER');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	/** LIFECYCLES **/
	useEffect(() => {
		if (getJwtToken()) router.replace('/');
	}, []);

	const switchView = (toLogin: boolean) => {
		setInput({ nick: '', password: '', phone: '', type: 'USER' });
		setConfirmPassword('');
		setSelectedType('USER');
		setShowPassword(false);
		setShowConfirmPassword(false);
		setLoginView(toLogin);
	};

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
			if (input.password !== confirmPassword) {
				await sweetMixinErrorAlert('Passwords do not match');
				return;
			}
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, confirmPassword]);

	const selectType = (type: 'USER' | 'TRAINER') => {
		setSelectedType(type);
		handleInput('type', type);
	};

	const EyeIcon = ({ visible }: { visible: boolean }) => (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			{visible ? (
				<>
					<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
					<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
					<line x1="1" y1="1" x2="23" y2="23" />
				</>
			) : (
				<>
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
					<circle cx="12" cy="12" r="3" />
				</>
			)}
		</svg>
	);

	return (
		<Stack className={'join-page'}>
			<Head><title>Athlex | Sign In</title></Head>
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
											key="login-nick"
											type="text"
											placeholder="Username"
											value={input.nick}
											onChange={(e) => handleInput('nick', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doLogin(); }}
										/>
									</div>
									<div className={'jf-field'}>
										<input
											key="login-password"
											type={showPassword ? 'text' : 'password'}
											placeholder="Password"
											value={input.password}
											onChange={(e) => handleInput('password', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doLogin(); }}
										/>
										<button type="button" className={'jf-eye'} onClick={() => setShowPassword((p) => !p)}>
											<EyeIcon visible={showPassword} />
										</button>
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
											key="signup-nick"
											type="text"
											placeholder="Username"
											value={input.nick}
											onChange={(e) => handleInput('nick', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doSignUp(); }}
										/>
									</div>
									<div className={'jf-field'}>
										<input
											key="signup-phone"
											type="tel"
											placeholder="Phone number"
											value={input.phone}
											onChange={(e) => handleInput('phone', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doSignUp(); }}
										/>
									</div>
									<div className={'jf-field'}>
										<input
											key="signup-password"
											type={showPassword ? 'text' : 'password'}
											placeholder="Password"
											value={input.password}
											onChange={(e) => handleInput('password', e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doSignUp(); }}
										/>
										<button type="button" className={'jf-eye'} onClick={() => setShowPassword((p) => !p)}>
											<EyeIcon visible={showPassword} />
										</button>
									</div>
									<div className={'jf-field'}>
										<input
											key="signup-confirm"
											type={showConfirmPassword ? 'text' : 'password'}
											placeholder="Confirm password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') doSignUp(); }}
										/>
										<button type="button" className={'jf-eye'} onClick={() => setShowConfirmPassword((p) => !p)}>
											<EyeIcon visible={showConfirmPassword} />
										</button>
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
										disabled={!input.nick || !input.password || !input.phone || !confirmPassword}
										onClick={doSignUp}
									>
										Sign Up
									</button>
								</>
							)}

							<div className={'jf-switch'}>
								{loginView ? (
									<p>Don&apos;t have an account? <b onClick={() => switchView(false)}>Sign Up</b></p>
								) : (
									<p>Already have an account? <b onClick={() => switchView(true)}>Sign In</b></p>
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
