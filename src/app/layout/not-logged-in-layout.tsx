import React from 'react';
import styled from 'styled-components';

const Content = styled.div`
	width: 100%;
`;

export const NotLoggedInLayout: React.FC<React.PropsWithChildren> = ({
	children,
}) => (
	<>
		<Content>{children}</Content>
	</>
);
