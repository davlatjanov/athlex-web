import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box,
	InputAdornment,
	MenuItem,
	OutlinedInput,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	Typography,
} from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_PROGRAMS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_PROGRAM_BY_ADMIN } from '../../../apollo/admin/mutation';
import { T } from '../../../libs/types/common';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import moment from 'moment';

const statusColors: Record<string, string> = {
	ACTIVE: '#4ecd64',
	STOPPED: '#FFB800',
	DELETE: '#E92C28',
};

const AdminPrograms: NextPage = ({ initialInquiry, ...props }: any) => {
	const [inquiry, setInquiry] = useState(initialInquiry);
	const [programs, setPrograms] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [searchText, setSearchText] = useState('');

	const [updateProgramByAdmin] = useMutation(UPDATE_PROGRAM_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_PROGRAMS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPrograms(data?.getAllProgramsByAdmin?.list ?? []);
			setTotal(data?.getAllProgramsByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		refetch({ input: inquiry }).then();
	}, [inquiry]);

	const handlePageChange = (_: unknown, newPage: number) => {
		setInquiry({ ...inquiry, page: newPage + 1 });
	};

	const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInquiry({ ...inquiry, limit: parseInt(e.target.value, 10), page: 1 });
	};

	const handleStatusFilter = (val: string) => {
		setStatusFilter(val);
		const next: any = { ...inquiry, page: 1 };
		if (val === 'ALL') {
			delete next.programStatus;
		} else {
			next.programStatus = val;
		}
		setInquiry(next);
	};

	const updateStatus = async (programId: string, programStatus: string) => {
		try {
			await updateProgramByAdmin({ variables: { input: { _id: programId, programStatus } } });
			await refetch({ input: inquiry });
			await sweetTopSmallSuccessAlert('Status updated', 800);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Stack sx={{ padding: '40px', gap: '24px' }}>
			<Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
				Program Management
			</Typography>

			{/* Filters */}
			<div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
				<OutlinedInput
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					placeholder="Search by name…"
					size="small"
					sx={{
						color: '#fff', width: 240,
						'& .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
						'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#E92C28' },
					}}
					endAdornment={
						searchText ? (
							<InputAdornment position="end">
								<CancelRoundedIcon
									sx={{ cursor: 'pointer', color: '#9ca3af' }}
									onClick={() => setSearchText('')}
								/>
							</InputAdornment>
						) : null
					}
				/>
				<Select
					value={statusFilter}
					onChange={(e) => handleStatusFilter(e.target.value)}
					size="small"
					sx={{
						color: '#fff', minWidth: 160,
						'& .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
						'& .MuiSvgIcon-root': { color: '#9ca3af' },
					}}
				>
					<MenuItem value="ALL">All Statuses</MenuItem>
					<MenuItem value="ACTIVE">Active</MenuItem>
					<MenuItem value="STOPPED">Stopped</MenuItem>
					<MenuItem value="DELETE">Deleted</MenuItem>
				</Select>
			</div>

			{/* Table */}
			<TableContainer sx={{ background: '#111827', borderRadius: 2 }}>
				<Table>
					<TableHead>
						<TableRow sx={{ '& th': { color: '#9ca3af', borderColor: '#1f2937', fontWeight: 600 } }}>
							<TableCell>Program</TableCell>
							<TableCell>Trainer</TableCell>
							<TableCell>Type</TableCell>
							<TableCell>Level</TableCell>
							<TableCell align="right">Price</TableCell>
							<TableCell align="right">Members</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Created</TableCell>
							<TableCell>Change Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{programs.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} align="center" sx={{ color: '#6b7280', py: 6 }}>
									No programs found
								</TableCell>
							</TableRow>
						) : (
							programs.map((prog: T) => (
								<TableRow
									key={prog._id}
									sx={{
										'& td': { color: '#e5e7eb', borderColor: '#1f2937' },
										'&:hover': { background: '#1f2937' },
									}}
								>
									<TableCell>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
											{prog.programImages?.[0] && (
												<img
													src={prog.programImages[0]}
													alt=""
													style={{ width: 40, height: 36, borderRadius: 6, objectFit: 'cover' }}
												/>
											)}
											<span style={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
												{prog.programName}
											</span>
										</Box>
									</TableCell>
									<TableCell>{prog.memberData?.memberNick ?? '—'}</TableCell>
									<TableCell sx={{ fontSize: 12 }}>{prog.programType?.replace(/_/g, ' ')}</TableCell>
									<TableCell sx={{ fontSize: 12 }}>{prog.programLevel}</TableCell>
									<TableCell align="right">${prog.programPrice?.toLocaleString()}</TableCell>
									<TableCell align="right">{prog.programMembers?.toLocaleString()}</TableCell>
									<TableCell>
										<span style={{ color: statusColors[prog.programStatus] ?? '#9ca3af', fontWeight: 600, fontSize: 12 }}>
											{prog.programStatus}
										</span>
									</TableCell>
									<TableCell sx={{ fontSize: 12, color: '#9ca3af' }}>
										{moment(prog.createdAt).format('MMM DD, YYYY')}
									</TableCell>
									<TableCell>
										<Select
											value={prog.programStatus}
											size="small"
											onChange={(e) => updateStatus(prog._id, e.target.value)}
											sx={{
												color: '#e5e7eb', fontSize: 12, minWidth: 110,
												'& .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' },
												'& .MuiSvgIcon-root': { color: '#9ca3af' },
											}}
										>
											<MenuItem value="ACTIVE">Activate</MenuItem>
											<MenuItem value="STOPPED">Stop</MenuItem>
											<MenuItem value="DELETE">Delete</MenuItem>
										</Select>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				component="div"
				count={total}
				page={inquiry.page - 1}
				rowsPerPage={inquiry.limit}
				onPageChange={handlePageChange}
				onRowsPerPageChange={handleRowsPerPageChange}
				rowsPerPageOptions={[10, 20, 50]}
				sx={{ color: '#9ca3af', '& .MuiSvgIcon-root': { color: '#9ca3af' } }}
			/>
		</Stack>
	);
};

AdminPrograms.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
	},
};

export default withAdminLayout(AdminPrograms);
