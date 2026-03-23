import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberEmail: '',
	memberPlan: '',
	memberPrograms: 0,
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberDesc: '',
	memberFollowers: 0,
	memberFollowings: 0,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberComments: 0,
	memberRank: 0,
	memberWarnings: 0,
});

//@ts-ignore
export const socketVar = makeVar<WebSocket>();
