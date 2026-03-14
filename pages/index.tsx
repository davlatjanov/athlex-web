import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import StatsBanner from '../libs/components/homepage/StatsBanner';
import ProgramCategories from '../libs/components/homepage/ProgramCategories';
import TrendPrograms from '../libs/components/homepage/TrendPrograms';
import PopularPrograms from '../libs/components/homepage/PopularPrograms';
import Advertisement from '../libs/components/homepage/Advertisement';
import TopPrograms from '../libs/components/homepage/TopPrograms';
import TopTrainers from '../libs/components/homepage/TopTrainers';
import AICoachTeaser from '../libs/components/homepage/AICoachTeaser';
import FeaturedProducts from '../libs/components/homepage/FeaturedProducts';
import MembershipPlans from '../libs/components/homepage/MembershipPlans';
import Events from '../libs/components/homepage/Events';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<StatsBanner />
				<ProgramCategories />
				<TrendPrograms />
				<PopularPrograms />

				<TopPrograms />
				<TopTrainers />
				<AICoachTeaser />
				<FeaturedProducts />
				<MembershipPlans />
				<Events />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<StatsBanner />
				<ProgramCategories />
				<TrendPrograms />
				<PopularPrograms />

				<TopPrograms />
				<TopTrainers />
				<AICoachTeaser />
				<FeaturedProducts />
				<MembershipPlans />
				<Events />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
