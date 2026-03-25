import React from 'react';
import { useRouter } from 'next/router';
import { Member } from '../../types/member/member';

interface TopAgentProps {
	agent: Member;
}

const TopAgentCard = (props: TopAgentProps) => {
	const { agent } = props;
	const router = useRouter();
	const agentImage = agent?.memberImage
		? `${process.env.NEXT_PUBLIC_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	return (
		<div className="top-agent-card">
			<img src={agentImage} alt="" />
			<strong>{agent?.memberNick}</strong>
			<span>{agent?.memberType}</span>
		</div>
	);
};

export default TopAgentCard;
