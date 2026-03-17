import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_MY_STUDENTS } from '../../../apollo/user/query';
import { useRouter } from 'next/router';
import { T } from '../../types/common';

const LIMIT = 20;

const MyStudents: React.FC = () => {
	const router = useRouter();
	const [page, setPage] = useState(1);

	const { data, loading } = useQuery(GET_MY_STUDENTS, {
		variables: { page, limit: LIMIT },
		fetchPolicy: 'network-only',
	});

	const students: T[] = data?.getMyStudents?.list ?? [];
	const total: number = data?.getMyStudents?.total ?? 0;
	const totalPages = Math.ceil(total / LIMIT);

	// Group by program
	const grouped: Record<string, { programName: string; members: T[] }> = {};
	students.forEach((s) => {
		const key = s.programId?.toString();
		if (!grouped[key]) grouped[key] = { programName: s.programName, members: [] };
		grouped[key].members.push(s);
	});

	return (
		<div className="my-students">
			<div className="ms-header">
				<h2 className="ms-title">My Students</h2>
				<span className="ms-count">{total} total</span>
			</div>

			{loading ? (
				<div className="ms-empty">Loading…</div>
			) : students.length === 0 ? (
				<div className="ms-empty">No students enrolled yet.</div>
			) : (
				<>
					{Object.entries(grouped).map(([programId, { programName, members }]) => (
						<div className="ms-program-group" key={programId}>
							<div className="ms-program-label">{programName}</div>
							<div className="ms-members">
								{members.map((s: T) => (
									<div
										className="ms-member-card"
										key={s.memberId}
										onClick={() => router.push(`/member?memberId=${s.memberId}`)}
									>
										<div className="ms-avatar">
											{s.memberImage
												? <img src={s.memberImage} alt={s.memberNick} />
												: <span>{(s.memberNick || 'U')[0].toUpperCase()}</span>
											}
										</div>
										<div className="ms-info">
											<span className="ms-nick">{s.memberNick}</span>
											{s.memberFullName && <span className="ms-fullname">{s.memberFullName}</span>}
											<span className="ms-enrolled">
												Enrolled {new Date(s.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					))}

					{totalPages > 1 && (
						<div className="ms-pagination">
							<button className="ms-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
							<span>{page} / {totalPages}</span>
							<button className="ms-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default MyStudents;
