import React, { useState } from 'react';
import { Pencil, Trash2, ArchiveRestore, Dumbbell } from 'lucide-react';
import { Program } from '../../types/program/program';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { ProgramStatus } from '../../enums/training-program.enum';

interface ProgramCardProps {
	program: Program;
	deleteProgramHandler?: any;
	memberPage?: boolean;
	updateProgramHandler?: any;
}

export const ProgramCard = (props: ProgramCardProps) => {
	const { program, deleteProgramHandler, memberPage, updateProgramHandler } = props;
	const router = useRouter();
	const [dropdownOpen, setDropdownOpen] = useState(false);

	/** HANDLERS **/
	const pushEditProgram = async (id: string) => {
		await router.push({
			pathname: '/mypage',
			query: { category: 'addProperty', propertyId: id },
		});
	};

	const pushProgramDetail = async (id: string) => {
		if (memberPage)
			await router.push({
				pathname: '/programs/detail',
				query: { id: id },
			});
		else return;
	};

	return (
		<div className="property-card-box">
			<div className="program-col" onClick={() => pushProgramDetail(program?._id)}>
				<div className="image-box">
					<img src={program?.programImages?.[0] || '/img/banner/header1.svg'} alt="" />
				</div>
				<div className="information-box">
					<span className="name">{program?.programName}</span>
					<span className="address">{program?.programType}</span>
					<span className="price">
						<strong>${program?.programPrice?.toLocaleString()}</strong>
					</span>
				</div>
			</div>
			<div className="date-box">
				<span className="date">
					<Moment format="DD MMMM, YYYY">{program?.createdAt}</Moment>
				</span>
			</div>
			<div className="status-box">
				<div
					className="coloured-box"
					style={{ background: program?.programStatus === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)' }}
					onClick={() => !memberPage && program?.programStatus !== 'ARCHIVED' && setDropdownOpen((o) => !o)}
				>
					<span className="status" style={{ color: program?.programStatus === 'ACTIVE' ? '#22C55E' : '#aaaaaa', fontWeight: 700 }}>
						{program?.programStatus}
					</span>
				</div>

				{/* Status dropdown */}
				{!memberPage && program?.programStatus !== 'ARCHIVED' && dropdownOpen && (
					<>
						<div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
						<div style={{
							position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: 4,
							background: '#1a2236', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
							boxShadow: '0 4px 12px rgba(0,0,0,0.4)', minWidth: 80, overflow: 'hidden',
						}}>
							{program?.programStatus === 'ACTIVE' && (
								<div
									style={{ padding: '8px 14px', fontSize: 13, color: '#e2e8f0', cursor: 'pointer' }}
									onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
									onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
									onClick={() => { setDropdownOpen(false); updateProgramHandler(ProgramStatus.ARCHIVED, program?._id); }}
								>
									Archive
								</div>
							)}
						</div>
					</>
				)}
			</div>

			<div className="views-box">
				<span className="views">{program?.programViews?.toLocaleString()}</span>
			</div>
			{!memberPage && (
				<div className="action-box">
					{program?.programStatus === ProgramStatus.ACTIVE ? (
						<>
							<button className="icon-button" title="Manage Workouts"
								onClick={() => router.push(`/mypage/workout-builder/${program._id}`)}>
								<Dumbbell className="buttons btn-workouts" size={18} />
							</button>
							<button className="icon-button" title="Edit" onClick={() => pushEditProgram(program._id)}>
								<Pencil className="buttons btn-edit" size={18} />
							</button>
							<button className="icon-button" title="Delete" onClick={() => deleteProgramHandler(program._id)}>
								<Trash2 className="buttons btn-delete" size={18} />
							</button>
						</>
					) : (
						<>
							<button className="icon-button" title="Unarchive" onClick={() => updateProgramHandler(ProgramStatus.ACTIVE, program._id)}>
								<ArchiveRestore className="buttons btn-unarchive" size={18} />
							</button>
							<button className="icon-button" title="Delete" onClick={() => deleteProgramHandler(program._id)}>
								<Trash2 className="buttons btn-delete" size={18} />
							</button>
						</>
					)}
				</div>
			)}
		</div>
	);
};
