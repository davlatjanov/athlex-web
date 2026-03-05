import React from 'react';
import { NextPage } from 'next';
import { Stack, Typography } from '@mui/material';

const MyFavorites: NextPage = () => {
	return (
		<div id="my-favorites-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">Saved Programs</Typography>
					<Typography className="sub-title">Programs you have bookmarked.</Typography>
				</Stack>
			</Stack>
			<Stack className="favorites-list-box">
				<div className={'no-data'}>
					<img src="/img/icons/icoAlert.svg" alt="" />
					<p>No saved programs yet.</p>
				</div>
			</Stack>
		</div>
	);
};

export default MyFavorites;
