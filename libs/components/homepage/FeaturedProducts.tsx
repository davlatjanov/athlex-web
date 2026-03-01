import React from 'react';
import { Stack, Box } from '@mui/material';
import Link from 'next/link';

const products = [
	{
		id: '1',
		name: 'Whey Protein Gold Standard',
		brand: 'OPTIMUM',
		type: 'SUPPLEMENT',
		price: 59,
		stock: 'In Stock',
		gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		badge: '⭐ Best Seller',
	},
	{
		id: '2',
		name: 'Pro Resistance Band Set',
		brand: 'NIKE',
		type: 'EQUIPMENT',
		price: 35,
		stock: 'In Stock',
		gradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
		badge: '🔥 Popular',
	},
	{
		id: '3',
		name: 'Pre-Workout Ignite X',
		brand: 'MUSCLETECH',
		type: 'SUPPLEMENT',
		price: 44,
		stock: 'Low Stock',
		gradient: 'linear-gradient(135deg, #1a0a0a 0%, #2d1515 100%)',
		badge: '⚡ New',
	},
	{
		id: '4',
		name: 'Performance Running Shoes',
		brand: 'ADIDAS',
		type: 'WEARABLE',
		price: 129,
		stock: 'In Stock',
		gradient: 'linear-gradient(135deg, #0a1a0a 0%, #1a2d1a 100%)',
		badge: '🏆 Top Rated',
	},
];

const FeaturedProducts = () => {
	return (
		<Stack className={'featured-products'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'section-header'}>
					<span className={'section-label'}>SHOP</span>
					<h2 className={'section-title'}>FEATURED PRODUCTS</h2>
					<Link href={'/products'}>
						<span className={'see-all'}>See All Products →</span>
					</Link>
				</Box>
				<Box component={'div'} className={'products-grid'}>
					{products.map((product) => (
						<Box key={product.id} className={'product-card'}>
							<div className={'product-img'} style={{ background: product.gradient }}>
								<span className={'product-badge'}>{product.badge}</span>
								<span className={'product-type-tag'}>{product.type}</span>
							</div>
							<div className={'product-info'}>
								<span className={'product-brand'}>{product.brand}</span>
								<strong className={'product-name'}>{product.name}</strong>
								<div className={'product-footer'}>
									<span className={'product-price'}>${product.price}</span>
									<span className={`stock-tag ${product.stock === 'Low Stock' ? 'low' : ''}`}>{product.stock}</span>
								</div>
								<button className={'btn-add-cart'}>Add to Cart</button>
							</div>
						</Box>
					))}
				</Box>
			</Stack>
		</Stack>
	);
};

export default FeaturedProducts;
