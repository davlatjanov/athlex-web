import React, { useState } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Pagination, Stack } from '@mui/material';
import { GET_MY_BOOKMARKS } from '../../../apollo/user/query';
import { T } from '../../types/common';

const MyBookmarks: NextPage = () => {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const limit = 12;

	const { data } = useQuery(GET_MY_BOOKMARKS, {
		variables: {
			input: { page, limit },
		},
		fetchPolicy: 'network-only',
	});

	const bookmarks: T[] = data?.getMyBookmarks?.list ?? [];
	const total: number = data?.getMyBookmarks?.metaCounter?.[0]?.total ?? 0;

	const navigateToItem = (bookmark: T) => {
		if (bookmark.bookmarkGroup === 'PROGRAM') {
			router.push(`/programs/${bookmark.bookmarkRefId}`);
		} else if (bookmark.bookmarkGroup === 'PRODUCT') {
			router.push(`/products/${bookmark.bookmarkRefId}`);
		}
	};

	const groupLabel: Record<string, string> = {
		PROGRAM: '🏋️ Program',
		PRODUCT: '🛍️ Product',
		MEMBER: '👤 Member',
	};

	return (
		<div id="my-favorites-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<p className="main-title">Saved Items</p>
					<p className="sub-title">Programs and products you've bookmarked.</p>
				</Stack>
			</Stack>

			<div className="favorites-list-box">
				{bookmarks.length === 0 ? (
					<div className="no-data">
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>No bookmarks yet. Save programs or products to see them here.</p>
					</div>
				) : (
					bookmarks.map((b: T) => (
						<div
							key={b._id}
							className="card-config"
							onClick={() => navigateToItem(b)}
							style={{ cursor: 'pointer' }}
						>
							<div className="bottom">
								<div className="name-address">
									<div className="name">
										<p>{groupLabel[b.bookmarkGroup] ?? b.bookmarkGroup}</p>
									</div>
									<div className="address">
										<p>ID: {b.bookmarkRefId?.slice(-8)}</p>
									</div>
								</div>
								<div className="options">
									<div className="option">
										<p style={{ fontSize: 11, color: '#9ca3af' }}>
											{new Date(b.createdAt).toLocaleDateString()}
										</p>
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
						<p>Total {total} saved</p>
					</Stack>
				</Stack>
			)}
		</div>
	);
};

export default MyBookmarks;
