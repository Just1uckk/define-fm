import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

export const TableControlWrapperCss = css<ThemeProps & { isActive?: boolean }>`
	display: flex;
	align-items: center;
	padding: 0.8rem 1rem;
	color: ${({ theme }) => theme.text.primaryColor};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	background-color: ${({ theme }) => theme.colors.background.secondary};

	&.is-open,
	&.is-active {
		background-color: ${({ theme }) => theme.colors.borderColorPrimary};
	}

	&:first-child {
		margin-left: 0;
	}
`;

export const TableControlWrapper = styled.div<ThemeProps>`
	${TableControlWrapperCss}
`;
