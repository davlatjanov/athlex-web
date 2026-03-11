export interface Trainer {
	id: string;
	name: string;
	nickname: string;
	specialty: string;
	secondarySpecialty?: string;
	level: string;
	rating: number;
	clients: number;
	programs: number;
	experience: string;
	bio: string;
	image: string;
	gradient: string;
	certifications: string[];
}

// Wired to backend — data comes from GraphQL (GET_TRAINERS / GET_MEMBER)
export const allTrainers: Trainer[] = [];
