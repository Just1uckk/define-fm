import { css } from 'styled-components';

import { THEME_COLORS } from 'app/settings/theme/theme';

export const buttonVariants = {
	variant: {
		primary: css`
			--color: ${({ theme }) => theme.colors.white};
			background-color: ${({ theme }) => theme.buttons.primary.background};
			border-color: ${({ theme }) => theme.buttons.primary.background};

			&:hover,
			&.is-active {
				color: var(--color);
				background-color: ${({ theme }) => theme.buttons.primary.hover.background};
		`,
		primary_outlined: css`
			--color: ${({ theme }) => theme.colors.primary};
			border-color: var(--color);

			&:hover,
			&.is-active {
				background-color: ${({ theme }) =>
					theme.buttons.primary_outlined.hover.background};
			}
		`,
		white: css`
			--color: ${THEME_COLORS.primary};
			background-color: ${({ theme }) => theme.colors.white};

			&.is-active .button__content-icon {
				color: ${({ theme }) => theme.colors.accent};
			}

			&:hover,
			&.is-active {
				background-color: ${({ theme }) => theme.colors.grey.style_0};
			}
		`,
		success_outlined: css`
			--color: ${({ theme }) => theme.colors.green.style_1};
			border-color: ${({ theme }) => theme.colors.green.style_1};
		`,
		primary_ghost: css`
			--color: ${({ theme }) => theme.colors.primary};
			border-color: transparent;
		`,
	},
};
