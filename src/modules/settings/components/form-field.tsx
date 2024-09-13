import styled, { css } from 'styled-components';

export const FormField = styled.div<{ fulfilled?: boolean }>`
	max-width: 34.1rem;
	padding: 0.8rem;
	margin: 0 -0.8rem;

	${({ fulfilled }) =>
		fulfilled &&
		css`
			max-width: 100%;
		`}
`;
