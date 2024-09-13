import styled from 'styled-components';

export const PaginationLink = styled.button.attrs(() => ({
	tabIndex: 0,
}))`
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 1.5rem;
	height: 1.5rem;
	cursor: pointer;
	font-size: 12px;
	line-height: 12px;
	background-color: transparent;
	border: none;
	color: inherit;
`;
