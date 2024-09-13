import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

export const DropdownItemSeparator = styled.li<ThemeProps>`
	height: 1px;
	margin-bottom: 0.1rem;
	background-color: ${({ theme }) => theme.colors.borderColorPrimary};
`;
