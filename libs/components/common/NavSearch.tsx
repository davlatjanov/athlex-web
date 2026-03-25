import React, { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_MEMBERS } from '../../../apollo/user/query';
import { useRouter } from 'next/router';
import { Search as SearchIcon } from 'lucide-react';
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
	const [allMembers, setAllMembers] = useState<T[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);

	const [fetchMembers] = useLazyQuery(GET_MEMBERS, {
		fetchPolicy: 'network-only',
		onCompleted: (data) => {
			const list: T[] = data?.getMembers?.list ?? [];
			// Sort: admins first, then trainers, then members
			const sorted = [...list].sort((a, b) => {
				const order = (t: string) => t === 'ADMIN' ? 0 : t === 'TRAINER' ? 1 : 2;
				return order(a.memberType) - order(b.memberType);
			});
			setAllMembers(sorted);
		},
	});

	// Filter client-side
	const filtered = text.trim()
		? allMembers.filter((m) =>
				m.memberNick?.toLowerCase().includes(text.toLowerCase()) ||
				m.memberFullName?.toLowerCase().includes(text.toLowerCase())
		  )
		: allMembers;

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
				setOpen(false);
				setText('');
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	const handleOpen = () => {
		setOpen(true);
		setTimeout(() => inputRef.current?.focus(), 50);
		if (allMembers.length === 0) {
			fetchMembers({ variables: { input: { page: 1, limit: 100 } } });
		}
	};

	const handleSelect = (member: T) => {
		setOpen(false);
		setText('');
		router.push(`/member?memberId=${member._id}`);
	};

	return (
		<div className="nav-search" ref={wrapRef}>
			{!open ? (
				<button className="nav-search-icon" onClick={handleOpen} title="Search members">
					<SearchIcon size={18} />
				</button>
			) : (
				<div className="nav-search-expanded">
					<SearchIcon size={18} className="nav-search-ic" />
					<input
						ref={inputRef}
						className="nav-search-input"
						placeholder="Search members…"
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
					/>
					<div className="nav-search-dropdown">
						{filtered.length > 0 ? (
							filtered.map((m: T) => {
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
							})
						) : (
							<div className="nav-search-empty">No members found</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default NavSearch;
