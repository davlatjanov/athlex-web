import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getJwtToken, updateUserInfo } from '../../auth';

const withAuth = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const [authorized, setAuthorized] = useState(false);

		useEffect(() => {
			const jwt = getJwtToken();
			if (!jwt) {
				router.replace(`/account/join?referrer=${router.pathname}`);
			} else {
				updateUserInfo(jwt);
				setAuthorized(true);
			}
		}, []);

		if (!authorized) return null;

		return <Component {...(props as any)} />;
	};
};

export default withAuth;
