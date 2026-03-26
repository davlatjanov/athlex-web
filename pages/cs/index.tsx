import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CS: NextPage = () => {
	const router = useRouter();

	/** HANDLERS **/
	const changeTabHandler = (tab: string) => {
		router.push(
			{
				pathname: '/cs',
				query: { tab: tab },
			},
			undefined,
			{ scroll: false },
		);
	};
	const tab = router.query.tab ?? 'notice';

	return (
		<div className={'cs-page'}>
				<div className={'container'}>
					<div className={'cs-main-info'}>
						<div className={'info'}>
							<span>Support Center</span>
							<p>Find answers, read announcements, or browse our FAQ</p>
						</div>
						<div className={'btns'}>
							<div
								className={tab == 'notice' ? 'active' : ''}
								onClick={() => {
									changeTabHandler('notice');
								}}
							>
								Notice
							</div>
							<div
								className={tab == 'faq' ? 'active' : ''}
								onClick={() => {
									changeTabHandler('faq');
								}}
							>
								FAQ
							</div>
						</div>
					</div>

					<div className={'cs-content'}>
						{tab === 'notice' && <Notice />}

						{tab === 'faq' && <Faq />}
					</div>
				</div>
		</div>
	);
};

export default withLayoutBasic(CS);
