import React from 'react';
import { NextPage } from 'next';
import { Stack, Typography } from '@mui/material';

const MyArticles: NextPage = () => {
	return (
		<div id="my-articles-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">My Articles</Typography>
				</Stack>
			</Stack>
			<div className={'no-data'}>
				<p>No articles yet.</p>
			</div>
		</div>
	);
};

export default MyArticles;
