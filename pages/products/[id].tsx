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
	NONE: 'Generic / Unbranded', OPTIMUM: 'Optimum Nutrition', MUSCLETECH: 'MuscleTech',
	NUTREX: 'Nutrex Research', MYPROTEIN: 'MyProtein', NIKE: 'Nike', ADIDAS: 'Adidas',
};

const statusConfig: Record<string, { label: string; color: string }> = {
	ACTIVE: { label: 'In Stock', color: '#4ecd64' },
	STOPPED: { label: 'Discontinued', color: '#FFB800' },
	OUT_OF_STOCK: { label: 'Out of Stock', color: '#E92C28' },
};

const typeGradients: Record<string, string> = {
	SUPPLEMENT: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
	EQUIPMENT: 'linear-gradient(135deg, #1a1a2e 0%, #e92c28 100%)',
	WEARABLE: 'linear-gradient(135deg, #0f3460 0%, #533483 100%)',
	ACCESSORY: 'linear-gradient(135deg, #1b4332 0%, #40916c 100%)',
	DRINK: 'linear-gradient(135deg, #003566 0%, #0077b6 100%)',
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
		setAddedToCart(true);
		setTimeout(() => setAddedToCart(false), 2000);
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
					<Link href="/products"><button>Browse Shop</button></Link>
				</div>
			</div>
		);
	}

	if (device === 'mobile') {
		return (
			<div id="product-detail-page">
				<div className="pdp-not-found">
					<p style={{ color: '#fff' }}>Mobile view coming soon.</p>
				</div>
			</div>
		);
	}

	const status = statusConfig[product.productStatus] ?? statusConfig['STOPPED'];
	const isOutOfStock = product.productStatus !== 'ACTIVE';
	const gradient = typeGradients[product.productType] ?? typeGradients['SUPPLEMENT'];
	const currentImage = selectedImage || product.productImages?.[0] || '';
	const displayViews = product.productViews >= 1000 ? `${(product.productViews / 1000).toFixed(1)}K` : String(product.productViews);

	return (
		<div id="product-detail-page">

			{/* ─── HERO ─────────────────────────────────────────────── */}
			<div className="pdp-hero" style={{ background: gradient }}>
				{currentImage && <img src={currentImage} alt={product.productName} className="pdp-hero-bg" />}
				<div className="pdp-hero-overlay" />
				<div className="pdp-hero-inner">
					<Link href="/products" className="pdp-back">← Shop</Link>
					<div className="pdp-hero-content">
						<div className="pdp-hero-left">
							<div className="pdp-brand-row">
								<span className="pdp-type-badge">{product.productType}</span>
								<span className="pdp-brand-name">{brandLabel[product.productBrand] ?? product.productBrand}</span>
							</div>
							<h1 className="pdp-name">{product.productName}</h1>
							<div className="pdp-meta-row">
								<span className="pdp-views">{displayViews} views</span>
								<span className="pdp-dot">·</span>
								<span className={`pdp-likes${liked ? ' liked' : ''}`} style={{ cursor: 'pointer' }} onClick={handleLike}>
									♥ {product.productLikes + (liked ? 1 : 0)}
								</span>
								<span className="pdp-dot">·</span>
								<span className="pdp-status" style={{ color: status.color }}>{status.label}</span>
								<span className="pdp-dot">·</span>
								<span style={{ color: '#666', fontSize: 13 }}>{moment(product.createdAt).fromNow()}</span>
							</div>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
							<img
								src={currentImage || '/img/banner/header1.svg'}
								alt={product.productName}
								className="pdp-hero-img"
								style={{ width: 240, height: 200, objectFit: 'cover', borderRadius: 12, display: 'block' }}
							/>
							{product.productImages?.length > 1 && (
								<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
									{product.productImages.map((img: string, i: number) => (
										<img
											key={i}
											src={img}
											alt=""
											onClick={() => setSelectedImage(img)}
											style={{
												width: 52, height: 44, objectFit: 'cover', borderRadius: 6,
												cursor: 'pointer', border: `2px solid ${img === currentImage ? '#E92C28' : 'transparent'}`,
												opacity: img === currentImage ? 1 : 0.6,
											}}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* ─── BODY ─────────────────────────────────────────────── */}
			<div className="pdp-body">

				{/* ── LEFT MAIN ───────────────────────────────────────── */}
				<div className="pdp-main">
					<section className="pdp-section">
						<h2 className="pdp-section-title">About This Product</h2>
						<p className="pdp-desc">{product.productDesc || 'No description available.'}</p>
					</section>

					<section className="pdp-section">
						<h2 className="pdp-section-title">Product Specs</h2>
						<div className="pdp-specs-grid">
							<div className="pdp-spec-item">
								<span className="pdp-spec-label">Category</span>
								<span className="pdp-spec-value">{product.productType}</span>
							</div>
							<div className="pdp-spec-item">
								<span className="pdp-spec-label">Brand</span>
								<span className="pdp-spec-value">{brandLabel[product.productBrand] ?? product.productBrand}</span>
							</div>
							<div className="pdp-spec-item">
								<span className="pdp-spec-label">Status</span>
								<span className="pdp-spec-value" style={{ color: status.color }}>{status.label}</span>
							</div>
							{product.productStock > 0 && (
								<div className="pdp-spec-item">
									<span className="pdp-spec-label">Stock</span>
									<span className="pdp-spec-value">{product.productStock} units</span>
								</div>
							)}
							<div className="pdp-spec-item">
								<span className="pdp-spec-label">Views</span>
								<span className="pdp-spec-value">{displayViews}</span>
							</div>
							<div className="pdp-spec-item">
								<span className="pdp-spec-label">Added</span>
								<span className="pdp-spec-value">{moment(product.createdAt).format('MMM DD, YYYY')}</span>
							</div>
						</div>
					</section>
				</div>

				{/* ── RIGHT SIDEBAR ────────────────────────────────────── */}
				<aside className="pdp-sidebar">
					<div className="pdp-buy-card">
						<div className="pdp-price-block">
							<span className="pdp-price">${product.productPrice?.toFixed(2)}</span>
							{product.productStock > 0 && product.productStock < 20 && (
								<span className="pdp-low-stock">Only {product.productStock} left!</span>
							)}
						</div>

						<div className="pdp-status-row" style={{ color: status.color }}>
							<span className="pdp-status-dot" style={{ background: status.color }} />
							{status.label}
						</div>

						{!isOutOfStock && (
							<div className="pdp-qty-row">
								<span className="pdp-qty-label">Quantity</span>
								<div className="pdp-qty-ctrl">
									<button className="pdp-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
									<span className="pdp-qty-val">{qty}</span>
									<button className="pdp-qty-btn" onClick={() => setQty((q) => Math.min(product.productStock, q + 1))}>+</button>
								</div>
							</div>
						)}

						<button
							className={`pdp-add-btn ${isOutOfStock ? 'disabled' : ''} ${addedToCart ? 'added' : ''}`}
							onClick={handleAddToCart}
							disabled={isOutOfStock}
						>
							{addedToCart ? '✓ Added to Cart!' : isOutOfStock ? 'Out of Stock' : 'Add to Cart →'}
						</button>

						<button className={`pdp-like-btn ${bookmarked ? 'liked' : ''}`} onClick={handleBookmark}>
							{bookmarked ? '♥ Saved to Wishlist' : '♡ Add to Wishlist'}
						</button>

						<div className="pdp-divider" />

						<div className="pdp-detail-rows">
							<div className="pdp-detail-row"><span>Category</span><span>{product.productType}</span></div>
							<div className="pdp-detail-row"><span>Brand</span><span>{brandLabel[product.productBrand] ?? product.productBrand}</span></div>
							<div className="pdp-detail-row"><span>Status</span><span style={{ color: status.color }}>{status.label}</span></div>
							<div className="pdp-detail-row"><span>Liked by</span><span>{product.productLikes} people</span></div>
						</div>

						<div className="pdp-divider" />

						<div className="pdp-guarantees">
							<div className="pdp-guarantee-item"><span className="pdp-g-icon">🔒</span><span>Secure Checkout</span></div>
							<div className="pdp-guarantee-item"><span className="pdp-g-icon">🚚</span><span>Free Shipping over $50</span></div>
							<div className="pdp-guarantee-item"><span className="pdp-g-icon">↩</span><span>30-Day Returns</span></div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
};

export default withLayoutBasic(ProductDetail);
