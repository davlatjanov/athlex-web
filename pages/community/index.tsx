import React, { useState } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { GET_PROGRESS_RESULTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import moment from 'moment';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityFeed: NextPage = () => {
	const [page, setPage] = useState(1);
	const limit = 12;

	const { data, loading } = useQuery(GET_PROGRESS_RESULTS, {
		variables: { input: { page, limit, search: {} } },
		fetchPolicy: 'network-only',
	});

	const posts: T[] = data?.getProgressResults?.list ?? [];
	const total: number = data?.getProgressResults?.metaCounter?.[0]?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	return (
		<div id="community-page">
			<div className="cp-hero">
				<h1 className="cp-hero-title">COMMUNITY</h1>
				<p className="cp-hero-sub">Progress updates from the Athlex community</p>
			</div>

			<div className="cp-body container">
				{loading ? (
					<div className="cp-loading">Loading feed…</div>
				) : posts.length === 0 ? (
					<div className="cp-empty">
						<span>🏋️</span>
						<p>No posts yet. Be the first to share your progress!</p>
					</div>
				) : (
					<div className="cp-grid">
						{posts.map((post: T) => (
							<div className="cp-card" key={post._id}>
								<div className="cp-card-head">
									<div className="cp-avatar">
										{post.memberData?.memberImage ? (
											<img src={post.memberData.memberImage} alt={post.memberData.memberNick} />
										) : (
											<span>{post.memberData?.memberNick?.[0]?.toUpperCase() ?? 'A'}</span>
										)}
									</div>
									<div className="cp-meta">
										<span className="cp-nick">{post.memberData?.memberNick ?? 'Athlete'}</span>
										<span className="cp-date">{moment(post.createdAt).fromNow()}</span>
									</div>
								</div>

								<p className="cp-content">{post.content}</p>

								{post.images?.length > 0 && (
									<div className="cp-images">
										{post.images.slice(0, 3).map((img: string, i: number) => (
											<img key={i} src={img} alt="" className="cp-img" />
										))}
									</div>
								)}
							</div>
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="cp-pagination">
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<button
								key={p}
								className={`cp-page-btn ${p === page ? 'active' : ''}`}
								onClick={() => setPage(p)}
							>
								{p}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(CommunityFeed);
