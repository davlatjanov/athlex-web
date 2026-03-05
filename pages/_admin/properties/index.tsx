import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Stack, Typography } from '@mui/material';

const AdminPrograms: NextPage = () => {
	return (
		<Stack sx={{ padding: '40px', color: '#fff' }}>
			<Typography variant="h5">Program Management</Typography>
			<Typography sx={{ color: '#94a3b8', mt: 1 }}>Admin program management coming soon.</Typography>
		</Stack>
	);
};

export default withAdminLayout(AdminPrograms);
