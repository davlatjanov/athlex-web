import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_FEEDBACKS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import moment from 'moment';

const SCALE_MAP: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const GROUP_LABEL: Record<string, string> = {
	TRAINING_PROGRAM: 'Program',
	TRAINER: 'Trainer',
	PRODUCT: 'Product',
};

const MemberReviews = () => {
	const router = useRouter();
	const memberId = router.query.memberId as string;
	const [feedbacks, setFeedbacks] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);

	useQuery(GET_FEEDBACKS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: 10, memberId } },
		skip: !memberId,
		onCompleted: (data: T) => {
			setFeedbacks(data?.getFeedbacks?.list ?? []);
			setTotal(data?.getFeedbacks?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const totalPages = Math.ceil(total / 10);

	const Stars = ({ scale }: { scale: string }) => {
		const n = SCALE_MAP[scale] ?? 0;
		return (
			<span className="mr-stars">
				{Array.from({ length: 5 }, (_, i) => (
					<span key={i} style={{ color: i < n ? '#f59e0b' : '#374151' }}>★</span>
				))}
			</span>
		);
	};

	return (
		<div id="member-reviews">
			<h3 className="mr-title">Reviews Given <span>{total}</span></h3>

			{feedbacks.length === 0 ? (
				<div className="mr-empty">
					<span>⭐</span>
					<p>No reviews given yet.</p>
				</div>
			) : (
				<div className="mr-list">
					{feedbacks.map((fb: T) => (
						<div key={fb._id} className="mr-card">
							<div className="mr-card-top">
								<Stars scale={fb.feedbackScale} />
								<span className="mr-group">{GROUP_LABEL[fb.feedbackGroup] ?? fb.feedbackGroup}</span>
								<span className="mr-date">{moment(fb.createdAt).format('MMM D, YYYY')}</span>
							</div>
							<p className="mr-content">{fb.feedbackContent}</p>
						</div>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="mr-pagination">
					<button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
						<button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
					))}
					<button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
				</div>
			)}
		</div>
	);
};

export default MemberReviews;
