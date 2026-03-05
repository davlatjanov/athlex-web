import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
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
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const checkUserTypeHandler = (e: any) => {
		const checked = e.target.checked;
		if (checked) {
			handleInput('type', e.target.name);
		} else {
			handleInput('type', 'USER');
		}
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
						{/* ── Left: Form ── */}
						<Stack className={'left'}>
							<Box className={'logo'}>
								<span className={'logo-brand'}>ATHLEX</span>
							</Box>

							<Box className={'info'}>
								<span>{loginView ? 'Welcome Back' : 'Create Account'}</span>
								<p>
									{loginView
										? 'Sign in to continue your fitness journey.'
										: 'Join Athlex and start training smarter.'}
								</p>
							</Box>

							<Box className={'input-wrap'}>
								<div className={'input-box'}>
									<span>Username</span>
									<input
										type="text"
										placeholder={'Enter your username'}
										onChange={(e) => handleInput('nick', e.target.value)}
										required
										onKeyDown={(e) => {
											if (e.key === 'Enter' && loginView) doLogin();
											if (e.key === 'Enter' && !loginView) doSignUp();
										}}
									/>
								</div>
								<div className={'input-box'}>
									<span>Password</span>
									<input
										type="password"
										placeholder={'Enter your password'}
										onChange={(e) => handleInput('password', e.target.value)}
										required
										onKeyDown={(e) => {
											if (e.key === 'Enter' && loginView) doLogin();
											if (e.key === 'Enter' && !loginView) doSignUp();
										}}
									/>
								</div>
								{!loginView && (
									<div className={'input-box'}>
										<span>Phone</span>
										<input
											type="tel"
											placeholder={'Enter your phone number'}
											onChange={(e) => handleInput('phone', e.target.value)}
											required
											onKeyDown={(e) => {
												if (e.key === 'Enter') doSignUp();
											}}
										/>
									</div>
								)}
							</Box>

							<Box className={'register'}>
								{!loginView && (
									<div className={'type-option'}>
										<span className={'text'}>Register as:</span>
										<div>
											<FormGroup>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															name={'USER'}
															onChange={checkUserTypeHandler}
															checked={input?.type === 'USER'}
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
															checked={input?.type === 'AGENT'}
														/>
													}
													label="Trainer"
												/>
											</FormGroup>
										</div>
									</div>
								)}

								{loginView && (
									<div className={'remember-info'}>
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
										className={'submit-btn'}
										disabled={input.nick === '' || input.password === ''}
										onClick={doLogin}
									>
										LOGIN
									</button>
								) : (
									<button
										className={'submit-btn'}
										disabled={
											input.nick === '' ||
											input.password === '' ||
											input.phone === '' ||
											input.type === ''
										}
										onClick={doSignUp}
									>
										CREATE ACCOUNT
									</button>
								)}
							</Box>

							<Box className={'ask-info'}>
								{loginView ? (
									<p>
										New to Athlex?
										<b onClick={() => viewChangeHandler(false)}>SIGN UP</b>
									</p>
								) : (
									<p>
										Already have an account?
										<b onClick={() => viewChangeHandler(true)}>LOGIN</b>
									</p>
								)}
							</Box>
						</Stack>

						{/* ── Right: Image ── */}
						<Stack className={'right'}>
							<div className={'right-overlay'}>
								<div className={'right-content'}>
									<strong>Forge Your Limits</strong>
									<p>Train smarter. Recover faster. Perform better.</p>
								</div>
							</div>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Join);
