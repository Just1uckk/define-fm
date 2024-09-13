import React from 'react';
import Skeleton from 'react-loading-skeleton';

export const DispositionSearchListSkeleton: React.FC = () => {
	return (
		<Skeleton
			count={12}
			height={70}
			style={{ marginTop: '12px' }}
			borderRadius="0.5rem"
		/>
	);
};
