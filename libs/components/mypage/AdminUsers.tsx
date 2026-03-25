import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { MemberPlan, MemberStatus, MemberType } from '../../enums/member.enum';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import moment from 'moment';

const bg = '#111827';
const border = 'rgba(255,255,255,0.07)';
const surface = '#1a2236';
const text = '#e2e8f0';
const muted = '#6B7280';
const accent = '#E92C28';

const STATUS_COLOR: Record<string, string> = {
	ACTIVE: '#22C55E',
	INACTIVE: '#FFB800',
	BANNED: '#E92C28',
	DELETED: '#9CA3AF',
};

const TABS = ['ALL', 'ACTIVE', 'BANNED', 'DELETED'];

const AdminUsers = () => {
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const [activeTab, setActiveTab] = useState('ALL');
	const [searchText, setSearchText] = useState('');
	const [typeFilter, setTypeFilter] = useState('ALL');
	const [members, setMembers] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [openKey, setOpenKey] = useState<string | null>(null);

	const buildSearch = () => {
		const s: any = {};
		if (activeTab !== 'ALL') s.memberStatus = activeTab;
		if (typeFilter !== 'ALL') s.memberType = typeFilter;
		if (searchText) s.text = searchText;
		return s;
	};

	const inquiry = { page: page + 1, limit, sort: 'createdAt', search: buildSearch() };

	const [updateMember] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		onCompleted: (data: T) => {
			setMembers(data?.getAllMembersByAdmin?.list ?? []);
			setTotal(data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => { refetch({ input: inquiry }).then(); }, [page, limit, activeTab, typeFilter]);

	const handleSearch = () => refetch({ input: inquiry }).then();

	const handleUpdate = async (update: any) => {
		try {
			await updateMember({ variables: { input: update } });
			await sweetTopSmallSuccessAlert('Updated', 800);
			setOpenKey(null);
			const result = await refetch({ input: inquiry });
			setMembers(result.data?.getAllMembersByAdmin?.list ?? []);
			setTotal(result.data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0);
		} catch (err) {
			sweetErrorHandling(err).then();
		}
	};

	const thS: React.CSSProperties = {
		textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700,
		color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase',
		background: surface, borderBottom: `1px solid ${border}`, whiteSpace: 'nowrap',
	};
	const tdS: React.CSSProperties = {
		padding: '10px 14px', fontSize: 13, color: text,
		borderBottom: `1px solid rgba(255,255,255,0.04)`,
	};

	const dropdownStyle: React.CSSProperties = {
		position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: 4,
		background: '#1a2236', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
		boxShadow: '0 4px 12px rgba(0,0,0,0.4)', minWidth: 100, overflow: 'hidden',
	};
	const dropdownItemStyle: React.CSSProperties = {
		padding: '8px 14px', fontSize: 13, color: '#e2e8f0', cursor: 'pointer',
	};

	const canPrev = page > 0;
	const canNext = (page + 1) * limit < total;

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

			{/* Close dropdown on outside click */}
			{openKey && (
				<div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpenKey(null)} />
			)}

			{/* Filters */}
			<div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
				{TABS.map((t) => (
					<button key={t} onClick={() => { setActiveTab(t); setPage(0); }} style={{
						padding: '6px 14px', borderRadius: 6, border: `1px solid ${activeTab === t ? accent : border}`,
						background: activeTab === t ? `rgba(233,44,40,0.1)` : 'transparent',
						color: activeTab === t ? '#fff' : muted, cursor: 'pointer', fontSize: 12, fontWeight: 600,
					}}>{t}</button>
				))}
				<div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
					<input
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
						placeholder="Search nickname…"
						style={{
							padding: '7px 12px', borderRadius: 6, border: `1px solid ${border}`,
							background: 'rgba(255,255,255,0.04)', color: text, fontSize: 13, outline: 'none', width: 180,
						}}
					/>
					<select
						value={typeFilter}
						onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
						style={{
							padding: '7px 10px', borderRadius: 6, border: `1px solid ${border}`,
							background: '#1a2236', color: text, fontSize: 13, cursor: 'pointer',
						}}
					>
						<option value="ALL">All Types</option>
						{Object.values(MemberType).map((t) => <option key={t} value={t}>{t}</option>)}
					</select>
				</div>
			</div>

			{/* Table */}
			<div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							{['Member', 'Phone', 'Type', 'Plan', 'Warnings', 'Status', 'Joined', 'Actions'].map((h) => (
								<th key={h} style={thS}>{h}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{members.length === 0 ? (
							<tr>
								<td colSpan={8} style={{ ...tdS, textAlign: 'center', padding: '32px', color: muted }}>
									No members found
								</td>
							</tr>
						) : members.map((m: T) => (
							<tr key={m._id} style={{ transition: 'background 0.15s' }}
								onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
								onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
							>
								<td style={tdS}>
									<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
										<img
											src={m.memberImage || '/img/profile/defaultUser.svg'}
											alt=""
											onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }}
											style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}
										/>
										<div>
											<div style={{ fontWeight: 600, fontSize: 13 }}>{m.memberNick}</div>
											{m.memberFullName && <div style={{ fontSize: 11, color: muted }}>{m.memberFullName}</div>}
										</div>
									</div>
								</td>
								<td style={{ ...tdS, color: muted, fontSize: 12 }}>{m.memberPhone}</td>

								{/* Type dropdown */}
								<td style={tdS}>
									<div style={{ position: 'relative', display: 'inline-block' }}>
										<button
											onClick={() => setOpenKey(openKey === `type-${m._id}` ? null : `type-${m._id}`)}
											title="Click to change type"
											style={{
												fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
												color: m.memberType === 'TRAINER' ? '#60a5fa' : m.memberType === 'ADMIN' ? accent : '#9CA3AF',
												background: m.memberType === 'TRAINER' ? 'rgba(96,165,250,0.1)' : m.memberType === 'ADMIN' ? 'rgba(233,44,40,0.1)' : 'rgba(156,163,175,0.1)',
												border: '1px dashed rgba(255,255,255,0.15)', cursor: 'pointer',
											}}
										>
											{m.memberType} ▾
										</button>
										{openKey === `type-${m._id}` && (
											<div style={dropdownStyle}>
												{Object.values(MemberType).filter((t) => t !== m.memberType).map((t) => (
													<div key={t} style={dropdownItemStyle}
														onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
														onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
														onClick={() => handleUpdate({ _id: m._id, memberType: t })}
													>{t}</div>
												))}
											</div>
										)}
									</div>
								</td>

								{/* Plan dropdown */}
								<td style={tdS}>
									<div style={{ position: 'relative', display: 'inline-block' }}>
										<button
											onClick={() => setOpenKey(openKey === `plan-${m._id}` ? null : `plan-${m._id}`)}
											title="Click to change plan"
											style={{
												fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
												color: m.memberPlan === 'PRO' ? '#f59e0b' : m.memberPlan === 'ADVANCED' ? '#a78bfa' : m.memberPlan === 'REGULAR' ? '#60a5fa' : '#9CA3AF',
												background: m.memberPlan === 'PRO' ? 'rgba(245,158,11,0.1)' : m.memberPlan === 'ADVANCED' ? 'rgba(167,139,250,0.1)' : m.memberPlan === 'REGULAR' ? 'rgba(96,165,250,0.1)' : 'rgba(156,163,175,0.1)',
												border: '1px dashed rgba(255,255,255,0.15)', cursor: 'pointer',
											}}
										>
											{m.memberPlan ?? 'NONE'} ▾
										</button>
										{openKey === `plan-${m._id}` && (
											<div style={dropdownStyle}>
												{Object.values(MemberPlan).filter((p) => p !== m.memberPlan).map((p) => (
													<div key={p} style={dropdownItemStyle}
														onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
														onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
														onClick={() => handleUpdate({ _id: m._id, memberPlan: p })}
													>{p}</div>
												))}
											</div>
										)}
									</div>
								</td>

								<td style={{ ...tdS, color: muted, fontSize: 13, textAlign: 'center' }}>{m.memberWarnings}</td>

								{/* Status dropdown */}
								<td style={tdS}>
									<div style={{ position: 'relative', display: 'inline-block' }}>
										<button
											onClick={() => setOpenKey(openKey === `status-${m._id}` ? null : `status-${m._id}`)}
											title="Click to change status"
											style={{
												fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
												color: STATUS_COLOR[m.memberStatus] ?? muted,
												background: `${STATUS_COLOR[m.memberStatus] ?? muted}1a`,
												border: '1px dashed rgba(255,255,255,0.15)', cursor: 'pointer',
											}}
										>
											{m.memberStatus} ▾
										</button>
										{openKey === `status-${m._id}` && (
											<div style={dropdownStyle}>
												{Object.values(MemberStatus).filter((s) => s !== m.memberStatus).map((s) => (
													<div key={s} style={dropdownItemStyle}
														onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
														onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
														onClick={() => handleUpdate({ _id: m._id, memberStatus: s })}
													>{s}</div>
												))}
											</div>
										)}
									</div>
								</td>

								<td style={{ ...tdS, color: muted, fontSize: 12 }}>{moment(m.createdAt).format('MMM DD, YYYY')}</td>
								<td style={tdS}>
									<a href={`/member?memberId=${m._id}`} style={{ color: accent, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
										View
									</a>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{/* Pagination */}
				<div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', borderTop: `1px solid ${border}`, color: '#9CA3AF', fontSize: 13 }}>
					<span style={{ marginRight: 'auto' }}>{total} total</span>
					<span>Rows per page:</span>
					<select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }} style={{ background: '#1a2236', color: '#9CA3AF', border: `1px solid ${border}`, borderRadius: 4, padding: '2px 6px', fontSize: 12 }}>
						{[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
					</select>
					<span>{total === 0 ? 0 : page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}</span>
					<button onClick={() => setPage((p) => p - 1)} disabled={!canPrev} style={{ background: 'none', border: 'none', color: canPrev ? '#9CA3AF' : 'rgba(156,163,175,0.3)', cursor: canPrev ? 'pointer' : 'default', fontSize: 18, lineHeight: 1 }}>‹</button>
					<button onClick={() => setPage((p) => p + 1)} disabled={!canNext} style={{ background: 'none', border: 'none', color: canNext ? '#9CA3AF' : 'rgba(156,163,175,0.3)', cursor: canNext ? 'pointer' : 'default', fontSize: 18, lineHeight: 1 }}>›</button>
				</div>
			</div>
		</div>
	);
};

export default AdminUsers;
