import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { T } from '../../types/common';

const typeGradients: Record<string, string> = {
	SUPPLEMENT: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
	EQUIPMENT: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
	APPAREL: 'linear-gradient(135deg, #1a0a0a 0%, #2d1515 100%)',
	WEARABLE: 'linear-gradient(135deg, #0a1a0a 0%, #1a2d1a 100%)',
	NUTRITION: 'linear-gradient(135deg, #1a1a0a 0%, #2d2d15 100%)',
	ACCESSORY: 'linear-gradient(135deg, #0a0a1a 0%, #15152d 100%)',
};

const FeaturedProducts = () => {
	const [products, setProducts] = useState<any[]>([]);

	useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 4, sort: 'productViews', direction: 'DESC' },
		},
		onCompleted: (data: T) => setProducts(data?.getProducts?.list ?? []),
	});

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
					{products.map((product) => {
						const stockLabel = product.productStock === 0
							? 'Out of Stock'
							: product.productStock < 5
								? 'Low Stock'
								: 'In Stock';
						return (
							<Link key={product._id} href={`/products/${product._id}`}>
								<Box className={'product-card'}>
									<div
										className={'product-img'}
										style={{ background: typeGradients[product.productType] ?? typeGradients['SUPPLEMENT'] }}
									>
										{product.productImages?.[0] && (
											<img
												src={product.productImages[0]}
												alt={product.productName}
												className={'fp-img'}
												onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
											/>
										)}
										<div className={'fp-overlay'} />
										<span className={'product-type-tag'}>{product.productType}</span>
									</div>
									<div className={'product-info'}>
										{product.productBrand && (
											<span className={'product-brand'}>{product.productBrand}</span>
										)}
										<strong className={'product-name'}>{product.productName}</strong>
										<div className={'product-footer'}>
											<span className={'product-price'}>${product.productPrice}</span>
											<span className={`stock-tag ${stockLabel === 'Low Stock' ? 'low' : stockLabel === 'Out of Stock' ? 'out' : ''}`}>
												{stockLabel}
											</span>
										</div>
										<button className={'btn-add-cart'}>View Product</button>
									</div>
								</Box>
							</Link>
						);
					})}
				</Box>
			</Stack>
		</Stack>
	);
};

export default FeaturedProducts;
