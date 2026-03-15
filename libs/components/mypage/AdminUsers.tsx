import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { MemberStatus, MemberType } from '../../enums/member.enum';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Avatar, Menu, MenuItem, Select, TablePagination } from '@mui/material';
import moment from 'moment';
import { REACT_APP_API_URL } from '../../config';

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

const TABS = ['ALL', 'ACTIVE', 'INACTIVE', 'BANNED', 'DELETED'];

const AdminUsers = () => {
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const [activeTab, setActiveTab] = useState('ALL');
	const [searchText, setSearchText] = useState('');
	const [typeFilter, setTypeFilter] = useState('ALL');
	const [members, setMembers] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>({});

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
			setAnchorEl({});
			await refetch({ input: inquiry });
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

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

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
							{['Member', 'Phone', 'Type', 'Warnings', 'Status', 'Joined', 'Actions'].map((h) => (
								<th key={h} style={thS}>{h}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{members.length === 0 ? (
							<tr>
								<td colSpan={7} style={{ ...tdS, textAlign: 'center', padding: '32px', color: muted }}>
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
										<Avatar
											src={m.memberImage ? `${REACT_APP_API_URL}/${m.memberImage}` : '/img/profile/defaultUser.svg'}
											sx={{ width: 30, height: 30, border: '1px solid rgba(255,255,255,0.1)' }}
										/>
										<div>
											<div style={{ fontWeight: 600, fontSize: 13 }}>{m.memberNick}</div>
											{m.memberFullName && <div style={{ fontSize: 11, color: muted }}>{m.memberFullName}</div>}
										</div>
									</div>
								</td>
								<td style={{ ...tdS, color: muted, fontSize: 12 }}>{m.memberPhone}</td>
								<td style={tdS}>
									<button
										id={`type-btn-${m._id}`}
										onClick={(e) => setAnchorEl({ ...anchorEl, [`type-${m._id}`]: e.currentTarget })}
										style={{
											fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
											color: m.memberType === 'TRAINER' ? '#60a5fa' : m.memberType === 'ADMIN' ? accent : '#9CA3AF',
											background: m.memberType === 'TRAINER' ? 'rgba(96,165,250,0.1)' : m.memberType === 'ADMIN' ? 'rgba(233,44,40,0.1)' : 'rgba(156,163,175,0.1)',
											border: 'none', cursor: 'pointer',
										}}
									>
										{m.memberType}
									</button>
									<Menu
										anchorEl={anchorEl[`type-${m._id}`]}
										open={Boolean(anchorEl[`type-${m._id}`])}
										onClose={() => setAnchorEl({ ...anchorEl, [`type-${m._id}`]: null })}
									>
										{Object.values(MemberType).filter((t) => t !== m.memberType).map((t) => (
											<MenuItem key={t} onClick={() => handleUpdate({ _id: m._id, memberType: t })}>{t}</MenuItem>
										))}
									</Menu>
								</td>
								<td style={{ ...tdS, color: muted, fontSize: 13, textAlign: 'center' }}>{m.memberWarnings}</td>
								<td style={tdS}>
									<button
										onClick={(e) => setAnchorEl({ ...anchorEl, [`status-${m._id}`]: e.currentTarget })}
										style={{
											fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
											color: STATUS_COLOR[m.memberStatus] ?? muted,
											background: `${STATUS_COLOR[m.memberStatus] ?? muted}1a`,
											border: 'none', cursor: 'pointer',
										}}
									>
										{m.memberStatus}
									</button>
									<Menu
										anchorEl={anchorEl[`status-${m._id}`]}
										open={Boolean(anchorEl[`status-${m._id}`])}
										onClose={() => setAnchorEl({ ...anchorEl, [`status-${m._id}`]: null })}
									>
										{Object.values(MemberStatus).filter((s) => s !== m.memberStatus).map((s) => (
											<MenuItem key={s} onClick={() => handleUpdate({ _id: m._id, memberStatus: s })}>{s}</MenuItem>
										))}
									</Menu>
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
				<TablePagination
					component="div"
					count={total}
					page={page}
					rowsPerPage={limit}
					onPageChange={(_, p) => setPage(p)}
					onRowsPerPageChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(0); }}
					rowsPerPageOptions={[10, 20, 50]}
					sx={{ color: '#9CA3AF', borderTop: `1px solid ${border}`, '& .MuiSvgIcon-root': { color: '#9CA3AF' } }}
				/>
			</div>
		</div>
	);
};

export default AdminUsers;
