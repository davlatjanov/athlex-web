import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_PROGRAMS, GET_PRODUCTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import ProgramCard from '../homepage/ProgramCard';

const VISITED_KEY = 'athlex_recently_visited';
const VISITED_TS_KEY = 'athlex_recently_visited_ts';
const MAX_VISITED = 30;
const ONE_HOUR_MS = 60 * 60 * 1000;

function clearIfExpired() {
	try {
		const ts = Number(localStorage.getItem(VISITED_TS_KEY) ?? '0');
		if (ts && Date.now() - ts > ONE_HOUR_MS) {
			localStorage.removeItem(VISITED_KEY);
			localStorage.removeItem(VISITED_TS_KEY);
		}
	} catch {}
}

interface VisitedEntry {
	id: string;
	type: 'PROGRAM' | 'PRODUCT';
}

export function trackProgramVisit(id: string) {
	if (typeof window === 'undefined' || !id) return;
	try {
		clearIfExpired();
		const list: VisitedEntry[] = JSON.parse(localStorage.getItem(VISITED_KEY) ?? '[]');
		const filtered = list.filter((e) => !(e.id === id && e.type === 'PROGRAM'));
		filtered.unshift({ id, type: 'PROGRAM' });
		localStorage.setItem(VISITED_KEY, JSON.stringify(filtered.slice(0, MAX_VISITED)));
		if (!localStorage.getItem(VISITED_TS_KEY)) localStorage.setItem(VISITED_TS_KEY, String(Date.now()));
	} catch {}
}

export function trackProductVisit(id: string) {
	if (typeof window === 'undefined' || !id) return;
	try {
		clearIfExpired();
		const list: VisitedEntry[] = JSON.parse(localStorage.getItem(VISITED_KEY) ?? '[]');
		const filtered = list.filter((e) => !(e.id === id && e.type === 'PRODUCT'));
		filtered.unshift({ id, type: 'PRODUCT' });
		localStorage.setItem(VISITED_KEY, JSON.stringify(filtered.slice(0, MAX_VISITED)));
		if (!localStorage.getItem(VISITED_TS_KEY)) localStorage.setItem(VISITED_TS_KEY, String(Date.now()));
	} catch {}
}

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

const PRICE_FILTERS = [
	{ label: 'All Prices', value: 'all' },
	{ label: 'Free', value: 'free' },
	{ label: 'Under $30', value: 'under30' },
	{ label: '$30 to $60', value: '30to60' },
	{ label: '$60+', value: '60plus' },
];

const SORT_OPTIONS = [
	{ label: 'Most Recent', value: 'recent' },
	{ label: 'Price: Low → High', value: 'price_asc' },
	{ label: 'Price: High → Low', value: 'price_desc' },
];

const LIMIT = 9;

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

const RecentlyVisited: NextPage = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<'PROGRAM' | 'PRODUCT'>('PROGRAM');
	const [visitedEntries, setVisitedEntries] = useState<VisitedEntry[]>([]);
	const [filterType, setFilterType] = useState('');
	const [filterLevel, setFilterLevel] = useState('');
	const [selectedPrice, setSelectedPrice] = useState('all');
	const [sortIdx, setSortIdx] = useState(0);
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState('');
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		try {
			clearIfExpired();
			const raw = localStorage.getItem(VISITED_KEY) ?? '[]';
			const parsed = JSON.parse(raw);
			if (parsed.length > 0 && typeof parsed[0] === 'string') {
				const migrated: VisitedEntry[] = parsed.map((id: string) => ({ id, type: 'PROGRAM' as const }));
				localStorage.setItem(VISITED_KEY, JSON.stringify(migrated));
				setVisitedEntries(migrated);
			} else {
				setVisitedEntries(parsed);
			}
		} catch {}
	}, []);

	useEffect(() => {
		setPage(1);
		setFilterType('');
		setFilterLevel('');
		setSelectedPrice('all');
		setSortIdx(0);
		setSearchInput('');
		setSearchText('');
	}, [activeTab]);

	useEffect(() => { setPage(1); }, [filterType, filterLevel, sortIdx, searchText]);

	const programIds = visitedEntries.filter((e) => e.type === 'PROGRAM').map((e) => e.id);
	const productIds = visitedEntries.filter((e) => e.type === 'PRODUCT').map((e) => e.id);

	const { data: programData } = useQuery(GET_PROGRAMS, {
		variables: { input: { page: 1, limit: 50, sort: 'createdAt', direction: 'DESC', programStatus: 'ACTIVE' } },
		fetchPolicy: 'cache-and-network',
		skip: programIds.length === 0,
	});

	const { data: productData } = useQuery(GET_PRODUCTS, {
		variables: { input: { page: 1, limit: 50, sort: 'createdAt', direction: 'DESC' } },
		fetchPolicy: 'cache-and-network',
		skip: productIds.length === 0,
	});

	const allPrograms: T[] = programData?.getPrograms?.list ?? [];
	const allProducts: T[] = productData?.getProducts?.list ?? [];

	const visitedPrograms = programIds.map((id) => allPrograms.find((p: T) => p._id === id)).filter(Boolean) as T[];
	const visitedProducts = productIds.map((id) => allProducts.find((p: T) => p._id === id)).filter(Boolean) as T[];

	const baseItems = activeTab === 'PROGRAM' ? visitedPrograms : visitedProducts;

	// Filter
	let filtered = baseItems.filter((p: T) => {
		const type = activeTab === 'PROGRAM' ? p.programType : p.productType;
		const level = p.programLevel;
		const price = activeTab === 'PROGRAM' ? p.programPrice : p.productPrice;
		const name = activeTab === 'PROGRAM' ? p.programName : p.productName;

		if (filterType && type !== filterType) return false;
		if (activeTab === 'PROGRAM' && filterLevel && level !== filterLevel) return false;
		if (searchText && !name?.toLowerCase().includes(searchText.toLowerCase())) return false;
		if (selectedPrice === 'free') return price === 0;
		if (selectedPrice === 'under30') return price > 0 && price < 30;
		if (selectedPrice === '30to60') return price >= 30 && price <= 60;
		if (selectedPrice === '60plus') return price > 60;
		return true;
	});

	// Sort
	if (sortIdx === 1) filtered = [...filtered].sort((a, b) => (activeTab === 'PROGRAM' ? a.programPrice - b.programPrice : a.productPrice - b.productPrice));
	if (sortIdx === 2) filtered = [...filtered].sort((a, b) => (activeTab === 'PROGRAM' ? b.programPrice - a.programPrice : b.productPrice - a.productPrice));

	const total = filtered.length;
	const totalPages = Math.ceil(total / LIMIT);
	const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

	const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearchText(searchInput); setPage(1); };
	const typeOptions = activeTab === 'PROGRAM' ? TYPE_OPTIONS : PRODUCT_TYPE_OPTIONS;

	return (
		<div id="my-visited-page">
			<div className="bk-tab-bar">
				<button className={`bk-tab ${activeTab === 'PROGRAM' ? 'active' : ''}`} onClick={() => setActiveTab('PROGRAM')}>
					Programs
				</button>
				<button className={`bk-tab ${activeTab === 'PRODUCT' ? 'active' : ''}`} onClick={() => setActiveTab('PRODUCT')}>
					Products
				</button>
			</div>

			<div className="programs-container">
				{/* ── Sidebar ── */}
				<aside className="filter-sidebar">
					<div className="filter-block">
						<h4>{activeTab === 'PROGRAM' ? 'Program Type' : 'Product Type'}</h4>
						<div className="chip-group">
							{typeOptions.map((opt) => (
								<button key={opt.value} className={`chip ${filterType === opt.value ? 'active' : ''}`} onClick={() => setFilterType(opt.value)}>
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
									<button key={opt.value} className={`chip ${filterLevel === opt.value ? 'active' : ''}`} onClick={() => setFilterLevel(opt.value)}>
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
									<input type="radio" name="rv-price" value={pf.value} checked={selectedPrice === pf.value} onChange={() => { setSelectedPrice(pf.value); setPage(1); }} />
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
							placeholder={`Search visited ${activeTab === 'PROGRAM' ? 'programs' : 'products'}…`}
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
							<strong>{total}</strong> visited {activeTab === 'PROGRAM' ? 'program' : 'product'}{total !== 1 ? 's' : ''}
						</span>
						<div className="sort-row">
							<span>Sort by:</span>
							<div className="sort-buttons">
								{SORT_OPTIONS.map((opt, idx) => (
									<button key={opt.value} className={`sort-btn ${sortIdx === idx ? 'active' : ''}`} onClick={() => setSortIdx(idx)}>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					</div>

					{paged.length === 0 ? (
						<div className="empty-state">
							<span>No visited {activeTab === 'PROGRAM' ? 'programs' : 'products'} yet.</span>
							<button onClick={() => { setFilterType(''); setFilterLevel(''); setSelectedPrice('all'); }}>Clear Filters</button>
						</div>
					) : activeTab === 'PROGRAM' ? (
						<div className="programs-grid">
							{paged.map((p: T) => (
								<ProgramCard
									key={p._id}
									id={p._id}
									name={p.programName}
									type={p.programType}
									level={p.programLevel}
									duration={p.programDuration}
									price={p.programPrice}
									views={p.programViews}
									likes={p.programLikes}
									members={p.programMembers}
									rank={p.programRank}
									image={p.programImages?.[0]}
									gradient={typeGradients[p.programType] ?? typeGradients['STRENGTH']}
								/>
							))}
						</div>
					) : (
						<div className="products-grid">
							{paged.map((p: T) => (
								<div key={p._id} className="product-card" onClick={() => router.push(`/products/${p._id}`)}>
									<div className="product-img">
										<img src={p.productImages?.[0] || '/img/banner/header1.svg'} alt={p.productName} />
									</div>
									<div className="product-info">
										<p className="product-name">{p.productName}</p>
										<p className="product-type">{p.productType?.replace(/_/g, ' ')}</p>
										<p className="product-price">${p.productPrice?.toLocaleString()}</p>
									</div>
								</div>
							))}
						</div>
					)}

					{totalPages > 1 && (
						<div className="pagination">
							<button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
							))}
							<button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default RecentlyVisited;
