import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { MenuItem, Select, TablePagination } from '@mui/material';
import moment from 'moment';

const bg = '#111827';
const border = 'rgba(255,255,255,0.07)';
const surface = '#1a2236';
const text = '#e2e8f0';
const muted = '#6B7280';

const STATUS_COLOR: Record<string, string> = {
	ACTIVE: '#22C55E',
	STOPPED: '#FFB800',
	OUT_OF_STOCK: '#a78bfa',
};

const selectSx = {
	fontSize: 12,
	minWidth: 120,
	color: '#e2e8f0',
	background: '#1a2236',
	'& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' },
	'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
	'& .MuiSelect-select': { background: '#1a2236' },
	'& .MuiSvgIcon-root': { color: '#6B7280' },
};

const AdminProductsList = () => {
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const [searchText, setSearchText] = useState('');
	const [products, setProducts] = useState<T[]>([]);
	const [total, setTotal] = useState(0);

	const buildInquiry = (search = searchText) => ({
		page: page + 1,
		limit,
		sort: 'createdAt',
		direction: 'DESC',
		...(search ? { search: { productName: search } } : {}),
	});

	const [updateProduct] = useMutation(UPDATE_PRODUCT_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: buildInquiry() },
		onCompleted: (data: T) => {
			setProducts(data?.getAllProductsByAdmin?.list ?? []);
			setTotal(data?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => { refetch({ input: buildInquiry() }).then(); }, [page, limit]);

	const handleSearch = () => refetch({ input: buildInquiry() }).then();

	const updateStatus = async (productId: string, productStatus: string) => {
		try {
			await updateProduct({ variables: { input: { _id: productId, productStatus } } });
			await sweetTopSmallSuccessAlert('Status updated', 800);
			const result = await refetch({ input: buildInquiry() });
			setProducts(result.data?.getAllProductsByAdmin?.list ?? []);
			setTotal(result.data?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0);
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

			{/* Search */}
			<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
				<input
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
					placeholder="Search by name…"
					style={{
						padding: '7px 12px', borderRadius: 6, border: `1px solid ${border}`,
						background: 'rgba(255,255,255,0.04)', color: text, fontSize: 13, outline: 'none', width: 220,
					}}
				/>
			</div>

			{/* Table */}
			<div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							{['Product', 'Type', 'Brand', 'Price', 'Stock', 'Views', 'Status', 'Created', 'Change'].map((h) => (
								<th key={h} style={thS}>{h}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{products.length === 0 ? (
							<tr>
								<td colSpan={9} style={{ ...tdS, textAlign: 'center', padding: '32px', color: muted }}>
									No products found
								</td>
							</tr>
						) : products.map((p: T) => (
							<tr key={p._id}
								onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
								onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
							>
								<td style={tdS}>
									<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
										{p.productImages?.[0] && (
											<img
												src={p.productImages[0]}
												alt=""
												style={{ width: 38, height: 34, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
												onError={(e) => { (e.target as HTMLImageElement).src = '/img/program-placeholder.svg'; }}
											/>
										)}
										<span style={{ fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
											{p.productName}
										</span>
									</div>
								</td>
								<td style={{ ...tdS, color: muted, fontSize: 11 }}>{p.productType?.replace(/_/g, ' ')}</td>
								<td style={{ ...tdS, color: muted, fontSize: 12 }}>{p.productBrand}</td>
								<td style={tdS}>${p.productPrice?.toLocaleString()}</td>
								<td style={{ ...tdS, textAlign: 'center' }}>{p.productStock}</td>
								<td style={{ ...tdS, color: muted, textAlign: 'center' }}>{p.productViews}</td>
								<td style={tdS}>
									<span style={{
										fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
										color: STATUS_COLOR[p.productStatus] ?? muted,
										background: `${STATUS_COLOR[p.productStatus] ?? muted}1a`,
									}}>
										{p.productStatus?.replace(/_/g, ' ')}
									</span>
								</td>
								<td style={{ ...tdS, color: muted, fontSize: 12 }}>{moment(p.createdAt).format('MMM DD, YY')}</td>
								<td style={tdS}>
									<Select
										value={p.productStatus}
										size="small"
										onChange={(e) => updateStatus(p._id, e.target.value)}
										sx={selectSx}
									>
										<MenuItem value="ACTIVE">Activate</MenuItem>
										<MenuItem value="STOPPED">Stop</MenuItem>
										<MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
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

export default AdminProductsList;
