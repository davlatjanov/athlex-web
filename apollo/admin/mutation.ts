import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberEmail
			memberPlan
			memberPrograms
			memberNick
			memberFullName
			memberImage
			memberDesc
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        PRODUCT         *
 *************************/

export const CREATE_PRODUCT_BY_ADMIN = gql`
	mutation CreateProduct($input: CreateProductInput!) {
		createProduct(input: $input) {
			_id
			productName
			productBrand
			productStatus
			productType
			productPrice
			productStock
			productImages
			productDesc
			productViews
			productLikes
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_PRODUCT_BY_ADMIN = gql`
	mutation UpdateProduct($input: ProductUpdateInput!) {
		updateProduct(input: $input) {
			_id
			productName
			productBrand
			productStatus
			productType
			productPrice
			productStock
			productImages
			productDesc
			createdAt
			updatedAt
		}
	}
`;

export const DELETE_PRODUCT_BY_ADMIN = gql`
	mutation DeleteProduct($productId: String!) {
		deleteProduct(productId: $productId) {
			_id
			productName
			productStatus
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation DeleteComment($commentId: String!) {
		deleteComment(commentId: $commentId) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;
