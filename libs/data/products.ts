export interface Product {
	id: string;
	productName: string;
	productDesc: string;
	productType: string;
	productStatus: string;
	productBrand: string;
	productPrice: number;
	productStock: number;
	productViews: number;
	productLikes: number;
	rating: number;
	tags: string[];
	weight?: string;
	servings?: string;
	flavor?: string;
	image: string;
	gradient: string;
	icon: string;
}

// Wired to backend — data comes from GraphQL (GET_PRODUCTS / GET_ONE_PRODUCT)
export const allProducts: Product[] = [];
