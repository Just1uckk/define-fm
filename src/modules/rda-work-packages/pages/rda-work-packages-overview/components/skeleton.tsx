import React from 'react';
import Skeleton from 'react-loading-skeleton';

export const RdaWorkPackagesListSkeleton: React.FC = () => {
	return (
		<Skeleton
			count={12}
			height={82}
			style={{ marginTop: '12px' }}
			borderRadius="0.5rem"
		/>
	);
};
