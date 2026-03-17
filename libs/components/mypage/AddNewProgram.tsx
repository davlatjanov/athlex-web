import React, { useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import axios from 'axios';
import { CREATE_PROGRAM, UPDATE_PROGRAM } from '../../../apollo/user/mutation';
import { GET_ONE_PROGRAM } from '../../../apollo/user/query';
import { ProgramType, ProgramLevel, ProgramStatus } from '../../enums/training-program.enum';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { getJwtToken } from '../../auth';
import { T } from '../../types/common';

/* ─────────────────────────── shared style tokens ─────────────────────────── */
const C = {
	bg: '#111827',
	surface: '#1a1f2e',
	border: 'rgba(255,255,255,0.1)',
	borderFocus: '#E92C28',
	text: '#e2e8f0',
	muted: '#6b7280',
	accent: '#E92C28',
	accentHover: '#c0231f',
	divider: 'rgba(255,255,255,0.07)',
};

const inputStyle: React.CSSProperties = {
	width: '100%',
	padding: '10px 14px',
	background: C.surface,
	border: `1px solid ${C.border}`,
	borderRadius: 8,
	color: C.text,
	fontSize: 14,
	outline: 'none',
	boxSizing: 'border-box',
	fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
	display: 'block',
	fontSize: 11,
	fontWeight: 700,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	color: C.muted,
	marginBottom: 6,
};

const fieldStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
};

const sectionLabelStyle: React.CSSProperties = {
	fontSize: 11,
	fontWeight: 700,
	letterSpacing: '0.1em',
	textTransform: 'uppercase',
	color: C.muted,
	marginBottom: 20,
};

const dividerStyle: React.CSSProperties = {
	borderTop: `1px solid ${C.divider}`,
	margin: '28px 0',
};

/* ─────────────────────────── types ─────────────────────────── */
interface ProgramFormData {
	programName: string;
	programDesc: string;
	programType: ProgramType | '';
	programLevel: ProgramLevel | '';
	programStatus: ProgramStatus;
	programPrice: number;
	programDuration: number;
	programStartDate: string;
	programEndDate: string;
	programImages: string[];
	programTags: string[];
	targetAudience: string[];
	requirements: string[];
}

const EMPTY_FORM: ProgramFormData = {
	programName: '',
	programDesc: '',
	programType: '',
	programLevel: '',
	programStatus: ProgramStatus.DRAFT,
	programPrice: 0,
	programDuration: 4,
	programStartDate: '',
	programEndDate: '',
	programImages: [],
	programTags: [],
	targetAudience: [],
	requirements: [],
};

/* ─────────────────────────── component ─────────────────────────── */
const AddProgram: NextPage = ({ initialValues, ...props }: any) => {
	const router = useRouter();
	const { propertyId } = router.query;
	const isEditMode = Boolean(propertyId);
	const token = getJwtToken();

	const [formData, setFormData] = useState<ProgramFormData>(EMPTY_FORM);
	const [tagInput, setTagInput] = useState('');
	const [audienceInput, setAudienceInput] = useState('');
	const [reqInput, setReqInput] = useState('');
	const [uploading, setUploading] = useState(false);
	const [focusedField, setFocusedField] = useState<string | null>(null);

	const [createProgram, { loading: creating }] = useMutation(CREATE_PROGRAM);
	const [updateProgram, { loading: updating }] = useMutation(UPDATE_PROGRAM);

	useQuery(GET_ONE_PROGRAM, {
		variables: { programId: propertyId },
		skip: !propertyId,
		fetchPolicy: 'network-only',
		onCompleted: (data: T) => {
			const p = data?.getOneProgram;
			if (!p) return;
			setFormData({
				programName: p.programName ?? '',
				programDesc: p.programDesc ?? '',
				programType: p.programType ?? '',
				programLevel: p.programLevel ?? '',
				programStatus: p.programStatus ?? ProgramStatus.DRAFT,
				programPrice: p.programPrice ?? 0,
				programDuration: p.programDuration ?? 4,
				programStartDate: p.programStartDate ? p.programStartDate.slice(0, 10) : '',
				programEndDate: p.programEndDate ? p.programEndDate.slice(0, 10) : '',
				programImages: p.programImages ?? [],
				programTags: p.programTags ?? [],
				targetAudience: p.targetAudience ?? [],
				requirements: p.requirements ?? [],
			});
		},
	});

	const handleField = (key: keyof ProgramFormData, value: any) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploading(true);
		try {
			const fd = new FormData();
			fd.append('operations', JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }`,
				variables: { file: null, target: 'program' },
			}));
			fd.append('map', JSON.stringify({ '0': ['variables.file'] }));
			fd.append('0', file);
			const res = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, fd, {
				headers: { 'Content-Type': 'multipart/form-data', 'apollo-require-preflight': true, Authorization: `Bearer ${token}` },
			});
			const url: string = res.data.data.imageUploader;
			setFormData((prev) => ({ ...prev, programImages: [...prev.programImages, url] }));
		} catch (err) {
			console.log('Upload error:', err);
		} finally {
			setUploading(false);
			e.target.value = '';
		}
	};

	const removeImage = (idx: number) =>
		setFormData((prev) => ({ ...prev, programImages: prev.programImages.filter((_, i) => i !== idx) }));

	const addChip = (key: 'programTags' | 'targetAudience' | 'requirements', val: string, setter: (v: string) => void) => {
		const t = val.trim();
		if (!t) return;
		setFormData((prev) => ({ ...prev, [key]: [...prev[key], t] }));
		setter('');
	};

	const removeChip = (key: 'programTags' | 'targetAudience' | 'requirements', idx: number) =>
		setFormData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));

	const handleSubmit = async () => {
		try {
			if (!formData.programName || !formData.programType || !formData.programLevel) {
				await sweetErrorHandling(new Error('Please fill in Name, Type and Level'));
				return;
			}
			const input: any = {
				programName: formData.programName,
				programDesc: formData.programDesc,
				programType: formData.programType,
				programLevel: formData.programLevel,
				programStatus: formData.programStatus,
				programPrice: Number(formData.programPrice),
				programDuration: Number(formData.programDuration),
				programImages: formData.programImages,
				programTags: formData.programTags,
				targetAudience: formData.targetAudience,
				requirements: formData.requirements,
			};
			if (formData.programStartDate) input.programStartDate = new Date(formData.programStartDate).toISOString();
			if (formData.programEndDate) input.programEndDate = new Date(formData.programEndDate).toISOString();

			if (isEditMode) {
				await updateProgram({ variables: { programId: propertyId, input } });
				await sweetMixinSuccessAlert('Program updated!');
			} else {
				await createProgram({ variables: { input } });
				await sweetMixinSuccessAlert('Program created!');
				setFormData(EMPTY_FORM);
			}
			await router.push({ pathname: '/mypage', query: { category: 'myProperties' } });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const loading = creating || updating;

	const getFocusStyle = (name: string): React.CSSProperties =>
		focusedField === name ? { borderColor: C.accent } : {};

	/* ── chip input row ── */
	const ChipField = ({
		label, placeholder, value, onChange, onAdd,
		chips, onRemove,
	}: {
		label: string; placeholder: string; value: string;
		onChange: (v: string) => void; onAdd: () => void;
		chips: string[]; onRemove: (i: number) => void;
	}) => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
			<span style={labelStyle}>{label}</span>
			{chips.length > 0 && (
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
					{chips.map((c, i) => (
						<span key={i} style={{
							display: 'inline-flex', alignItems: 'center', gap: 5,
							padding: '3px 10px', borderRadius: 20,
							background: 'rgba(233,44,40,0.12)', border: `1px solid rgba(233,44,40,0.3)`,
							color: '#fca5a5', fontSize: 12,
						}}>
							{c}
							<button onClick={() => onRemove(i)} style={{
								background: 'none', border: 'none', color: '#fca5a5',
								cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14,
							}}>×</button>
						</span>
					))}
				</div>
			)}
			<div style={{ display: 'flex', gap: 8 }}>
				<input
					style={{ ...inputStyle, ...getFocusStyle(`chip-${label}`) }}
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onFocus={() => setFocusedField(`chip-${label}`)}
					onBlur={() => setFocusedField(null)}
					onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
				/>
				<button onClick={onAdd} style={{
					padding: '0 18px', borderRadius: 8, border: `1px solid ${C.border}`,
					background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 13,
					whiteSpace: 'nowrap',
					transition: 'border-color 0.2s, color 0.2s',
				}}
					onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.accent; (e.currentTarget as HTMLButtonElement).style.color = C.accent; }}
					onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.muted; }}
				>Add</button>
			</div>
		</div>
	);

	return (
		<div id="add-property-page">
			<div className="main-title-box">
				<div className="right-box">
					<p className="main-title">{isEditMode ? 'Edit Program' : 'Add New Program'}</p>
					<p className="sub-title">
						{isEditMode ? 'Update your training program details.' : 'Create a new training program for your athletes.'}
					</p>
				</div>
			</div>

			<div className="config" style={{ display: 'flex', flexDirection: 'column' }}>

				{/* ── BASIC INFORMATION ── */}
				<p style={sectionLabelStyle}>Basic Information</p>

				<div style={fieldStyle as any}>
					<label style={labelStyle}>Program Name *</label>
					<input
						style={{ ...inputStyle, ...getFocusStyle('name'), marginBottom: 16 }}
						placeholder="e.g. 12-Week Mass Builder"
						value={formData.programName}
						onChange={(e) => handleField('programName', e.target.value)}
						onFocus={() => setFocusedField('name')}
						onBlur={() => setFocusedField(null)}
					/>
				</div>

				<div style={fieldStyle as any}>
					<label style={labelStyle}>Description</label>
					<textarea
						style={{ ...inputStyle, ...getFocusStyle('desc'), height: 110, resize: 'vertical', marginBottom: 16 }}
						placeholder="Describe what this program covers…"
						value={formData.programDesc}
						onChange={(e) => handleField('programDesc', e.target.value)}
						onFocus={() => setFocusedField('desc')}
						onBlur={() => setFocusedField(null)}
					/>
				</div>

				<div style={{ display: 'flex', gap: 16, marginBottom: 0 }}>
					<div style={fieldStyle as any}>
						<label style={labelStyle}>Type *</label>
						<select
							style={{ ...inputStyle, ...getFocusStyle('type'), cursor: 'pointer' }}
							value={formData.programType}
							onChange={(e) => handleField('programType', e.target.value)}
							onFocus={() => setFocusedField('type')}
							onBlur={() => setFocusedField(null)}
						>
							<option value="" disabled>Select type</option>
							{Object.values(ProgramType).map((t) => (
								<option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
							))}
						</select>
					</div>

					<div style={fieldStyle as any}>
						<label style={labelStyle}>Level *</label>
						<select
							style={{ ...inputStyle, ...getFocusStyle('level'), cursor: 'pointer' }}
							value={formData.programLevel}
							onChange={(e) => handleField('programLevel', e.target.value)}
							onFocus={() => setFocusedField('level')}
							onBlur={() => setFocusedField(null)}
						>
							<option value="" disabled>Select level</option>
							{Object.values(ProgramLevel).map((l) => (
								<option key={l} value={l}>{l}</option>
							))}
						</select>
					</div>

					<div style={fieldStyle as any}>
						<label style={labelStyle}>Status</label>
						<select
							style={{ ...inputStyle, ...getFocusStyle('status'), cursor: 'pointer' }}
							value={formData.programStatus}
							onChange={(e) => handleField('programStatus', e.target.value)}
							onFocus={() => setFocusedField('status')}
							onBlur={() => setFocusedField(null)}
						>
							{Object.values(ProgramStatus).map((s) => (
								<option key={s} value={s}>{s}</option>
							))}
						</select>
					</div>
				</div>

				<div style={dividerStyle} />

				{/* ── PRICING & SCHEDULE ── */}
				<p style={sectionLabelStyle}>Pricing & Schedule</p>

				<div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
					<div style={fieldStyle as any}>
						<label style={labelStyle}>Price ($)</label>
						<input
							type="number" min={0}
							style={{ ...inputStyle, ...getFocusStyle('price') }}
							value={formData.programPrice}
							onChange={(e) => handleField('programPrice', e.target.value)}
							onFocus={() => setFocusedField('price')}
							onBlur={() => setFocusedField(null)}
						/>
					</div>
					<div style={fieldStyle as any}>
						<label style={labelStyle}>Duration (weeks)</label>
						<input
							type="number" min={1}
							style={{ ...inputStyle, ...getFocusStyle('duration') }}
							value={formData.programDuration}
							onChange={(e) => handleField('programDuration', e.target.value)}
							onFocus={() => setFocusedField('duration')}
							onBlur={() => setFocusedField(null)}
						/>
					</div>
				</div>

				<div style={{ display: 'flex', gap: 16 }}>
					<div style={fieldStyle as any}>
						<label style={labelStyle}>Start Date</label>
						<input
							type="date"
							style={{ ...inputStyle, ...getFocusStyle('start'), colorScheme: 'dark' }}
							value={formData.programStartDate}
							onChange={(e) => handleField('programStartDate', e.target.value)}
							onFocus={() => setFocusedField('start')}
							onBlur={() => setFocusedField(null)}
						/>
					</div>
					<div style={fieldStyle as any}>
						<label style={labelStyle}>End Date</label>
						<input
							type="date"
							style={{ ...inputStyle, ...getFocusStyle('end'), colorScheme: 'dark' }}
							value={formData.programEndDate}
							onChange={(e) => handleField('programEndDate', e.target.value)}
							onFocus={() => setFocusedField('end')}
							onBlur={() => setFocusedField(null)}
						/>
					</div>
				</div>

				<div style={dividerStyle} />

				{/* ── IMAGES ── */}
				<p style={sectionLabelStyle}>Images</p>

				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
					{formData.programImages.map((img, idx) => (
						<div key={idx} style={{ position: 'relative', width: 120, height: 90 }}>
							<img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
							<button onClick={() => removeImage(idx)} style={{
								position: 'absolute', top: 4, right: 4, width: 22, height: 22,
								background: C.accent, border: 'none', borderRadius: '50%',
								color: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: '22px', padding: 0,
							}}>×</button>
						</div>
					))}

					<label style={{ cursor: uploading ? 'wait' : 'pointer' }}>
						<div style={{
							width: 120, height: 90, border: `2px dashed ${C.border}`, borderRadius: 8,
							display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
							gap: 4, color: C.muted, fontSize: 12, transition: 'border-color 0.2s, color 0.2s',
						}}
							onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = C.accent; el.style.color = C.accent; }}
							onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = C.border; el.style.color = C.muted; }}
						>
							<span style={{ fontSize: 22 }}>+</span>
							<span>{uploading ? 'Uploading…' : 'Add Image'}</span>
						</div>
						<input type="file" accept="image/*" hidden onChange={uploadImage} disabled={uploading} />
					</label>
				</div>

				<div style={dividerStyle} />

				{/* ── TAGS & DETAILS ── */}
				<p style={sectionLabelStyle}>Tags & Details</p>

				<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
					<ChipField
						label="Tags"
						placeholder="e.g. strength, cardio"
						value={tagInput}
						onChange={setTagInput}
						onAdd={() => addChip('programTags', tagInput, setTagInput)}
						chips={formData.programTags}
						onRemove={(i) => removeChip('programTags', i)}
					/>
					<ChipField
						label="Target Audience"
						placeholder="e.g. Beginners, Athletes"
						value={audienceInput}
						onChange={setAudienceInput}
						onAdd={() => addChip('targetAudience', audienceInput, setAudienceInput)}
						chips={formData.targetAudience}
						onRemove={(i) => removeChip('targetAudience', i)}
					/>
					<ChipField
						label="Requirements"
						placeholder="e.g. Basic fitness level"
						value={reqInput}
						onChange={setReqInput}
						onAdd={() => addChip('requirements', reqInput, setReqInput)}
						chips={formData.requirements}
						onRemove={(i) => removeChip('requirements', i)}
					/>
				</div>

				{/* ── ACTIONS ── */}
				<div style={{
					display: 'flex', justifyContent: 'flex-end', gap: 12,
					marginTop: 36, paddingTop: 24, borderTop: `1px solid ${C.divider}`,
				}}>
					<button
						disabled={loading}
						onClick={() => router.push({ pathname: '/mypage', query: { category: 'myProperties' } })}
						style={{
							padding: '10px 24px', borderRadius: 8, border: `1px solid ${C.border}`,
							background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 14, fontWeight: 600,
						}}
					>
						Cancel
					</button>
					<button
						disabled={loading}
						onClick={handleSubmit}
						style={{
							padding: '10px 28px', borderRadius: 8, border: 'none',
							background: loading ? '#7a1614' : C.accent, color: '#fff',
							cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700,
							minWidth: 140, transition: 'background 0.2s',
						}}
						onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = C.accentHover; }}
						onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = C.accent; }}
					>
						{loading ? 'Saving…' : isEditMode ? 'Update Program' : 'Create Program'}
					</button>
				</div>

			</div>
		</div>
	);
};

AddProgram.defaultProps = {
	initialValues: {},
};

export default AddProgram;
