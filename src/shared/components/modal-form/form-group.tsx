import styled from 'styled-components';

export const FormGroup = styled.div`
	& + & {
		margin-top: 1.25rem;
	}

	& > :first-child {
		margin-top: 0;
	}
`;
