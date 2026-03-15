import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { useQuery } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN, GET_ALL_PROGRAMS_BY_ADMIN, GET_ALL_PRODUCTS_BY_ADMIN } from '../../apollo/admin/query';
import { T } from '../../libs/types/common';
import { Stack, Avatar, Typography } from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import moment from 'moment';
import { REACT_APP_API_URL } from '../../libs/config';

const card = '#111827';
const border = 'rgba(255,255,255,0.07)';
const textColor = '#e2e8f0';
const mutedColor = '#6B7280';
const accentColor = '#E92C28';
const surfaceBg = '#1a2236';

const STATUS_COLOR: Record<string, string> = {
	ACTIVE: '#22C55E',
	INACTIVE: '#FFB800',
	BANNED: '#E92C28',
	DELETED: '#9CA3AF',
	STOPPED: '#FFB800',
	DELETE: '#9CA3AF',
};

const StatCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) => (
	<div style={{ flex: 1, minWidth: 180, background: card, border: `1px solid ${accent ? 'rgba(233,44,40,0.2)' : border}`, borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
		<div style={{ width: 48, height: 48, borderRadius: 10, background: accent ? 'rgba(233,44,40,0.12)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent ? accentColor : '#9CA3AF', flexShrink: 0 }}>
			{icon}
		</div>
		<div>
			<p style={{ fontSize: 11, color: mutedColor, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 4px' }}>{label}</p>
			<p style={{ fontSize: 28, fontWeight: 800, color: textColor, lineHeight: 1, margin: 0 }}>{value.toLocaleString()}</p>
		</div>
	</div>
);

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
	<div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', flex: 1, minWidth: 0 }}>
		<div style={{ padding: '14px 20px', borderBottom: `1px solid ${border}` }}>
			<span style={{ fontSize: 12, fontWeight: 700, color: textColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</span>
		</div>
		{children}
	</div>
);

const AdminDashboard: NextPage = () => {
	const { data: memberCountData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', search: {} } },
	});

	const { data: recentMemberData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 5, sort: 'createdAt', search: {} } },
	});

	const { data: trainerCountData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', search: { memberType: 'TRAINER' } } },
	});

	const { data: programCountData } = useQuery(GET_ALL_PROGRAMS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 1, sort: 'createdAt' } },
	});

	const { data: recentProgramData } = useQuery(GET_ALL_PROGRAMS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 5, sort: 'createdAt' } },
	});

	const { data: productCountData } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 1, sort: 'createdAt' } },
	});

	const totalMembers = memberCountData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalTrainers = trainerCountData?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalPrograms = programCountData?.getAllProgramsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalProducts = productCountData?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const recentMembers: T[] = recentMemberData?.getAllMembersByAdmin?.list ?? [];
	const recentPrograms: T[] = recentProgramData?.getAllProgramsByAdmin?.list ?? [];

	const TH = ({ children }: { children: string }) => (
		<th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${border}`, whiteSpace: 'nowrap', background: surfaceBg }}>
			{children}
		</th>
	);

	const TD = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
		<td style={{ padding: '10px 16px', fontSize: 13, color: textColor, borderBottom: '1px solid rgba(255,255,255,0.04)', ...style }}>
			{children}
		</td>
	);

	const Badge = ({ status }: { status: string }) => {
		const color = STATUS_COLOR[status] ?? mutedColor;
		return (
			<span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, color, background: `${color}1a` }}>
				{status}
			</span>
		);
	};

	return (
		<div className={'content'}>
			<Typography variant={'h2'} className={'tit'}>
				Dashboard
			</Typography>

			{/* ── Stat Cards ── */}
			<Stack direction={'row'} gap={'16px'} mb={'28px'} flexWrap={'wrap'}>
				<StatCard icon={<PeopleOutlineIcon />} label="Total Members" value={totalMembers} />
				<StatCard icon={<FitnessCenterIcon />} label="Active Trainers" value={totalTrainers} accent />
				<StatCard icon={<PlayCircleOutlineIcon />} label="Total Programs" value={totalPrograms} />
				<StatCard icon={<StorefrontOutlinedIcon />} label="Total Products" value={totalProducts} />
			</Stack>

			{/* ── Recent Tables ── */}
			<Stack direction={'row'} gap={'20px'} flexWrap={'wrap'}>

				{/* Recent Members */}
				<SectionCard title="Recent Members">
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr>
								{['Member', 'Type', 'Status', 'Joined'].map((h) => <TH key={h}>{h}</TH>)}
							</tr>
						</thead>
						<tbody>
							{recentMembers.length === 0 ? (
								<tr>
									<td colSpan={4} style={{ textAlign: 'center', padding: '28px 16px', color: mutedColor, fontSize: 13 }}>
										No members yet
									</td>
								</tr>
							) : recentMembers.map((m: T) => (
								<tr key={m._id}>
									<TD>
										<Stack direction={'row'} alignItems={'center'} gap={'10px'}>
											<Avatar
												src={m.memberImage ? `${REACT_APP_API_URL}/${m.memberImage}` : '/img/profile/defaultUser.svg'}
												sx={{ width: 30, height: 30, border: '1px solid rgba(255,255,255,0.1)' }}
											/>
											<span style={{ fontSize: 13, color: textColor, fontWeight: 600 }}>{m.memberNick}</span>
										</Stack>
									</TD>
									<TD style={{ color: mutedColor, fontSize: 12 }}>{m.memberType}</TD>
									<TD><Badge status={m.memberStatus} /></TD>
									<TD style={{ color: mutedColor, fontSize: 12 }}>{moment(m.createdAt).format('MMM DD, YYYY')}</TD>
								</tr>
							))}
						</tbody>
					</table>
				</SectionCard>

				{/* Recent Programs */}
				<SectionCard title="Recent Programs">
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr>
								{['Program', 'Trainer', 'Status', 'Created'].map((h) => <TH key={h}>{h}</TH>)}
							</tr>
						</thead>
						<tbody>
							{recentPrograms.length === 0 ? (
								<tr>
									<td colSpan={4} style={{ textAlign: 'center', padding: '28px 16px', color: mutedColor, fontSize: 13 }}>
										No programs yet
									</td>
								</tr>
							) : recentPrograms.map((p: T) => (
								<tr key={p._id}>
									<TD>
										<span style={{ fontSize: 13, color: textColor, fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
											{p.programName}
										</span>
									</TD>
									<TD style={{ color: mutedColor, fontSize: 12 }}>{p.memberData?.memberNick ?? '—'}</TD>
									<TD><Badge status={p.programStatus} /></TD>
									<TD style={{ color: mutedColor, fontSize: 12 }}>
										{moment(p.createdAt).format('MMM DD, YYYY')}
									</TD>
								</tr>
							))}
						</tbody>
					</table>
				</SectionCard>

			</Stack>
		</div>
	);
};

export default withAdminLayout(AdminDashboard);
