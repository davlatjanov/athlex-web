import React from 'react';

interface SkeletonProps {
	width?: string;
	height?: string;
	borderRadius?: string;
	className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
	width = '100%',
	height = '16px',
	borderRadius = '6px',
	className = '',
}) => (
	<div
		className={`skeleton-pulse ${className}`}
		style={{ width, height, borderRadius }}
	/>
);

export const ProgramCardSkeleton: React.FC = () => (
	<div className="skeleton-card">
		<div className="skeleton-card-img skeleton-pulse" />
		<div className="skeleton-card-body">
			<Skeleton height="22px" width="60%" />
			<Skeleton height="14px" width="40%" />
			<Skeleton height="14px" width="80%" />
			<Skeleton height="32px" borderRadius="8px" />
		</div>
	</div>
);

export const ProductCardSkeleton: React.FC = () => (
	<div className="skeleton-card">
		<div className="skeleton-card-img skeleton-pulse" />
		<div className="skeleton-card-body">
			<Skeleton height="12px" width="40%" />
			<Skeleton height="18px" width="70%" />
			<Skeleton height="22px" width="30%" />
			<Skeleton height="36px" borderRadius="8px" />
		</div>
	</div>
);

export const TrainerCardSkeleton: React.FC = () => (
	<div className="skeleton-trainer-card">
		<div className="skeleton-avatar skeleton-pulse" />
		<Skeleton height="16px" width="60%" />
		<Skeleton height="12px" width="80%" />
		<Skeleton height="12px" width="50%" />
	</div>
);
