import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_MY_BOOKMARKS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import ProgramCard from '../homepage/ProgramCard';

const TYPE_OPTIONS = [
	{ label: 'All Types', value: '' },
	{ label: 'Mass Gain', value: 'MASS_GAIN' },
	{ label: 'Weight Loss', value: 'WEIGHT_LOSS' },
	{ label: 'Strength', value: 'STRENGTH' },
	{ label: 'Cardio', value: 'CARDIO' },
	{ label: 'Yoga', value: 'YOGA' },
	{ label: 'Functional', value: 'FUNCTIONAL' },
	{ label: 'Rehabilitation', value: 'REHABILITATION' },
	{ label: 'Mobility', value: 'MOBILITY' },
	{ label: 'Beginners', value: 'BEGINNERS' },
	{ label: 'Advanced', value: 'ADVANCED' },
];

const PRODUCT_TYPE_OPTIONS = [
	{ label: 'All Types', value: '' },
	{ label: 'Supplement', value: 'SUPPLEMENT' },
	{ label: 'Equipment', value: 'EQUIPMENT' },
	{ label: 'Apparel', value: 'APPAREL' },
	{ label: 'Accessory', value: 'ACCESSORY' },
];

const LEVEL_OPTIONS = [
	{ label: 'All Levels', value: '' },
	{ label: 'Beginner', value: 'BEGINNER' },
	{ label: 'Intermediate', value: 'INTERMEDIATE' },
	{ label: 'Advanced', value: 'ADVANCED' },
];

const SORT_OPTIONS = [
	{ label: 'Most Popular', value: 'programViews', direction: 'DESC' },
	{ label: 'Top Rated', value: 'programRank', direction: 'DESC' },
	{ label: 'Price: Low → High', value: 'programPrice', direction: 'ASC' },
	{ label: 'Price: High → Low', value: 'programPrice', direction: 'DESC' },
	{ label: 'Newest', value: 'createdAt', direction: 'DESC' },
];

const PRICE_FILTERS = [
	{ label: 'All Prices', value: 'all' },
	{ label: 'Free', value: 'free' },
	{ label: 'Under $30', value: 'under30' },
	{ label: '$30 to $60', value: '30to60' },
	{ label: '$60+', value: '60plus' },
];

const typeGradients: Record<string, string> = {
	MASS_GAIN: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
	WEIGHT_LOSS: 'linear-gradient(135deg, #0f3460 0%, #e94560 100%)',
	STRENGTH: 'linear-gradient(135deg, #1a1a2e 0%, #e92c28 100%)',
	CARDIO: 'linear-gradient(135deg, #0f3460 0%, #533483 100%)',
	YOGA: 'linear-gradient(135deg, #1b4332 0%, #40916c 100%)',
	FUNCTIONAL: 'linear-gradient(135deg, #212529 0%, #495057 100%)',
	REHABILITATION: 'linear-gradient(135deg, #003566 0%, #0077b6 100%)',
	MOBILITY: 'linear-gradient(135deg, #370617 0%, #e85d04 100%)',
	BEGINNERS: 'linear-gradient(135deg, #1b263b 0%, #415a77 100%)',
	ADVANCED: 'linear-gradient(135deg, #10002b 0%, #5a189a 100%)',
};

const LIMIT = 9;

const MyBookmarks: NextPage = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<'PROGRAM' | 'PRODUCT'>('PROGRAM');
	const [filterType, setFilterType] = useState('');
	const [filterLevel, setFilterLevel] = useState('');
	const [selectedPrice, setSelectedPrice] = useState('all');
	const [sortIdx, setSortIdx] = useState(0);
	const [page, setPage] = useState(1);
	const [items, setItems] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [searchInput, setSearchInput] = useState('');
	const [searchText, setSearchText] = useState('');

	const sort = SORT_OPTIONS[sortIdx];

	const { loading } = useQuery(GET_MY_BOOKMARKS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page,
				limit: LIMIT,
				sort: sort.value,
				direction: sort.direction,
				bookmarkGroup: activeTab,
			},
		},
		onCompleted: (data: T) => {
			setItems(data?.getMyBookmarks?.list ?? []);
			setTotal(data?.getMyBookmarks?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		setPage(1);
		setFilterType('');
		setFilterLevel('');
		setSelectedPrice('all');
		setSortIdx(0);
		setSearchInput('');
		setSearchText('');
	}, [activeTab]);

	useEffect(() => {
		setPage(1);
	}, [filterType, filterLevel, sortIdx, searchText]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchText(searchInput);
		setPage(1);
	};

	const filtered = items.filter((item) => {
		const p = item.itemData;
		if (!p) return false;
		if (filterType && p.type !== filterType) return false;
		if (filterLevel && p.level !== filterLevel) return false;
		if (searchText && !p.name?.toLowerCase().includes(searchText.toLowerCase())) return false;
		if (selectedPrice === 'free') return p.price === 0;
		if (selectedPrice === 'under30') return p.price > 0 && p.price < 30;
		if (selectedPrice === '30to60') return p.price >= 30 && p.price <= 60;
		if (selectedPrice === '60plus') return p.price > 60;
		return true;
	});

	const totalPages = Math.ceil(total / LIMIT);
	const typeOptions = activeTab === 'PROGRAM' ? TYPE_OPTIONS : PRODUCT_TYPE_OPTIONS;

	return (
		<div id="my-bookmarks-page">
			{/* ── Tabs ── */}
			<div className="bk-tab-bar">
				<button
					className={`bk-tab ${activeTab === 'PROGRAM' ? 'active' : ''}`}
					onClick={() => setActiveTab('PROGRAM')}
				>
					Saved Programs
				</button>
				<button
					className={`bk-tab ${activeTab === 'PRODUCT' ? 'active' : ''}`}
					onClick={() => setActiveTab('PRODUCT')}
				>
					Saved Products
				</button>
			</div>

			<div className="programs-container">
				{/* ── Sidebar ── */}
				<aside className="filter-sidebar">
					<div className="filter-block">
						<h4>{activeTab === 'PROGRAM' ? 'Program Type' : 'Product Type'}</h4>
						<div className="chip-group">
							{typeOptions.map((opt) => (
								<button
									key={opt.value}
									className={`chip ${filterType === opt.value ? 'active' : ''}`}
									onClick={() => setFilterType(opt.value)}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>

					{activeTab === 'PROGRAM' && (
						<div className="filter-block">
							<h4>Level</h4>
							<div className="chip-group">
								{LEVEL_OPTIONS.map((opt) => (
									<button
										key={opt.value}
										className={`chip ${filterLevel === opt.value ? 'active' : ''}`}
										onClick={() => setFilterLevel(opt.value)}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					)}

					<div className="filter-block">
						<h4>Price</h4>
						<div className="radio-group">
							{PRICE_FILTERS.map((pf) => (
								<label key={pf.value} className={`radio-item ${selectedPrice === pf.value ? 'active' : ''}`}>
									<input
										type="radio"
										name="bk-price"
										value={pf.value}
										checked={selectedPrice === pf.value}
										onChange={() => { setSelectedPrice(pf.value); setPage(1); }}
									/>
									{pf.label}
								</label>
							))}
						</div>
					</div>
				</aside>

				{/* ── Main ── */}
				<main className="programs-main">
					<form className="search-bar" onSubmit={handleSearch}>
						<input
							className="search-input"
							type="text"
							placeholder={`Search saved ${activeTab === 'PROGRAM' ? 'programs' : 'products'}…`}
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
						/>
						{searchText && (
							<button type="button" className="search-clear" onClick={() => { setSearchInput(''); setSearchText(''); setPage(1); }}>✕</button>
						)}
						<button type="submit" className="search-btn">Search</button>
					</form>

					<div className="top-bar">
						<span className="results-count">
							<strong>{total}</strong> saved {activeTab === 'PROGRAM' ? 'program' : 'product'}{total !== 1 ? 's' : ''}
						</span>
						<div className="sort-row">
							<span>Sort by:</span>
							<div className="sort-buttons">
								{SORT_OPTIONS.map((opt, idx) => (
									<button
										key={`${opt.value}-${opt.direction}`}
										className={`sort-btn ${sortIdx === idx ? 'active' : ''}`}
										onClick={() => setSortIdx(idx)}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					</div>

					{loading ? (
						<div className="loading-state">Loading...</div>
					) : filtered.length === 0 ? (
						<div className="empty-state">
							<span>No saved {activeTab === 'PROGRAM' ? 'programs' : 'products'} yet.</span>
							<button onClick={() => { setFilterType(''); setFilterLevel(''); setSelectedPrice('all'); }}>
								Clear Filters
							</button>
						</div>
					) : activeTab === 'PROGRAM' ? (
						<div className="programs-grid">
							{filtered.map((item) => {
								const p = item.itemData;
								return (
									<ProgramCard
										key={item._id}
										id={item.bookmarkRefId}
										name={p?.name ?? ''}
										type={p?.type ?? ''}
										level={p?.level ?? ''}
										duration={p?.duration ?? 0}
										price={p?.price ?? 0}
										views={p?.views ?? 0}
										likes={p?.likes ?? 0}
										members={p?.members ?? 0}
										rank={p?.rank ?? 0}
										image={p?.images?.[0]}
										gradient={typeGradients[p?.type] ?? typeGradients['STRENGTH']}
									/>
								);
							})}
						</div>
					) : (
						<div className="products-grid">
							{filtered.map((item) => {
								const p = item.itemData;
								return (
									<div
										key={item._id}
										className="product-card"
										onClick={() => router.push(`/products/${item.bookmarkRefId}`)}
									>
										<div className="product-img">
											<img src={p?.images?.[0] || '/img/banner/header1.svg'} alt={p?.name} />
										</div>
										<div className="product-info">
											<p className="product-name">{p?.name}</p>
											<p className="product-type">{p?.type?.replace(/_/g, ' ')}</p>
											<p className="product-price">${p?.price?.toLocaleString()}</p>
										</div>
									</div>
								);
							})}
						</div>
					)}

					{totalPages > 1 && (
						<div className="pagination">
							<button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button
									key={p}
									className={`page-btn ${page === p ? 'active' : ''}`}
									onClick={() => setPage(p)}
								>
									{p}
								</button>
							))}
							<button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default MyBookmarks;
