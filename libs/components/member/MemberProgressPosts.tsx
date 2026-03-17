import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_PROGRESS_RESULTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import moment from 'moment';

const MemberProgressPosts = () => {
	const router = useRouter();
	const memberId = router.query.memberId as string;
	const [posts, setPosts] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [lightbox, setLightbox] = useState<string | null>(null);

	useQuery(GET_PROGRESS_RESULTS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: 12, memberId } },
		skip: !memberId,
		onCompleted: (data: T) => {
			setPosts(data?.getProgressResults?.list ?? []);
			setTotal(data?.getProgressResults?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const totalPages = Math.ceil(total / 12);

	return (
		<div id="member-progress">
			<h3 className="mp-section-title">Progress Posts <span>{total}</span></h3>

			{posts.length === 0 ? (
				<div className="mp-empty">
					<span>📸</span>
					<p>No progress posts yet.</p>
				</div>
			) : (
				<>
					<div className="mp-grid">
						{posts.map((post: T) => (
							<div key={post._id} className="mp-post-card" onClick={() => setLightbox(post._id)}>
								{post.images?.[0] ? (
									<img src={post.images[0]} alt="" />
								) : (
									<div className="mp-post-placeholder">💪</div>
								)}
								<div className="mp-post-overlay">
									<p>{post.content}</p>
									<span>{moment(post.createdAt).fromNow()}</span>
								</div>
							</div>
						))}
					</div>

					{totalPages > 1 && (
						<div className="mp-pagination">
							<button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
							))}
							<button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
						</div>
					)}
				</>
			)}

			{/* Simple lightbox */}
			{lightbox && (() => {
				const post = posts.find((p: T) => p._id === lightbox);
				return post ? (
					<div className="mp-lightbox" onClick={() => setLightbox(null)}>
						<div className="mp-lightbox-inner" onClick={(e) => e.stopPropagation()}>
							{post.images?.[0] && <img src={post.images[0]} alt="" />}
							{post.content && <p>{post.content}</p>}
							<span>{moment(post.createdAt).format('MMM D, YYYY')}</span>
							<button onClick={() => setLightbox(null)}>✕</button>
						</div>
					</div>
				) : null;
			})()}
		</div>
	);
};

export default MemberProgressPosts;
