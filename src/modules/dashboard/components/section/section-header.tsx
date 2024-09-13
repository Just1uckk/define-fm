import React from 'react';
import styled from 'styled-components';

import { Text } from 'shared/components/text/text';

const Wrapper = styled.div`
	display: flex;
`;

export const SectionHeader: React.FC<
	React.PropsWithChildren<{ title: string }>
> = ({ title, children }) => {
	return (
		<Wrapper>
			<Text variant="body_3_primary_semibold">{title}</Text>
			{children}
		</Wrapper>
	);
};
