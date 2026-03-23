import { Member } from '../member/member';

export enum ProgressResultStatus {
	ACTIVE = 'ACTIVE',
	DELETED = 'DELETED',
}

export interface ProgressResult {
	_id: string;
	memberId: string;
	programId?: string;
	trainerId?: string;
	images: string[];
	content: string;
	status: ProgressResultStatus;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	memberData?: Member;
}

export interface ProgressResults {
	list: ProgressResult[];
	metaCounter: { total: number }[];
}

export interface ProgressResultInput {
	programId?: string;
	trainerId?: string;
	images?: string[];
	content: string;
}

export interface ProgressResultInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: string;
	search?: {
		programId?: string;
		memberId?: string;
		trainerId?: string;
		status?: ProgressResultStatus;
	};
}
