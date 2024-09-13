import React from 'react';
import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';

const Wrapper = styled.div`
	display: flex;
	flex-grow: 1;
	gap: 1.6rem;
	margin-top: -0.75rem;
	padding-bottom: 0.75rem;

	& > * {
		width: 100%;
	}

	& .panel {
		max-width: 340px;
	}
`;

export const UsersAndGroupsListSkeleton: React.FC = () => {
	return (
		<Wrapper>
			<Skeleton
				count={12}
				height={72}
				style={{ marginTop: '12px' }}
				borderRadius="0.5rem"
			/>
			<Skeleton
				containerClassName="panel"
				count={1}
				height={375}
				style={{ marginTop: '12px' }}
				borderRadius="0.5rem"
			/>
		</Wrapper>
	);
};
