import { ProgramLevel, ProgramStatus, ProgramType } from '../../enums/training-program.enum';
import { TotalCounter } from '../member/member';

export interface MemberData {
	_id: string;
	memberNick: string;
	memberImage?: string;
	memberType?: string;
}

export interface Exercise {
	_id: string;
	exerciseName: string;
	exerciseDesc: string;
	exerciseVideo?: string;
	exerciseGif?: string;
	exerciseImage?: string;
	primaryMuscle: string;
	secondaryMuscles: string[];
	sets: number;
	reps: string;
	restTime: number;
	tempo?: string;
	instructions: string[];
	tips: string[];
	equipment: string[];
	difficulty: string;
	orderInWorkout: number;
	workoutId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Workout {
	_id: string;
	workoutName: string;
	workoutDesc?: string;
	workoutDay: number;
	workoutDuration: number;
	bodyParts: string[];
	isRestDay: boolean;
	exercises?: Exercise[];
	programId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Program {
	_id: string;
	programName: string;
	programDesc: string;
	programImages: string[];
	programVideo?: string;
	programType: ProgramType;
	programLevel: ProgramLevel;
	programStatus: ProgramStatus;
	programPrice: number;
	programDuration: number;
	programStartDate: Date;
	programEndDate: Date;
	programViews: number;
	programLikes: number;
	programMembers: number;
	programComments: number;
	programRank: number;
	workouts?: Workout[];
	programTags: string[];
	targetAudience: string[];
	requirements: string[];
	memberId: string;
	memberData?: MemberData;
	createdAt: Date;
	updatedAt: Date;
}

export interface Programs {
	list: Program[];
	metaCounter: TotalCounter[];
}
