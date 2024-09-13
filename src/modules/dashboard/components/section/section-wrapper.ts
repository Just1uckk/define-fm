import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

export const SectionWrapper = styled.section<ThemeProps>`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	border: ${({ theme }) => theme.border.base};
	border-radius: ${({ theme }) => theme.borderRadius.base};
	padding: 1rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
`;

export const SectionBody = styled.div``;
