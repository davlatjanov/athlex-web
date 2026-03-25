import React from 'react';
import { NextPage } from 'next';

const MyArticles: NextPage = () => {
	return (
		<div id="my-articles-page">
			<div className="main-title-box">
				<div className="right-box">
					<span className="main-title">My Articles</span>
				</div>
			</div>
			<div className={'no-data'}>
				<p>No articles yet.</p>
			</div>
		</div>
	);
};

export default MyArticles;
