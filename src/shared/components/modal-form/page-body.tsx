import styled from 'styled-components';

export const PageBody = styled.div.attrs(() => ({
	className: 'page-body',
}))`
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	margin-top: 1.5rem;
`;
