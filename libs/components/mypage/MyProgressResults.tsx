import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_MY_PROGRESS_RESULTS } from '../../../apollo/user/query';
import { DELETE_PROGRESS_RESULT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import moment from 'moment';
import axios from 'axios';
import { getJwtToken } from '../../auth';

const MAX_IMAGES = 4;

// Each slot holds the File object + a local preview URL
type ImageSlot = { file: File; preview: string };

const MyProgressResults: React.FC = () => {
	const user = useReactiveVar(userVar);
	const [page] = useState(1);
	const [content, setContent] = useState('');
	const [slots, setSlots] = useState<ImageSlot[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const [activePost, setActivePost] = useState<T | null>(null);
	const fileRef = useRef<HTMLInputElement>(null);

	const { data, refetch } = useQuery(GET_MY_PROGRESS_RESULTS, {
		variables: { input: { page, limit: 20 } },
		fetchPolicy: 'network-only',
		skip: !user._id,
	});

	const [deleteProgressResult] = useMutation(DELETE_PROGRESS_RESULT);

	const posts: T[] = data?.getMyProgressResults?.list ?? [];

	const submitWithFiles = async (content: string, files: File[]) => {
		const token = getJwtToken();
		const hasFiles = files.length > 0;

		const query = `mutation CreateProgressResult($input: ProgressResultInput!${hasFiles ? ', $files: [Upload!]' : ''}) {
			createProgressResult(input: $input${hasFiles ? ', files: $files' : ''}) {
				_id content images createdAt
			}
		}`;

		const variables: any = { input: { content } };
		if (hasFiles) variables.files = files.map(() => null);

		if (!hasFiles) {
			// No files — plain JSON request
			const res = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`,
				{ query, variables },
				{ headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
			);
			if (res.data?.errors?.length) throw new Error(res.data.errors[0].message);
			return;
		}

		// With files — multipart request
		const formData = new FormData();
		formData.append('operations', JSON.stringify({ query, variables }));
		const map: Record<string, string[]> = {};
		files.forEach((_, i) => { map[String(i)] = [`variables.files.${i}`]; });
		formData.append('map', JSON.stringify(map));
		files.forEach((file, i) => formData.append(String(i), file));
		const res = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formData, {
			headers: { 'Content-Type': 'multipart/form-data', 'apollo-require-preflight': true, Authorization: `Bearer ${token}` },
		});
		if (res.data?.errors?.length) throw new Error(res.data.errors[0].message);
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		if (!files.length) return;
		const remaining = MAX_IMAGES - slots.length;
		const toAdd = files.slice(0, remaining).map((file) => ({
			file,
			preview: URL.createObjectURL(file),
		}));
		setSlots((prev) => [...prev, ...toAdd]);
		if (fileRef.current) fileRef.current.value = '';
	};

	const removeSlot = (idx: number) => {
		setSlots((prev) => prev.filter((_, i) => i !== idx));
	};

	const handleSubmit = async () => {
		if (!content.trim()) return;
		setSubmitting(true);
		try {
			await submitWithFiles(content, slots.map((s) => s.file));

			setContent('');
			setSlots([]);
			await refetch();
			await sweetTopSmallSuccessAlert('Progress posted!', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		try {
			await deleteProgressResult({ variables: { progressResultId: id } });
			if (activePost?._id === id) setActivePost(null);
			await refetch();
			await sweetTopSmallSuccessAlert('Deleted', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const u = user as any;

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

				{/* Image slots — local preview only, upload happens on submit */}
				<div className="mpr-image-slots">
					{slots.map((slot, idx) => (
						<div className="mpr-slot mpr-slot--filled" key={idx}>
							<img src={slot.preview} alt="" />
							<button className="mpr-slot-remove" onClick={() => removeSlot(idx)}>✕</button>
						</div>
					))}
					{slots.length < MAX_IMAGES && (
						<div className="mpr-slot mpr-slot--add" onClick={() => fileRef.current?.click()}>
							<span>📷</span>
							<span className="mpr-slot-label">{slots.length === 0 ? 'Add Photo' : '+'}</span>
						</div>
					)}
					<input ref={fileRef} type="file" hidden multiple accept="image/jpg,image/jpeg,image/png" onChange={handleImageSelect} />
				</div>

				<div className="mpr-create-footer">
					<span className="mpr-img-count">{slots.length}/{MAX_IMAGES} photos</span>
					<button className="mpr-submit-btn" onClick={handleSubmit} disabled={!content.trim() || submitting}>
						{submitting ? (slots.length > 0 ? 'Uploading…' : 'Posting…') : 'Post Update'}
					</button>
				</div>
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
						<div className="mpr-post" key={post._id} onClick={() => setActivePost(post)}>
							<div className="mpr-post-head">
								<div className="mpr-avatar">
									{u?.memberImage ? <img src={u.memberImage} alt="" /> : u?.memberNick?.[0]?.toUpperCase() ?? 'A'}
								</div>
								<div className="mpr-post-meta">
									<span className="mpr-nick">{u?.memberNick}</span>
									<span className="mpr-date">{moment(post.createdAt).fromNow()}</span>
								</div>
								<button className="mpr-delete-btn" onClick={(e) => handleDelete(e, post._id)} title="Delete">✕</button>
							</div>
							<p className="mpr-content">{post.content}</p>
							{post.images?.length > 0 && (
								<div className={`mpr-images mpr-images--${Math.min(post.images.length, 4)}`}>
									{post.images.slice(0, 4).map((img: string, i: number) => (
										<img key={i} src={img} alt="" className="mpr-img" />
									))}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Post detail modal */}
			{activePost && (
				<div className="mpr-modal-backdrop" onClick={() => setActivePost(null)}>
					<div className="mpr-modal" onClick={(e) => e.stopPropagation()}>
						<button className="mpr-modal-close" onClick={() => setActivePost(null)}>✕</button>
						<div className="mpr-modal-head">
							<div className="mpr-avatar">
								{u?.memberImage ? <img src={u.memberImage} alt="" /> : u?.memberNick?.[0]?.toUpperCase() ?? 'A'}
							</div>
							<div className="mpr-post-meta">
								<span className="mpr-nick">{u?.memberNick}</span>
								<span className="mpr-date">{moment(activePost.createdAt).fromNow()}</span>
							</div>
						</div>
						<p className="mpr-modal-content">{activePost.content}</p>
						{activePost.images?.length > 0 && (
							<div className={`mpr-modal-images mpr-images--${Math.min(activePost.images.length, 4)}`}>
								{activePost.images.map((img: string, i: number) => (
									<img key={i} src={img} alt="" />
								))}
							</div>
						)}
						<div className="mpr-modal-actions">
							<button className="mpr-delete-btn" onClick={(e) => handleDelete(e, activePost._id)}>Delete Post</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MyProgressResults;
