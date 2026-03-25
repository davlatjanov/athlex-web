import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_MEMBER = gql`
	query GetMember($memberId: String!) {
		getMember(memberId: $memberId) {
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
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const GET_MEMBERS = gql`
	query GetMembers($input: MembersInquiry!) {
		getMembers(input: $input) {
			list {
				_id
				memberType
				memberNick
				memberFullName
				memberImage
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_TRAINERS = gql`
	query GetTrainers($input: TrainersInquiry!) {
		getTrainers(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberNick
				memberFullName
				memberImage
				memberDesc
				memberPrograms
				memberFollowers
				memberPoints
				memberLikes
				memberViews
				createdAt
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

export const GET_PROGRAMS = gql`
	query GetPrograms($input: ProgramInquiry!) {
		getPrograms(input: $input) {
			list {
				_id
				programName
				programDesc
				programImages
				programVideo
				programType
				programLevel
				programStatus
				programPrice
				programDuration
				programStartDate
				programEndDate
				programViews
				programLikes
				programMembers
				programComments
				programRank
				programTags
				meLiked
				memberId
				memberData {
					_id
					memberNick
					memberImage
					memberType
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

export const GET_ONE_PROGRAM = gql`
	query GetOneProgram($programId: String!) {
		getOneProgram(programId: $programId) {
			_id
			programName
			programDesc
			programImages
			programVideo
			programType
			programLevel
			programStatus
			programPrice
			programDuration
			programStartDate
			programEndDate
			programViews
			programLikes
			programMembers
			programComments
			programRank
			programTags
			targetAudience
			requirements
			memberId
			memberData {
				_id
				memberNick
				memberImage
				memberType
			}
			createdAt
			updatedAt
		}
	}
`;

export const GET_ONE_PROGRAM_WITH_MEMBER = gql`
	query GetOneProgramWithMember($programId: String!) {
		getOneProgramWithMember(programId: $programId) {
			_id
			programName
			programDesc
			programImages
			programVideo
			programType
			programLevel
			programStatus
			programPrice
			programDuration
			programStartDate
			programEndDate
			programViews
			programLikes
			programMembers
			programComments
			programRank
			programTags
			targetAudience
			requirements
			memberId
			memberData {
				_id
				memberNick
				memberImage
				memberType
			}
			createdAt
			updatedAt
		}
	}
`;

export const GET_PROGRAM_WITH_WORKOUTS = gql`
	query GetProgramWithWorkouts($programId: String!) {
		getProgramWithWorkouts(programId: $programId) {
			_id
			programName
			programDesc
			programImages
			programType
			programLevel
			programStatus
			programDuration
			workouts {
				_id
				workoutName
				workoutDesc
				workoutDay
				workoutDuration
				bodyParts
				isRestDay
				exercises {
					_id
					exerciseName
					exerciseDesc
					exerciseVideo
					exerciseGif
					exerciseImage
					primaryMuscle
					secondaryMuscles
					sets
					reps
					restTime
					instructions
					tips
					equipment
					difficulty
					orderInWorkout
				}
				createdAt
			}
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const GET_MY_PROGRAMS = gql`
	query GetMyPrograms($input: ProgramInquiry!) {
		getMyPrograms(input: $input) {
			list {
				_id
				programName
				programDesc
				programImages
				programType
				programLevel
				programStatus
				programPrice
				programDuration
				programStartDate
				programEndDate
				programViews
				programLikes
				programMembers
				programComments
				programRank
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_JOINED_PROGRAMS = gql`
	query GetJoinedPrograms($input: ProgramInquiry!) {
		getJoinedPrograms(input: $input) {
			list {
				_id
				programName
				programDesc
				programImages
				programType
				programLevel
				programStatus
				programPrice
				programDuration
				programStartDate
				programEndDate
				programViews
				programLikes
				programComments
				programMembers
				programRank
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
 *         PRODUCT        *
 *************************/

export const GET_PRODUCTS = gql`
	query GetProducts($input: ProductsInquiry!) {
		getProducts(input: $input) {
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

export const GET_ONE_PRODUCT = gql`
	query GetOneProduct($productId: String!) {
		getOneProduct(productId: $productId) {
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

/**************************
 *         COMMENT        *
 *************************/

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
				memberData {
					_id
					memberNick
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW         *
 *************************/

export const GET_FOLLOWERS = gql`
	query GetFollowers($memberId: String!, $input: FollowInquiry!) {
		getFollowers(memberId: $memberId, input: $input) {
			list {
				_id
				memberNick
				memberImage
				memberType
				memberFollowers
				memberFollowings
				memberLikes
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FOLLOWINGS = gql`
	query GetFollowings($memberId: String!, $input: FollowInquiry!) {
		getFollowings(memberId: $memberId, input: $input) {
			list {
				_id
				memberNick
				memberImage
				memberType
				memberFollowers
				memberFollowings
				memberLikes
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        BOOKMARK        *
 *************************/

export const GET_MY_BOOKMARKS = gql`
	query GetMyBookmarks($input: BookmarkInquiry!) {
		getMyBookmarks(input: $input) {
			list {
				_id
				bookmarkRefId
				bookmarkGroup
				createdAt
				itemData {
					_id
					name
					images
					price
					type
					level
					views
					likes
					members
					duration
					rank
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        FEEDBACK        *
 *************************/

export const GET_FEEDBACKS = gql`
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
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const CHECK_IF_USER_LIKED = gql`
	query CheckIfUserLiked($likeRefId: String!) {
		checkIfUserLiked(likeRefId: $likeRefId)
	}
`;

/**************************
 *     PROGRESS RESULT    *
 *************************/

export const GET_PROGRESS_RESULTS = gql`
	query GetProgressResults($input: ProgressResultInquiry!) {
		getProgressResults(input: $input) {
			list {
				_id
				memberId
				programId
				trainerId
				images
				content
				status
				memberData {
					_id
					memberNick
					memberImage
					memberType
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

export const GET_MY_PROGRESS_RESULTS = gql`
	query GetMyProgressResults($input: ProgressResultInquiry!) {
		getMyProgressResults(input: $input) {
			list {
				_id
				memberId
				programId
				trainerId
				images
				content
				status
				memberData {
					_id
					memberNick
					memberImage
					memberType
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
 *     WORKOUT/EXERCISE   *
 *************************/

export const GET_EXERCISES_BY_WORKOUT = gql`
	query GetExercisesByWorkout($workoutId: String!) {
		getExercisesByWorkout(workoutId: $workoutId) {
			_id
			exerciseName
			exerciseDesc
			exerciseImage
			exerciseVideo
			exerciseGif
			primaryMuscle
			secondaryMuscles
			sets
			reps
			restTime
			tempo
			equipment
			difficulty
			orderInWorkout
			instructions
			tips
			workoutId
			createdAt
		}
	}
`;

export const GET_WORKOUTS_BY_PROGRAM = gql`
	query GetWorkoutsByProgram($programId: String!) {
		getWorkoutsByProgram(programId: $programId) {
			_id
			workoutName
			workoutDesc
			workoutDay
			workoutDuration
			bodyParts
			isRestDay
			exercises {
				_id
				exerciseName
				exerciseDesc
				primaryMuscle
				secondaryMuscles
				sets
				reps
				restTime
				equipment
				difficulty
				orderInWorkout
			}
			createdAt
		}
	}
`;

/**************************
 *      NOTIFICATION      *
 *************************/

export const GET_MY_NOTIFICATIONS = gql`
	query GetMyNotifications($input: NotificationsInquiry!) {
		getMyNotifications(input: $input) {
			list {
				_id
				notificationType
				notificationTitle
				notificationMessage
				notificationLink
				isRead
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
	query GetUnreadNotificationCount {
		getUnreadNotificationCount
	}
`;

/**************************
 *         ORDERS         *
 *************************/

export const GET_MY_ORDERS = gql`
	query GetMyOrders($input: OrdersInquiry!) {
		getMyOrders(input: $input) {
			list {
				_id
				memberId
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

export const GET_ONE_ORDER = gql`
	query GetOneOrder($orderId: String!) {
		getOneOrder(orderId: $orderId) {
			_id
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
		}
	}
`;

/**************************
 *           AI           *
 *************************/

export const ASK_AI = gql`
	query AskAI($input: AskAIInput!) {
		askAI(input: $input) {
			answer
			conversationId
			timestamp
		}
	}
`;

export const GET_MY_CONVERSATIONS = gql`
	query GetMyConversations {
		getMyConversations {
			_id
			title
			updatedAt
		}
	}
`;

export const GET_MY_STUDENTS = gql`
	query GetMyStudents($page: Float, $limit: Float) {
		getMyStudents(page: $page, limit: $limit) {
			list {
				memberId
				memberNick
				memberImage
				memberFullName
				programId
				programName
				enrolledAt
			}
			total
		}
	}
`;

export const GET_CONVERSATION = gql`
	query GetConversation($conversationId: String!) {
		getConversation(conversationId: $conversationId) {
			_id
			title
			messages {
				role
				content
			}
			createdAt
			updatedAt
		}
	}
`;
