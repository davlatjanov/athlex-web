import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
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

	const canPrev = page > 0;
	const canNext = (page + 1) * limit < total;

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
									<select
										value={p.productStatus}
										onChange={(e) => updateStatus(p._id, e.target.value)}
										style={{
											fontSize: 12, minWidth: 120, padding: '4px 8px', borderRadius: 4,
											color: '#e2e8f0', background: '#1a2236',
											border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
										}}
									>
										<option value="ACTIVE">Activate</option>
										<option value="STOPPED">Stop</option>
										<option value="OUT_OF_STOCK">Out of Stock</option>
									</select>
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

export default AdminProductsList;
