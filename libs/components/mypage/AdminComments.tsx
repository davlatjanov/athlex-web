import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_COMMENTS } from '../../../apollo/admin/query';
import { REMOVE_COMMENT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { T } from '../../types/common';
import moment from 'moment';

const GROUP_LABEL: Record<string, string> = {
	PROGRAM: 'Program',
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

const AdminComments = () => {
	const [page, setPage] = useState(1);
	const [comments, setComments] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [groupFilter, setGroupFilter] = useState('ALL');

	const buildInquiry = (p = page) => ({
		page: p,
		limit: 15,
		...(groupFilter !== 'ALL' ? { commentGroup: groupFilter } : {}),
	});

	const { refetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: buildInquiry() },
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list ?? []);
			setTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const [removeComment] = useMutation(REMOVE_COMMENT_BY_ADMIN);

	const handleDelete = async (commentId: string) => {
		if (!confirm('Delete this comment?')) return;
		await removeComment({ variables: { commentId } });
		const result = await refetch({ input: buildInquiry() });
		setComments(result.data?.getComments?.list ?? []);
		setTotal(result.data?.getComments?.metaCounter?.[0]?.total ?? 0);
	};

	const handleFilterChange = async (group: string) => {
		setGroupFilter(group);
		setPage(1);
		const input = { page: 1, limit: 15, ...(group !== 'ALL' ? { commentGroup: group } : {}) };
		const result = await refetch({ input });
		setComments(result.data?.getComments?.list ?? []);
		setTotal(result.data?.getComments?.metaCounter?.[0]?.total ?? 0);
	};

	const totalPages = Math.ceil(total / 15);

	return (
		<div id="admin-comments">
			<div className="ac-header">
				<h3 className="ac-title">Comments <span>{total}</span></h3>
				<select style={selectSx} value={groupFilter} onChange={(e) => handleFilterChange(e.target.value)}>
					<option value="ALL">All</option>
					<option value="PROGRAM">Program</option>
					<option value="PRODUCT">Product</option>
				</select>
			</div>

			{comments.length === 0 ? (
				<div className="ac-empty"><p>No comments found.</p></div>
			) : (
				<table className="ac-table">
					<thead>
						<tr>
							<th>Member</th>
							<th>Type</th>
							<th>Comment</th>
							<th>Date</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{comments.map((c: T) => (
							<tr key={c._id}>
								<td className="ac-member">
									<span className="ac-member-id">{c.memberId?.toString().slice(-6)}</span>
								</td>
								<td>
									<span className="ac-group-badge">{GROUP_LABEL[c.commentGroup] ?? c.commentGroup}</span>
								</td>
								<td className="ac-content">{c.commentContent}</td>
								<td className="ac-date">{moment(c.createdAt).format('MMM D, YYYY')}</td>
								<td>
									<button className="ac-delete-btn" onClick={() => handleDelete(c._id)}>Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{totalPages > 1 && (
				<div className="ac-pagination">
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

export default AdminComments;
