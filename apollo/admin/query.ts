import { gql } from '@apollo/client';

/**************************
 *         ORDERS         *
 *************************/

export const GET_ALL_ORDERS_BY_ADMIN = gql`
	query GetAllOrdersByAdmin($input: OrdersInquiry!) {
		getAllOrdersByAdmin(input: $input) {
			list {
				_id
				memberId
				memberData {
					memberNick
					memberImage
				}
				items {
					productId
					productName
					productPrice
					quantity
				}
				totalAmount
				orderStatus
				shippingAddress {
					street
					city
					state
					zipCode
					country
				}
				paymentMethod
				notes
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
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
				lastLoginAt
				deletedAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        PRODUCT         *
 *************************/

export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
	query GetAllProductsByAdmin($input: ProductsInquiry!) {
		getAllProductsByAdmin(input: $input) {
			list {
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
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        PROGRAM         *
 *************************/

export const GET_ALL_PROGRAMS_BY_ADMIN = gql`
	query GetAllProgramsByAdmin($input: ProgramInquiry!) {
		getAllProgramsByAdmin(input: $input) {
			list {
				_id
				programName
				programType
				programLevel
				programStatus
				programPrice
				programDuration
				programViews
				programLikes
				programMembers
				programComments
				programRank
				memberId
				memberData {
					_id
					memberNick
					memberImage
				}
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

/**************************
 *        FEEDBACK        *
 *************************/

export const GET_FEEDBACKS_BY_ADMIN = gql`
	query GetFeedbacks($input: FeedbackInquiry!) {
		getFeedbacks(input: $input) {
			list {
				_id
				feedbackContent
				feedbackScale
				feedbackGroup
				feedbackRefId
				memberId
				memberData {
					_id
					memberNick
					memberImage
				}
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_COMMENTS = gql`
	query GetComments($input: CommentInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;
