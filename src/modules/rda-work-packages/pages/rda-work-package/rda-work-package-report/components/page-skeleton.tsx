import React from 'react';
import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';

const Title = styled.div`
	margin-bottom: 1.7rem;
`;

const Sections = styled.div`
	display: flex;
	align-items: stretch;
	gap: 1.5rem;
	height: 572px;

	& .left-content {
		width: 100%;
		max-width: 340px;

		.react-loading-skeleton {
			height: 100%;
		}
	}

	& .right-content {
		width: 100%;

		.react-loading-skeleton {
			height: 100%;
		}
	}
`;

export const PageSkeleton: React.FC = () => {
	return (
		<>
			<Title>
				<Skeleton count={1} height="63px" borderRadius="0.5rem" />
			</Title>

			<Sections>
				<Skeleton
					containerClassName="left-content"
					count={1}
					borderRadius="0.5rem"
				/>
				<Skeleton
					containerClassName="right-content"
					count={1}
					borderRadius="0.5rem"
				/>
			</Sections>
		</>
	);
};
