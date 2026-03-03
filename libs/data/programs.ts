export interface Program {
	id: string;
	name: string;
	type: string;
	level: string;
	duration: number;
	price: number;
	views: number;
	likes: number;
	members: number;
	rating: number;
	gradient: string;
	image?: string;
	rank?: number;
}

const typeImages: Record<string, string> = {
	'MASS GAIN':      'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&fit=crop&auto=format&q=80',
	'WEIGHT LOSS':    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&fit=crop&auto=format&q=80',
	'STRENGTH':       'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&fit=crop&auto=format&q=80',
	'CARDIO':         'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=800&fit=crop&auto=format&q=80',
	'YOGA':           'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&fit=crop&auto=format&q=80',
	'FUNCTIONAL':     'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&fit=crop&auto=format&q=80',
	'REHABILITATION': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&fit=crop&auto=format&q=80',
	'MOBILITY':       'https://images.unsplash.com/photo-1518611184-3f8177f0fc6e?w=800&fit=crop&auto=format&q=80',
};

export const allPrograms: Program[] = [
	{ id: '1',  name: 'Alpha Muscle Builder',        type: 'MASS GAIN',      level: 'ADVANCED',     duration: 12, price: 49, views: 8400,  likes: 342, members: 1240, rating: 4.7, gradient: 'linear-gradient(160deg, #1a0a0a 0%, #3d1212 100%)', image: typeImages['MASS GAIN'] },
	{ id: '2',  name: 'Fat Torch Express',            type: 'WEIGHT LOSS',    level: 'BEGINNER',     duration: 8,  price: 29, views: 7200,  likes: 289, members: 980,  rating: 4.6, gradient: 'linear-gradient(160deg, #0a1a0a 0%, #123d12 100%)', image: typeImages['WEIGHT LOSS'] },
	{ id: '3',  name: 'Power Lift Fundamentals',      type: 'STRENGTH',       level: 'INTERMEDIATE', duration: 10, price: 39, views: 6100,  likes: 256, members: 870,  rating: 4.8, gradient: 'linear-gradient(160deg, #0a0a1a 0%, #12123d 100%)', image: typeImages['STRENGTH'] },
	{ id: '4',  name: 'HIIT Cardio Blast',            type: 'CARDIO',         level: 'BEGINNER',     duration: 6,  price: 19, views: 9800,  likes: 234, members: 1560, rating: 4.5, gradient: 'linear-gradient(160deg, #1a0a1a 0%, #3d123d 100%)', image: typeImages['CARDIO'] },
	{ id: '5',  name: 'Zen Flow Yoga',                type: 'YOGA',           level: 'BEGINNER',     duration: 8,  price: 25, views: 5300,  likes: 198, members: 720,  rating: 4.9, gradient: 'linear-gradient(160deg, #0a1a1a 0%, #123d3d 100%)', image: typeImages['YOGA'] },
	{ id: '6',  name: 'Athletic Movement Lab',        type: 'FUNCTIONAL',     level: 'INTERMEDIATE', duration: 10, price: 35, views: 4800,  likes: 187, members: 640,  rating: 4.6, gradient: 'linear-gradient(160deg, #1a1a0a 0%, #3d3d12 100%)', image: typeImages['FUNCTIONAL'] },
	{ id: '7',  name: 'Comeback Program',             type: 'REHABILITATION', level: 'BEGINNER',     duration: 6,  price: 45, views: 3200,  likes: 156, members: 430,  rating: 4.8, gradient: 'linear-gradient(160deg, #1a0f0a 0%, #3d2512 100%)', image: typeImages['REHABILITATION'] },
	{ id: '8',  name: 'Mobility & Flexibility Pro',   type: 'MOBILITY',       level: 'INTERMEDIATE', duration: 8,  price: 30, views: 2900,  likes: 145, members: 510,  rating: 4.7, gradient: 'linear-gradient(160deg, #0f0a1a 0%, #25123d 100%)', image: typeImages['MOBILITY'] },
	{ id: '9',  name: 'Elite Mass Protocol',          type: 'MASS GAIN',      level: 'ADVANCED',     duration: 16, price: 89, views: 18400, likes: 920, members: 3100, rating: 4.9, gradient: 'linear-gradient(160deg, #1a0505 0%, #3d0f0f 100%)', image: typeImages['MASS GAIN'],      rank: 1 },
	{ id: '10', name: 'Total Body Transformation',    type: 'FUNCTIONAL',     level: 'INTERMEDIATE', duration: 12, price: 69, views: 15200, likes: 740, members: 2600, rating: 4.8, gradient: 'linear-gradient(160deg, #050a1a 0%, #0f1a3d 100%)', image: typeImages['FUNCTIONAL'],     rank: 2 },
	{ id: '11', name: 'Olympic Strength Base',        type: 'STRENGTH',       level: 'ADVANCED',     duration: 20, price: 99, views: 13800, likes: 680, members: 2200, rating: 4.9, gradient: 'linear-gradient(160deg, #0a0a0a 0%, #1f1f1f 100%)', image: typeImages['STRENGTH'],       rank: 3 },
	{ id: '12', name: 'Rapid Fat Loss System',        type: 'WEIGHT LOSS',    level: 'INTERMEDIATE', duration: 8,  price: 49, views: 11600, likes: 590, members: 1950, rating: 4.7, gradient: 'linear-gradient(160deg, #0a1a05 0%, #1a3d0f 100%)', image: typeImages['WEIGHT LOSS'] },
	{ id: '13', name: 'Advanced Yoga & Breath',       type: 'YOGA',           level: 'ADVANCED',     duration: 10, price: 55, views: 9200,  likes: 480, members: 1400, rating: 4.8, gradient: 'linear-gradient(160deg, #05101a 0%, #0f203d 100%)', image: typeImages['YOGA'] },
	{ id: '14', name: 'Recovery & Rebuild',           type: 'REHABILITATION', level: 'BEGINNER',     duration: 6,  price: 39, views: 7800,  likes: 430, members: 1100, rating: 4.9, gradient: 'linear-gradient(160deg, #1a1005 0%, #3d250f 100%)', image: typeImages['REHABILITATION'] },
	{ id: '15', name: 'Sport Performance Edge',       type: 'FUNCTIONAL',     level: 'ADVANCED',     duration: 14, price: 75, views: 6400,  likes: 360, members: 890,  rating: 4.7, gradient: 'linear-gradient(160deg, #100a1a 0%, #1a123d 100%)', image: typeImages['FUNCTIONAL'] },
	{ id: '16', name: 'Beginner Blueprint',           type: 'STRENGTH',       level: 'BEGINNER',     duration: 8,  price: 0,  views: 14600, likes: 820, members: 4200, rating: 4.8, gradient: 'linear-gradient(160deg, #0a0a1a 0%, #151530 100%)', image: typeImages['STRENGTH'] },
	{ id: '17', name: 'The 6-Week Shred',             type: 'WEIGHT LOSS',    level: 'INTERMEDIATE', duration: 6,  price: 34, views: 12400, likes: 520, members: 2100, rating: 4.6, gradient: 'linear-gradient(160deg, #0a1a0a 0%, #1a3d1a 100%)', image: typeImages['WEIGHT LOSS'] },
	{ id: '18', name: 'Morning Mobility Flow',        type: 'MOBILITY',       level: 'BEGINNER',     duration: 4,  price: 0,  views: 8900,  likes: 760, members: 4100, rating: 4.9, gradient: 'linear-gradient(160deg, #0a1a1a 0%, #1a2d2d 100%)', image: typeImages['MOBILITY'] },
	{ id: '19', name: 'Powerlifting Prep',            type: 'STRENGTH',       level: 'ADVANCED',     duration: 16, price: 79, views: 7800,  likes: 290, members: 890,  rating: 4.7, gradient: 'linear-gradient(160deg, #1a1a0a 0%, #2d2d1a 100%)', image: typeImages['STRENGTH'] },
	{ id: '20', name: 'Cardio Kickstarter',           type: 'CARDIO',         level: 'BEGINNER',     duration: 4,  price: 15, views: 7200,  likes: 540, members: 2780, rating: 4.5, gradient: 'linear-gradient(160deg, #1a0a1a 0%, #2d1a2d 100%)', image: typeImages['CARDIO'] },
	{ id: '21', name: 'Yoga for Athletes',            type: 'YOGA',           level: 'INTERMEDIATE', duration: 6,  price: 29, views: 6500,  likes: 330, members: 1230, rating: 4.6, gradient: 'linear-gradient(160deg, #0f1a0a 0%, #1a2d12 100%)', image: typeImages['YOGA'] },
	{ id: '22', name: 'Beginner Strength Foundation', type: 'STRENGTH',       level: 'BEGINNER',     duration: 8,  price: 0,  views: 10800, likes: 680, members: 3200, rating: 4.8, gradient: 'linear-gradient(160deg, #0a0a1a 0%, #1a1a3d 100%)', image: typeImages['STRENGTH'] },
]

export const typeIcons: Record<string, string> = {
	'MASS GAIN': '💪',
	'WEIGHT LOSS': '🔥',
	STRENGTH: '🏋️',
	CARDIO: '🏃',
	YOGA: '🧘',
	FUNCTIONAL: '⚡',
	REHABILITATION: '🩺',
	MOBILITY: '🤸',
};

export const typeDescriptions: Record<string, string> = {
	'MASS GAIN':
		"Build serious, lean muscle mass with our evidence-based hypertrophy program. Designed around progressive overload principles, this program combines compound and isolation movements to maximize muscle stimulation. You'll follow a structured split routine with optimized volume and intensity progressions, complemented by a comprehensive nutrition guide that ensures you're fueled for growth.",
	'WEIGHT LOSS':
		'Torch stubborn body fat and reveal your best physique with this metabolically optimized fat-loss program. Combining strategic HIIT sessions, strength training, and active recovery, you will create a significant caloric deficit while preserving hard-earned muscle. Every week is carefully programmed to prevent adaptation plateaus and keep your metabolism running hot.',
	STRENGTH:
		"Develop raw, functional strength through a scientifically structured program. Built around the fundamental compound movements — squat, deadlift, bench press, and overhead press — this program uses periodization to drive continuous strength gains. You'll learn proper technique, master progressive overload, and develop the neural efficiency needed for elite performance.",
	CARDIO:
		'Elevate your cardiovascular fitness to elite levels with varied training protocols designed to build aerobic base, lactate threshold, and VO2 max. This program progresses from foundational steady-state work to high-intensity intervals, helping you become a more efficient, powerful athlete across any sport or activity.',
	YOGA:
		'Deepen your yoga practice with a thoughtfully sequenced program that integrates asana, pranayama, and meditation. Moving through foundational poses to advanced sequences, you will develop greater flexibility, balance, and body awareness. Each session combines physical challenge with mindful presence for a truly transformative experience.',
	FUNCTIONAL:
		'Improve real-world athletic performance with movement patterns that directly translate to sports and daily life. This program focuses on multi-planar movements, rotational power, coordination, and stability — building the kind of athleticism that makes you better at everything you do.',
	REHABILITATION:
		'Recover from injury and rebuild strength with evidence-based protocols developed by sports medicine experts. This carefully progressed program starts with gentle mobility work and gradually builds to full functional training, ensuring safe and complete recovery while addressing movement deficiencies.',
	MOBILITY:
		"Unlock your body's full potential with comprehensive mobility training targeting every major joint and movement pattern. Daily routines combine dynamic stretching, fascial release, and corrective exercises to improve range of motion, reduce injury risk, and enhance athletic performance.",
};

export const typeTrainers: Record<string, { name: string; specialty: string; clients: number; experience: string; rating: number }> = {
	'MASS GAIN': { name: 'Marcus Johnson', specialty: 'Hypertrophy & Mass Building', clients: 1240, experience: '8 Years', rating: 4.9 },
	'WEIGHT LOSS': { name: 'Emma Rodriguez', specialty: 'Fat Loss & Metabolic Conditioning', clients: 980, experience: '6 Years', rating: 4.8 },
	STRENGTH: { name: 'Alex Chen', specialty: 'Powerlifting & Strength Training', clients: 870, experience: '10 Years', rating: 4.9 },
	CARDIO: { name: 'Sarah Kim', specialty: 'Endurance & HIIT Training', clients: 1560, experience: '5 Years', rating: 4.7 },
	YOGA: { name: 'Maya Patel', specialty: 'Yoga & Mindfulness', clients: 720, experience: '7 Years', rating: 5.0 },
	FUNCTIONAL: { name: 'James Wilson', specialty: 'Athletic Performance & Functional Movement', clients: 640, experience: '9 Years', rating: 4.8 },
	REHABILITATION: { name: 'Dr. Lisa Turner', specialty: 'Sports Rehabilitation & Recovery', clients: 430, experience: '12 Years', rating: 4.9 },
	MOBILITY: { name: 'Chris Park', specialty: 'Mobility & Flexibility Training', clients: 510, experience: '6 Years', rating: 4.8 },
};

const phaseNames = [
	{ name: 'Foundation & Assessment', desc: 'Establish your baseline, learn foundational movements, and set measurable goals for the weeks ahead.' },
	{ name: 'Progressive Development', desc: 'Build upon your foundation with increasing intensity and movement complexity to spark adaptation.' },
	{ name: 'Intensity Amplification', desc: 'Elevate training volume and intensity to drive significant physiological adaptation and results.' },
	{ name: 'Peak Performance', desc: 'Push to new personal records with carefully calibrated peak training protocols.' },
	{ name: 'Advanced Techniques', desc: 'Incorporate advanced training methods and techniques to break through plateaus.' },
	{ name: 'Power & Strength Peak', desc: 'Maximize output with peak-week programming designed to elicit elite performance.' },
	{ name: 'Elite Programming', desc: 'Train with pro-level programming that unlocks your full physiological potential.' },
	{ name: 'Final Push', desc: 'Give everything in this final intensive training block before your reassessment.' },
	{ name: 'Deload & Recovery', desc: 'Strategic recovery period to consolidate gains and allow your body to super-compensate.' },
	{ name: 'Reassessment & Mastery', desc: 'Measure progress, celebrate your achievements, and plan your next phase of growth.' },
];

export const getCurriculum = (duration: number) => {
	const phases = [];
	const phaseCount = Math.ceil(duration / 2);
	for (let i = 0; i < phaseCount; i++) {
		const startWeek = i * 2 + 1;
		const endWeek = Math.min((i + 1) * 2, duration);
		const phase = phaseNames[i % phaseNames.length];
		phases.push({
			range: startWeek === endWeek ? `Week ${startWeek}` : `Week ${startWeek}–${endWeek}`,
			name: phase.name,
			desc: phase.desc,
		});
	}
	return phases;
};

export const getIncludes = (duration: number, type: string) => {
	const sessions = duration * 3;
	return [
		`${sessions} structured HD workout sessions`,
		type === 'YOGA' || type === 'MOBILITY' ? 'Daily mobility routines & breathwork guides' : 'Customized nutrition & meal planning guide',
		'Full exercise demonstration video library',
		'Progress tracking templates & worksheets',
		'Private Athlex community access',
		'Direct Q&A with your assigned trainer',
		'Lifetime access to all program materials',
		'Digital certificate of completion',
	];
};

// ─── VISUAL DATA FOR DETAIL PAGE ──────────────────────────────────────────────

export const typeMuscles: Record<string, string[]> = {
	'MASS GAIN': ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'QUADS', 'HAMSTRINGS'],
	'WEIGHT LOSS': ['FULL BODY', 'CORE', 'LEGS', 'CHEST', 'BACK'],
	STRENGTH: ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CHEST', 'BACK', 'SHOULDERS'],
	CARDIO: ['CARDIOVASCULAR', 'LEGS', 'CORE', 'FULL BODY'],
	YOGA: ['CORE', 'HIPS', 'BACK', 'SHOULDERS', 'HAMSTRINGS'],
	FUNCTIONAL: ['FULL BODY', 'CORE', 'GLUTES', 'BACK', 'SHOULDERS'],
	REHABILITATION: ['CORE', 'STABILIZERS', 'JOINTS', 'TARGETED AREA'],
	MOBILITY: ['HIPS', 'THORACIC SPINE', 'SHOULDERS', 'ANKLES', 'HAMSTRINGS'],
};

export const typeEquipment: Record<string, string[]> = {
	'MASS GAIN': ['🏋️ Barbell', '💪 Dumbbell', '🔌 Cable', '📦 Bench', '⚙️ Machine'],
	'WEIGHT LOSS': ['💪 Dumbbell', '🟡 Kettlebell', '🦺 Resistance Band', '🧍 Bodyweight'],
	STRENGTH: ['🏋️ Barbell', '🔧 Power Rack', '💪 Dumbbell', '📦 Bench'],
	CARDIO: ['🧍 Bodyweight', '🪢 Jump Rope', '🏃 Treadmill (optional)'],
	YOGA: ['🧘 Yoga Mat', '🟦 Blocks (optional)', '🎀 Strap (optional)'],
	FUNCTIONAL: ['🟡 Kettlebell', '🧍 Bodyweight', '⚽ Medicine Ball', '🦺 Resistance Band'],
	REHABILITATION: ['🦺 Resistance Band', '🛁 Foam Roller', '🧍 Bodyweight'],
	MOBILITY: ['🛁 Foam Roller', '🧘 Yoga Mat', '🦺 Resistance Band'],
};

export const levelRequirements: Record<string, string[]> = {
	BEGINNER: ['No prior gym experience needed', 'Comfortable athletic wear', 'Consistent commitment to training'],
	INTERMEDIATE: ['6+ months of training experience', 'Knowledge of basic compound lifts', 'Access to a gym or home gym'],
	ADVANCED: ['2+ years of consistent training', 'Proficiency in major compound lifts', 'Experience with periodized programming', 'Physical assessment recommended before starting'],
};

export interface WeekDay {
	day: string;
	label: string;
	muscles: string;
	isRest: boolean;
}

export const typeWeeklySchedule: Record<string, WeekDay[]> = {
	'MASS GAIN': [
		{ day: 'MON', label: 'Chest + Triceps', muscles: 'CHEST · TRICEPS', isRest: false },
		{ day: 'TUE', label: 'Back + Biceps', muscles: 'BACK · BICEPS', isRest: false },
		{ day: 'WED', label: 'REST', muscles: '', isRest: true },
		{ day: 'THU', label: 'Legs', muscles: 'QUADS · HAMSTRINGS · GLUTES', isRest: false },
		{ day: 'FRI', label: 'Shoulders + Abs', muscles: 'SHOULDERS · ABS', isRest: false },
		{ day: 'SAT', label: 'Full Body', muscles: 'FULL BODY', isRest: false },
		{ day: 'SUN', label: 'REST', muscles: '', isRest: true },
	],
	'WEIGHT LOSS': [
		{ day: 'MON', label: 'HIIT Cardio', muscles: 'FULL BODY', isRest: false },
		{ day: 'TUE', label: 'Strength Circuit', muscles: 'UPPER BODY', isRest: false },
		{ day: 'WED', label: 'Active Recovery', muscles: 'CORE · FLEXIBILITY', isRest: false },
		{ day: 'THU', label: 'HIIT + Core', muscles: 'CORE · LEGS', isRest: false },
		{ day: 'FRI', label: 'Upper Body Burn', muscles: 'CHEST · BACK · SHOULDERS', isRest: false },
		{ day: 'SAT', label: 'Lower Body Burn', muscles: 'LEGS · GLUTES', isRest: false },
		{ day: 'SUN', label: 'REST', muscles: '', isRest: true },
	],
	STRENGTH: [
		{ day: 'MON', label: 'Squat Day', muscles: 'QUADS · HAMSTRINGS · GLUTES', isRest: false },
		{ day: 'TUE', label: 'Bench Day', muscles: 'CHEST · TRICEPS · FRONT DELTS', isRest: false },
		{ day: 'WED', label: 'REST', muscles: '', isRest: true },
		{ day: 'THU', label: 'Deadlift Day', muscles: 'BACK · HAMSTRINGS · GLUTES', isRest: false },
		{ day: 'FRI', label: 'Press Day', muscles: 'SHOULDERS · TRICEPS', isRest: false },
		{ day: 'SAT', label: 'Accessory Work', muscles: 'BICEPS · FOREARMS · ABS', isRest: false },
		{ day: 'SUN', label: 'REST', muscles: '', isRest: true },
	],
	CARDIO: [
		{ day: 'MON', label: 'Steady State', muscles: 'CARDIOVASCULAR', isRest: false },
		{ day: 'TUE', label: 'Interval Run', muscles: 'LEGS · LUNGS', isRest: false },
		{ day: 'WED', label: 'REST', muscles: '', isRest: true },
		{ day: 'THU', label: 'HIIT Sprint', muscles: 'FULL BODY', isRest: false },
		{ day: 'FRI', label: 'Tempo Run', muscles: 'CARDIOVASCULAR', isRest: false },
		{ day: 'SAT', label: 'Long Distance', muscles: 'ENDURANCE', isRest: false },
		{ day: 'SUN', label: 'REST', muscles: '', isRest: true },
	],
	YOGA: [
		{ day: 'MON', label: 'Morning Flow', muscles: 'FULL BODY', isRest: false },
		{ day: 'TUE', label: 'Strength Yoga', muscles: 'CORE · ARMS · LEGS', isRest: false },
		{ day: 'WED', label: 'Yin Yoga', muscles: 'HIPS · SPINE', isRest: false },
		{ day: 'THU', label: 'Balance & Focus', muscles: 'CORE · STABILITY', isRest: false },
		{ day: 'FRI', label: 'Power Flow', muscles: 'FULL BODY', isRest: false },
		{ day: 'SAT', label: 'Restorative', muscles: 'RECOVERY', isRest: false },
		{ day: 'SUN', label: 'REST', muscles: '', isRest: true },
	],
	FUNCTIONAL: [
		{ day: 'MON', label: 'Push Patterns', muscles: 'CHEST · SHOULDERS · TRICEPS', isRest: false },
		{ day: 'TUE', label: 'Pull Patterns', muscles: 'BACK · BICEPS', isRest: false },
		{ day: 'WED', label: 'Core & Stability', muscles: 'CORE · GLUTES', isRest: false },
		{ day: 'THU', label: 'Lower Body Power', muscles: 'LEGS · GLUTES', isRest: false },
		{ day: 'FRI', label: 'Full Body Circuit', muscles: 'FULL BODY', isRest: false },
		{ day: 'SAT', label: 'Active Recovery', muscles: 'MOBILITY', isRest: false },
		{ day: 'SUN', label: 'REST', muscles: '', isRest: true },
	],
	REHABILITATION: [
		{ day: 'MON', label: 'Mobility Work', muscles: 'JOINTS · CONNECTIVE TISSUE', isRest: false },
		{ day: 'TUE', label: 'Strength Rebuild', muscles: 'TARGETED MUSCLES', isRest: false },
		{ day: 'WED', label: 'REST', muscles: '', isRest: true },
		{ day: 'THU', label: 'Balance & Stability', muscles: 'CORE · STABILIZERS', isRest: false },
		{ day: 'FRI', label: 'Functional Movement', muscles: 'FULL BODY', isRest: false },
		{ day: 'SAT', label: 'Gentle Conditioning', muscles: 'CARDIOVASCULAR', isRest: false },
		{ day: 'SUN', label: 'REST', muscles: '', isRest: true },
	],
	MOBILITY: [
		{ day: 'MON', label: 'Hip Mobility', muscles: 'HIPS · GROIN · GLUTES', isRest: false },
		{ day: 'TUE', label: 'Thoracic Spine', muscles: 'BACK · SHOULDERS', isRest: false },
		{ day: 'WED', label: 'Ankle & Foot', muscles: 'ANKLES · CALVES', isRest: false },
		{ day: 'THU', label: 'Shoulder Mobility', muscles: 'SHOULDERS · CHEST', isRest: false },
		{ day: 'FRI', label: 'Full Body Flow', muscles: 'FULL BODY', isRest: false },
		{ day: 'SAT', label: 'Deep Stretching', muscles: 'FLEXIBILITY', isRest: false },
		{ day: 'SUN', label: 'REST', muscles: '', isRest: true },
	],
};

export interface Review {
	name: string;
	initials: string;
	rating: number;
	date: string;
	text: string;
}

const defaultReviews: Review[] = [
	{ name: 'Alex Thompson', initials: 'AT', rating: 5, date: '2 weeks ago', text: 'This program completely changed my approach to training. Saw results within the first 3 weeks.' },
	{ name: 'Maria Santos', initials: 'MS', rating: 4, date: '1 month ago', text: 'Well structured and very easy to follow. Already seeing major improvements in my physique.' },
	{ name: 'Jake Rodriguez', initials: 'JR', rating: 5, date: '2 months ago', text: 'Best program I have ever done. The trainer is incredibly knowledgeable and the plan works.' },
	{ name: 'Priya Kumar', initials: 'PK', rating: 4, date: '3 months ago', text: 'Loved every session. My confidence and fitness have both improved massively. 10/10 recommend.' },
];

const typeReviews: Record<string, Review[]> = {
	'MASS GAIN': [
		{ name: 'Alex Thompson', initials: 'AT', rating: 5, date: '2 weeks ago', text: 'Put on 8kg of lean muscle in 12 weeks. The progressive overload approach is exactly right.' },
		{ name: 'Marcus D.', initials: 'MD', rating: 5, date: '1 month ago', text: 'Best hypertrophy program out there. Trainer knows the science of muscle growth deeply.' },
		{ name: 'Chris R.', initials: 'CR', rating: 4, date: '2 months ago', text: 'Volume is intense — exactly what you need for serious mass. Results speak for themselves.' },
		{ name: 'James W.', initials: 'JW', rating: 5, date: '3 months ago', text: 'Went from 70kg to 82kg. Best investment I have ever made in my fitness journey.' },
	],
	'WEIGHT LOSS': [
		{ name: 'Sarah K.', initials: 'SK', rating: 5, date: '3 weeks ago', text: 'Lost 12kg and feel amazing. The HIIT sessions are brutal but worth every second.' },
		{ name: 'Tom B.', initials: 'TB', rating: 4, date: '1 month ago', text: 'Fantastic fat loss program. Keeps you accountable and the nutrition plan is spot on.' },
		{ name: 'Lisa M.', initials: 'LM', rating: 5, date: '2 months ago', text: 'Dropped 3 dress sizes in 8 weeks. The variety keeps it fun and challenging.' },
		{ name: 'Dan P.', initials: 'DP', rating: 4, date: '4 months ago', text: 'Really solid program. The structure makes it easy to stay consistent even with a busy schedule.' },
	],
	STRENGTH: [
		{ name: 'Ryan C.', initials: 'RC', rating: 5, date: '1 month ago', text: 'Added 40kg to my squat in 12 weeks. The periodization model is elite level programming.' },
		{ name: 'Mike T.', initials: 'MT', rating: 5, date: '2 months ago', text: 'Finally broke through my plateau. Deadlift went from 180kg to 220kg. Absolutely incredible.' },
		{ name: 'Ben L.', initials: 'BL', rating: 4, date: '3 months ago', text: 'Excellent program. Very science-backed approach to strength development. Highly recommend.' },
		{ name: 'Tom H.', initials: 'TH', rating: 5, date: '4 months ago', text: 'Hit my first 200kg squat using this program. The coach is world-class.' },
	],
};

export const getReviews = (type: string): Review[] => typeReviews[type] ?? defaultReviews;
