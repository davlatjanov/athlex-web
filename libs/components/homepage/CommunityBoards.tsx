import React from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';

const newsArticles = [
	{ id: '1', title: 'Science Behind Progressive Overload', category: 'NEWS', views: 4200, date: 'Feb 28', gradient: 'linear-gradient(135deg, #1a0a0a 0%, #2d1515 100%)' },
	{ id: '2', title: 'Top 10 Supplements for 2025', category: 'NEWS', views: 3800, date: 'Feb 25', gradient: 'linear-gradient(135deg, #0a1a0a 0%, #152d15 100%)' },
	{ id: '3', title: 'How Sleep Affects Your Gains', category: 'NEWS', views: 3100, date: 'Feb 22', gradient: 'linear-gradient(135deg, #0a0a1a 0%, #15152d 100%)' },
	{ id: '4', title: 'Creatine: Everything You Need to Know', category: 'NEWS', views: 2900, date: 'Feb 20', gradient: 'linear-gradient(135deg, #1a1a0a 0%, #2d2d15 100%)' },
	{ id: '5', title: 'Best Pre-Workout Meals Explained', category: 'NEWS', views: 2700, date: 'Feb 18', gradient: 'linear-gradient(135deg, #0a1a1a 0%, #152d2d 100%)' },
	{ id: '6', title: 'Recovery Techniques Used by Pros', category: 'NEWS', views: 2400, date: 'Feb 15', gradient: 'linear-gradient(135deg, #1a0a1a 0%, #2d152d 100%)' },
];

const freeArticles = [
	{ id: '7', title: 'My 12-Week Transformation Story', category: 'FREE', author: 'Jake M.', views: 1800, date: 'Mar 01', gradient: 'linear-gradient(135deg, #1a0505 0%, #3d1010 100%)' },
	{ id: '8', title: 'Beginner mistakes I wish I avoided', category: 'FREE', author: 'Priya K.', views: 1500, date: 'Feb 28', gradient: 'linear-gradient(135deg, #05051a 0%, #10103d 100%)' },
	{ id: '9', title: 'Budget-friendly high protein meals', category: 'FREE', author: 'Tom W.', views: 1200, date: 'Feb 26', gradient: 'linear-gradient(135deg, #0a1505 0%, #15250a 100%)' },
];

const CommunityBoards = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'community-board'}>
				<Stack className={'container'}>
					<span className={'section-label'}>COMMUNITY</span>
					<h2>Community Board</h2>
					<Stack className={'community-mobile'}>
						{[...newsArticles.slice(0, 3), ...freeArticles.slice(0, 2)].map((article) => (
							<Link href={`/community/${article.id}`} key={article.id}>
								<Box className={'community-article'}>
									<div className={'article-img'} style={{ background: article.gradient }} />
									<div className={'article-info'}>
										<span className={'article-category'}>{article.category}</span>
										<strong>{article.title}</strong>
										<span className={'article-meta'}>👁 {article.views} · {article.date}</span>
									</div>
								</Box>
							</Link>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'community-board'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'section-header'}>
					<span className={'section-label'}>COMMUNITY</span>
					<h2 className={'section-title'}>COMMUNITY BOARD</h2>
				</Box>
				<Stack className={'community-main'}>
					<Stack className={'community-left'}>
						<Stack className={'content-top'}>
							<Link href={'/community?articleCategory=NEWS'}>
								<span>News</span>
							</Link>
							<span className={'arrow'}>→</span>
						</Stack>
						<Stack className={'card-wrap'}>
							{newsArticles.map((article) => (
								<Link href={`/community/${article.id}`} key={article.id}>
									<Box className={'vertical-card'}>
										<div className={'community-img'} style={{ background: article.gradient }}>
											<span className={'cat-label'}>{article.category[0]}</span>
										</div>
										<strong>{article.title}</strong>
										<span className={'article-meta'}>👁 {article.views} · {article.date}</span>
									</Box>
								</Link>
							))}
						</Stack>
					</Stack>
					<div className={'center-divider'} />
					<Stack className={'community-right'}>
						<Stack className={'content-top'}>
							<Link href={'/community?articleCategory=FREE'}>
								<span>Free Board</span>
							</Link>
							<span className={'arrow'}>→</span>
						</Stack>
						<Stack className={'card-wrap'}>
							{freeArticles.map((article) => (
								<Link href={`/community/${article.id}`} key={article.id}>
									<Box className={'horizontal-card'}>
										<div className={'article-img-sm'} style={{ background: article.gradient }} />
										<div className={'article-text'}>
											<span className={'article-category'}>{article.category}</span>
											<strong>{article.title}</strong>
											<span className={'article-author'}>{article.author} · {article.date}</span>
										</div>
									</Box>
								</Link>
							))}
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CommunityBoards;
