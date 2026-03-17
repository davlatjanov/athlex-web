import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FEEDBACKS_BY_ADMIN } from '../../../apollo/admin/query';
import { DELETE_FEEDBACK_BY_ADMIN } from '../../../apollo/admin/mutation';
import { T } from '../../types/common';
import moment from 'moment';

const SCALE_MAP: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const GROUP_LABEL: Record<string, string> = {
	TRAINING_PROGRAM: 'Program',
	TRAINER: 'Trainer',
	PRODUCT: 'Product',
};

const selectSx = {
	background: '#1a2236',
	border: '1px solid rgba(255,255,255,0.12)',
	color: '#e2e8f0',
	borderRadius: 6,
	padding: '4px 8px',
	fontSize: 12,
	cursor: 'pointer',
	outline: 'none',
};

const Stars = ({ scale }: { scale: string }) => {
	const n = SCALE_MAP[scale] ?? 0;
	return (
		<span>
			{Array.from({ length: 5 }, (_, i) => (
				<span key={i} style={{ color: i < n ? '#f59e0b' : '#374151', fontSize: 14 }}>★</span>
			))}
		</span>
	);
};

const AdminFeedback = () => {
	const [page, setPage] = useState(1);
	const [feedbacks, setFeedbacks] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [groupFilter, setGroupFilter] = useState('ALL');

	const buildInquiry = (p = page) => ({
		page: p,
		limit: 15,
		...(groupFilter !== 'ALL' ? { feedbackGroup: groupFilter } : {}),
	});

	const { refetch } = useQuery(GET_FEEDBACKS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: buildInquiry() },
		onCompleted: (data: T) => {
			setFeedbacks(data?.getFeedbacks?.list ?? []);
			setTotal(data?.getFeedbacks?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const [deleteFeedback] = useMutation(DELETE_FEEDBACK_BY_ADMIN);

	const handleDelete = async (feedbackId: string) => {
		if (!confirm('Delete this review?')) return;
		await deleteFeedback({ variables: { feedbackId } });
		const result = await refetch({ input: buildInquiry() });
		setFeedbacks(result.data?.getFeedbacks?.list ?? []);
		setTotal(result.data?.getFeedbacks?.metaCounter?.[0]?.total ?? 0);
	};

	const handleFilterChange = async (group: string) => {
		setGroupFilter(group);
		setPage(1);
		const input = { page: 1, limit: 15, ...(group !== 'ALL' ? { feedbackGroup: group } : {}) };
		const result = await refetch({ input });
		setFeedbacks(result.data?.getFeedbacks?.list ?? []);
		setTotal(result.data?.getFeedbacks?.metaCounter?.[0]?.total ?? 0);
	};

	const totalPages = Math.ceil(total / 15);

	return (
		<div id="admin-feedback">
			<div className="af-header">
				<h3 className="af-title">Reviews <span>{total}</span></h3>
				<select style={selectSx} value={groupFilter} onChange={(e) => handleFilterChange(e.target.value)}>
					<option value="ALL">All</option>
					<option value="TRAINING_PROGRAM">Program</option>
					<option value="TRAINER">Trainer</option>
					<option value="PRODUCT">Product</option>
				</select>
			</div>

			{feedbacks.length === 0 ? (
				<div className="af-empty"><p>No reviews found.</p></div>
			) : (
				<table className="af-table">
					<thead>
						<tr>
							<th>Member</th>
							<th>Type</th>
							<th>Rating</th>
							<th>Review</th>
							<th>Date</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{feedbacks.map((fb: T) => (
							<tr key={fb._id}>
								<td className="af-member">
									{fb.memberData?.memberImage ? (
										<img src={fb.memberData.memberImage} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginRight: 8, verticalAlign: 'middle' }} />
									) : null}
									<span>{fb.memberData?.memberNick ?? fb.memberId?.toString().slice(-6)}</span>
								</td>
								<td><span className="af-group-badge">{GROUP_LABEL[fb.feedbackGroup] ?? fb.feedbackGroup}</span></td>
								<td><Stars scale={fb.feedbackScale} /></td>
								<td className="af-content">{fb.feedbackContent}</td>
								<td className="af-date">{moment(fb.createdAt).format('MMM D, YYYY')}</td>
								<td><button className="af-delete-btn" onClick={() => handleDelete(fb._id)}>Delete</button></td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{totalPages > 1 && (
				<div className="af-pagination">
					<button disabled={page === 1} onClick={() => { setPage(page - 1); refetch({ input: buildInquiry(page - 1) }); }}>Prev</button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
						<button key={p} className={page === p ? 'active' : ''} onClick={() => { setPage(p); refetch({ input: buildInquiry(p) }); }}>{p}</button>
					))}
					<button disabled={page === totalPages} onClick={() => { setPage(page + 1); refetch({ input: buildInquiry(page + 1) }); }}>Next</button>
				</div>
			)}
		</div>
	);
};

export default AdminFeedback;
