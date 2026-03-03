import React from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const CATEGORY_IMAGES: Record<string, string> = {
	FREE: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&fit=crop&auto=format&q=75',
	RECOMMEND: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&fit=crop&auto=format&q=75',
	NEWS: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&fit=crop&auto=format&q=75',
	HUMOR: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&fit=crop&auto=format&q=75',
};

const CATEGORY_LABELS: Record<string, string> = {
	FREE: 'General',
	RECOMMEND: 'Workouts',
	NEWS: 'Nutrition',
	HUMOR: 'Progress',
};

const CATEGORY_COLORS: Record<string, string> = {
	FREE: '#5b8dee',
	RECOMMEND: '#E92C28',
	NEWS: '#27ae60',
	HUMOR: '#e67e22',
};

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: string;
	likeArticleHandler: any;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { boardArticle, likeArticleHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const category = boardArticle?.articleCategory || 'FREE';
	const imagePath: string = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: CATEGORY_IMAGES[category] || CATEGORY_IMAGES['FREE'];

	const memberImage: string = boardArticle?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${boardArticle?.memberData?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/
	const chooseArticleHandler = () => {
		router.push(
			{
				pathname: '/community/detail',
				query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	const goMemberPage = (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	if (device === 'mobile') {
		return <div>COMMUNITY CARD MOBILE</div>;
	} else {
		return (
			<Stack className={'comm-card'} onClick={chooseArticleHandler}>
				{/* Thumbnail */}
				<div className={'cc-thumb'}>
					<img
						src={imagePath}
						alt={boardArticle?.articleTitle}
						className={'cc-thumb-img'}
						onError={(e) => { (e.target as HTMLImageElement).src = CATEGORY_IMAGES['FREE']; }}
					/>
					<div className={'cc-thumb-overlay'} />
				</div>

				{/* Main content */}
				<Stack className={'cc-body'}>
					<div className={'cc-top'}>
						<span
							className={'cc-category-badge'}
							style={{ background: CATEGORY_COLORS[category] + '22', color: CATEGORY_COLORS[category], borderColor: CATEGORY_COLORS[category] + '44' }}
						>
							{CATEGORY_LABELS[category]}
						</span>
						<Moment className={'cc-date'} format={'MMM DD, YYYY'}>
							{boardArticle?.createdAt}
						</Moment>
					</div>

					<h3 className={'cc-title'}>{boardArticle?.articleTitle}</h3>

					<div className={'cc-author'} onClick={(e) => goMemberPage(e, boardArticle?.memberData?._id as string)}>
						<img
							src={memberImage}
							alt={boardArticle?.memberData?.memberNick}
							className={'cc-avatar'}
							onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }}
						/>
						<span className={'cc-nick'}>{boardArticle?.memberData?.memberNick || 'Anonymous'}</span>
					</div>
				</Stack>

				{/* Stats */}
				<Stack className={'cc-stats'}>
					<div className={'cc-stat-item'}>
						<RemoveRedEyeIcon className={'cc-stat-icon'} />
						<span>{boardArticle?.articleViews || 0}</span>
					</div>
					<div className={'cc-stat-item'} onClick={(e) => likeArticleHandler(e, user, boardArticle._id)}>
						{boardArticle?.meLiked?.[0]?.myFavorite ? (
							<FavoriteIcon className={'cc-stat-icon liked'} />
						) : (
							<FavoriteBorderIcon className={'cc-stat-icon'} />
						)}
						<span>{boardArticle?.articleLikes || 0}</span>
					</div>
					<div className={'cc-stat-item'}>
						<ChatBubbleOutlineIcon className={'cc-stat-icon'} />
						<span>{boardArticle?.articleComments || 0}</span>
					</div>
				</Stack>
			</Stack>
		);
	}
};

export default CommunityCard;
