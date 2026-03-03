import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { allProducts, Product } from '../../libs/data/products';
import { useLike } from '../../libs/hooks/useInteractions';

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

const typeIcons: Record<string, string> = {
	SUPPLEMENT: '🧪', EQUIPMENT: '🏋️', WEARABLE: '👕', ACCESSORY: '🎒', DRINK: '🥤',
};

const ProductDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { id } = router.query;
	const productId = typeof id === 'string' ? id : '';
	const { liked, toggle: toggleLike } = useLike('programs', productId);

	const [qty, setQty] = useState(1);
	const [addedToCart, setAddedToCart] = useState(false);

	const product = allProducts.find((p) => p.id === productId);

	if (!product) {
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
		return <div id="product-detail-page"><div className="pdp-not-found"><p style={{ color: '#fff' }}>Mobile view coming soon.</p></div></div>;
	}

	const status = statusConfig[product.productStatus];
	const isOutOfStock = product.productStatus !== 'ACTIVE';
	const related = allProducts.filter((p) => p.productType === product.productType && p.id !== product.id).slice(0, 3);
	const displayViews = product.productViews >= 1000 ? `${(product.productViews / 1000).toFixed(1)}K` : String(product.productViews);

	const handleAddToCart = () => {
		if (isOutOfStock) return;
		setAddedToCart(true);
		setTimeout(() => setAddedToCart(false), 2000);
	};

	return (
		<div id="product-detail-page">

			{/* ─── HERO ────────────────────────────────────────────────── */}
			<div className="pdp-hero" style={{ background: product.gradient }}>
				<img src={product.image} alt={product.productName} className="pdp-hero-bg" />
				<div className="pdp-hero-overlay" />
				<div className="pdp-hero-inner">
					<Link href="/products" className="pdp-back">← Shop</Link>
					<div className="pdp-hero-content">
						<div className="pdp-hero-left">
							<div className="pdp-brand-row">
								<span className="pdp-type-badge">{product.productType}</span>
								<span className="pdp-brand-name">{brandLabel[product.productBrand]}</span>
							</div>
							<h1 className="pdp-name">{product.productName}</h1>
							<div className="pdp-meta-row">
								<span className="pdp-rating">★ {product.rating}</span>
								<span className="pdp-dot">·</span>
								<span className="pdp-views">{displayViews} views</span>
								<span className="pdp-dot">·</span>
								<span className="pdp-likes">♥ {product.productLikes}</span>
								<span className="pdp-dot">·</span>
								<span className="pdp-status" style={{ color: status.color }}>{status.label}</span>
							</div>
						</div>
						<img src={product.image} alt={product.productName} className="pdp-hero-img" />
					</div>
				</div>
			</div>

			{/* ─── BODY ────────────────────────────────────────────────── */}
			<div className="pdp-body">

				{/* ── LEFT MAIN ─────────────────────────────────────────── */}
				<div className="pdp-main">

					{/* Description */}
					<section className="pdp-section">
						<h2 className="pdp-section-title">About This Product</h2>
						<p className="pdp-desc">{product.productDesc}</p>
					</section>

					{/* Key features */}
					<section className="pdp-section">
						<h2 className="pdp-section-title">Key Features</h2>
						<div className="pdp-tags">
							{product.tags.map((tag, i) => (
								<span key={i} className="pdp-tag">✓ {tag}</span>
							))}
						</div>
					</section>

					{/* Supplement specs */}
					{(product.weight || product.servings || product.flavor) && (
						<section className="pdp-section">
							<h2 className="pdp-section-title">Product Specs</h2>
							<div className="pdp-specs-grid">
								{product.weight && (
									<div className="pdp-spec-item">
										<span className="pdp-spec-label">Weight</span>
										<span className="pdp-spec-value">{product.weight}</span>
									</div>
								)}
								{product.servings && (
									<div className="pdp-spec-item">
										<span className="pdp-spec-label">Servings</span>
										<span className="pdp-spec-value">{product.servings}</span>
									</div>
								)}
								{product.flavor && (
									<div className="pdp-spec-item">
										<span className="pdp-spec-label">Flavor</span>
										<span className="pdp-spec-value">{product.flavor}</span>
									</div>
								)}
								<div className="pdp-spec-item">
									<span className="pdp-spec-label">Brand</span>
									<span className="pdp-spec-value">{brandLabel[product.productBrand]}</span>
								</div>
								<div className="pdp-spec-item">
									<span className="pdp-spec-label">Category</span>
									<span className="pdp-spec-value">{product.productType}</span>
								</div>
								{product.productStatus === 'ACTIVE' && (
									<div className="pdp-spec-item">
										<span className="pdp-spec-label">Stock</span>
										<span className="pdp-spec-value">{product.productStock} units</span>
									</div>
								)}
							</div>
						</section>
					)}

					{/* Related products */}
					{related.length > 0 && (
						<section className="pdp-section">
							<div className="pdp-section-header">
								<h2 className="pdp-section-title">Related Products</h2>
								<Link href="/products" className="pdp-see-all">See all →</Link>
							</div>
							<div className="pdp-related-grid">
								{related.map((rel) => (
									<Link href={`/products/${rel.id}`} key={rel.id} className="pdp-rel-card">
										<div className="pdp-rel-visual" style={{ background: rel.gradient }}>
											<div className="pdp-rel-icon">{rel.icon}</div>
										</div>
										<div className="pdp-rel-body">
											<span className="pdp-rel-type">{rel.productType}</span>
											<p className="pdp-rel-name">{rel.productName}</p>
											<span className="pdp-rel-price">${rel.productPrice.toFixed(2)}</span>
										</div>
									</Link>
								))}
							</div>
						</section>
					)}
				</div>

				{/* ── RIGHT STICKY SIDEBAR ───────────────────────────────── */}
				<aside className="pdp-sidebar">
					<div className="pdp-buy-card">

						{/* Price */}
						<div className="pdp-price-block">
							<span className="pdp-price">${product.productPrice.toFixed(2)}</span>
							{product.productStock > 0 && product.productStock < 20 && (
								<span className="pdp-low-stock">Only {product.productStock} left!</span>
							)}
						</div>

						{/* Status */}
						<div className="pdp-status-row" style={{ color: status.color }}>
							<span className="pdp-status-dot" style={{ background: status.color }} />
							{status.label}
						</div>

						{/* Quantity */}
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

						{/* CTA buttons */}
						<button
							className={`pdp-add-btn ${isOutOfStock ? 'disabled' : ''} ${addedToCart ? 'added' : ''}`}
							onClick={handleAddToCart}
							disabled={isOutOfStock}
						>
							{addedToCart ? '✓ Added to Cart!' : isOutOfStock ? 'Out of Stock' : 'Add to Cart →'}
						</button>

						<button
							className={`pdp-like-btn ${liked ? 'liked' : ''}`}
							onClick={(e) => toggleLike(e)}
						>
							{liked ? '♥ Saved to Wishlist' : '♡ Add to Wishlist'}
						</button>

						<div className="pdp-divider" />

						{/* Details rows */}
						<div className="pdp-detail-rows">
							<div className="pdp-detail-row">
								<span>Category</span>
								<span>{product.productType}</span>
							</div>
							<div className="pdp-detail-row">
								<span>Brand</span>
								<span>{brandLabel[product.productBrand]}</span>
							</div>
							<div className="pdp-detail-row">
								<span>Status</span>
								<span style={{ color: status.color }}>{status.label}</span>
							</div>
							<div className="pdp-detail-row">
								<span>Rating</span>
								<span>★ {product.rating}</span>
							</div>
							<div className="pdp-detail-row">
								<span>Liked by</span>
								<span>{product.productLikes} people</span>
							</div>
						</div>

						<div className="pdp-divider" />

						{/* Guarantees */}
						<div className="pdp-guarantees">
							<div className="pdp-guarantee-item">
								<span className="pdp-g-icon">🔒</span>
								<span>Secure Checkout</span>
							</div>
							<div className="pdp-guarantee-item">
								<span className="pdp-g-icon">🚚</span>
								<span>Free Shipping over $50</span>
							</div>
							<div className="pdp-guarantee-item">
								<span className="pdp-g-icon">↩</span>
								<span>30-Day Returns</span>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
};

export default withLayoutBasic(ProductDetail);
