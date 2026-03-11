import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation SignUp($input: MemberInput!) {
		signUp(input: $input) {
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
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
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
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
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
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        PROGRAM         *
 *************************/

export const CREATE_PROGRAM = gql`
	mutation CreateProgram($input: ProgramInput!) {
		createProgram(input: $input) {
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
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_PROGRAM = gql`
	mutation UpdateProgram($programId: String!, $input: ProgramUpdate!) {
		updateProgram(programId: $programId, input: $input) {
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
			createdAt
			updatedAt
		}
	}
`;

export const DELETE_PROGRAM = gql`
	mutation DeleteProgram($programId: String!) {
		deleteProgram(programId: $programId) {
			_id
			programName
			programStatus
		}
	}
`;

export const JOIN_PROGRAM = gql`
	mutation JoinProgram($programId: String!) {
		joinProgram(programId: $programId) {
			_id
			memberId
			programId
			createdAt
		}
	}
`;

export const LEAVE_PROGRAM = gql`
	mutation LeaveProgram($programId: String!) {
		leaveProgram(programId: $programId) {
			_id
			memberId
			programId
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
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

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
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

export const DELETE_COMMENT = gql`
	mutation DeleteComment($commentId: String!) {
		deleteComment(commentId: $commentId) {
			_id
			commentContent
			memberId
		}
	}
`;

/**************************
 *          LIKE          *
 *************************/

export const LIKE_TARGET_ITEM = gql`
	mutation LikeTargetItem($input: LikeInput!) {
		likeTargetItem(input: $input) {
			_id
			likeGroup
			likeRefId
			memberId
			createdAt
		}
	}
`;

/**************************
 *        BOOKMARK        *
 *************************/

export const TOGGLE_BOOKMARK = gql`
	mutation ToggleBookmark($input: BookmarkInput!) {
		toggleBookmark(input: $input) {
			_id
			bookmarkGroup
			bookmarkRefId
			memberId
			createdAt
		}
	}
`;

/**************************
 *         FOLLOW         *
 *************************/

export const FOLLOW_MEMBER = gql`
	mutation FollowMember($input: FollowInput!) {
		followMember(input: $input) {
			_id
			followingId
			followerId
			createdAt
		}
	}
`;

/**************************
 *        FEEDBACK        *
 *************************/

export const CREATE_FEEDBACK = gql`
	mutation CreateFeedback($input: FeedbackInput!) {
		createFeedback(input: $input) {
			_id
			feedbackContent
			feedbackScale
			feedbackGroup
			feedbackRefId
			memberId
			createdAt
		}
	}
`;

export const UPDATE_FEEDBACK = gql`
	mutation UpdateFeedback($input: FeedbackUpdate!) {
		updateFeedback(input: $input) {
			_id
			feedbackContent
			feedbackScale
			feedbackGroup
			feedbackRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const DELETE_FEEDBACK = gql`
	mutation DeleteFeedback($feedbackId: String!) {
		deleteFeedback(feedbackId: $feedbackId) {
			_id
			feedbackContent
			memberId
		}
	}
`;

/**************************
 *     PROGRESS RESULT    *
 *************************/

export const CREATE_PROGRESS_RESULT = gql`
	mutation CreateProgressResult($input: ProgressResultInput!) {
		createProgressResult(input: $input) {
			_id
			memberId
			programId
			trainerId
			images
			content
			status
			createdAt
		}
	}
`;

export const UPDATE_PROGRESS_RESULT = gql`
	mutation UpdateProgressResult($input: ProgressResultUpdate!) {
		updateProgressResult(input: $input) {
			_id
			content
			images
			status
			updatedAt
		}
	}
`;

export const DELETE_PROGRESS_RESULT = gql`
	mutation DeleteProgressResult($progressResultId: String!) {
		deleteProgressResult(progressResultId: $progressResultId) {
			_id
			status
		}
	}
`;

/**************************
 *           AI           *
 *************************/

export const CHAT_WITH_AI = gql`
	mutation ChatWithAI($input: ChatAIInput!) {
		chatWithAI(input: $input) {
			answer
			conversationId
			timestamp
		}
	}
`;
