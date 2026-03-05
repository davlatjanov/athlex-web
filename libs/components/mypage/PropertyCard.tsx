import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import { Program } from '../../types/program/program';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { ProgramStatus } from '../../enums/training-program.enum';

interface PropertyCardProps {
	property: Program;
	deletePropertyHandler?: any;
	memberPage?: boolean;
	updatePropertyHandler?: any;
}

export const PropertyCard = (props: PropertyCardProps) => {
	const { property: program, deletePropertyHandler, memberPage, updatePropertyHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	/** HANDLERS **/
	const pushEditProperty = async (id: string) => {
		await router.push({
			pathname: '/mypage',
			query: { category: 'addProperty', propertyId: id },
		});
	};

	const pushPropertyDetail = async (id: string) => {
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
				<Stack className="image-box" onClick={() => pushPropertyDetail(program?._id)}>
					<img src={program?.programImages?.[0] || '/img/banner/header1.svg'} alt="" />
				</Stack>
				<Stack className="information-box" onClick={() => pushPropertyDetail(program?._id)}>
					<Typography className="name">{program?.programName}</Typography>
					<Typography className="address">{program?.programType}</Typography>
					<Typography className="price">
						<strong>${program?.programPrice?.toLocaleString()}</strong>
					</Typography>
				</Stack>
				<Stack className="date-box">
					<Typography className="date">
						<Moment format="DD MMMM, YYYY">{program?.createdAt}</Moment>
					</Typography>
				</Stack>
				<Stack className="status-box">
					<Stack className="coloured-box" sx={{ background: '#E5F0FD' }} onClick={handleClick}>
						<Typography className="status" sx={{ color: '#3554d1' }}>
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
										updatePropertyHandler(ProgramStatus.ARCHIVED, program?._id);
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
				{!memberPage && program?.programStatus === ProgramStatus.ACTIVE && (
					<Stack className="action-box">
						<IconButton className="icon-button" onClick={() => pushEditProperty(program._id)}>
							<ModeIcon className="buttons" />
						</IconButton>
						<IconButton className="icon-button" onClick={() => deletePropertyHandler(program._id)}>
							<DeleteIcon className="buttons" />
						</IconButton>
					</Stack>
				)}
			</Stack>
		);
};
