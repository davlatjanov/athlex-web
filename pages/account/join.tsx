import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
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

	/** HANDLERS **/
	const checkUserTypeHandler = (e: any) => {
		if (e.target.checked) handleInput('type', e.target.name);
		else handleInput('type', 'USER');
	};

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

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	} else {
		return (
			<Stack className={'join-page'}>
				<Stack className={'container'}>
					<Stack className={'main'}>
						{/* ── Left: Image bg + Form ── */}
						<div className={'left'}>
							<div className={'jl-inner'}>
								<div className={'jl-brand'}>ATHLEX</div>

								<div className={'jl-heading'}>
									<h2>{loginView ? 'Welcome Back' : 'Create Account'}</h2>
									<p>
										{loginView
											? 'Sign in to continue your fitness journey.'
											: 'Join Athlex and start training smarter.'}
									</p>
								</div>

								<div className={'jl-tabs'}>
									<button className={`jl-tab ${loginView ? 'active' : ''}`} onClick={() => setLoginView(true)}>
										Login
									</button>
									<button className={`jl-tab ${!loginView ? 'active' : ''}`} onClick={() => setLoginView(false)}>
										Sign Up
									</button>
								</div>

								<div className={'jl-form'}>
									<div className={'jl-field'}>
										<label>Username</label>
										<input
											type="text"
											placeholder="Enter your username"
											onChange={(e) => handleInput('nick', e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter' && loginView) doLogin();
												if (e.key === 'Enter' && !loginView) doSignUp();
											}}
										/>
									</div>

									<div className={'jl-field'}>
										<label>Password</label>
										<input
											type="password"
											placeholder="Enter your password"
											onChange={(e) => handleInput('password', e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter' && loginView) doLogin();
												if (e.key === 'Enter' && !loginView) doSignUp();
											}}
										/>
									</div>

									{!loginView && (
										<div className={'jl-field'}>
											<label>Phone</label>
											<input
												type="tel"
												placeholder="Enter your phone number"
												onChange={(e) => handleInput('phone', e.target.value)}
												onKeyDown={(e) => {
													if (e.key === 'Enter') doSignUp();
												}}
											/>
										</div>
									)}

									{!loginView && (
										<div className={'jl-roles'}>
											<span>I am a:</span>
											<div className={'jl-roles-options'}>
												<FormGroup>
													<FormControlLabel
														control={
															<Checkbox
																size="small"
																name={'USER'}
																onChange={checkUserTypeHandler}
																checked={input.type === 'USER'}
															/>
														}
														label="User"
													/>
												</FormGroup>
												<FormGroup>
													<FormControlLabel
														control={
															<Checkbox
																size="small"
																name={'AGENT'}
																onChange={checkUserTypeHandler}
																checked={input.type === 'AGENT'}
															/>
														}
														label="Trainer"
													/>
												</FormGroup>
											</div>
										</div>
									)}

									{loginView && (
										<div className={'jl-remember'}>
											<FormGroup>
												<FormControlLabel
													control={<Checkbox defaultChecked size="small" />}
													label="Remember me"
												/>
											</FormGroup>
											<a>Forgot password?</a>
										</div>
									)}

									{loginView ? (
										<button
											className={'jl-submit'}
											disabled={!input.nick || !input.password}
											onClick={doLogin}
										>
											LOGIN
										</button>
									) : (
										<button
											className={'jl-submit'}
											disabled={!input.nick || !input.password || !input.phone}
											onClick={doSignUp}
										>
											CREATE ACCOUNT
										</button>
									)}
								</div>

								<div className={'jl-switch'}>
									{loginView ? (
										<p>
											New to Athlex? <b onClick={() => setLoginView(false)}>Sign Up</b>
										</p>
									) : (
										<p>
											Already have an account? <b onClick={() => setLoginView(true)}>Login</b>
										</p>
									)}
								</div>
							</div>
						</div>

						{/* ── Right: Image only ── */}
						<div className={'right'} />
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Join);
