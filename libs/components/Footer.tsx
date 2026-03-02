import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import moment from 'moment';

const Footer = () => {
	const device = useDeviceDetect();

	if (device == 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<img src="/img/logo/logoWhite.svg" alt="Athlex" className={'logo'} />
							<span className={'logo-name'}>ATHLEX</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>24/7 Customer Support</span>
							<p>support@athlex.com</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Live Chat</span>
							<p>Available Mon–Sun</p>
							<span>Need help?</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>Follow us on social media</p>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>Popular</strong>
								<span>Strength Programs</span>
								<span>Weight Loss Plans</span>
							</div>
							<div>
								<strong>Quick Links</strong>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>Membership Plans</span>
								<span>Our Services</span>
								<span>Contact Support</span>
								<span>FAQs</span>
							</div>
							<div>
								<strong>Explore</strong>
								<span>Programs</span>
								<span>Trainers</span>
								<span>Community</span>
								<span>Blog</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© Athlex - All rights reserved. Athlex {moment().year()}</span>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<img src="/img/logo/logoWhite.svg" alt="Athlex" className={'logo'} />
							<span className={'logo-name'}>ATHLEX</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>24/7 Customer Support</span>
							<p>support@athlex.com</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Live Chat</span>
							<p>Available Mon–Sun</p>
							<span>Need help?</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>Follow us on social media</p>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'top'}>
							<strong>Stay up to date with Athlex</strong>
							<div>
								<input type="text" placeholder={'Your Email'} />
								<span>Subscribe</span>
							</div>
						</Box>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>Popular</strong>
								<span>Strength Programs</span>
								<span>Weight Loss Plans</span>
								<span>HIIT Cardio</span>
								<span>Yoga & Flexibility</span>
							</div>
							<div>
								<strong>Quick Links</strong>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>Membership Plans</span>
								<span>Our Services</span>
								<span>Contact Support</span>
								<span>FAQs</span>
							</div>
							<div>
								<strong>Explore</strong>
								<span>Programs</span>
								<span>Trainers</span>
								<span>Community</span>
								<span>Blog</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© Athlex - All rights reserved. Athlex {moment().year()}</span>
					<span>Privacy · Terms · Sitemap</span>
				</Stack>
			</Stack>
		);
	}
};

export default Footer;
