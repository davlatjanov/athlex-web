import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { allTrainers, TRAINER_SPECIALTIES, TRAINER_LEVELS, Trainer } from '../../libs/data/trainers';
import { useLike } from '../../libs/hooks/useInteractions';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SORT_OPTIONS = [
	{ label: 'Most Popular', value: 'popular' },
	{ label: 'Top Rated', value: 'rating' },
	{ label: 'Most Clients', value: 'clients' },
	{ label: 'Experience', value: 'experience' },
];

const PER_PAGE = 9;

const TrainerCard = ({ trainer }: { trainer: Trainer }) => {
	const displayClients = trainer.clients >= 1000 ? `${(trainer.clients / 1000).toFixed(1)}K` : String(trainer.clients);
	const { liked, toggle: toggleLike } = useLike('trainers', trainer.id);

	return (
		<div className="trainer-card">
			<div className="tc-header" style={{ background: trainer.gradient }}>
				<div className="tc-header-overlay" />
				<div className="tc-level-badge">{trainer.level}</div>
				<button className={`tc-like-btn ${liked ? 'liked' : ''}`} onClick={toggleLike}>
					{liked ? '♥' : '♡'}
				</button>
				<div className="tc-avatar">{trainer.icon}</div>
			</div>
			<div className="tc-body">
				<div className="tc-specialty">{trainer.specialty}</div>
				<h3 className="tc-name">{trainer.name}</h3>
				<p className="tc-nick">@{trainer.nickname}</p>
				<p className="tc-bio">{trainer.bio}</p>
				<div className="tc-stats">
					<div className="tc-stat">
						<span className="ts-val">★ {trainer.rating}</span>
						<span className="ts-lbl">Rating</span>
					</div>
					<div className="tc-stat-sep" />
					<div className="tc-stat">
						<span className="ts-val">{displayClients}</span>
						<span className="ts-lbl">Clients</span>
					</div>
					<div className="tc-stat-sep" />
					<div className="tc-stat">
						<span className="ts-val">{trainer.programs}</span>
						<span className="ts-lbl">Programs</span>
					</div>
					<div className="tc-stat-sep" />
					<div className="tc-stat">
						<span className="ts-val">{trainer.experience}</span>
						<span className="ts-lbl">Exp.</span>
					</div>
				</div>
				<div className="tc-certs">
					{trainer.certifications.slice(0, 2).map((c) => (
						<span key={c} className="tc-cert">{c}</span>
					))}
				</div>
				<Link href={`/trainer/detail?id=${trainer.id}`}>
					<button className="tc-btn">View Profile →</button>
				</Link>
			</div>
		</div>
	);
};

const TrainerList: NextPage = () => {
	const device = useDeviceDetect();
	const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
	const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState('popular');
	const [page, setPage] = useState(1);

	const toggleSpecialty = (s: string) => {
		setSelectedSpecialties((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
		setPage(1);
	};

	const toggleLevel = (l: string) => {
		setSelectedLevels((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);
		setPage(1);
	};

	const filtered = useMemo(() => {
		let list = [...allTrainers];

		if (selectedSpecialties.length > 0)
			list = list.filter((t) => selectedSpecialties.includes(t.specialty) || (t.secondarySpecialty && selectedSpecialties.includes(t.secondarySpecialty)));
		if (selectedLevels.length > 0)
			list = list.filter((t) => selectedLevels.includes(t.level));

		if (sortBy === 'popular') list.sort((a, b) => b.views - a.views);
		else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
		else if (sortBy === 'clients') list.sort((a, b) => b.clients - a.clients);
		else if (sortBy === 'experience') list.sort((a, b) => b.experienceYears - a.experienceYears);

		return list;
	}, [selectedSpecialties, selectedLevels, sortBy]);

	const totalPages = Math.ceil(filtered.length / PER_PAGE);
	const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

	if (device === 'mobile') {
		return <div id="trainer-list-page"><p style={{ color: '#fff', padding: 40 }}>Mobile view coming soon.</p></div>;
	}

	return (
		<div id="trainer-list-page">
			<div className="tl-container">

				{/* ── SIDEBAR ───────────────────────────────────────── */}
				<aside className="tl-sidebar">
					<div className="tl-filter-block">
						<h4 className="tl-filter-title">Specialty</h4>
						<div className="tl-chip-group">
							<button
								className={`tl-chip ${selectedSpecialties.length === 0 ? 'active' : ''}`}
								onClick={() => { setSelectedSpecialties([]); setPage(1); }}
							>
								All
							</button>
							{TRAINER_SPECIALTIES.map((s) => (
								<button
									key={s}
									className={`tl-chip ${selectedSpecialties.includes(s) ? 'active' : ''}`}
									onClick={() => toggleSpecialty(s)}
								>
									{s}
								</button>
							))}
						</div>
					</div>

					<div className="tl-filter-block">
						<h4 className="tl-filter-title">Level</h4>
						<div className="tl-chip-group">
							<button
								className={`tl-chip ${selectedLevels.length === 0 ? 'active' : ''}`}
								onClick={() => { setSelectedLevels([]); setPage(1); }}
							>
								All Levels
							</button>
							{TRAINER_LEVELS.map((l) => (
								<button
									key={l}
									className={`tl-chip ${selectedLevels.includes(l) ? 'active' : ''}`}
									onClick={() => toggleLevel(l)}
								>
									{l}
								</button>
							))}
						</div>
					</div>
				</aside>

				{/* ── MAIN ──────────────────────────────────────────── */}
				<main className="tl-main">
					{/* Top bar */}
					<div className="tl-top-bar">
						<span className="tl-count"><strong>{filtered.length}</strong> trainers found</span>
						<div className="tl-sort-row">
							<span>Sort by:</span>
							<div className="tl-sort-buttons">
								{SORT_OPTIONS.map((opt) => (
									<button
										key={opt.value}
										className={`tl-sort-btn ${sortBy === opt.value ? 'active' : ''}`}
										onClick={() => { setSortBy(opt.value); setPage(1); }}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Grid */}
					{paginated.length === 0 ? (
						<div className="tl-empty">
							<span>🏋️</span>
							<p>No trainers match your filters.</p>
							<button onClick={() => { setSelectedSpecialties([]); setSelectedLevels([]); }}>
								Clear Filters
							</button>
						</div>
					) : (
						<div className="tl-grid">
							{paginated.map((trainer) => (
								<TrainerCard key={trainer.id} trainer={trainer} />
							))}
						</div>
					)}

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="tl-pagination">
							<button className="tl-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
								← Prev
							</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button
									key={p}
									className={`tl-page-btn ${page === p ? 'active' : ''}`}
									onClick={() => setPage(p)}
								>
									{p}
								</button>
							))}
							<button className="tl-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
								Next →
							</button>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default withLayoutBasic(TrainerList);
