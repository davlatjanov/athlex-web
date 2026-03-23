import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ProgramCard from '../../libs/components/homepage/ProgramCard';
import { ProgramCardSkeleton } from '../../libs/components/common/Skeleton';
import { useQuery } from '@apollo/client';
import { GET_PROGRAMS } from '../../apollo/user/query';
import { Program } from '../../libs/types/program/program';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

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

const LEVEL_OPTIONS = [
	{ label: 'All Levels', value: '' },
	{ label: 'Beginner', value: 'BEGINNER' },
	{ label: 'Intermediate', value: 'INTERMEDIATE' },
	{ label: 'Advanced', value: 'ADVANCED' },
];

const SORT_OPTIONS = [
	{ label: 'Most Popular', value: 'programViews', direction: 'DESC' },
	{ label: 'Top Rated', value: 'programRank', direction: 'DESC' },
	{ label: 'Price: Low to High', value: 'programPrice', direction: 'ASC' },
	{ label: 'Price: High to Low', value: 'programPrice', direction: 'DESC' },
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

const ProgramsPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();

	const [programType, setProgramType] = useState('');
	const [programLevel, setProgramLevel] = useState('');
	const [selectedPrice, setSelectedPrice] = useState('all');
	const [sortIdx, setSortIdx] = useState(0);
	const [page, setPage] = useState(1);
	const [programs, setPrograms] = useState<Program[]>([]);
	const [total, setTotal] = useState(0);
	const [searchInput, setSearchInput] = useState('');
	const [searchText, setSearchText] = useState('');

	const sort = SORT_OPTIONS[sortIdx];

	const { loading } = useQuery(GET_PROGRAMS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page,
				limit: LIMIT,
				sort: sort.value,
				direction: sort.direction,
				...(programType && { programType }),
				...(programLevel && { programLevel }),
				...(searchText && { search: searchText }),
				programStatus: 'ACTIVE',
			},
		},
		onCompleted: (data: T) => {
			setPrograms(data?.getPrograms?.list ?? []);
			setTotal(data?.getPrograms?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		const { type } = router.query;
		if (type && typeof type === 'string') {
			setProgramType(type);
			setPage(1);
		}
	}, [router.query.type]);

	useEffect(() => {
		setPage(1);
	}, [programType, programLevel, sortIdx, searchText]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchText(searchInput);
		setPage(1);
	};

	const filtered = programs.filter((p) => {
		if (selectedPrice === 'free') return p.programPrice === 0;
		if (selectedPrice === 'under30') return p.programPrice > 0 && p.programPrice < 30;
		if (selectedPrice === '30to60') return p.programPrice >= 30 && p.programPrice <= 60;
		if (selectedPrice === '60plus') return p.programPrice > 60;
		return true;
	});

	const totalPages = Math.ceil(total / LIMIT);

	if (device === 'mobile') {
		return (
			<Stack className={'programs-page-mobile'}>
				<Head><title>Athlex | Programs</title></Head>
				<h2>Programs</h2>
				<Stack className={'mobile-grid'}>
					{filtered.map((prog) => (
						<ProgramCard
							key={prog._id}
							id={prog._id}
							name={prog.programName}
							type={prog.programType}
							level={prog.programLevel}
							duration={prog.programDuration}
							price={prog.programPrice}
							views={prog.programViews}
							likes={prog.programLikes}
							members={prog.programMembers}
							rank={prog.programRank}
							image={prog.programImages?.[0]}
							gradient={typeGradients[prog.programType] ?? typeGradients['STRENGTH']}
						/>
					))}
				</Stack>
			</Stack>
		);
	}

	return (
		<div id="programs-page">
			<Head><title>Athlex | Programs</title></Head>
			<div className={'programs-container'}>
				<aside className={'filter-sidebar'}>
					<div className={'filter-block'}>
						<h4>Program Type</h4>
						<div className={'chip-group'}>
							{TYPE_OPTIONS.map((opt) => (
								<button
									key={opt.value}
									className={`chip ${programType === opt.value ? 'active' : ''}`}
									onClick={() => setProgramType(opt.value)}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>

					<div className={'filter-block'}>
						<h4>Level</h4>
						<div className={'chip-group'}>
							{LEVEL_OPTIONS.map((opt) => (
								<button
									key={opt.value}
									className={`chip ${programLevel === opt.value ? 'active' : ''}`}
									onClick={() => setProgramLevel(opt.value)}
								>
									{opt.label}
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
										onChange={() => { setSelectedPrice(pf.value); setPage(1); }}
									/>
									{pf.label}
								</label>
							))}
						</div>
					</div>
				</aside>

				<main className={'programs-main'}>
					<form className={'search-bar'} onSubmit={handleSearch}>
						<input
							className={'search-input'}
							type="text"
							placeholder="Search programs…"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
						/>
						{searchText && (
							<button type="button" className={'search-clear'} onClick={() => { setSearchInput(''); setSearchText(''); setPage(1); }}>✕</button>
						)}
						<button type="submit" className={'search-btn'}>Search</button>
					</form>

					<div className={'top-bar'}>
						<span className={'results-count'}>
							<strong>{total}</strong> programs found
						</span>
						<div className={'sort-row'}>
							<span>Sort by:</span>
							<div className={'sort-buttons'}>
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
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 300px)', gap: '24px' }}>
							{[...Array(6)].map((_, i) => <ProgramCardSkeleton key={i} />)}
						</div>
					) : filtered.length === 0 ? (
						<div className={'empty-state'}>
							<span>No programs match your filters.</span>
							<button onClick={() => { setProgramType(''); setProgramLevel(''); setSelectedPrice('all'); }}>
								Clear Filters
							</button>
						</div>
					) : (
						<div className={'programs-grid'}>
							{filtered.map((prog) => (
								<ProgramCard
									key={prog._id}
									id={prog._id}
									name={prog.programName}
									type={prog.programType}
									level={prog.programLevel}
									duration={prog.programDuration}
									price={prog.programPrice}
									views={prog.programViews}
									likes={prog.programLikes}
									members={prog.programMembers}
									rank={prog.programRank}
									image={prog.programImages?.[0]}
									gradient={typeGradients[prog.programType] ?? typeGradients['STRENGTH']}
								/>
							))}
						</div>
					)}

					{totalPages > 1 && (
						<div className={'pagination'}>
							<button className={'page-btn'} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
								Prev
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
								Next
							</button>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default withLayoutBasic(ProgramsPage);
