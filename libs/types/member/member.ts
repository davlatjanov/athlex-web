import { MemberAuthType, MemberPlan, MemberStatus, MemberType } from '../../enums/member.enum';

export interface Member {
	_id: string;
	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: MemberAuthType;
	memberPhone: string;
	memberEmail?: string;
	memberPlan?: MemberPlan;
	memberPrograms: number;
	memberNick: string;
	memberPassword?: string;
	memberFullName?: string;
	memberImage?: string;
	memberDesc?: string;
	memberFollowers: number;
	memberFollowings: number;
	memberPoints: number;
	memberLikes: number;
	memberViews: number;
	memberComments: number;
	memberRank: number;
	memberWarnings: number;
	lastLoginAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	accessToken?: string;
	/** from aggregation **/
	meFollowed?: { myFollowing: boolean }[];
}

export interface Members {
	list: Member[];
	metaCounter: TotalCounter[];
}

export interface TotalCounter {
	total?: number;
}
