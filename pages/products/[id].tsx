import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CircularProgress } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_ONE_PRODUCT } from '../../apollo/user/query';
import { LIKE_TARGET_ITEM, TOGGLE_BOOKMARK } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Message } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import moment from 'moment';

export const getServerSideProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const brandLabel: Record<string, string> = {
	NONE: 'Generic / Unbranded',
	OPTIMUM: 'Optimum Nutrition',
	MUSCLETECH: 'MuscleTech',
	NUTREX: 'Nutrex Research',
	MYPROTEIN: 'MyProtein',
	NIKE: 'Nike',
	ADIDAS: 'Adidas',
};

const statusConfig: Record<string, { label: string; color: string }> = {
	ACTIVE: { label: 'In Stock', color: '#4ecd64' },
	STOPPED: { label: 'Discontinued', color: '#FFB800' },
	OUT_OF_STOCK: { label: 'Out of Stock', color: '#E92C28' },
};

const ProductDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { id } = router.query;
	const productId = typeof id === 'string' ? id : '';

	const [qty, setQty] = useState(1);
	const [addedToCart, setAddedToCart] = useState(false);
	const [bookmarked, setBookmarked] = useState(false);
	const [liked, setLiked] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string>('');

	const [likeTargetItem] = useMutation(LIKE_TARGET_ITEM);
	const [toggleBookmark] = useMutation(TOGGLE_BOOKMARK);

	const { data, loading } = useQuery(GET_ONE_PRODUCT, {
		variables: { productId },
		skip: !productId,
		fetchPolicy: 'network-only',
		onCompleted: (data: T) => {
			if (data?.getOneProduct?.productImages?.[0]) {
				setSelectedImage(data.getOneProduct.productImages[0]);
			}
		},
	});

	const product = data?.getOneProduct;

	const handleLike = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetItem({ variables: { input: { likeGroup: LikeGroup.PRODUCT, likeRefId: productId } } });
			setLiked((prev) => !prev);
			await sweetTopSmallSuccessAlert(liked ? 'Unliked' : 'Liked!', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handleBookmark = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await toggleBookmark({ variables: { input: { bookmarkGroup: 'PRODUCT', bookmarkRefId: productId } } });
			setBookmarked(!bookmarked);
			await sweetTopSmallSuccessAlert(bookmarked ? 'Removed from saved' : 'Saved!', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handleAddToCart = () => {
		if (!product || product.productStatus !== 'ACTIVE') return;
		setAddedToCart((prev) => !prev);
	};

	if (loading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
				<CircularProgress size="4rem" />
			</div>
		);
	}

	if (!product && !loading) {
		return (
			<div id="product-detail-page">
				<div className="pdp-not-found">
					<span>🛒</span>
					<h2>Product not found</h2>
					<p>This product may have been removed or doesn&apos;t exist.</p>
					<button onClick={() => router.push('/products')}>Browse Shop</button>
				</div>
			</div>
		);
	}

	if (device === 'mobile') {
		return (
			<div id="product-detail-page">
				<div className="pdp-mobile-body">
					<h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 }}>{product?.productName}</h2>
					<img
						src={selectedImage || '/img/banner/header1.svg'}
						alt={product?.productName}
						style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10 }}
					/>
					<p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{product?.productDesc}</p>
					<div className="mobile-sticky-cta">
						<span className="msc-price">${product?.productPrice?.toFixed(2)}</span>
						<button
							className={`msc-btn${product?.productStatus !== 'ACTIVE' ? ' disabled' : ''}`}
							onClick={handleAddToCart}
							disabled={product?.productStatus !== 'ACTIVE'}
						>
							{product?.productStatus !== 'ACTIVE' ? 'Out of Stock' : 'Add to Cart →'}
						</button>
					</div>
				</div>
			</div>
		);
	}

	const status = statusConfig[product.productStatus] ?? statusConfig['STOPPED'];
	const isOutOfStock = product.productStatus !== 'ACTIVE';
	const currentImage = selectedImage || product.productImages?.[0] || '';
	const displayViews = product.productViews >= 1000
		? `${(product.productViews / 1000).toFixed(1)}K`
		: String(product.productViews);

	return (
		<div id="product-detail-page">

			{/* ── HERO ── */}
			<div className="pdp-hero-wrap">
				<div className="pdp-hero-left">
					<a className="pdp-back" onClick={() => router.back()} style={{ cursor: 'pointer' }}>← Back</a>
					<div className="pdp-badges">
						<span className="badge-type">{product.productType}</span>
						<span className="badge-brand">{brandLabel[product.productBrand] ?? product.productBrand}</span>
						<span className="badge-status" style={{ color: status.color }}>● {status.label}</span>
					</div>
					<h1 className="pdp-hero-title">{product.productName}</h1>
					<div className="pdp-hero-meta">
						<span className="phm-item">👁 {displayViews} views</span>
						<div className="phm-dot" />
						<span
							className={`phm-item phm-like${liked ? ' liked' : ''}`}
							onClick={handleLike}
							style={{ cursor: 'pointer' }}
						>
							♥ {product.productLikes + (liked ? 1 : 0)} likes
						</span>
						<div className="phm-dot" />
						<span className="phm-item">{moment(product.createdAt).fromNow()}</span>
					</div>
				</div>
				<div className="pdp-hero-right">
					<img
						className="pdp-hero-img"
						src={currentImage || '/img/banner/header1.svg'}
						alt={product.productName}
					/>
					{product.productImages?.length > 1 && (
						<div className="pdp-thumb-row">
							{product.productImages.map((img: string, i: number) => (
								<img
									key={i}
									className={`pdp-thumb${img === currentImage ? ' active' : ''}`}
									src={img}
									alt=""
									onClick={() => setSelectedImage(img)}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* ── BODY ── */}
			<div className="pdp-body">

				{/* LEFT MAIN */}
				<div className="pdp-main">

					{/* Stat pills */}
					<div className="stat-pills">
						<div className="stat-pill">
							<span className="sp-icon">💰</span>
							<span className="sp-val">${product.productPrice?.toFixed(2)}</span>
							<span className="sp-lbl">Price</span>
						</div>
						<div className="stat-pill">
							<span className="sp-icon">📦</span>
							<span className="sp-val">{product.productStock > 0 ? product.productStock : '—'}</span>
							<span className="sp-lbl">In Stock</span>
						</div>
						<div className="stat-pill">
							<span className="sp-icon">👁</span>
							<span className="sp-val">{displayViews}</span>
							<span className="sp-lbl">Views</span>
						</div>
						<div className="stat-pill">
							<span className="sp-icon">♥</span>
							<span className="sp-val">{product.productLikes + (liked ? 1 : 0)}</span>
							<span className="sp-lbl">Likes</span>
						</div>
					</div>

					{/* About */}
					{product.productDesc && (
						<div className="pdp-section">
							<h3 className="pdp-section-title">About This Product</h3>
							<p className="pdp-desc">{product.productDesc}</p>
						</div>
					)}

					{/* Specs */}
					<div className="pdp-section">
						<h3 className="pdp-section-title">Product Details</h3>
						<div className="spec-rows">
							<div className="spec-row">
								<span className="sr-label">Category</span>
								<span className="sr-value">{product.productType}</span>
							</div>
							<div className="spec-row">
								<span className="sr-label">Brand</span>
								<span className="sr-value">{brandLabel[product.productBrand] ?? product.productBrand}</span>
							</div>
							<div className="spec-row">
								<span className="sr-label">Status</span>
								<span className="sr-value" style={{ color: status.color }}>{status.label}</span>
							</div>
							{product.productStock > 0 && (
								<div className="spec-row">
									<span className="sr-label">Stock</span>
									<span className="sr-value">{product.productStock} units</span>
								</div>
							)}
							<div className="spec-row">
								<span className="sr-label">Added</span>
								<span className="sr-value">{moment(product.createdAt).format('MMM DD, YYYY')}</span>
							</div>
						</div>
					</div>
				</div>

				{/* RIGHT SIDEBAR */}
				<div className="pdp-sidebar">
					<div className="buy-card">
						<div className="bc-price-row">
							<span className="bc-price">${product.productPrice?.toFixed(2)}</span>
							{product.productStock > 0 && product.productStock < 20 && (
								<span className="bc-low-stock">Only {product.productStock} left!</span>
							)}
						</div>

						<div className="bc-status-row" style={{ color: status.color }}>
							<span className="bc-status-dot" style={{ background: status.color }} />
							{status.label}
						</div>

						{!isOutOfStock && (
							<div className="bc-qty-row">
								<span className="bc-qty-label">Quantity</span>
								<div className="bc-qty-ctrl">
									<button className="bc-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
									<span className="bc-qty-val">{qty}</span>
									<button className="bc-qty-btn" onClick={() => setQty((q) => Math.min(product.productStock, q + 1))}>+</button>
								</div>
							</div>
						)}

						<button
							className={`bc-add-btn${isOutOfStock ? ' disabled' : ''}${addedToCart ? ' added' : ''}`}
							onClick={handleAddToCart}
							disabled={isOutOfStock}
						>
							{addedToCart ? '✓ Added to Cart!' : isOutOfStock ? 'Out of Stock' : 'Add to Cart →'}
						</button>

						<button className={`bc-wish-btn${bookmarked ? ' active' : ''}`} onClick={handleBookmark}>
							{bookmarked ? '♥ Saved to Wishlist' : '♡ Add to Wishlist'}
						</button>

						<div className="bc-divider" />

						<div className="bc-detail-rows">
							<div className="bc-detail-row">
								<span>Category</span>
								<span>{product.productType}</span>
							</div>
							<div className="bc-detail-row">
								<span>Brand</span>
								<span>{brandLabel[product.productBrand] ?? product.productBrand}</span>
							</div>
							<div className="bc-detail-row">
								<span>Liked by</span>
								<span>{product.productLikes + (liked ? 1 : 0)} people</span>
							</div>
						</div>

						<div className="bc-divider" />

						<div className="bc-trust">
							<div className="bc-trust-item">Secure Checkout</div>
							<div className="bc-trust-item">Free Shipping over $50</div>
							<div className="bc-trust-item">30-Day Returns</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(ProductDetail);
