import styled from 'styled-components';

export const FormBody = styled.div`
	margin-bottom: 1.5rem;
	padding: 1.5rem;
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: ${({ theme }) => theme.borderRadius.base};
	background-color: ${({ theme }) => theme.colors.background.secondary};
`;
