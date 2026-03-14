import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination, Stack } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_PROGRAMS } from '../../../apollo/user/query';
import { T } from '../../types/common';

const VISITED_KEY = 'athlex_recently_visited';
const MAX_VISITED = 30;

/** Call this from any program detail page to track a visit */
export function trackProgramVisit(programId: string) {
	if (typeof window === 'undefined' || !programId) return;
	try {
		const list: string[] = JSON.parse(localStorage.getItem(VISITED_KEY) ?? '[]');
		const filtered = list.filter((id) => id !== programId);
		filtered.unshift(programId);
		localStorage.setItem(VISITED_KEY, JSON.stringify(filtered.slice(0, MAX_VISITED)));
	} catch {}
}

const RecentlyVisited: NextPage = () => {
	const router = useRouter();
	const [visitedIds, setVisitedIds] = useState<string[]>([]);
	const [page, setPage] = useState(1);
	const limit = 9;

	useEffect(() => {
		try {
			const list: string[] = JSON.parse(localStorage.getItem(VISITED_KEY) ?? '[]');
			setVisitedIds(list);
		} catch {}
	}, []);

	// Fetch active programs, then filter to only show visited ones
	const { data } = useQuery(GET_PROGRAMS, {
		variables: {
			input: {
				page: 1,
				limit: 50,
				sort: 'createdAt',
				direction: 'DESC',
				programStatus: 'ACTIVE',
			},
		},
		fetchPolicy: 'cache-and-network',
		skip: visitedIds.length === 0,
	});

	const allPrograms: T[] = data?.getPrograms?.list ?? [];

	// Filter and order by visit recency
	const visitedPrograms = visitedIds
		.map((id) => allPrograms.find((p: T) => p._id === id))
		.filter(Boolean) as T[];

	const pagedPrograms = visitedPrograms.slice((page - 1) * limit, page * limit);
	const total = visitedPrograms.length;

	return (
		<div id="my-favorites-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<p className="main-title">Recently Visited</p>
					<p className="sub-title">Programs you've recently viewed.</p>
				</Stack>
			</Stack>

			<div className="favorites-list-box">
				{pagedPrograms.length === 0 ? (
					<div className="no-data">
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>No recently visited programs. Browse programs to see them here.</p>
					</div>
				) : (
					pagedPrograms.map((p: T) => (
						<div
							key={p._id}
							className="card-config"
							onClick={() => router.push(`/programs/${p._id}`)}
							style={{ cursor: 'pointer' }}
						>
							<div className="top">
								<img
									src={p.programImages?.[0] || '/img/banner/header1.svg'}
									alt={p.programName}
								/>
								<div className="top-badge">{p.programLevel}</div>
								<div className="price-box">
									<p>${p.programPrice?.toLocaleString()}</p>
								</div>
							</div>
							<div className="bottom">
								<div className="name-address">
									<div className="name"><p>{p.programName}</p></div>
									<div className="address"><p>{p.programType?.replace(/_/g, ' ')}</p></div>
								</div>
								<div className="options">
									<div className="option">
										<img src="/img/icons/eye.svg" alt="" />
										<p>{p.programViews?.toLocaleString() ?? 0}</p>
									</div>
									<div className="option">
										<img src="/img/icons/like.svg" alt="" />
										<p>{p.programLikes?.toLocaleString() ?? 0}</p>
									</div>
								</div>
								<div className="divider" />
								<div className="type-buttons">
									<div className="type">
										<p style={{ fontSize: 12 }}>{p.programDuration}w</p>
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>

			{total > limit && (
				<Stack className="pagination-config">
					<Stack className="pagination-box">
						<Pagination
							count={Math.ceil(total / limit)}
							page={page}
							shape="circular"
							color="primary"
							onChange={(_e, value) => setPage(value)}
						/>
					</Stack>
					<Stack className="total-result">
						<p>Total {total} visited</p>
					</Stack>
				</Stack>
			)}
		</div>
	);
};

export default RecentlyVisited;
