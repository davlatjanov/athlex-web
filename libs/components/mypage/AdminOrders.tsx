import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_ORDERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_ORDER_STATUS } from '../../../apollo/admin/mutation';
import { T } from '../../types/common';
import moment from 'moment';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const STATUS_COLOR: Record<string, string> = {
	PENDING: '#f59e0b',
	CONFIRMED: '#3b82f6',
	PAID: '#22c55e',
	SHIPPED: '#8b5cf6',
	DELIVERED: '#10b981',
	CANCELLED: '#ef4444',
	REFUNDED: '#6b7280',
};

const selectSx = {
	background: '#1a2236',
	border: '1px solid rgba(255,255,255,0.12)',
	color: '#e2e8f0',
	borderRadius: 6,
	padding: '4px 8px',
	fontSize: 12,
	cursor: 'pointer',
	outline: 'none',
};

const AdminOrders = () => {
	const [page, setPage] = useState(1);
	const [orders, setOrders] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [expanded, setExpanded] = useState<string | null>(null);

	const buildInquiry = () => ({
		page,
		limit: 10,
		...(statusFilter !== 'ALL' ? { orderStatus: statusFilter } : {}),
	});

	const { refetch } = useQuery(GET_ALL_ORDERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: buildInquiry() },
		onCompleted: (data: T) => {
			setOrders(data?.getAllOrdersByAdmin?.list ?? []);
			setTotal(data?.getAllOrdersByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const [updateStatus] = useMutation(UPDATE_ORDER_STATUS);

	const handleStatusChange = async (orderId: string, newStatus: string) => {
		await updateStatus({ variables: { input: { orderId, orderStatus: newStatus } } });
		const result = await refetch({ input: buildInquiry() });
		setOrders(result.data?.getAllOrdersByAdmin?.list ?? []);
		setTotal(result.data?.getAllOrdersByAdmin?.metaCounter?.[0]?.total ?? 0);
	};

	const handleFilterChange = async (status: string) => {
		setStatusFilter(status);
		setPage(1);
		const input = { page: 1, limit: 10, ...(status !== 'ALL' ? { orderStatus: status } : {}) };
		const result = await refetch({ input });
		setOrders(result.data?.getAllOrdersByAdmin?.list ?? []);
		setTotal(result.data?.getAllOrdersByAdmin?.metaCounter?.[0]?.total ?? 0);
	};

	const totalPages = Math.ceil(total / 10);

	return (
		<div id="admin-orders">
			<div className="ao-header">
				<h3 className="ao-title">Orders <span>{total}</span></h3>
				<select style={selectSx} value={statusFilter} onChange={(e) => handleFilterChange(e.target.value)}>
					<option value="ALL">All</option>
					{ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
				</select>
			</div>

			{orders.length === 0 ? (
				<div className="ao-empty"><p>No orders found.</p></div>
			) : (
				<div className="ao-list">
					{orders.map((order: T) => (
						<div key={order._id} className="ao-card">
							<div className="ao-card-header" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
								<div className="ao-card-left">
									<div className="ao-member">
										{order.memberData?.memberImage ? (
											<img src={order.memberData.memberImage} alt="" />
										) : (
											<div className="ao-member-initial">{(order.memberData?.memberNick || 'U')[0].toUpperCase()}</div>
										)}
										<span>{order.memberData?.memberNick ?? 'Unknown'}</span>
									</div>
									<span className="ao-id">#{order._id.slice(-8).toUpperCase()}</span>
									<span className="ao-date">{moment(order.createdAt).format('MMM D, YYYY')}</span>
								</div>
								<div className="ao-card-right">
									<span className="ao-total">${order.totalAmount?.toFixed(2)}</span>
									<select
										style={{ ...selectSx, borderColor: STATUS_COLOR[order.orderStatus] ?? 'rgba(255,255,255,0.12)', color: STATUS_COLOR[order.orderStatus] ?? '#e2e8f0' }}
										value={order.orderStatus}
										onClick={(e) => e.stopPropagation()}
										onChange={(e) => handleStatusChange(order._id, e.target.value)}
									>
										{ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
									</select>
									<span className="ao-chevron">{expanded === order._id ? '▲' : '▼'}</span>
								</div>
							</div>

							{expanded === order._id && (
								<div className="ao-card-body">
									<div className="ao-items">
										{(order.items ?? []).map((item: T, idx: number) => (
											<div key={idx} className="ao-item">
												<span>{item.productName}</span>
												<span>× {item.quantity}</span>
												<span>${(item.productPrice * item.quantity).toFixed(2)}</span>
											</div>
										))}
									</div>
									{order.shippingAddress?.street && (
										<p className="ao-shipping-addr">
											📍 {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
										</p>
									)}
									{order.paymentMethod && <p className="ao-payment">💳 {order.paymentMethod}</p>}
									{order.notes && <p className="ao-notes">📝 {order.notes}</p>}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="ao-pagination">
					<button disabled={page === 1} onClick={() => { setPage(page - 1); refetch({ input: { ...buildInquiry(), page: page - 1 } }); }}>Prev</button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
						<button key={p} className={page === p ? 'active' : ''} onClick={() => { setPage(p); refetch({ input: { ...buildInquiry(), page: p } }); }}>{p}</button>
					))}
					<button disabled={page === totalPages} onClick={() => { setPage(page + 1); refetch({ input: { ...buildInquiry(), page: page + 1 } }); }}>Next</button>
				</div>
			)}
		</div>
	);
};

export default AdminOrders;
