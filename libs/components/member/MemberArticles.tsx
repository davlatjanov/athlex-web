import React from 'react';
import { NextPage } from 'next';
import { Stack, Typography } from '@mui/material';

const MemberArticles: NextPage = () => {
	return (
		<div id="member-articles">
			<div className={'no-data'}>
				<p>No articles yet.</p>
			</div>
		</div>
	);
};

export default MemberArticles;
