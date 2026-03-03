import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { allProducts, PRODUCT_TYPES, PRODUCT_BRANDS, Product, ProductBrand, ProductType } from '../../libs/data/products';
import { useLike } from '../../libs/hooks/useInteractions';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PRICE_FILTERS = [
	{ label: 'All Prices', value: 'all' },
	{ label: 'Under $30', value: 'under30' },
	{ label: '$30 – $60', value: '30to60' },
	{ label: '$60 – $150', value: '60to150' },
	{ label: '$150+', value: '150plus' },
];

const SORT_OPTIONS = [
	{ label: 'Most Popular', value: 'popular' },
	{ label: 'Top Rated', value: 'rating' },
	{ label: 'Price: Low → High', value: 'price-asc' },
	{ label: 'Price: High → Low', value: 'price-desc' },
	{ label: 'Most Liked', value: 'liked' },
];

const brandLabel: Record<string, string> = {
	NONE: 'Generic', OPTIMUM: 'Optimum', MUSCLETECH: 'MuscleTech',
	NUTREX: 'Nutrex', MYPROTEIN: 'MyProtein', NIKE: 'Nike', ADIDAS: 'Adidas',
};

const statusColor: Record<string, string> = {
	ACTIVE: '#4ecd64',
	STOPPED: '#FFB800',
	OUT_OF_STOCK: '#E92C28',
};

const PER_PAGE = 12;

const ProductCard = ({ product }: { product: Product }) => {
	const { liked, toggle: toggleLike } = useLike('programs', product.id);
	const isOutOfStock = product.productStatus === 'OUT_OF_STOCK';

	return (
		<div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
			<Link href={`/products/${product.id}`} className="pc-link">
				<div className="pc-visual" style={{ background: product.gradient }}>
					<div className="pc-visual-overlay" />
					<div className="pc-type-badge">{product.productType}</div>
					<button
						className={`pc-like-btn ${liked ? 'liked' : ''}`}
						onClick={toggleLike}
					>
						{liked ? '♥' : '♡'}
					</button>
					<div className="pc-icon">{product.icon}</div>
					{isOutOfStock && <div className="pc-oos-overlay">OUT OF STOCK</div>}
				</div>
				<div className="pc-body">
					<div className="pc-brand">{brandLabel[product.productBrand] ?? product.productBrand}</div>
					<h3 className="pc-name">{product.productName}</h3>
					<div className="pc-rating">
						<span className="pc-stars">★ {product.rating}</span>
						<span className="pc-views">{product.productViews >= 1000 ? `${(product.productViews / 1000).toFixed(1)}K` : product.productViews} views</span>
					</div>
					<div className="pc-footer">
						<span className="pc-price">${product.productPrice.toFixed(2)}</span>
						<button className="pc-btn" disabled={isOutOfStock}>
							{isOutOfStock ? 'Out of Stock' : 'Shop Now →'}
						</button>
					</div>
				</div>
			</Link>
		</div>
	);
};

const ProductsPage: NextPage = () => {
	const device = useDeviceDetect();
	const [selectedTypes, setSelectedTypes] = useState<ProductType[]>([]);
	const [selectedBrands, setSelectedBrands] = useState<ProductBrand[]>([]);
	const [selectedPrice, setSelectedPrice] = useState('all');
	const [showInStockOnly, setShowInStockOnly] = useState(false);
	const [sortBy, setSortBy] = useState('popular');
	const [page, setPage] = useState(1);

	const toggleType = (t: ProductType) => {
		setSelectedTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
		setPage(1);
	};

	const toggleBrand = (b: ProductBrand) => {
		setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
		setPage(1);
	};

	const filtered = useMemo(() => {
		let list = [...allProducts];

		if (selectedTypes.length > 0) list = list.filter((p) => selectedTypes.includes(p.productType));
		if (selectedBrands.length > 0) list = list.filter((p) => selectedBrands.includes(p.productBrand));
		if (showInStockOnly) list = list.filter((p) => p.productStatus === 'ACTIVE');

		if (selectedPrice === 'under30') list = list.filter((p) => p.productPrice < 30);
		else if (selectedPrice === '30to60') list = list.filter((p) => p.productPrice >= 30 && p.productPrice <= 60);
		else if (selectedPrice === '60to150') list = list.filter((p) => p.productPrice > 60 && p.productPrice <= 150);
		else if (selectedPrice === '150plus') list = list.filter((p) => p.productPrice > 150);

		if (sortBy === 'popular') list.sort((a, b) => b.productViews - a.productViews);
		else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
		else if (sortBy === 'price-asc') list.sort((a, b) => a.productPrice - b.productPrice);
		else if (sortBy === 'price-desc') list.sort((a, b) => b.productPrice - a.productPrice);
		else if (sortBy === 'liked') list.sort((a, b) => b.productLikes - a.productLikes);

		return list;
	}, [selectedTypes, selectedBrands, selectedPrice, showInStockOnly, sortBy]);

	const totalPages = Math.ceil(filtered.length / PER_PAGE);
	const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

	if (device === 'mobile') {
		return <div id="products-page"><p style={{ color: '#fff', padding: 40 }}>Mobile view coming soon.</p></div>;
	}

	return (
		<div id="products-page">
			<div className="shop-container">

				{/* ── SIDEBAR ───────────────────────────────────────────── */}
				<aside className="shop-sidebar">
					<div className="shop-filter-block">
						<h4 className="shop-filter-title">Category</h4>
						<div className="shop-chip-group">
							<button
								className={`shop-chip ${selectedTypes.length === 0 ? 'active' : ''}`}
								onClick={() => { setSelectedTypes([]); setPage(1); }}
							>
								All
							</button>
							{PRODUCT_TYPES.map((t) => (
								<button
									key={t}
									className={`shop-chip ${selectedTypes.includes(t) ? 'active' : ''}`}
									onClick={() => toggleType(t)}
								>
									{t}
								</button>
							))}
						</div>
					</div>

					<div className="shop-filter-block">
						<h4 className="shop-filter-title">Brand</h4>
						<div className="shop-chip-group">
							<button
								className={`shop-chip ${selectedBrands.length === 0 ? 'active' : ''}`}
								onClick={() => { setSelectedBrands([]); setPage(1); }}
							>
								All Brands
							</button>
							{PRODUCT_BRANDS.map((b) => (
								<button
									key={b}
									className={`shop-chip ${selectedBrands.includes(b) ? 'active' : ''}`}
									onClick={() => toggleBrand(b)}
								>
									{brandLabel[b] ?? b}
								</button>
							))}
						</div>
					</div>

					<div className="shop-filter-block">
						<h4 className="shop-filter-title">Price</h4>
						<div className="shop-radio-group">
							{PRICE_FILTERS.map((pf) => (
								<label key={pf.value} className={`shop-radio-item ${selectedPrice === pf.value ? 'active' : ''}`}>
									<input
										type="radio"
										name="price"
										value={pf.value}
										checked={selectedPrice === pf.value}
										onChange={() => { setSelectedPrice(pf.value); setPage(1); }}
									/>
									{pf.label}
								</label>
							))}
						</div>
					</div>

					<div className="shop-filter-block">
						<h4 className="shop-filter-title">Availability</h4>
						<label className={`shop-toggle ${showInStockOnly ? 'on' : ''}`}>
							<input
								type="checkbox"
								checked={showInStockOnly}
								onChange={(e) => { setShowInStockOnly(e.target.checked); setPage(1); }}
							/>
							<span className="shop-toggle-track"><span className="shop-toggle-thumb" /></span>
							In Stock Only
						</label>
					</div>
				</aside>

				{/* ── MAIN ──────────────────────────────────────────────── */}
				<main className="shop-main">
					{/* Top bar */}
					<div className="shop-top-bar">
						<span className="shop-count"><strong>{filtered.length}</strong> products found</span>
						<div className="shop-sort-row">
							<span>Sort:</span>
							<div className="shop-sort-buttons">
								{SORT_OPTIONS.map((opt) => (
									<button
										key={opt.value}
										className={`shop-sort-btn ${sortBy === opt.value ? 'active' : ''}`}
										onClick={() => { setSortBy(opt.value); setPage(1); }}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Grid */}
					{paginated.length === 0 ? (
						<div className="shop-empty">
							<span>🛒</span>
							<p>No products match your filters.</p>
							<button onClick={() => { setSelectedTypes([]); setSelectedBrands([]); setSelectedPrice('all'); setShowInStockOnly(false); }}>
								Clear Filters
							</button>
						</div>
					) : (
						<div className="shop-grid">
							{paginated.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					)}

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="shop-pagination">
							<button className="shop-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
								← Prev
							</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button
									key={p}
									className={`shop-page-btn ${page === p ? 'active' : ''}`}
									onClick={() => setPage(p)}
								>
									{p}
								</button>
							))}
							<button className="shop-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
								Next →
							</button>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default withLayoutBasic(ProductsPage);
