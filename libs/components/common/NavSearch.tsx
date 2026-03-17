import React, { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_MEMBERS } from '../../../apollo/user/query';
import { useRouter } from 'next/router';
import SearchIcon from '@mui/icons-material/Search';
import { T } from '../../types/common';

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
	TRAINER: { label: 'Trainer', color: '#60a5fa' },
	ADMIN:   { label: 'Admin',   color: '#E92C28' },
	USER:    { label: 'Member',  color: '#9CA3AF' },
};

const NavSearch: React.FC = () => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [text, setText] = useState('');
	const [results, setResults] = useState<T[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);

	const [searchMembers] = useLazyQuery(GET_MEMBERS, {
		fetchPolicy: 'network-only',
		onCompleted: (data) => setResults(data?.getMembers?.list ?? []),
	});

	useEffect(() => {
		if (!text.trim()) { setResults([]); return; }
		const timer = setTimeout(() => {
			searchMembers({ variables: { input: { page: 1, limit: 8, search: { text } } } });
		}, 300);
		return () => clearTimeout(timer);
	}, [text]);

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
				setOpen(false);
				setText('');
				setResults([]);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	const handleOpen = () => {
		setOpen(true);
		setTimeout(() => inputRef.current?.focus(), 50);
	};

	const handleSelect = (member: T) => {
		setOpen(false);
		setText('');
		setResults([]);
		router.push(`/member?memberId=${member._id}`);
	};

	return (
		<div className="nav-search" ref={wrapRef}>
			{!open ? (
				<button className="nav-search-icon" onClick={handleOpen} title="Search members">
					<SearchIcon fontSize="small" />
				</button>
			) : (
				<div className="nav-search-expanded">
					<SearchIcon fontSize="small" className="nav-search-ic" />
					<input
						ref={inputRef}
						className="nav-search-input"
						placeholder="Search members…"
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
					/>
					{results.length > 0 && (
						<div className="nav-search-dropdown">
							{results.map((m: T) => {
								const type = TYPE_LABEL[m.memberType] ?? TYPE_LABEL.USER;
								return (
									<div className="nav-search-item" key={m._id} onClick={() => handleSelect(m)}>
										<div className="nav-search-avatar">
											{m.memberImage
												? <img src={m.memberImage} alt="" />
												: <span>{(m.memberNick || 'A')[0].toUpperCase()}</span>
											}
										</div>
										<div className="nav-search-info">
											<span className="nav-search-nick">{m.memberNick}</span>
											{m.memberFullName && <span className="nav-search-name">{m.memberFullName}</span>}
										</div>
										<span className="nav-search-type" style={{ color: type.color }}>{type.label}</span>
									</div>
								);
							})}
						</div>
					)}
					{text.trim() && results.length === 0 && (
						<div className="nav-search-dropdown">
							<div className="nav-search-empty">No members found</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default NavSearch;
