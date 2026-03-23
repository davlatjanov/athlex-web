import React, { useState } from 'react';
import { Drawer, IconButton, Badge } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useCart } from '../../context/CartContext';
import { CREATE_ORDER } from '../../../apollo/user/mutation';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';

type View = 'cart' | 'checkout' | 'success';

const STATUS_COLOR: Record<string, string> = {
	PENDING: '#f59e0b',
	CONFIRMED: '#3b82f6',
	PAID: '#22c55e',
	SHIPPED: '#8b5cf6',
	DELIVERED: '#10b981',
	CANCELLED: '#ef4444',
	REFUNDED: '#6b7280',
};

const CartDrawer = () => {
	const user = useReactiveVar(userVar) as any;
	const { items, totalItems, totalPrice, removeItem, updateQty, clearCart } = useCart();
	const [open, setOpen] = useState(false);
	const [view, setView] = useState<View>('cart');
	const [loading, setLoading] = useState(false);
	const [lastOrderId, setLastOrderId] = useState('');

	const [shipping, setShipping] = useState({ street: '', city: '', state: '', zipCode: '', country: '' });
	const [paymentMethod, setPaymentMethod] = useState('CASH');
	const [notes, setNotes] = useState('');

	const [createOrder] = useMutation(CREATE_ORDER);

	const handleOpen = () => {
		setView('cart');
		setOpen(true);
	};

	const handleClose = () => setOpen(false);

	const handlePlaceOrder = async () => {
		if (!user?._id) return;
		setLoading(true);
		try {
			const result = await createOrder({
				variables: {
					input: {
						items: items.map((i) => ({
							productId: i.productId,
							productName: i.productName,
							productPrice: i.productPrice,
							quantity: i.qty,
						})),
						shippingAddress: shipping.street ? shipping : undefined,
						paymentMethod,
						notes: notes || undefined,
					},
				},
			});
			setLastOrderId(result.data?.createOrder?._id ?? '');
			clearCart();
			setView('success');
		} catch (err: any) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{/* Trigger button — matches navbar icon style */}
			<Badge
				badgeContent={totalItems}
				color="error"
				invisible={totalItems === 0}
				sx={{ cursor: 'pointer', mr: 1 }}
				onClick={handleOpen}
			>
				<ShoppingBagOutlinedIcon className={'notification-icon'} />
			</Badge>

			<Drawer
				anchor="right"
				open={open}
				onClose={handleClose}
				PaperProps={{
					sx: {
						width: 420,
						background: '#0f172a',
						color: '#e2e8f0',
						border: 'none',
						borderLeft: '1px solid rgba(255,255,255,0.08)',
						display: 'flex',
						flexDirection: 'column',
					},
				}}
			>
				{/* Header */}
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
						{view === 'checkout' && (
							<IconButton onClick={() => setView('cart')} sx={{ color: '#9ca3af', p: 0.5, mr: 0.5 }}>
								<ArrowBackIcon fontSize="small" />
							</IconButton>
						)}
						<span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
							{view === 'cart' ? 'CART' : view === 'checkout' ? 'CHECKOUT' : 'ORDER PLACED'}
						</span>
						{view === 'cart' && totalItems > 0 && (
							<span style={{ fontSize: 12, color: '#6b7280', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 20 }}>
								{totalItems} item{totalItems !== 1 ? 's' : ''}
							</span>
						)}
					</div>
					<IconButton onClick={handleClose} sx={{ color: '#9ca3af', p: 0.5 }}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</div>

				{/* Body */}
				<div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>

					{/* ── CART VIEW ── */}
					{view === 'cart' && (
						<>
							{items.length === 0 ? (
								<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#6b7280' }}>
									<ShoppingBagOutlinedIcon sx={{ fontSize: 48, opacity: 0.3 }} />
									<p style={{ margin: 0, fontSize: 14 }}>Your cart is empty</p>
								</div>
							) : (
								<div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
									{items.map((item) => (
										<div key={item.productId} style={{ display: 'flex', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
											{item.productImage ? (
												<img src={item.productImage} alt={item.productName} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
											) : (
												<div style={{ width: 60, height: 60, borderRadius: 8, background: 'rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🛍️</div>
											)}
											<div style={{ flex: 1, minWidth: 0 }}>
												<p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName}</p>
												<p style={{ margin: '0 0 8px', fontSize: 13, color: '#E92C28', fontWeight: 700 }}>${(item.productPrice * item.qty).toFixed(2)}</p>
												<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
													<button onClick={() => updateQty(item.productId, item.qty - 1)} style={qtyBtn}> − </button>
													<span style={{ fontSize: 13, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
													<button onClick={() => updateQty(item.productId, item.qty + 1)} style={qtyBtn}> + </button>
												</div>
											</div>
											<IconButton onClick={() => removeItem(item.productId)} sx={{ color: '#6b7280', alignSelf: 'flex-start', p: 0.5, '&:hover': { color: '#ef4444' } }}>
												<DeleteOutlineIcon fontSize="small" />
											</IconButton>
										</div>
									))}
								</div>
							)}
						</>
					)}

					{/* ── CHECKOUT VIEW ── */}
					{view === 'checkout' && (
						<div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
							<p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#6b7280' }}>SHIPPING ADDRESS</p>

							<input style={inputSx} placeholder="Street address" value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })} />
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
								<input style={inputSx} placeholder="City" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
								<input style={inputSx} placeholder="State" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} />
							</div>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
								<input style={inputSx} placeholder="ZIP Code" value={shipping.zipCode} onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })} />
								<input style={inputSx} placeholder="Country" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} />
							</div>

							<p style={{ margin: '8px 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#6b7280' }}>PAYMENT METHOD</p>
							<div style={{ display: 'flex', gap: 10 }}>
								{['CASH', 'CARD', 'TRANSFER'].map((method) => (
									<button
										key={method}
										onClick={() => setPaymentMethod(method)}
										style={{
											flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
											background: paymentMethod === method ? 'rgba(233,44,40,0.15)' : 'rgba(255,255,255,0.04)',
											border: paymentMethod === method ? '1px solid #E92C28' : '1px solid rgba(255,255,255,0.1)',
											color: paymentMethod === method ? '#E92C28' : '#9ca3af',
										}}
									>
										{method}
									</button>
								))}
							</div>

							<p style={{ margin: '8px 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#6b7280' }}>NOTES (optional)</p>
							<textarea
								style={{ ...inputSx, resize: 'none', height: 72, paddingTop: 8 } as React.CSSProperties}
								placeholder="Any delivery instructions..."
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
							/>

							{/* Order summary */}
							<div style={{ marginTop: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
								<p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#6b7280' }}>ORDER SUMMARY</p>
								{items.map((item) => (
									<div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
										<span>{item.productName} × {item.qty}</span>
										<span>${(item.productPrice * item.qty).toFixed(2)}</span>
									</div>
								))}
								<div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
									<span>Total</span>
									<span style={{ color: '#E92C28' }}>${totalPrice.toFixed(2)}</span>
								</div>
							</div>
						</div>
					)}

					{/* ── SUCCESS VIEW ── */}
					{view === 'success' && (
						<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 360, gap: 16, textAlign: 'center' }}>
							<div style={{ fontSize: 56 }}>✅</div>
							<h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#22c55e' }}>Order Placed!</h3>
							<p style={{ margin: 0, fontSize: 13, color: '#9ca3af', maxWidth: 260 }}>Your order has been received. You can track it in your profile under My Orders.</p>
							<a href="/mypage?category=myOrders" onClick={handleClose} style={{ marginTop: 8, padding: '10px 24px', borderRadius: 8, background: '#E92C28', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
								View My Orders
							</a>
						</div>
					)}
				</div>

				{/* Footer */}
				{view === 'cart' && items.length > 0 && (
					<div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 10 }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700 }}>
							<span style={{ color: '#9ca3af' }}>Subtotal</span>
							<span style={{ color: '#E92C28' }}>${totalPrice.toFixed(2)}</span>
						</div>
						{user?._id ? (
							<button onClick={() => setView('checkout')} style={checkoutBtn}>Proceed to Checkout →</button>
						) : (
							<a href="/account/join" style={{ ...checkoutBtn, textAlign: 'center', textDecoration: 'none' } as React.CSSProperties}>
								Sign in to Checkout
							</a>
						)}
					</div>
				)}

				{view === 'checkout' && (
					<div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
						<button
							onClick={handlePlaceOrder}
							disabled={loading}
							style={{ ...checkoutBtn, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
						>
							{loading ? 'Placing Order...' : `Place Order — $${totalPrice.toFixed(2)}`}
						</button>
					</div>
				)}
			</Drawer>
		</>
	);
};

const qtyBtn: React.CSSProperties = {
	width: 26, height: 26, borderRadius: 6,
	background: 'rgba(255,255,255,0.06)',
	border: '1px solid rgba(255,255,255,0.1)',
	color: '#e2e8f0', fontSize: 16, cursor: 'pointer',
	display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const inputSx: React.CSSProperties = {
	width: '100%', padding: '9px 12px', borderRadius: 8,
	background: 'rgba(255,255,255,0.05)',
	border: '1px solid rgba(255,255,255,0.1)',
	color: '#e2e8f0', fontSize: 13, outline: 'none',
	boxSizing: 'border-box',
};

const checkoutBtn: React.CSSProperties = {
	width: '100%', padding: '12px 0', borderRadius: 10,
	background: '#E92C28', color: '#fff',
	fontSize: 14, fontWeight: 700, cursor: 'pointer',
	border: 'none', letterSpacing: 0.5,
};

export default CartDrawer;
