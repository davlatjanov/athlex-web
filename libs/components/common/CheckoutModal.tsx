import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ORDER, UPDATE_ORDER_STATUS } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface CheckoutModalProps {
	programId: string;
	programName: string;
	price: number;
	onClose: () => void;
	onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ programId, programName, price, onClose, onSuccess }) => {
	const [cardNumber, setCardNumber] = useState('');
	const [expiry, setExpiry] = useState('');
	const [cvv, setCvv] = useState('');
	const [name, setName] = useState('');
	const [paying, setPaying] = useState(false);

	const [createOrder] = useMutation(CREATE_ORDER);
	const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);

	const formatCardNumber = (val: string) =>
		val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

	const formatExpiry = (val: string) => {
		const digits = val.replace(/\D/g, '').slice(0, 4);
		if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
		return digits;
	};

	const isValid = name.trim().length > 0 &&
		cardNumber.trim().length > 0 &&
		expiry.trim().length > 0 &&
		cvv.trim().length > 0;

	const handlePay = async () => {
		if (!isValid || paying) return;
		setPaying(true);
		try {
			// Step 1: Create order with programId stored in notes as payment reference
			const orderRes = await createOrder({
				variables: {
					input: {
						items: [{
							productId: programId,   // reusing field for program ref
							productName: programName,
							productPrice: price,
							quantity: 1,
						}],
						paymentMethod: 'CARD',
						notes: programId,           // used by backend guard to verify payment
					},
				},
			});

			const orderId = orderRes.data?.createOrder?._id;
			if (!orderId) throw new Error('Order creation failed');

			// Step 2: Mark order as PAID (simulated payment success)
			await updateOrderStatus({
				variables: {
					input: {
						orderId,
						orderStatus: 'PAID',
						paymentId: `sim_${Date.now()}`,
					},
				},
			});

			await sweetTopSmallSuccessAlert('Payment successful!', 1000);
			onSuccess();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setPaying(false);
		}
	};

	return (
		<div className="checkout-backdrop" onClick={onClose}>
			<div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="co-header">
					<div>
						<h3 className="co-title">Complete Enrollment</h3>
						<p className="co-program">{programName}</p>
					</div>
					<button className="co-close" onClick={onClose}>✕</button>
				</div>

				{/* Price summary */}
				<div className="co-summary">
					<div className="co-row">
						<span>Program access</span>
						<span>${price.toFixed(2)}</span>
					</div>
					<div className="co-row co-total">
						<span>Total</span>
						<span>${price.toFixed(2)}</span>
					</div>
				</div>

				{/* Card form */}
				<div className="co-form">
					<div className="co-field">
						<label>Cardholder Name</label>
						<input
							type="text"
							placeholder="John Smith"
							value={name}
							onChange={(e) => setName(e.target.value)}
							autoComplete="cc-name"
						/>
					</div>
					<div className="co-field">
						<label>Card Number</label>
						<input
							type="text"
							placeholder="1234 5678 9012 3456"
							value={cardNumber}
							onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
							autoComplete="cc-number"
							inputMode="numeric"
						/>
					</div>
					<div className="co-field-row">
						<div className="co-field">
							<label>Expiry</label>
							<input
								type="text"
								placeholder="MM/YY"
								value={expiry}
								onChange={(e) => setExpiry(formatExpiry(e.target.value))}
								autoComplete="cc-exp"
								inputMode="numeric"
							/>
						</div>
						<div className="co-field">
							<label>CVV</label>
							<input
								type="text"
								placeholder="123"
								value={cvv}
								onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
								autoComplete="cc-csc"
								inputMode="numeric"
							/>
						</div>
					</div>
				</div>

				{/* Trust badges */}
				<div className="co-trust">
					<span>🔒 Secure payment</span>
					<span>· Instant access</span>
					<span>· Cancel anytime</span>
				</div>

				<button
					className="co-pay-btn"
					onClick={handlePay}
					disabled={!isValid || paying}
				>
					{paying ? 'Processing…' : `Pay $${price.toFixed(2)}`}
				</button>
			</div>
		</div>
	);
};

export default CheckoutModal;
