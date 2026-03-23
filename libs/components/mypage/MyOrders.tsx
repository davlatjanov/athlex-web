import React, { useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MY_ORDERS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import moment from 'moment';

const STATUS_COLOR: Record<string, string> = {
	PENDING: '#f59e0b',
	CONFIRMED: '#3b82f6',
	PAID: '#22c55e',
	SHIPPED: '#8b5cf6',
	DELIVERED: '#10b981',
	CANCELLED: '#ef4444',
	REFUNDED: '#6b7280',
};

const MyOrders = () => {
	const user = useReactiveVar(userVar) as any;
	const [page, setPage] = useState(1);
	const [orders, setOrders] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [expanded, setExpanded] = useState<string | null>(null);

	const { refetch } = useQuery(GET_MY_ORDERS, {
		fetchPolicy: 'network-only',
		variables: { input: { page, limit: 10 } },
		skip: !user?._id,
		onCompleted: (data: T) => {
			setOrders(data?.getMyOrders?.list ?? []);
			setTotal(data?.getMyOrders?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const totalPages = Math.ceil(total / 10);

	const handlePageChange = async (p: number) => {
		setPage(p);
		const result = await refetch({ input: { page: p, limit: 10 } });
		setOrders(result.data?.getMyOrders?.list ?? []);
		setTotal(result.data?.getMyOrders?.metaCounter?.[0]?.total ?? 0);
	};

	return (
		<div id="my-orders">
			<h3 className="mo-title">My Orders <span>{total}</span></h3>

			{orders.length === 0 ? (
				<div className="mo-empty">
					<span>🛍️</span>
					<p>No orders yet. Start shopping!</p>
				</div>
			) : (
				<div className="mo-list">
					{orders.map((order: T) => (
						<div key={order._id} className="mo-card">
							<div className="mo-card-header" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
								<div className="mo-card-left">
									<span className="mo-id">#{order._id.slice(-8).toUpperCase()}</span>
									<span className="mo-date">{moment(order.createdAt).format('MMM D, YYYY')}</span>
								</div>
								<div className="mo-card-right">
									<span className="mo-total">${order.totalAmount?.toFixed(2)}</span>
									<span className="mo-status" style={{ color: STATUS_COLOR[order.orderStatus] ?? '#9ca3af', borderColor: STATUS_COLOR[order.orderStatus] ?? '#9ca3af' }}>
										{order.orderStatus}
									</span>
									<span className="mo-chevron">{expanded === order._id ? '▲' : '▼'}</span>
								</div>
							</div>

							{expanded === order._id && (
								<div className="mo-card-body">
									<div className="mo-items">
										{(order.items ?? []).map((item: T, idx: number) => (
											<div key={idx} className="mo-item">
												<span className="mo-item-name">{item.productName}</span>
												<span className="mo-item-qty">× {item.quantity}</span>
												<span className="mo-item-price">${(item.productPrice * item.quantity).toFixed(2)}</span>
											</div>
										))}
									</div>

									{order.shippingAddress?.street && (
										<div className="mo-shipping">
											<span className="mo-section-label">Shipping</span>
											<p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}</p>
										</div>
									)}

									{order.paymentMethod && (
										<div className="mo-payment">
											<span className="mo-section-label">Payment</span>
											<span>{order.paymentMethod}</span>
										</div>
									)}

									{order.notes && (
										<div className="mo-notes">
											<span className="mo-section-label">Notes</span>
											<p>{order.notes}</p>
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="mo-pagination">
					<button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>Prev</button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
						<button key={p} className={page === p ? 'active' : ''} onClick={() => handlePageChange(p)}>{p}</button>
					))}
					<button disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>Next</button>
				</div>
			)}
		</div>
	);
};

export default MyOrders;
