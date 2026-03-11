import React, { useState } from 'react';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_MY_PROGRESS_RESULTS } from '../../../apollo/user/query';
import { CREATE_PROGRESS_RESULT, DELETE_PROGRESS_RESULT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import moment from 'moment';

const MyProgressResults: React.FC = () => {
	const user = useReactiveVar(userVar);
	const [page] = useState(1);
	const [content, setContent] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const { data, refetch } = useQuery(GET_MY_PROGRESS_RESULTS, {
		variables: { input: { page, limit: 20, search: {} } },
		fetchPolicy: 'network-only',
		skip: !user._id,
	});

	const [createProgressResult] = useMutation(CREATE_PROGRESS_RESULT);
	const [deleteProgressResult] = useMutation(DELETE_PROGRESS_RESULT);

	const posts: T[] = data?.getMyProgressResults?.list ?? [];

	const handleSubmit = async () => {
		if (!content.trim()) return;
		setSubmitting(true);
		try {
			await createProgressResult({ variables: { input: { content } } });
			setContent('');
			await refetch();
			await sweetTopSmallSuccessAlert('Progress posted!', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteProgressResult({ variables: { progressResultId: id } });
			await refetch();
			await sweetTopSmallSuccessAlert('Deleted', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className="my-progress-results">
			<div className="mpr-header">
				<h3 className="mpr-title">My Progress Posts</h3>
				<p className="mpr-sub">Share your fitness journey with the community</p>
			</div>

			{/* Create new post */}
			<div className="mpr-create-card">
				<textarea
					className="mpr-textarea"
					rows={3}
					placeholder="Share a progress update, milestone, or achievement…"
					value={content}
					onChange={(e) => setContent(e.target.value)}
				/>
				<button
					className="mpr-submit-btn"
					onClick={handleSubmit}
					disabled={!content.trim() || submitting}
				>
					{submitting ? 'Posting…' : 'Post Update'}
				</button>
			</div>

			{/* Posts list */}
			{posts.length === 0 ? (
				<div className="mpr-empty">
					<span>🏋️</span>
					<p>No progress posts yet. Share your first update!</p>
				</div>
			) : (
				<div className="mpr-list">
					{posts.map((post: T) => (
						<div className="mpr-post" key={post._id}>
							<div className="mpr-post-head">
								<div className="mpr-avatar">
									{(user as any)?.memberNick?.[0]?.toUpperCase() ?? 'A'}
								</div>
								<div className="mpr-post-meta">
									<span className="mpr-nick">{(user as any)?.memberNick}</span>
									<span className="mpr-date">{moment(post.createdAt).fromNow()}</span>
								</div>
								<button
									className="mpr-delete-btn"
									onClick={() => handleDelete(post._id)}
									title="Delete"
								>
									✕
								</button>
							</div>
							<p className="mpr-content">{post.content}</p>
							{post.images?.length > 0 && (
								<div className="mpr-images">
									{post.images.map((img: string, i: number) => (
										<img key={i} src={img} alt="" className="mpr-img" />
									))}
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MyProgressResults;
