import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.li`
	position: absolute;
	top: 0;
	height: 100%;
	left: 1.3rem;
`;

export const MenuItemVerticalLine: React.FC = () => {
	return (
		<Wrapper role="presentation" aria-hidden="true">
			<svg
				width="1"
				height="100%"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<line x1="100%" y1="0%" x2="0%" y2="68%" stroke="#F0F0F0" />
			</svg>
		</Wrapper>
	);
};
