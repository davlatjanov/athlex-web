import { Member } from '../member/member';

export enum FeedbackGroup {
	PRODUCT = 'PRODUCT',
	TRAINING_PROGRAM = 'TRAINING_PROGRAM',
	TRAINER = 'TRAINER',
}

export interface Feedback {
	_id: string;
	feedbackContent: string;
	feedbackScale: number;
	feedbackGroup: FeedbackGroup;
	feedbackRefId: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	memberData?: Member;
}

export interface Feedbacks {
	list: Feedback[];
	metaCounter: { total: number }[];
}

export interface FeedbackInput {
	feedbackRefId: string;
	feedbackGroup: FeedbackGroup;
	feedbackScale: number;
	feedbackContent: string;
}

export interface FeedbackInquiry {
	page: number;
	limit: number;
	search: {
		feedbackRefId: string;
		feedbackGroup?: FeedbackGroup;
	};
}
