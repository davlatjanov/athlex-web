import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_PROGRESS_RESULTS } from '../../../apollo/user/query';

type T = any;

const formatDate = (dateStr: string): string => {
	const d = new Date(dateStr);
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const MemberJoinedPrograms = () => {
	const router = useRouter();
	const memberId = router.query?.memberId as string;

	const { data } = useQuery(GET_PROGRESS_RESULTS, {
		variables: { input: { page: 1, limit: 50, memberId } },
		skip: !memberId,
	});

	const posts: T[] = data?.getProgressResults?.list ?? [];

	// Group posts by programId
	const programMap: Record<string, { programId: string; posts: T[] }> = {};
	posts.forEach((post: T) => {
		const pid = post.programId ?? 'unknown';
		if (!programMap[pid]) {
			programMap[pid] = { programId: pid, posts: [] };
		}
		programMap[pid].posts.push(post);
	});

	const programs = Object.values(programMap);

	// Latest 3 activity posts
	const latestPosts = [...posts]
		.sort((a: T, b: T) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 3);

	if (posts.length === 0) {
		return (
			<div id="member-joined-programs">
				<div className="mjp-empty">
					<span>📋</span>
					<p>No program activity found.</p>
				</div>
			</div>
		);
	}

	return (
		<div id="member-joined-programs">
			<h2 className="mjp-header">
				Active Programs
				<span>({programs.length})</span>
			</h2>

			<div className="mjp-grid">
				{programs.map(({ programId, posts: pPosts }) => (
					<div className="mjp-card" key={programId}>
						<div className="mjp-program-name">
							{programId !== 'unknown' ? `Program #${programId.slice(-6)}` : 'Unknown Program'}
						</div>
						<div className="mjp-count">{pPosts.length} progress {pPosts.length === 1 ? 'post' : 'posts'}</div>
					</div>
				))}
			</div>

			{latestPosts.length > 0 && (
				<div className="mjp-activity">
					<h4>Latest Activity</h4>
					{latestPosts.map((post: T) => (
						<div className="mjp-post" key={post._id}>
							{post.content && <p style={{ margin: 0 }}>{post.content}</p>}
							<div className="mjp-post-date">{formatDate(post.createdAt)}</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MemberJoinedPrograms;
