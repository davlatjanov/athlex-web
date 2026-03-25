import React from 'react';

const Advertisement = () => {
	return (
		<div className={'video-frame'}>
			<video
				autoPlay
				muted
				loop
				playsInline
				preload="auto"
				style={{ width: '100%', height: '100%', objectFit: 'cover' }}
			>
				<source src="/video/ads.mov" type="video/mp4" />
			</video>
		</div>
	);
};

export default Advertisement;
