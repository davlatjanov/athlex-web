export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;

const thisYear = new Date().getFullYear();

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const topProgramRank = 2;

/** @deprecated Use topProgramRank. Kept for legacy component compatibility. */
export const topPropertyRank = topProgramRank;

/** @deprecated Legacy stubs — kept so HeaderFilter and Filter still compile. */
export const propertySquare = [0, 50, 100, 150, 200, 250, 300, 400, 500];
export const propertyYears = [2020, 2021, 2022, 2023, 2024, 2025];

