import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
	position: absolute;
	top: 50%;
	left: -3px;
	margin-top: -2px;
	transform: translateY(-50%);
`;

export const MenuItemCurveLine: React.FC = () => {
	return (
		<Wrapper>
			<svg
				width="11"
				height="14"
				viewBox="0 0 11 14"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M0.5 0.5C0.499861 5 0.5 13.5 11 13.5" stroke="#F0F0F0" />
			</svg>
		</Wrapper>
	);
};
