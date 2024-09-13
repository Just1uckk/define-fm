import styled, { css } from 'styled-components';
import { compose, space, SpaceProps } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

export type DropdownItemProps = {
	isActive?: boolean;
	isHighlighted?: boolean;
} & SpaceProps;

const hoverStyles = css`
	background-color: ${({ theme }) =>
		theme.dropdownOption.active.backgroundColor};

	color: ${({ theme }) => theme.dropdownOption.active.color};
	text-shadow: 1px 0 0 currentColor;
`;

export const DropdownItem = styled.li<DropdownItemProps & ThemeProps>`
	width: 100%;
	cursor: pointer;
	font-size: 0.875rem;
	line-height: 1.0625rem;
	font-weight: 400;
	color: ${({ theme }) => theme.colors.primary};
	border-radius: 0.5rem;

	&:hover {
		${hoverStyles}
	}

	${({ isActive, isHighlighted }) => (isActive || isHighlighted) && hoverStyles}

	&[data-selected] {
		${hoverStyles}
	}

	${compose(space)}
`;
