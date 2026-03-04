import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack } from '@mui/material';
import moment from 'moment';
import Link from 'next/link';

const Footer = () => {
	const device = useDeviceDetect();

	if (device == 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<div className={'ft-brand'}>
					<img src="/img/logo/logoWhite.svg" alt="Athlex" className={'ft-logo'} />
					<span className={'ft-logo-name'}>ATHLEX</span>
					<p className={'ft-tagline'}>Train harder. Recover smarter. Perform better.</p>
					<div className={'ft-socials'}>
						<FacebookOutlinedIcon />
						<InstagramIcon />
						<TwitterIcon />
						<TelegramIcon />
					</div>
				</div>
				<div className={'ft-links'}>
					<div className={'ft-col'}>
						<strong>Programs</strong>
						<span>Strength Training</span>
						<span>Weight Loss</span>
						<span>HIIT & Cardio</span>
						<span>Yoga & Flexibility</span>
					</div>
					<div className={'ft-col'}>
						<strong>Company</strong>
						<span>About Us</span>
						<span>Trainers</span>
						<span>Community</span>
						<span>Support</span>
					</div>
				</div>
				<div className={'ft-bottom'}>
					<span>© {moment().year()} Athlex. All rights reserved.</span>
				</div>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				{/* ── Top: brand + newsletter ── */}
				<div className={'ft-top'}>
					<div className={'ft-brand'}>
						<div className={'ft-brand-logo'}>
							<img src="/img/logo/logoWhite.svg" alt="Athlex" className={'ft-logo'} />
							<span className={'ft-logo-name'}>ATHLEX</span>
						</div>
						<p className={'ft-tagline'}>Train harder. Recover smarter.<br />Perform better.</p>
						<div className={'ft-socials'}>
							<a href="#"><FacebookOutlinedIcon /></a>
							<a href="#"><InstagramIcon /></a>
							<a href="#"><TwitterIcon /></a>
							<a href="#"><TelegramIcon /></a>
						</div>
					</div>

					<div className={'ft-newsletter'}>
						<strong>Stay in the game</strong>
						<p>Get the latest programs, trainer spotlights, and training tips.</p>
						<div className={'ft-newsletter-input'}>
							<input type="email" placeholder="Enter your email" />
							<button>Subscribe</button>
						</div>
					</div>
				</div>

				{/* ── Divider ── */}
				<div className={'ft-divider'} />

				{/* ── Link columns ── */}
				<div className={'ft-links'}>
					<div className={'ft-col'}>
						<strong>Programs</strong>
						<Link href="/programs"><span>Strength Training</span></Link>
						<Link href="/programs"><span>Weight Loss Plans</span></Link>
						<Link href="/programs"><span>HIIT &amp; Cardio</span></Link>
						<Link href="/programs"><span>Yoga &amp; Flexibility</span></Link>
						<Link href="/programs"><span>Sport-Specific</span></Link>
					</div>
					<div className={'ft-col'}>
						<strong>Trainers</strong>
						<Link href="/trainer"><span>Find a Trainer</span></Link>
						<Link href="/trainer"><span>Become a Trainer</span></Link>
						<Link href="/trainer"><span>1-on-1 Coaching</span></Link>
						<Link href="/trainer"><span>Trainer Reviews</span></Link>
					</div>
					<div className={'ft-col'}>
						<strong>Company</strong>
						<Link href="/about"><span>About Athlex</span></Link>
						<Link href="/community"><span>Community</span></Link>
						<Link href="/mypage"><span>My Page</span></Link>
						<Link href="/cs"><span>Support Center</span></Link>
						<Link href="/cs"><span>FAQs</span></Link>
					</div>
					<div className={'ft-col'}>
						<strong>Legal</strong>
						<span>Privacy Policy</span>
						<span>Terms of Use</span>
						<span>Cookie Settings</span>
						<span>Membership Plans</span>
					</div>
				</div>

				{/* ── Bottom bar ── */}
				<div className={'ft-bottom'}>
					<span>© {moment().year()} Athlex. All rights reserved.</span>
					<span>Privacy · Terms · Sitemap</span>
				</div>
			</Stack>
		);
	}
};

export default Footer;
