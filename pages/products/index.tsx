import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { ProductCardSkeleton } from '../../libs/components/common/Skeleton';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { Product } from '../../libs/types/product/product';
import { ProductType, ProductBrand } from '../../libs/enums/product.enum';
import { useLike } from '../../libs/hooks/useInteractions';
import { T } from '../../libs/types/common';
import { useCart } from '../../libs/context/CartContext';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PRODUCT_TYPES = Object.values(ProductType);
const PRODUCT_BRANDS = Object.values(ProductBrand).filter((b) => b !== ProductBrand.NONE);

const PRICE_FILTERS = [
	{ label: 'All Prices', value: 'all' },
	{ label: 'Under $30', value: 'under30' },
	{ label: '$30 – $60', value: '30to60' },
	{ label: '$60 – $150', value: '60to150' },
	{ label: '$150+', value: '150plus' },
];

const SORT_OPTIONS = [
	{ label: 'Most Popular', value: 'productViews', direction: 'DESC' },
	{ label: 'Most Liked', value: 'productLikes', direction: 'DESC' },
	{ label: 'Newest', value: 'createdAt', direction: 'DESC' },
];

const brandLabel: Record<string, string> = {
	NONE: 'Generic', OPTIMUM: 'Optimum', MUSCLETECH: 'MuscleTech',
	NUTREX: 'Nutrex', MYPROTEIN: 'MyProtein', NIKE: 'Nike', ADIDAS: 'Adidas',
};

const statusColor: Record<string, string> = {
	ACTIVE: '#22C55E',
	STOPPED: '#FFB800',
	OUT_OF_STOCK: '#E92C28',
};

const PER_PAGE = 9;

const ProductCard = ({ product }: { product: Product }) => {
	const { liked, toggle: toggleLike } = useLike('programs', product._id);
	const { addItem } = useCart();
	const [added, setAdded] = useState(false);
	const isOutOfStock = product.productStatus === 'OUT_OF_STOCK';
	const image = product.productImages?.[0];

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		addItem({
			productId: product._id,
			productName: product.productName,
			productImage: image ?? '',
			productPrice: product.productPrice,
		});
		setAdded(true);
		setTimeout(() => setAdded(false), 1500);
	};

	return (
		<div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
			<Link href={`/products/${product._id}`} className="pc-link">
				<div className="pc-visual">
					{image && (
						<img
							src={image}
							alt={product.productName}
							className="pc-img"
							onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
						/>
					)}
					<div className="pc-visual-overlay" />
					<div className="pc-type-badge">{product.productType}</div>
					<button className={`pc-like-btn ${liked ? 'liked' : ''}`} onClick={toggleLike}>
						{liked ? '♥' : '♡'}
					</button>
					{isOutOfStock && <div className="pc-oos-overlay">OUT OF STOCK</div>}
					<div className="pc-status-dot" style={{ background: statusColor[product.productStatus] }} />
				</div>
				<div className="pc-body">
					<div className="pc-brand">{brandLabel[product.productBrand] ?? product.productBrand}</div>
					<h3 className="pc-name">{product.productName}</h3>
					<div className="pc-views">
						{product.productViews >= 1000 ? `${(product.productViews / 1000).toFixed(1)}K` : product.productViews} views · ♥ {product.productLikes}
					</div>
					<div className="pc-footer">
						<span className="pc-price">${product.productPrice.toFixed(2)}</span>
						<button className="pc-btn" disabled={isOutOfStock} onClick={isOutOfStock ? undefined : handleAddToCart}>
							{isOutOfStock ? 'Out of Stock' : added ? '✓ Added' : 'Add to Cart'}
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
	const [sortIdx, setSortIdx] = useState(0);
	const [page, setPage] = useState(1);
	const [allProducts, setAllProducts] = useState<Product[]>([]);
	const [searchInput, setSearchInput] = useState('');
	const [searchText, setSearchText] = useState('');

	const sort = SORT_OPTIONS[sortIdx];

	const { loading } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 100,
				sort: sort.value,
				direction: sort.direction,
				...(searchText && { search: { productName: searchText } }),
			},
		},
		onCompleted: (data: T) => {
			setAllProducts(data?.getProducts?.list ?? []);
		},
	});

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setSearchText(searchInput);
		setPage(1);
	};

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
		return list;
	}, [allProducts, selectedTypes, selectedBrands, selectedPrice, showInStockOnly]);

	const totalPages = Math.ceil(filtered.length / PER_PAGE);
	const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

	if (device === 'mobile') {
		return <div id="products-page"><Head><title>Athlex | Shop</title></Head><p style={{ color: '#fff', padding: 40 }}>Mobile view coming soon.</p></div>;
	}

	return (
		<div id="products-page">
			<Head><title>Athlex | Shop</title></Head>
			<div className="shop-container">

				{/* ── SIDEBAR ─────────────────────────────────────── */}
				<aside className="shop-sidebar">
					<div className="shop-filter-block">
						<h4 className="shop-filter-title">Category</h4>
						<div className="shop-chip-group">
							<button className={`shop-chip ${selectedTypes.length === 0 ? 'active' : ''}`} onClick={() => { setSelectedTypes([]); setPage(1); }}>All</button>
							{PRODUCT_TYPES.map((t) => (
								<button key={t} className={`shop-chip ${selectedTypes.includes(t) ? 'active' : ''}`} onClick={() => toggleType(t)}>{t}</button>
							))}
						</div>
					</div>

					<div className="shop-filter-block">
						<h4 className="shop-filter-title">Brand</h4>
						<div className="shop-chip-group">
							<button className={`shop-chip ${selectedBrands.length === 0 ? 'active' : ''}`} onClick={() => { setSelectedBrands([]); setPage(1); }}>All Brands</button>
							{PRODUCT_BRANDS.map((b) => (
								<button key={b} className={`shop-chip ${selectedBrands.includes(b) ? 'active' : ''}`} onClick={() => toggleBrand(b)}>{brandLabel[b] ?? b}</button>
							))}
						</div>
					</div>

					<div className="shop-filter-block">
						<h4 className="shop-filter-title">Price</h4>
						<div className="shop-radio-group">
							{PRICE_FILTERS.map((pf) => (
								<label key={pf.value} className={`shop-radio-item ${selectedPrice === pf.value ? 'active' : ''}`}>
									<input type="radio" name="price" value={pf.value} checked={selectedPrice === pf.value} onChange={() => { setSelectedPrice(pf.value); setPage(1); }} />
									{pf.label}
								</label>
							))}
						</div>
					</div>

					<div className="shop-filter-block">
						<h4 className="shop-filter-title">Availability</h4>
						<label className={`shop-toggle ${showInStockOnly ? 'on' : ''}`}>
							<input type="checkbox" checked={showInStockOnly} onChange={(e) => { setShowInStockOnly(e.target.checked); setPage(1); }} />
							<span className="shop-toggle-track"><span className="shop-toggle-thumb" /></span>
							In Stock Only
						</label>
					</div>
				</aside>

				{/* ── MAIN ────────────────────────────────────────── */}
				<main className="shop-main">
					<form className="shop-search-bar" onSubmit={handleSearch}>
						<input
							className="shop-search-input"
							type="text"
							placeholder="Search products…"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
						/>
						{searchText && (
							<button type="button" className="shop-search-clear" onClick={() => { setSearchInput(''); setSearchText(''); setPage(1); }}>✕</button>
						)}
						<button type="submit" className="shop-search-btn">Search</button>
					</form>

					<div className="shop-top-bar">
						<span className="shop-count">
							{loading ? 'Loading…' : <><strong>{filtered.length}</strong> products found</>}
						</span>
						<div className="shop-sort-row">
							<span>Sort:</span>
							<div className="shop-sort-buttons">
								{SORT_OPTIONS.map((opt, i) => (
									<button
										key={`${opt.value}-${opt.direction}`}
										className={`shop-sort-btn ${sortIdx === i ? 'active' : ''}`}
										onClick={() => { setSortIdx(i); setPage(1); }}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					</div>

					{loading && allProducts.length === 0 ? (
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
							{[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
						</div>
					) : paginated.length === 0 ? (
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
								<ProductCard key={product._id} product={product} />
							))}
						</div>
					)}

					{totalPages > 1 && (
						<div className="shop-pagination">
							<button className="shop-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
								<button key={p} className={`shop-page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
							))}
							<button className="shop-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default withLayoutBasic(ProductsPage);
