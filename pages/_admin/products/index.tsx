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
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { T } from '../../../libs/types/common';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import moment from 'moment';
import { REACT_APP_API_URL } from '../../../libs/config';

const STATUS_COLOR: Record<string, string> = {
	ACTIVE: '#22C55E',
	STOPPED: '#FFB800',
	OUT_OF_STOCK: '#a78bfa',
};

const AdminProducts: NextPage = ({ initialInquiry, ...props }: any) => {
	const [inquiry, setInquiry] = useState(initialInquiry);
	const [products, setProducts] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [searchText, setSearchText] = useState('');

	const [updateProductByAdmin] = useMutation(UPDATE_PRODUCT_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getAllProductsByAdmin?.list ?? []);
			setTotal(data?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0);
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
		setInquiry({
			...inquiry,
			page: 1,
			search: val === 'ALL' ? {} : { productStatus: val },
		});
	};

	const handleSearch = () => {
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, text: searchText } });
	};

	const updateStatus = async (productId: string, productStatus: string) => {
		try {
			await updateProductByAdmin({ variables: { input: { _id: productId, productStatus } } });
			await refetch({ input: inquiry });
			await sweetTopSmallSuccessAlert('Status updated', 800);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box className={'content'}>
			<Typography variant={'h2'} className={'tit'}>
				Products
			</Typography>

			<Box className={'table-wrap'}>
				{/* Filters */}
				<Stack className={'search-area'}>
					<OutlinedInput
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						placeholder="Search by name…"
						onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
						endAdornment={
							searchText ? (
								<InputAdornment position="end">
									<CancelRoundedIcon
										sx={{ cursor: 'pointer' }}
										onClick={() => {
											setSearchText('');
											setInquiry({ ...inquiry, search: { ...inquiry.search, text: '' } });
										}}
									/>
								</InputAdornment>
							) : null
						}
					/>
					<Select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)} sx={{ minWidth: 160 }}>
						<MenuItem value="ALL">All Statuses</MenuItem>
						<MenuItem value="ACTIVE">Active</MenuItem>
						<MenuItem value="STOPPED">Stopped</MenuItem>
						<MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
					</Select>
				</Stack>

				{/* Table */}
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Product</TableCell>
								<TableCell>Type</TableCell>
								<TableCell>Brand</TableCell>
								<TableCell align="right">Price</TableCell>
								<TableCell align="right">Stock</TableCell>
								<TableCell align="right">Views</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Created</TableCell>
								<TableCell>Change Status</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{products.length === 0 ? (
								<TableRow>
									<TableCell colSpan={9} align="center" className={'no-data'} sx={{ py: 6 }}>
										No products found
									</TableCell>
								</TableRow>
							) : products.map((prod: T) => (
								<TableRow key={prod._id}>
									<TableCell>
										<Stack direction={'row'} alignItems={'center'} gap={1.5}>
											{prod.productImages?.[0] && (
												<img
													src={`${REACT_APP_API_URL}/${prod.productImages[0]}`}
													alt=""
													style={{ width: 40, height: 36, borderRadius: 6, objectFit: 'cover' }}
													onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
												/>
											)}
											<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
												{prod.productName}
											</Typography>
										</Stack>
									</TableCell>
									<TableCell>{prod.productType?.replace(/_/g, ' ')}</TableCell>
									<TableCell>{prod.productBrand}</TableCell>
									<TableCell align="right">${prod.productPrice?.toLocaleString()}</TableCell>
									<TableCell align="right">{prod.productStock?.toLocaleString()}</TableCell>
									<TableCell align="right">{prod.productViews?.toLocaleString()}</TableCell>
									<TableCell>
										<Box component={'span'} className={'badge'} sx={{
											color: STATUS_COLOR[prod.productStatus] ?? '#9CA3AF',
											background: `${STATUS_COLOR[prod.productStatus] ?? '#9CA3AF'}1a`,
										}}>
											{prod.productStatus?.replace(/_/g, ' ')}
										</Box>
									</TableCell>
									<TableCell>{moment(prod.createdAt).format('MMM DD, YYYY')}</TableCell>
									<TableCell>
										<Select
											value={prod.productStatus}
											size="small"
											onChange={(e) => updateStatus(prod._id, e.target.value)}
											sx={{ fontSize: 12, minWidth: 130 }}
										>
											<MenuItem value="ACTIVE">Activate</MenuItem>
											<MenuItem value="STOPPED">Stop</MenuItem>
											<MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
										</Select>
									</TableCell>
								</TableRow>
							))}
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
				/>
			</Box>
		</Box>
	);
};

AdminProducts.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminProducts);
