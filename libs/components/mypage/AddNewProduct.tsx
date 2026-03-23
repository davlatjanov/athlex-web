import React, { useState } from 'react';
import { NextPage } from 'next';
import { useMutation } from '@apollo/client';
import axios from 'axios';
import { CREATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { ProductType, ProductStatus, ProductBrand } from '../../enums/product.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { getJwtToken } from '../../auth';

/* ─── shared style tokens ─── */
const C = {
	bg: '#111827',
	surface: '#1a1f2e',
	border: 'rgba(255,255,255,0.1)',
	borderFocus: '#E92C28',
	text: '#e2e8f0',
	muted: '#6b7280',
	accent: '#E92C28',
	accentHover: '#c0231f',
	divider: 'rgba(255,255,255,0.07)',
};

const inputStyle: React.CSSProperties = {
	width: '100%',
	padding: '10px 14px',
	background: C.surface,
	border: `1px solid ${C.border}`,
	borderRadius: 8,
	color: C.text,
	fontSize: 14,
	outline: 'none',
	boxSizing: 'border-box',
	fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
	display: 'block',
	fontSize: 11,
	fontWeight: 700,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: C.muted,
	marginBottom: 6,
};

const fieldStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
};

const sectionLabelStyle: React.CSSProperties = {
	fontSize: 11,
	fontWeight: 700,
	letterSpacing: '0.1em',
	textTransform: 'uppercase',
	color: C.muted,
	marginBottom: 20,
};

const dividerStyle: React.CSSProperties = {
	borderTop: `1px solid ${C.divider}`,
	margin: '28px 0',
};

interface ProductFormData {
	productName: string;
	productDesc: string;
	productType: ProductType | '';
	productBrand: ProductBrand;
	productStatus: ProductStatus;
	productPrice: number;
	productStock: number;
	productImages: string[];
}

const EMPTY_FORM: ProductFormData = {
	productName: '',
	productDesc: '',
	productType: '',
	productBrand: ProductBrand.NONE,
	productStatus: ProductStatus.ACTIVE,
	productPrice: 0,
	productStock: 0,
	productImages: [],
};

const AddNewProduct: NextPage = () => {
	const token = getJwtToken();
	const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
	const [uploading, setUploading] = useState(false);
	const [focusedField, setFocusedField] = useState<string | null>(null);

	const [createProduct, { loading }] = useMutation(CREATE_PRODUCT_BY_ADMIN);

	const handleField = (key: keyof ProductFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const getFocusStyle = (name: string): React.CSSProperties =>
		focusedField === name ? { borderColor: C.accent } : {};

	const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploading(true);
		try {
			const fd = new FormData();
			fd.append('operations', JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }`,
				variables: { file: null, target: 'product' },
			}));
			fd.append('map', JSON.stringify({ '0': ['variables.file'] }));
			fd.append('0', file);
			const res = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, fd, {
				headers: { 'Content-Type': 'multipart/form-data', 'apollo-require-preflight': true, Authorization: `Bearer ${token}` },
			});
			const url: string = res.data.data.imageUploader;
			setFormData((prev) => ({ ...prev, productImages: [...prev.productImages, url] }));
		} catch (err) {
			sweetMixinErrorAlert('Image upload failed. Please try again.').then();
		} finally {
			setUploading(false);
			e.target.value = '';
		}
	};

	const removeImage = (idx: number) =>
		setFormData((prev) => ({ ...prev, productImages: prev.productImages.filter((_, i) => i !== idx) }));

	const handleSubmit = async () => {
		try {
			if (!formData.productName || !formData.productType) {
				await sweetErrorHandling(new Error('Please fill in Name and Type'));
				return;
			}
			await createProduct({
				variables: {
					input: {
						productName: formData.productName,
						productDesc: formData.productDesc,
						productType: formData.productType,
						productBrand: formData.productBrand,
						productStatus: formData.productStatus,
						productPrice: Number(formData.productPrice),
						productStock: Number(formData.productStock),
						productImages: formData.productImages,
					},
				},
			});
			await sweetMixinSuccessAlert('Product created!');
			setFormData(EMPTY_FORM);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div id="add-property-page">
			<div className="main-title-box">
				<div className="right-box">
					<p className="main-title">Add New Product</p>
					<p className="sub-title">Create a new product for the store.</p>
				</div>
			</div>

			<div className="config" style={{ display: 'flex', flexDirection: 'column' }}>

				{/* ── BASIC INFORMATION ── */}
				<p style={sectionLabelStyle}>Basic Information</p>

				<div style={fieldStyle as any}>
					<label style={labelStyle}>Product Name *</label>
					<input
						style={{ ...inputStyle, ...getFocusStyle('name'), marginBottom: 16 }}
						placeholder="e.g. Whey Protein 5lb"
						value={formData.productName}
						onChange={(e) => handleField('productName', e.target.value)}
						onFocus={() => setFocusedField('name')}
						onBlur={() => setFocusedField(null)}
					/>
				</div>

				<div style={fieldStyle as any}>
					<label style={labelStyle}>Description</label>
					<textarea
						style={{ ...inputStyle, ...getFocusStyle('desc'), height: 110, resize: 'vertical', marginBottom: 16 }}
						placeholder="Describe the product…"
						value={formData.productDesc}
						onChange={(e) => handleField('productDesc', e.target.value)}
						onFocus={() => setFocusedField('desc')}
						onBlur={() => setFocusedField(null)}
					/>
				</div>

				<div style={{ display: 'flex', gap: 16, marginBottom: 0 }}>
					<div style={fieldStyle as any}>
						<label style={labelStyle}>Type *</label>
						<select
							style={{ ...inputStyle, ...getFocusStyle('type'), cursor: 'pointer' }}
							value={formData.productType}
							onChange={(e) => handleField('productType', e.target.value)}
							onFocus={() => setFocusedField('type')}
							onBlur={() => setFocusedField(null)}
						>
							<option value="" disabled>Select type</option>
							{Object.values(ProductType).map((t) => (
								<option key={t} value={t}>{t}</option>
							))}
						</select>
					</div>

					<div style={fieldStyle as any}>
						<label style={labelStyle}>Brand</label>
						<select
							style={{ ...inputStyle, ...getFocusStyle('brand'), cursor: 'pointer' }}
							value={formData.productBrand}
							onChange={(e) => handleField('productBrand', e.target.value)}
							onFocus={() => setFocusedField('brand')}
							onBlur={() => setFocusedField(null)}
						>
							{Object.values(ProductBrand).map((b) => (
								<option key={b} value={b}>{b}</option>
							))}
						</select>
					</div>

					<div style={fieldStyle as any}>
						<label style={labelStyle}>Status</label>
						<select
							style={{ ...inputStyle, ...getFocusStyle('status'), cursor: 'pointer' }}
							value={formData.productStatus}
							onChange={(e) => handleField('productStatus', e.target.value)}
							onFocus={() => setFocusedField('status')}
							onBlur={() => setFocusedField(null)}
						>
							{Object.values(ProductStatus).map((s) => (
								<option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
							))}
						</select>
					</div>
				</div>

				<div style={dividerStyle} />

				{/* ── PRICING & STOCK ── */}
				<p style={sectionLabelStyle}>Pricing & Stock</p>

				<div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
					<div style={fieldStyle as any}>
						<label style={labelStyle}>Price ($)</label>
						<input
							type="number" min={0}
							style={{ ...inputStyle, ...getFocusStyle('price') }}
							value={formData.productPrice}
							onChange={(e) => handleField('productPrice', e.target.value)}
							onFocus={() => setFocusedField('price')}
							onBlur={() => setFocusedField(null)}
						/>
					</div>
					<div style={fieldStyle as any}>
						<label style={labelStyle}>Stock Quantity</label>
						<input
							type="number" min={0}
							style={{ ...inputStyle, ...getFocusStyle('stock') }}
							value={formData.productStock}
							onChange={(e) => handleField('productStock', e.target.value)}
							onFocus={() => setFocusedField('stock')}
							onBlur={() => setFocusedField(null)}
						/>
					</div>
				</div>

				<div style={dividerStyle} />

				{/* ── IMAGES ── */}
				<p style={sectionLabelStyle}>Images</p>

				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
					{formData.productImages.map((img, idx) => (
						<div key={idx} style={{ position: 'relative', width: 120, height: 90 }}>
							<img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
							<button onClick={() => removeImage(idx)} style={{
								position: 'absolute', top: 4, right: 4, width: 22, height: 22,
								background: C.accent, border: 'none', borderRadius: '50%',
								color: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: '22px', padding: 0,
							}}>×</button>
						</div>
					))}
					<label style={{ cursor: uploading ? 'wait' : 'pointer' }}>
						<div style={{
							width: 120, height: 90, border: `2px dashed ${C.border}`, borderRadius: 8,
							display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
							gap: 4, color: C.muted, fontSize: 12, transition: 'border-color 0.2s, color 0.2s',
						}}
							onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = C.accent; el.style.color = C.accent; }}
							onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = C.border; el.style.color = C.muted; }}
						>
							<span style={{ fontSize: 22 }}>+</span>
							<span>{uploading ? 'Uploading…' : 'Add Image'}</span>
						</div>
						<input type="file" accept="image/*" hidden onChange={uploadImage} disabled={uploading} />
					</label>
				</div>

				{/* ── ACTIONS ── */}
				<div style={{
					display: 'flex', justifyContent: 'flex-end', gap: 12,
					marginTop: 36, paddingTop: 24, borderTop: `1px solid ${C.divider}`,
				}}>
					<button
						disabled={loading}
						onClick={() => setFormData(EMPTY_FORM)}
						style={{
							padding: '10px 24px', borderRadius: 8, border: `1px solid ${C.border}`,
							background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 14, fontWeight: 600,
						}}
					>
						Reset
					</button>
					<button
						disabled={loading}
						onClick={handleSubmit}
						style={{
							padding: '10px 28px', borderRadius: 8, border: 'none',
							background: loading ? '#7a1614' : C.accent, color: '#fff',
							cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700,
							minWidth: 140, transition: 'background 0.2s',
						}}
						onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = C.accentHover; }}
						onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = C.accent; }}
					>
						{loading ? 'Saving…' : 'Create Product'}
					</button>
				</div>

			</div>
		</div>
	);
};

export default AddNewProduct;
