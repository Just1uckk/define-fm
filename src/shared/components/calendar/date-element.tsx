import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

export const DateElement = styled.button<ThemeProps>`
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 0.875rem;
	line-height: 0.875rem;
	text-align: center;
	border: none;
	border-radius: 0.25rem;
	background-color: transparent;
	/* color: ${({ theme }) => theme.datePicker.dataElement.color}; */
	color: var(--palette-primary);

	&:focus-visible {
		outline: rgb(16, 16, 16) auto 1px;
		outline: -webkit-focus-ring-color auto 1px;
	}

	&[disabled] {
		color: ${({ theme }) => theme.datePicker.dataElement.disabledColor};
		outline: none;
		cursor: not-allowed;
	}

	&.is-today {
		color: ${({ theme }) => theme.colors.accent};
		border: 1px solid ${({ theme }) => theme.datePicker.dataElement.borderColor};
	}

	&.range {
		font-weight: 600;
		color: ${({ theme }) => theme.datePicker.dataElement.active.color};
		border: 1px solid ${({ theme }) => theme.datePicker.dataElement.borderColor};
	}

	&.is-current-second {
		font-weight: 600;
		background-color: ${({ theme }) =>
			theme.datePicker.dataElement.active.background};
		color: ${({ theme }) => theme.datePicker.dataElement.active.color};
	}

	&.is-current {
		font-weight: 600;
		background-color: ${({ theme }) =>
			theme.datePicker.dataElement.active.background};
		color: ${({ theme }) => theme.datePicker.dataElement.active.color};
	}
`;
