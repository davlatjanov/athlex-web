import React from 'react';
import { Stack, Typography } from '@mui/material';

const AddProperty = ({ initialValues, ...props }: any) => {
	return (
		<div id="add-property-page">
			<Stack className="main-title-box">
				<Typography className="main-title">Add New Program</Typography>
				<Typography className="sub-title">Program creation coming soon.</Typography>
			</Stack>
		</div>
	);
};

AddProperty.defaultProps = {
	initialValues: {},
};

export default AddProperty;
