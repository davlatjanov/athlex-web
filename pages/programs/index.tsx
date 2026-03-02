import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ProgramCard from '../../libs/components/homepage/ProgramCard';
import { allPrograms } from '../../libs/data/programs';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const TYPES = ['ALL', 'MASS GAIN', 'WEIGHT LOSS', 'STRENGTH', 'CARDIO', 'YOGA', 'FUNCTIONAL', 'REHABILITATION', 'MOBILITY'];
const LEVELS = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const PRICE_FILTERS = [
	{ label: 'All Prices', value: 'all' },
	{ label: 'Free', value: 'free' },
	{ label: 'Under $30', value: 'under30' },
	{ label: '$30 – $60', value: '30to60' },
	{ label: '$60+', value: '60plus' },
];
const SORT_OPTIONS = [
	{ label: 'Most Popular', value: 'popular' },
	{ label: 'Top Rated', value: 'rating' },
	{ label: 'Price: Low → High', value: 'price-asc' },
	{ label: 'Price: High → Low', value: 'price-desc' },
	{ label: 'Duration: Short → Long', value: 'duration-asc' },
];

const ProgramsPage: NextPage = () => {
	const device = useDeviceDetect();
	const [selectedType, setSelectedType] = useState('ALL');
	const [selectedLevel, setSelectedLevel] = useState('ALL');
	const [selectedPrice, setSelectedPrice] = useState('all');
	const [sortBy, setSortBy] = useState('popular');
	const [page, setPage] = useState(1);
	const PER_PAGE = 9;

	const filtered = useMemo(() => {
		let list = [...allPrograms];

		if (selectedType !== 'ALL') list = list.filter((p) => p.type === selectedType);
		if (selectedLevel !== 'ALL') list = list.filter((p) => p.level === selectedLevel);

		if (selectedPrice === 'free') list = list.filter((p) => p.price === 0);
		else if (selectedPrice === 'under30') list = list.filter((p) => p.price > 0 && p.price < 30);
		else if (selectedPrice === '30to60') list = list.filter((p) => p.price >= 30 && p.price <= 60);
		else if (selectedPrice === '60plus') list = list.filter((p) => p.price > 60);

		if (sortBy === 'popular') list.sort((a, b) => b.views - a.views);
		else if (sortBy === 'rating') list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
		else if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
		else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
		else if (sortBy === 'duration-asc') list.sort((a, b) => a.duration - b.duration);

		return list;
	}, [selectedType, selectedLevel, selectedPrice, sortBy]);

	const totalPages = Math.ceil(filtered.length / PER_PAGE);
	const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

	const handleFilterChange = (setter: (v: string) => void, value: string) => {
		setter(value);
		setPage(1);
	};

	if (device === 'mobile') {
		return (
			<Stack className={'programs-page-mobile'}>
				<h2>Programs</h2>
				<Stack className={'mobile-grid'}>
					{paginated.map((prog) => (
						<ProgramCard key={prog.id} {...prog} />
					))}
				</Stack>
			</Stack>
		);
	}

	return (
		<div id="programs-page">
			<div className={'programs-container'}>
				{/* SIDEBAR */}
				<aside className={'filter-sidebar'}>
					<div className={'filter-block'}>
						<h4>Program Type</h4>
						<div className={'chip-group'}>
							{TYPES.map((type) => (
								<button
									key={type}
									className={`chip ${selectedType === type ? 'active' : ''}`}
									onClick={() => handleFilterChange(setSelectedType, type)}
								>
									{type === 'ALL' ? 'All Types' : type}
								</button>
							))}
						</div>
					</div>

					<div className={'filter-block'}>
						<h4>Level</h4>
						<div className={'chip-group'}>
							{LEVELS.map((level) => (
								<button
									key={level}
									className={`chip ${selectedLevel === level ? 'active' : ''}`}
									onClick={() => handleFilterChange(setSelectedLevel, level)}
								>
									{level === 'ALL' ? 'All Levels' : level}
								</button>
							))}
						</div>
					</div>

					<div className={'filter-block'}>
						<h4>Price</h4>
						<div className={'radio-group'}>
							{PRICE_FILTERS.map((pf) => (
								<label key={pf.value} className={`radio-item ${selectedPrice === pf.value ? 'active' : ''}`}>
									<input
										type="radio"
										name="price"
										value={pf.value}
										checked={selectedPrice === pf.value}
										onChange={() => handleFilterChange(setSelectedPrice, pf.value)}
									/>
									{pf.label}
								</label>
							))}
						</div>
					</div>
				</aside>

				{/* MAIN */}
				<main className={'programs-main'}>
					{/* TOP BAR */}
					<div className={'top-bar'}>
						<span className={'results-count'}>
							<strong>{filtered.length}</strong> programs found
						</span>
						<div className={'sort-row'}>
							<span>Sort by:</span>
							<div className={'sort-buttons'}>
								{SORT_OPTIONS.map((opt) => (
									<button
										key={opt.value}
										className={`sort-btn ${sortBy === opt.value ? 'active' : ''}`}
										onClick={() => { setSortBy(opt.value); setPage(1); }}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* GRID */}
					{paginated.length === 0 ? (
						<div className={'empty-state'}>
							<span>🏋️</span>
							<p>No programs match your filters.</p>
							<button onClick={() => { setSelectedType('ALL'); setSelectedLevel('ALL'); setSelectedPrice('all'); }}>
								Clear Filters
							</button>
						</div>
					) : (
						<div className={'programs-grid'}>
							{paginated.map((prog) => (
								<ProgramCard key={prog.id} {...prog} />
							))}
						</div>
					)}

					{/* PAGINATION */}
					{totalPages > 1 && (
						<div className={'pagination'}>
							<button className={'page-btn'} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
								← Prev
							</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button
									key={p}
									className={`page-btn ${page === p ? 'active' : ''}`}
									onClick={() => setPage(p)}
								>
									{p}
								</button>
							))}
							<button className={'page-btn'} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
								Next →
							</button>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default withLayoutBasic(ProgramsPage);
