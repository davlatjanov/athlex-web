import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useQuery } from '@apollo/client';
import { GET_TRAINERS } from '../../apollo/user/query';
import { useLike } from '../../libs/hooks/useInteractions';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SORT_OPTIONS = [
	{ label: 'Most Popular', value: 'memberViews', direction: 'DESC' },
	{ label: 'Most Liked', value: 'memberLikes', direction: 'DESC' },
	{ label: 'Top Ranked', value: 'memberRank', direction: 'DESC' },
	{ label: 'Newest', value: 'createdAt', direction: 'DESC' },
];

const TrainerCard = ({ trainer }: { trainer: any }) => {
	const { liked, toggle: toggleLike } = useLike('trainers', trainer._id);
	const displayFollowers = trainer.memberFollowers >= 1000
		? `${(trainer.memberFollowers / 1000).toFixed(1)}K`
		: String(trainer.memberFollowers ?? 0);
	const displayViews = trainer.memberViews >= 1000
		? `${(trainer.memberViews / 1000).toFixed(1)}K`
		: String(trainer.memberViews ?? 0);

	const initials = (trainer.memberFullName || trainer.memberNick || '?')
		.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

	return (
		<div className="trainer-card">
			<div className="tc-header">
				{trainer.memberImage ? (
					<img
						src={trainer.memberImage}
						alt={trainer.memberFullName}
						className="tc-header-img"
						onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
					/>
				) : (
					<div className="tc-initials">{initials}</div>
				)}
				<div className="tc-header-overlay" />
				<button className={`tc-like-btn ${liked ? 'liked' : ''}`} onClick={toggleLike}>
					{liked ? '♥' : '♡'}
				</button>
			</div>
			<div className="tc-body">
				<h3 className="tc-name">{trainer.memberFullName || trainer.memberNick}</h3>
				<p className="tc-nick">@{trainer.memberNick}</p>
				{trainer.memberDesc && <p className="tc-bio">{trainer.memberDesc}</p>}
				<div className="tc-stats">
					<div className="tc-stat">
						<span className="ts-val">{trainer.memberPrograms ?? 0}</span>
						<span className="ts-lbl">Programs</span>
					</div>
					<div className="tc-stat-sep" />
					<div className="tc-stat">
						<span className="ts-val">{displayFollowers}</span>
						<span className="ts-lbl">Followers</span>
					</div>
					<div className="tc-stat-sep" />
					<div className="tc-stat">
						<span className="ts-val">♥ {trainer.memberLikes ?? 0}</span>
						<span className="ts-lbl">Likes</span>
					</div>
					<div className="tc-stat-sep" />
					<div className="tc-stat">
						<span className="ts-val">👁 {displayViews}</span>
						<span className="ts-lbl">Views</span>
					</div>
				</div>
				<Link href={`/trainer/detail?id=${trainer._id}`}>
					<button className="tc-btn">View Profile →</button>
				</Link>
			</div>
		</div>
	);
};

const TrainerList: NextPage = () => {
	const [sortIdx, setSortIdx] = useState(0);
	const [page, setPage] = useState(1);
	const [searchText, setSearchText] = useState('');
	const [searchInput, setSearchInput] = useState('');
	const [allTrainers, setAllTrainers] = useState<any[]>([]);
	const [total, setTotal] = useState(0);

	const sort = SORT_OPTIONS[sortIdx];
	const PER_PAGE = 9;

	const { loading } = useQuery(GET_TRAINERS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page,
				limit: PER_PAGE,
				sort: sort.value,
				direction: sort.direction,
				...(searchText ? { search: { text: searchText } } : {}),
			},
		},
		onCompleted: (data: T) => {
			setAllTrainers(data?.getTrainers?.list ?? []);
			setTotal(data?.getTrainers?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchText(searchInput);
		setPage(1);
	};

	const totalPages = Math.ceil(total / PER_PAGE);

	return (
		<div id="trainer-list-page">
			<Head><title>Athlex | Trainers</title></Head>
			<div className="tl-container">
				<main className="tl-main" style={{ width: '100%' }}>
					<form className="tl-search-bar" onSubmit={handleSearch}>
						<input
							className="tl-search-input"
							type="text"
							placeholder="Search trainers by nickname…"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
						/>
						{searchText && (
							<button type="button" className="tl-search-clear" onClick={() => { setSearchInput(''); setSearchText(''); setPage(1); }}>✕</button>
						)}
						<button type="submit" className="tl-search-btn">Search</button>
					</form>

					<div className="tl-top-bar">
						<span className="tl-count">
							{loading ? 'Loading…' : <><strong>{total}</strong> trainers found</>}
						</span>
						<div className="tl-sort-row">
							<span>Sort by:</span>
							<div className="tl-sort-buttons">
								{SORT_OPTIONS.map((opt, i) => (
									<button
										key={`${opt.value}-${opt.direction}`}
										className={`tl-sort-btn ${sortIdx === i ? 'active' : ''}`}
										onClick={() => { setSortIdx(i); setPage(1); }}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					</div>

					{loading && allTrainers.length === 0 ? (
						<div className="tl-empty"><span>⏳</span><p>Loading trainers…</p></div>
					) : allTrainers.length === 0 ? (
						<div className="tl-empty"><span>🏋️</span><p>No trainers found.</p></div>
					) : (
						<div className="tl-grid">
							{allTrainers.map((trainer) => (
								<TrainerCard key={trainer._id} trainer={trainer} />
							))}
						</div>
					)}

					{totalPages > 1 && (
						<div className="tl-pagination">
							<button className="tl-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button key={p} className={`tl-page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
							))}
							<button className="tl-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default withLayoutBasic(TrainerList);
