import { Globe, Camera, MessageCircle, Send } from 'lucide-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import moment from 'moment';
import Link from 'next/link';

const Footer = () => {
	const device = useDeviceDetect();

	if (device == 'mobile') {
		return (
			<div className={'footer-container'}>
				<div className={'ft-brand'}>
					<span className={'ft-logo-name'}>ATHLEX</span>
					<p className={'ft-tagline'}>Train harder. Recover smarter. Perform better.</p>
					<div className={'ft-socials'}>
						<Globe />
						<Camera />
						<MessageCircle />
						<Send />
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
						<span>Support</span>
					</div>
				</div>
				<div className={'ft-bottom'}>
					<span>© {moment().year()} Athlex. All rights reserved.</span>
				</div>
			</div>
		);
	} else {
		return (
			<div className={'footer-container'}>
				{/* ── Top: brand + newsletter ── */}
				<div className={'ft-top'}>
					<div className={'ft-brand'}>
						<div className={'ft-brand-logo'}>
							<span className={'ft-logo-name'}>ATHLEX</span>
						</div>
						<p className={'ft-tagline'}>Train harder. Recover smarter.<br />Perform better.</p>
						<div className={'ft-socials'}>
							<a href="#"><Globe /></a>
							<a href="#"><Camera /></a>
							<a href="#"><MessageCircle /></a>
							<a href="#"><Send /></a>
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
			</div>
		);
	}
};

export default Footer;
