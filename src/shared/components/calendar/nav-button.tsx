import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IconButton } from 'shared/components/icon-button/icon-button';

export const NavButton = styled(IconButton)<ThemeProps>`
	height: 1.5rem;
	width: 1.5rem;
	border-radius: 50%;
	background: ${({ theme }) => theme.datePicker.navButton.background};
	padding: 0;

	&:focus-visible {
		outline: rgb(16, 16, 16) auto 1px;
		outline: -webkit-focus-ring-color auto 1px;
	}

	&:disabled {
		color: ${({ theme }) => theme.datePicker.navButton.disabledColor};
		outline: none;
		cursor: not-allowed;
	}
`;
