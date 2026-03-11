export interface ProgramData {
	id: string;
	type: string;
	name: string;
	duration: number;
	rating: number;
	price: number;
	gradient: string;
}

// Wired to backend — data comes from GraphQL (GET_PROGRAMS)
export const allPrograms: ProgramData[] = [];
