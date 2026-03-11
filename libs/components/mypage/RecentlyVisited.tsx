import React, { useState } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Pagination, Stack } from '@mui/material';
import { GET_PROGRAMS } from '../../../apollo/user/query';
import { T } from '../../types/common';

const RecentlyVisited: NextPage = () => {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const limit = 9;

	const { data } = useQuery(GET_PROGRAMS, {
		variables: {
			input: {
				page,
				limit,
				sort: 'programViews',
				direction: 'DESC',
				search: { programStatus: 'ACTIVE' },
			},
		},
		fetchPolicy: 'cache-and-network',
	});

	const programs: T[] = data?.getPrograms?.list ?? [];
	const total: number = data?.getPrograms?.metaCounter?.[0]?.total ?? 0;

	return (
		<div id="my-favorites-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<p className="main-title">Recently Viewed</p>
					<p className="sub-title">Most viewed active programs.</p>
				</Stack>
			</Stack>

			<div className="favorites-list-box">
				{programs.length === 0 ? (
					<div className="no-data">
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>No programs found.</p>
					</div>
				) : (
					programs.map((p: T) => (
						<div key={p._id} className="card-config">
							<div className="top">
								<img
									src={p.programImages?.[0] || '/img/banner/header1.svg'}
									alt={p.programName}
									onClick={() => router.push({ pathname: '/programs/detail', query: { id: p._id } })}
									style={{ cursor: 'pointer' }}
								/>
								<div className="top-badge">{p.programLevel}</div>
								<div className="price-box">
									<p style={{ color: '#181a20' }}>${p.programPrice?.toLocaleString()}</p>
								</div>
							</div>
							<div className="bottom">
								<div className="name-address">
									<div className="name">
										<p
											onClick={() => router.push({ pathname: '/programs/detail', query: { id: p._id } })}
											style={{ cursor: 'pointer' }}
										>
											{p.programName}
										</p>
									</div>
									<div className="address">
										<p>{p.programType?.replace(/_/g, ' ')}</p>
									</div>
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
									<div className="buttons">
										<p style={{ fontSize: 11, color: '#9ca3af' }}>{p.memberData?.memberNick ?? 'Trainer'}</p>
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
						<p>Total {total} programs</p>
					</Stack>
				</Stack>
			)}
		</div>
	);
};

export default RecentlyVisited;
