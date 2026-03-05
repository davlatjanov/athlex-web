import { ProductBrand, ProductStatus, ProductType } from '../../enums/product.enum';
import { TotalCounter } from '../member/member';

export interface Product {
	_id: string;
	productName: string;
	productBrand: ProductBrand;
	productStatus: ProductStatus;
	productType: ProductType;
	productPrice: number;
	productStock: number;
	productImages: string[];
	productDesc: string;
	productViews: number;
	productLikes: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}
