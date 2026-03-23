import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
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
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

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

	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return <div>MOBILE PROGRAM CARD</div>;
	} else
		return (
			<Stack className="property-card-box">
				<div className="program-col" onClick={() => pushProgramDetail(program?._id)}>
					<Stack className="image-box">
						<img src={program?.programImages?.[0] || '/img/banner/header1.svg'} alt="" />
					</Stack>
					<Stack className="information-box">
						<Typography className="name">{program?.programName}</Typography>
						<Typography className="address">{program?.programType}</Typography>
						<Typography className="price">
							<strong>${program?.programPrice?.toLocaleString()}</strong>
						</Typography>
					</Stack>
				</div>
				<Stack className="date-box">
					<Typography className="date">
						<Moment format="DD MMMM, YYYY">{program?.createdAt}</Moment>
					</Typography>
				</Stack>
				<Stack className="status-box">
					<Stack className="coloured-box"
						sx={{ background: program?.programStatus === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)' }}
						onClick={handleClick}
					>
						<Typography className="status" sx={{ color: program?.programStatus === 'ACTIVE' ? '#22C55E' : '#aaaaaa', fontWeight: 700 }}>
							{program?.programStatus}
						</Typography>
					</Stack>
				</Stack>
				{!memberPage && program?.programStatus !== 'ARCHIVED' && (
					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
						PaperProps={{
							elevation: 0,
							sx: {
								width: '70px',
								mt: 1,
								ml: '10px',
								overflow: 'visible',
								filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							},
							style: {
								padding: 0,
								display: 'flex',
								justifyContent: 'center',
							},
						}}
					>
						{program?.programStatus === 'ACTIVE' && (
							<>
								<MenuItem
									disableRipple
									onClick={() => {
										handleClose();
										updateProgramHandler(ProgramStatus.ARCHIVED, program?._id);
									}}
								>
									Archive
								</MenuItem>
							</>
						)}
					</Menu>
				)}

				<Stack className="views-box">
					<Typography className="views">{program?.programViews?.toLocaleString()}</Typography>
				</Stack>
				{!memberPage && (
					<Stack className="action-box">
						{program?.programStatus === ProgramStatus.ACTIVE ? (
							<>
								<IconButton className="icon-button" title="Manage Workouts"
									onClick={() => router.push(`/mypage/workout-builder/${program._id}`)}>
									<FitnessCenterIcon className="buttons btn-workouts" />
								</IconButton>
								<IconButton className="icon-button" title="Edit" onClick={() => pushEditProgram(program._id)}>
									<ModeIcon className="buttons btn-edit" />
								</IconButton>
								<IconButton className="icon-button" title="Delete" onClick={() => deleteProgramHandler(program._id)}>
									<DeleteIcon className="buttons btn-delete" />
								</IconButton>
							</>
						) : (
							<>
								<IconButton className="icon-button" title="Unarchive" onClick={() => updateProgramHandler(ProgramStatus.ACTIVE, program._id)}>
									<UnarchiveOutlinedIcon className="buttons btn-unarchive" />
								</IconButton>
								<IconButton className="icon-button" title="Delete" onClick={() => deleteProgramHandler(program._id)}>
									<DeleteIcon className="buttons btn-delete" />
								</IconButton>
							</>
						)}
					</Stack>
				)}
			</Stack>
		);
};
