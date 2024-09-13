import styled from 'styled-components';

export const TableCol = styled.div`
	display: flex;
	justify-content: center;
	flex-direction: column;

	&:not(:last-child) {
		flex-grow: 1;
	}
`;
