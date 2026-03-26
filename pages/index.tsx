import { NextPage } from 'next';
import Head from 'next/head';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import StatsBanner from '../libs/components/homepage/StatsBanner';
import ProgramCategories from '../libs/components/homepage/ProgramCategories';
import TrendPrograms from '../libs/components/homepage/TrendPrograms';
import PopularPrograms from '../libs/components/homepage/PopularPrograms';
import TopPrograms from '../libs/components/homepage/TopPrograms';
import TopTrainers from '../libs/components/homepage/TopTrainers';
import AICoachTeaser from '../libs/components/homepage/AICoachTeaser';
import FeaturedProducts from '../libs/components/homepage/FeaturedProducts';
import MembershipPlans from '../libs/components/homepage/MembershipPlans';
import Events from '../libs/components/homepage/Events';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	return (
		<div className={'home-page'}>
			<Head><title>Athlex | Home</title></Head>
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
		</div>
	);
};

export default withLayoutMain(Home);
