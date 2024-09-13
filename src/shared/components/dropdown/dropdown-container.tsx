import styled from 'styled-components';
import { compose, space, SpaceProps } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

export const DropdownContainer = styled.div<ThemeProps & SpaceProps>`
	padding: 0.5rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border-radius: ${({ theme }) => theme.borderRadius.base};
	box-shadow: 0 12px 32px rgba(0, 0, 0, var(--box-shadow-opacity, 0.15));
	z-index: 10;
	cursor: default;
	overflow: hidden;
	${compose(space)}
`;
