import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_PROGRESS_RESULTS } from '../../../apollo/user/query';
import { CREATE_PROGRESS_RESULT, DELETE_PROGRESS_RESULT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import moment from 'moment';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const MemberProgressPosts = () => {
	const router = useRouter();
	const memberId = router.query.memberId as string;
	const user = useReactiveVar(userVar) as any;
	const isOwner = user?._id && memberId === user._id;

	const [posts, setPosts] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [lightbox, setLightbox] = useState<T | null>(null);

	// Create modal state
	const [showModal, setShowModal] = useState(false);
	const [content, setContent] = useState('');
	const [imageUrl, setImageUrl] = useState('');
	const [uploading, setUploading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const { refetch } = useQuery(GET_PROGRESS_RESULTS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: 12, memberId } },
		skip: !memberId,
		onCompleted: (data: T) => {
			setPosts(data?.getProgressResults?.list ?? []);
			setTotal(data?.getProgressResults?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const [createPost] = useMutation(CREATE_PROGRESS_RESULT);
	const [deletePost] = useMutation(DELETE_PROGRESS_RESULT);

	const totalPages = Math.ceil(total / 12);

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploading(true);
		try {
			const token = getJwtToken();
			const formData = new FormData();
			formData.append('operations', JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }`,
				variables: { file: null, target: 'progress' },
			}));
			formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
			formData.append('0', file);

			const res = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});
			setImageUrl(res.data?.data?.imageUploader ?? '');
		} catch (err) {
			sweetMixinErrorAlert((err as any)?.message || 'Something went wrong').then();
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = async () => {
		if (!content.trim()) return;
		setSubmitting(true);
		try {
			await createPost({
				variables: {
					input: {
						content: content.trim(),
						images: imageUrl ? [imageUrl] : [],
					},
				},
			});
			setShowModal(false);
			setContent('');
			setImageUrl('');
			const result = await refetch({ input: { page: 1, limit: 12, memberId } });
			setPosts(result.data?.getProgressResults?.list ?? []);
			setTotal(result.data?.getProgressResults?.metaCounter?.[0]?.total ?? 0);
			setPage(1);
		} catch (err) {
			sweetMixinErrorAlert((err as any)?.message || 'Something went wrong').then();
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (postId: string) => {
		if (!confirm('Delete this post?')) return;
		await deletePost({ variables: { progressResultId: postId } });
		const result = await refetch({ input: { page, limit: 12, memberId } });
		setPosts(result.data?.getProgressResults?.list ?? []);
		setTotal(result.data?.getProgressResults?.metaCounter?.[0]?.total ?? 0);
	};

	return (
		<div id="member-progress">
			<div className="mp-header">
				<h3 className="mp-section-title">Progress Posts <span>{total}</span></h3>
				{isOwner && (
					<button className="mp-add-btn" onClick={() => setShowModal(true)}>+ Add Post</button>
				)}
			</div>

			{posts.length === 0 ? (
				<div className="mp-empty">
					<span>📸</span>
					<p>{isOwner ? 'Share your first progress post!' : 'No progress posts yet.'}</p>
				</div>
			) : (
				<>
					<div className="mp-grid">
						{posts.map((post: T) => (
							<div key={post._id} className="mp-post-card" onClick={() => setLightbox(post)}>
								{post.images?.[0] ? (
									<img src={post.images[0]} alt="" />
								) : (
									<div className="mp-post-placeholder">💪</div>
								)}
								<div className="mp-post-overlay">
									<p>{post.content}</p>
									<span>{moment(post.createdAt).fromNow()}</span>
								</div>
								{isOwner && (
									<button
										className="mp-delete-btn"
										onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }}
									>✕</button>
								)}
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

			{/* Lightbox */}
			{lightbox && (
				<div className="mp-lightbox" onClick={() => setLightbox(null)}>
					<div className="mp-lightbox-inner" onClick={(e) => e.stopPropagation()}>
						{lightbox.images?.[0] && <img src={lightbox.images[0]} alt="" />}
						{lightbox.content && <p>{lightbox.content}</p>}
						<span>{moment(lightbox.createdAt).format('MMM D, YYYY')}</span>
						<button onClick={() => setLightbox(null)}>✕</button>
					</div>
				</div>
			)}

			{/* Create Post Modal */}
			{showModal && (
				<div className="mp-modal-backdrop" onClick={() => setShowModal(false)}>
					<div className="mp-modal" onClick={(e) => e.stopPropagation()}>
						<div className="mp-modal-header">
							<h3>New Progress Post</h3>
							<button onClick={() => setShowModal(false)}>✕</button>
						</div>

						<div className="mp-modal-body">
							{/* Image upload */}
							<label className="mp-upload-area">
								{imageUrl ? (
									<>
										<img src={imageUrl} alt="preview" className="mp-upload-preview" />
										<span className="mp-upload-change">Click to change</span>
									</>
								) : uploading ? (
									<span className="mp-upload-hint">Uploading…</span>
								) : (
									<>
										<span className="mp-upload-icon">📷</span>
										<span className="mp-upload-hint">Click to upload photo</span>
										<span className="mp-upload-sub">JPG, PNG supported</span>
									</>
								)}
								<input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
							</label>

							{/* Content */}
							<textarea
								className="mp-modal-textarea"
								placeholder="Describe your progress, workout, or milestone…"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								rows={4}
							/>
						</div>

						<div className="mp-modal-footer">
							<button className="mp-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
							<button
								className="mp-modal-submit"
								onClick={handleSubmit}
								disabled={submitting || uploading || !content.trim()}
							>
								{submitting ? 'Posting…' : 'Post'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MemberProgressPosts;
