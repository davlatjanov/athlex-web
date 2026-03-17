import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { NextPage } from 'next';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_PROGRAM_WITH_WORKOUTS } from '../../../apollo/user/query';
import {
	CREATE_WORKOUT,
	UPDATE_WORKOUT,
	DELETE_WORKOUT,
	CREATE_EXERCISE,
	UPDATE_EXERCISE,
	DELETE_EXERCISE,
} from '../../../apollo/user/mutation';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { getJwtToken } from '../../../libs/auth';
import { Workout, Exercise } from '../../../libs/types/program/program';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HotelIcon from '@mui/icons-material/Hotel';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const BODY_PARTS = [
	'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS',
	'QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'ABS', 'OBLIQUES', 'FULL_BODY',
];

const EQUIPMENT = [
	'BENCH', 'BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT',
	'RESISTANCE_BAND', 'KETTLEBELL', 'MEDICINE_BALL', 'SMITH_MACHINE', 'EZ_BAR',
];

const MUSCLES = [
	'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS',
	'QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'ABS', 'OBLIQUES', 'FULL_BODY',
];

const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const defaultWorkoutForm = {
	workoutName: '',
	workoutDesc: '',
	workoutDuration: 60,
	bodyParts: [] as string[],
	isRestDay: false,
};

const defaultExerciseForm = {
	exerciseName: '',
	exerciseDesc: '',
	primaryMuscle: '',
	secondaryMuscles: [] as string[],
	sets: 3,
	reps: '10-12',
	restTime: 60,
	equipment: [] as string[],
	difficulty: 'INTERMEDIATE',
	instructions: [''],
	tips: [] as string[],
	exerciseImage: '',   // existing Cloudinary URL (when editing)
	exerciseVideo: '',   // YouTube / video URL
};

const WorkoutBuilderPage: NextPage = () => {
	const router = useRouter();
	const { programId } = router.query as { programId: string };
	const user = useReactiveVar(userVar);

	const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
	const [workoutModal, setWorkoutModal] = useState<{ open: boolean; day: number; existing?: Workout } | null>(null);
	const [exerciseModal, setExerciseModal] = useState<{ open: boolean; workoutId: string; existing?: Exercise } | null>(null);
	const [workoutForm, setWorkoutForm] = useState({ ...defaultWorkoutForm });
	const [exerciseForm, setExerciseForm] = useState({ ...defaultExerciseForm });
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>('');
	const [uploading, setUploading] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);

	/** APOLLO **/
	const { data, refetch } = useQuery(GET_PROGRAM_WITH_WORKOUTS, {
		skip: !programId,
		variables: { programId },
		fetchPolicy: 'network-only',
	});

	const program = data?.getProgramWithWorkouts;
	const workouts: Workout[] = program?.workouts ?? [];

	const [createWorkout] = useMutation(CREATE_WORKOUT);
	const [updateWorkout] = useMutation(UPDATE_WORKOUT);
	const [deleteWorkout] = useMutation(DELETE_WORKOUT);
	const [createExercise] = useMutation(CREATE_EXERCISE);
	const [updateExercise] = useMutation(UPDATE_EXERCISE);
	const [deleteExercise] = useMutation(DELETE_EXERCISE);

	/** GUARDS **/
	useEffect(() => {
		if (user && user.memberType !== 'TRAINER' && user.memberType !== 'ADMIN') {
			router.push('/mypage');
		}
	}, [user]);

	/** HELPERS **/
	const getWorkoutForDay = (day: number) => workouts.find((w) => w.workoutDay === day);

	const toggleDay = (day: number) => {
		setExpandedDays((prev) => {
			const next = new Set(prev);
			next.has(day) ? next.delete(day) : next.add(day);
			return next;
		});
	};

	/** WORKOUT MODAL **/
	const openWorkoutModal = (day: number, existing?: Workout) => {
		if (existing) {
			setWorkoutForm({
				workoutName: existing.workoutName,
				workoutDesc: existing.workoutDesc ?? '',
				workoutDuration: existing.workoutDuration,
				bodyParts: [...existing.bodyParts],
				isRestDay: existing.isRestDay,
			});
		} else {
			setWorkoutForm({ ...defaultWorkoutForm });
		}
		setWorkoutModal({ open: true, day, existing });
	};

	const closeWorkoutModal = () => {
		setWorkoutModal(null);
		setWorkoutForm({ ...defaultWorkoutForm });
	};

	const submitWorkout = async () => {
		try {
			if (!workoutModal) return;
			if (workoutModal.existing) {
				await updateWorkout({
					variables: {
						workoutId: workoutModal.existing._id,
						input: {
							workoutName: workoutForm.workoutName,
							workoutDesc: workoutForm.workoutDesc || undefined,
							workoutDuration: workoutForm.workoutDuration,
							bodyParts: workoutForm.bodyParts,
							isRestDay: workoutForm.isRestDay,
						},
					},
				});
			} else {
				await createWorkout({
					variables: {
						input: {
							workoutName: workoutForm.workoutName || (workoutForm.isRestDay ? 'Rest Day' : 'Workout'),
							workoutDesc: workoutForm.workoutDesc || undefined,
							workoutDay: workoutModal.day,
							workoutDuration: workoutForm.workoutDuration,
							bodyParts: workoutForm.isRestDay ? [] : workoutForm.bodyParts,
							isRestDay: workoutForm.isRestDay,
							programId,
						},
					},
				});
			}
			await refetch();
			closeWorkoutModal();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleDeleteWorkout = async (workoutId: string) => {
		if (!(await sweetConfirmAlert('Delete this workout?'))) return;
		try {
			await deleteWorkout({ variables: { workoutId } });
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	/** EXERCISE MODAL **/
	const openExerciseModal = (workoutId: string, existing?: Exercise) => {
		if (existing) {
			setExerciseForm({
				exerciseName: existing.exerciseName,
				exerciseDesc: existing.exerciseDesc,
				primaryMuscle: existing.primaryMuscle,
				secondaryMuscles: [...(existing.secondaryMuscles ?? [])],
				sets: existing.sets,
				reps: existing.reps,
				restTime: existing.restTime,
				equipment: [...(existing.equipment ?? [])],
				difficulty: existing.difficulty,
				instructions: existing.instructions?.length ? [...existing.instructions] : [''],
				tips: [...(existing.tips ?? [])],
				exerciseImage: existing.exerciseImage ?? '',
				exerciseVideo: existing.exerciseVideo ?? '',
			});
			setImagePreview(existing.exerciseImage ?? '');
		} else {
			setExerciseForm({ ...defaultExerciseForm });
			setImagePreview('');
		}
		setImageFile(null);
		setExerciseModal({ open: true, workoutId, existing });
	};

	const closeExerciseModal = () => {
		setExerciseModal(null);
		setExerciseForm({ ...defaultExerciseForm });
		setImageFile(null);
		setImagePreview('');
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setImageFile(file);
		setImagePreview(URL.createObjectURL(file));
		if (imageInputRef.current) imageInputRef.current.value = '';
	};

	const uploadImageToCloudinary = async (file: File): Promise<string> => {
		const token = getJwtToken();
		const query = `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
			imagesUploader(files: $files, target: $target)
		}`;
		const variables = { files: [null], target: 'exercises' };
		const formData = new FormData();
		formData.append('operations', JSON.stringify({ query, variables }));
		formData.append('map', JSON.stringify({ '0': ['variables.files.0'] }));
		formData.append('0', file);
		const res = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
			headers: { 'Content-Type': 'multipart/form-data', 'apollo-require-preflight': true, Authorization: `Bearer ${token}` },
		});
		if (res.data?.errors?.length) throw new Error(res.data.errors[0].message);
		return res.data?.data?.imagesUploader?.[0] ?? '';
	};

	const submitExercise = async () => {
		try {
			if (!exerciseModal) return;
			setUploading(true);

			let exerciseImage = exerciseForm.exerciseImage;
			if (imageFile) {
				exerciseImage = await uploadImageToCloudinary(imageFile);
			}

			const payload = {
				exerciseName: exerciseForm.exerciseName,
				exerciseDesc: exerciseForm.exerciseDesc,
				primaryMuscle: exerciseForm.primaryMuscle,
				secondaryMuscles: exerciseForm.secondaryMuscles,
				sets: Number(exerciseForm.sets),
				reps: exerciseForm.reps,
				restTime: Number(exerciseForm.restTime),
				equipment: exerciseForm.equipment,
				difficulty: exerciseForm.difficulty,
				instructions: exerciseForm.instructions.filter(Boolean),
				tips: exerciseForm.tips.filter(Boolean),
				exerciseImage: exerciseImage || undefined,
				exerciseVideo: exerciseForm.exerciseVideo || undefined,
			};
			if (exerciseModal.existing) {
				await updateExercise({ variables: { exerciseId: exerciseModal.existing._id, input: payload } });
			} else {
				await createExercise({ variables: { input: { ...payload, workoutId: exerciseModal.workoutId } } });
			}
			await refetch();
			closeExerciseModal();
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setUploading(false);
		}
	};

	const handleDeleteExercise = async (exerciseId: string) => {
		if (!(await sweetConfirmAlert('Delete this exercise?'))) return;
		try {
			await deleteExercise({ variables: { exerciseId } });
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	/** CHECKBOX HELPERS **/
	const toggleArrayItem = (arr: string[], item: string): string[] =>
		arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

	if (!program) return <div className="wb-root"><div className="wb-loading">Loading program...</div></div>;

	return (
		<div className="wb-root">
		<div className="wb-page">
			{/* Header */}
			<div className="wb-header">
				<button className="wb-back-btn" onClick={() => router.push('/mypage?category=myProperty')}>
					<ArrowBackIcon fontSize="small" /> Back
				</button>
				<div className="wb-header-info">
					<h1 className="wb-title">{program.programName}</h1>
					<span className="wb-subtitle">{program.programType} · {program.programLevel} · {program.programDuration} weeks</span>
				</div>
			</div>

			{/* Week grid */}
			<div className="wb-week-label">Weekly Template <span>(repeats each week)</span></div>
			<div className="wb-days">
				{Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
					const workout = getWorkoutForDay(day);
					const expanded = expandedDays.has(day);

					return (
						<div key={day} className={`wb-day-card ${workout?.isRestDay ? 'rest' : workout ? 'has-workout' : 'empty'}`}>
							{/* Day header */}
							<div className="wb-day-header">
								<div className="wb-day-label">
									<span className="wb-day-num">Day {day}</span>
									<span className="wb-day-name">{DAY_NAMES[day - 1]}</span>
								</div>
								{workout ? (
									<div className="wb-day-actions">
										{!workout.isRestDay && (
											<button className="wb-icon-btn" title="Add Exercise"
												onClick={() => { setExpandedDays((p) => new Set([...p, day])); openExerciseModal(workout._id); }}>
												<AddIcon fontSize="small" />
											</button>
										)}
										<button className="wb-icon-btn" title="Edit" onClick={() => openWorkoutModal(day, workout)}>
											<EditIcon fontSize="small" />
										</button>
										<button className="wb-icon-btn danger" title="Delete" onClick={() => handleDeleteWorkout(workout._id)}>
											<DeleteIcon fontSize="small" />
										</button>
										{!workout.isRestDay && (
											<button className="wb-expand-btn" onClick={() => toggleDay(day)}>
												{expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
											</button>
										)}
									</div>
								) : (
									<div className="wb-day-actions">
										<button className="wb-add-btn" onClick={() => openWorkoutModal(day)}>
											<AddIcon fontSize="small" /> Workout
										</button>
										<button className="wb-rest-btn" onClick={() => {
											setWorkoutForm({ ...defaultWorkoutForm, isRestDay: true, workoutName: 'Rest Day' });
											setTimeout(() => {
												createWorkout({
													variables: {
														input: {
															workoutName: 'Rest Day',
															workoutDay: day,
															workoutDuration: 0,
															bodyParts: [],
															isRestDay: true,
															programId,
														},
													},
												}).then(() => refetch());
											}, 0);
										}}>
											<HotelIcon fontSize="small" /> Rest
										</button>
									</div>
								)}
							</div>

							{/* Workout info */}
							{workout && (
								<div className="wb-workout-info">
									{workout.isRestDay ? (
										<div className="wb-rest-info">
											<HotelIcon className="wb-rest-icon" />
											<span>Rest & Recovery</span>
										</div>
									) : (
										<>
											<div className="wb-workout-meta">
												<FitnessCenterIcon className="wb-fit-icon" />
												<span className="wb-workout-name">{workout.workoutName}</span>
												{workout.workoutDuration > 0 && (
													<span className="wb-duration">{workout.workoutDuration} min</span>
												)}
											</div>
											<div className="wb-body-parts">
												{workout.bodyParts.slice(0, 4).map((bp) => (
													<span key={bp} className="wb-bp-chip">{bp.replace('_', ' ')}</span>
												))}
											</div>
											{workout.exercises && workout.exercises.length > 0 && (
												<span className="wb-ex-count">{workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}</span>
											)}
										</>
									)}
								</div>
							)}

							{/* Exercises list */}
							{workout && !workout.isRestDay && expanded && (
								<div className="wb-exercises">
									{(!workout.exercises || workout.exercises.length === 0) ? (
										<div className="wb-no-exercises">No exercises yet. Click + to add.</div>
									) : (
										workout.exercises.map((ex, idx) => (
											<div key={ex._id} className="wb-exercise-row">
												<div className="wb-ex-order">{idx + 1}</div>
												{ex.exerciseImage && (
													<img src={ex.exerciseImage} alt="" className="wb-ex-thumb" />
												)}
												<div className="wb-ex-info">
													<span className="wb-ex-name">{ex.exerciseName}</span>
													<span className="wb-ex-meta">
														{ex.sets}×{ex.reps} · {ex.primaryMuscle?.replace('_', ' ')} · {ex.restTime}s rest
													</span>
												</div>
												<div className="wb-ex-actions">
													<button className="wb-icon-btn" onClick={() => openExerciseModal(workout._id, ex)}>
														<EditIcon fontSize="small" />
													</button>
													<button className="wb-icon-btn danger" onClick={() => handleDeleteExercise(ex._id)}>
														<DeleteIcon fontSize="small" />
													</button>
												</div>
											</div>
										))
									)}
									<button className="wb-add-exercise-btn" onClick={() => openExerciseModal(workout._id)}>
										<AddIcon fontSize="small" /> Add Exercise
									</button>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* WORKOUT MODAL */}
			{workoutModal?.open && (
				<div className="wb-modal-overlay" onClick={closeWorkoutModal}>
					<div className="wb-modal" onClick={(e) => e.stopPropagation()}>
						<div className="wb-modal-header">
							<h2>{workoutModal.existing ? 'Edit Workout' : 'Add Workout'} — Day {workoutModal.day} ({DAY_NAMES[workoutModal.day - 1]})</h2>
							<button className="wb-modal-close" onClick={closeWorkoutModal}>✕</button>
						</div>
						<div className="wb-modal-body">
							<label className="wb-label">
								<span>Rest Day</span>
								<input type="checkbox" checked={workoutForm.isRestDay}
									onChange={(e) => setWorkoutForm((p) => ({ ...p, isRestDay: e.target.checked }))} />
							</label>

							{!workoutForm.isRestDay && (
								<>
									<label className="wb-label">
										<span>Workout Name *</span>
										<input className="wb-input" value={workoutForm.workoutName} placeholder="e.g. Push Day"
											onChange={(e) => setWorkoutForm((p) => ({ ...p, workoutName: e.target.value }))} />
									</label>
									<label className="wb-label">
										<span>Description</span>
										<textarea className="wb-textarea" value={workoutForm.workoutDesc} rows={2}
											placeholder="Optional description"
											onChange={(e) => setWorkoutForm((p) => ({ ...p, workoutDesc: e.target.value }))} />
									</label>
									<label className="wb-label">
										<span>Duration (minutes)</span>
										<input className="wb-input" type="number" min={0} value={workoutForm.workoutDuration}
											onChange={(e) => setWorkoutForm((p) => ({ ...p, workoutDuration: Number(e.target.value) }))} />
									</label>
									<div className="wb-label">
										<span>Target Body Parts</span>
										<div className="wb-chip-grid">
											{BODY_PARTS.map((bp) => (
												<button key={bp}
													className={`wb-chip ${workoutForm.bodyParts.includes(bp) ? 'selected' : ''}`}
													onClick={() => setWorkoutForm((p) => ({ ...p, bodyParts: toggleArrayItem(p.bodyParts, bp) }))}>
													{bp.replace(/_/g, ' ')}
												</button>
											))}
										</div>
									</div>
								</>
							)}
						</div>
						<div className="wb-modal-footer">
							<button className="wb-btn-cancel" onClick={closeWorkoutModal}>Cancel</button>
							<button className="wb-btn-save" onClick={submitWorkout}>
								{workoutModal.existing ? 'Save Changes' : 'Create Workout'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* EXERCISE MODAL */}
			{exerciseModal?.open && (
				<div className="wb-modal-overlay" onClick={closeExerciseModal}>
					<div className="wb-modal wb-modal-wide" onClick={(e) => e.stopPropagation()}>
						<div className="wb-modal-header">
							<h2>{exerciseModal.existing ? 'Edit Exercise' : 'Add Exercise'}</h2>
							<button className="wb-modal-close" onClick={closeExerciseModal}>✕</button>
						</div>
						<div className="wb-modal-body wb-two-col">
							{/* Left column */}
							<div className="wb-col">
								{/* Image upload */}
								<div className="wb-label">
									<span>Demo Photo</span>
									<div className="wb-image-upload" onClick={() => imageInputRef.current?.click()}>
										{imagePreview ? (
											<>
												<img src={imagePreview} alt="preview" className="wb-image-preview" />
												<div className="wb-image-overlay">
													<span>Change Photo</span>
												</div>
											</>
										) : (
											<div className="wb-image-placeholder">
												<span className="wb-image-icon">📷</span>
												<span>Click to upload a demo photo</span>
												<span className="wb-image-hint">JPG, PNG, WebP</span>
											</div>
										)}
									</div>
									<input
										ref={imageInputRef}
										type="file"
										accept="image/*"
										style={{ display: 'none' }}
										onChange={handleImageSelect}
									/>
									{imagePreview && (
										<button className="wb-remove-image" onClick={() => { setImageFile(null); setImagePreview(''); setExerciseForm((p) => ({ ...p, exerciseImage: '' })); }}>
											✕ Remove photo
										</button>
									)}
								</div>

								{/* Video URL */}
								<label className="wb-label">
									<span>Video URL (YouTube / any link)</span>
									<input className="wb-input" value={exerciseForm.exerciseVideo}
										placeholder="https://youtube.com/watch?v=..."
										onChange={(e) => setExerciseForm((p) => ({ ...p, exerciseVideo: e.target.value }))} />
									{exerciseForm.exerciseVideo && (
										<a href={exerciseForm.exerciseVideo} target="_blank" rel="noreferrer" className="wb-video-link">
											▶ Preview link
										</a>
									)}
								</label>

								<label className="wb-label">
									<span>Exercise Name *</span>
									<input className="wb-input" value={exerciseForm.exerciseName} placeholder="e.g. Bench Press"
										onChange={(e) => setExerciseForm((p) => ({ ...p, exerciseName: e.target.value }))} />
								</label>
								<label className="wb-label">
									<span>Description *</span>
									<textarea className="wb-textarea" value={exerciseForm.exerciseDesc} rows={2}
										placeholder="Brief exercise description"
										onChange={(e) => setExerciseForm((p) => ({ ...p, exerciseDesc: e.target.value }))} />
								</label>
								<div className="wb-row-3">
									<label className="wb-label">
										<span>Sets</span>
										<input className="wb-input" type="number" min={1} value={exerciseForm.sets}
											onChange={(e) => setExerciseForm((p) => ({ ...p, sets: Number(e.target.value) }))} />
									</label>
									<label className="wb-label">
										<span>Reps</span>
										<input className="wb-input" value={exerciseForm.reps} placeholder="10-12"
											onChange={(e) => setExerciseForm((p) => ({ ...p, reps: e.target.value }))} />
									</label>
									<label className="wb-label">
										<span>Rest (sec)</span>
										<input className="wb-input" type="number" min={0} value={exerciseForm.restTime}
											onChange={(e) => setExerciseForm((p) => ({ ...p, restTime: Number(e.target.value) }))} />
									</label>
								</div>
								<label className="wb-label">
									<span>Difficulty</span>
									<select className="wb-select" value={exerciseForm.difficulty}
										onChange={(e) => setExerciseForm((p) => ({ ...p, difficulty: e.target.value }))}>
										<option value="BEGINNER">Beginner</option>
										<option value="INTERMEDIATE">Intermediate</option>
										<option value="ADVANCED">Advanced</option>
									</select>
								</label>
								<div className="wb-label">
									<span>Instructions (step by step)</span>
									{exerciseForm.instructions.map((inst, idx) => (
										<div key={idx} className="wb-instruction-row">
											<span className="wb-step-num">{idx + 1}</span>
											<input className="wb-input" value={inst} placeholder={`Step ${idx + 1}`}
												onChange={(e) => {
													const arr = [...exerciseForm.instructions];
													arr[idx] = e.target.value;
													setExerciseForm((p) => ({ ...p, instructions: arr }));
												}} />
											{exerciseForm.instructions.length > 1 && (
												<button className="wb-icon-btn danger" onClick={() => {
													setExerciseForm((p) => ({ ...p, instructions: p.instructions.filter((_, i) => i !== idx) }));
												}}>✕</button>
											)}
										</div>
									))}
									<button className="wb-add-step-btn" onClick={() =>
										setExerciseForm((p) => ({ ...p, instructions: [...p.instructions, ''] }))}>
										+ Add Step
									</button>
								</div>
							</div>

							{/* Right column */}
							<div className="wb-col">
								<div className="wb-label">
									<span>Primary Muscle *</span>
									<div className="wb-chip-grid">
										{MUSCLES.map((m) => (
											<button key={m}
												className={`wb-chip ${exerciseForm.primaryMuscle === m ? 'selected' : ''}`}
												onClick={() => setExerciseForm((p) => ({ ...p, primaryMuscle: m }))}>
												{m.replace(/_/g, ' ')}
											</button>
										))}
									</div>
								</div>
								<div className="wb-label">
									<span>Secondary Muscles</span>
									<div className="wb-chip-grid">
										{MUSCLES.filter((m) => m !== exerciseForm.primaryMuscle).map((m) => (
											<button key={m}
												className={`wb-chip ${exerciseForm.secondaryMuscles.includes(m) ? 'selected' : ''}`}
												onClick={() => setExerciseForm((p) => ({ ...p, secondaryMuscles: toggleArrayItem(p.secondaryMuscles, m) }))}>
												{m.replace(/_/g, ' ')}
											</button>
										))}
									</div>
								</div>
								<div className="wb-label">
									<span>Equipment *</span>
									<div className="wb-chip-grid">
										{EQUIPMENT.map((eq) => (
											<button key={eq}
												className={`wb-chip ${exerciseForm.equipment.includes(eq) ? 'selected' : ''}`}
												onClick={() => setExerciseForm((p) => ({ ...p, equipment: toggleArrayItem(p.equipment, eq) }))}>
												{eq.replace(/_/g, ' ')}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>
						<div className="wb-modal-footer">
							<button className="wb-btn-cancel" onClick={closeExerciseModal} disabled={uploading}>Cancel</button>
							<button className="wb-btn-save" onClick={submitExercise} disabled={uploading}>
								{uploading ? (imageFile ? 'Uploading photo…' : 'Saving…') : (exerciseModal.existing ? 'Save Changes' : 'Add Exercise')}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
		</div>
	);
};

export default withLayoutBasic(WorkoutBuilderPage);
