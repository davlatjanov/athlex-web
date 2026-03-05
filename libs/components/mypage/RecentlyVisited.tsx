import React from 'react';
import { NextPage } from 'next';
import { Stack, Typography } from '@mui/material';

const RecentlyVisited: NextPage = () => {
	return (
		<div id="recently-viewed-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">Recently Viewed</Typography>
					<Typography className="sub-title">Programs you opened recently.</Typography>
				</Stack>
			</Stack>
			<Stack className="favorites-list-box">
				<div className={'no-data'}>
					<img src="/img/icons/icoAlert.svg" alt="" />
					<p>No recently viewed programs yet.</p>
				</div>
			</Stack>
		</div>
	);
};

export default RecentlyVisited;
