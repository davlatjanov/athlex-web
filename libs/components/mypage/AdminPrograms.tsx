import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_PROGRAMS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_PROGRAM_BY_ADMIN } from '../../../apollo/admin/mutation';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { MenuItem, Select, TablePagination } from '@mui/material';
import moment from 'moment';

const bg = '#111827';
const border = 'rgba(255,255,255,0.07)';
const surface = '#1a2236';
const text = '#e2e8f0';
const muted = '#6B7280';
const accent = '#E92C28';

const STATUS_COLOR: Record<string, string> = {
	ACTIVE: '#22C55E',
	STOPPED: '#FFB800',
	DELETE: '#9CA3AF',
};

const TABS = ['ALL', 'ACTIVE', 'STOPPED', 'DELETE'];

const AdminPrograms = () => {
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const [statusTab, setStatusTab] = useState('ALL');
	const [programs, setPrograms] = useState<T[]>([]);
	const [total, setTotal] = useState(0);

	const buildInquiry = () => {
		const base: any = { page: page + 1, limit, sort: 'createdAt' };
		if (statusTab !== 'ALL') base.programStatus = statusTab;
		return base;
	};

	const [updateProgram] = useMutation(UPDATE_PROGRAM_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_PROGRAMS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: buildInquiry() },
		onCompleted: (data: T) => {
			setPrograms(data?.getAllProgramsByAdmin?.list ?? []);
			setTotal(data?.getAllProgramsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => { refetch({ input: buildInquiry() }).then(); }, [page, limit, statusTab]);

	const updateStatus = async (programId: string, programStatus: string) => {
		try {
			await updateProgram({ variables: { input: { _id: programId, programStatus } } });
			await sweetTopSmallSuccessAlert('Status updated', 800);
			await refetch({ input: buildInquiry() });
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

			{/* Status tabs */}
			<div style={{ display: 'flex', gap: 8 }}>
				{TABS.map((t) => (
					<button key={t} onClick={() => { setStatusTab(t); setPage(0); }} style={{
						padding: '6px 14px', borderRadius: 6, border: `1px solid ${statusTab === t ? accent : border}`,
						background: statusTab === t ? 'rgba(233,44,40,0.1)' : 'transparent',
						color: statusTab === t ? '#fff' : muted, cursor: 'pointer', fontSize: 12, fontWeight: 600,
					}}>{t}</button>
				))}
			</div>

			{/* Table */}
			<div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							{['Program', 'Trainer', 'Type', 'Level', 'Price', 'Members', 'Status', 'Created', 'Change'].map((h) => (
								<th key={h} style={thS}>{h}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{programs.length === 0 ? (
							<tr>
								<td colSpan={9} style={{ ...tdS, textAlign: 'center', padding: '32px', color: muted }}>
									No programs found
								</td>
							</tr>
						) : programs.map((p: T) => (
							<tr key={p._id}
								onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
								onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
							>
								<td style={tdS}>
									<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
										{p.programImages?.[0] && (
											<img src={p.programImages[0]} alt="" style={{ width: 38, height: 34, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
										)}
										<span style={{ fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
											{p.programName}
										</span>
									</div>
								</td>
								<td style={{ ...tdS, color: muted, fontSize: 12 }}>{p.memberData?.memberNick ?? '—'}</td>
								<td style={{ ...tdS, color: muted, fontSize: 11 }}>{p.programType?.replace(/_/g, ' ')}</td>
								<td style={{ ...tdS, color: muted, fontSize: 12 }}>{p.programLevel}</td>
								<td style={{ ...tdS, fontSize: 13 }}>${p.programPrice?.toLocaleString()}</td>
								<td style={{ ...tdS, fontSize: 13, textAlign: 'center' }}>{p.programMembers}</td>
								<td style={tdS}>
									<span style={{
										fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
										color: STATUS_COLOR[p.programStatus] ?? muted,
										background: `${STATUS_COLOR[p.programStatus] ?? muted}1a`,
									}}>
										{p.programStatus}
									</span>
								</td>
								<td style={{ ...tdS, color: muted, fontSize: 12 }}>{moment(p.createdAt).format('MMM DD, YY')}</td>
								<td style={tdS}>
									<Select
										value={p.programStatus}
										size="small"
										onChange={(e) => updateStatus(p._id, e.target.value)}
										sx={{ fontSize: 12, minWidth: 110, color: text }}
									>
										<MenuItem value="ACTIVE">Activate</MenuItem>
										<MenuItem value="STOPPED">Stop</MenuItem>
										<MenuItem value="DELETE">Delete</MenuItem>
									</Select>
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

export default AdminPrograms;
