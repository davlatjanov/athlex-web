import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_PROGRESS_RESULTS } from '../../../apollo/user/query';

type T = any;

const formatDate = (dateStr: string): string => {
	const d = new Date(dateStr);
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const MemberActivity = () => {
	const router = useRouter();
	const memberId = router.query?.memberId as string;

	const { data } = useQuery(GET_PROGRESS_RESULTS, {
		variables: { input: { page: 1, limit: 20, memberId } },
		skip: !memberId,
	});

	const posts: T[] = data?.getProgressResults?.list ?? [];

	return (
		<div id="member-activity">
			{posts.length === 0 ? (
				<div className="ma-empty">
					<span>🏋️</span>
					<p>No activity yet.</p>
				</div>
			) : (
				<div className="ma-timeline">
					{posts.map((post: T) => (
						<div className="ma-item" key={post._id}>
							<div className="ma-left">
								<div className="ma-dot" />
								<div className="ma-line" />
							</div>
							<div className="ma-card">
								<div className="ma-date">{formatDate(post.createdAt)}</div>
								{post.content && <p className="ma-content">{post.content}</p>}
								{post.images && post.images.length > 0 && (
									<img
										className="ma-img-thumb"
										src={post.images[0]}
										alt="Progress"
									/>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MemberActivity;
