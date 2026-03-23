import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Legacy route — redirect to the new dynamic route /programs/[id]
const ProgramDetailRedirect = () => {
	const router = useRouter();
	useEffect(() => {
		const { id } = router.query;
		if (id) {
			router.replace(`/programs/${id}`);
		} else {
			router.replace('/programs');
		}
	}, [router]);
	return null;
};

export default ProgramDetailRedirect;
