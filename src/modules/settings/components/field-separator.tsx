import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

export const FieldSeparator = styled.div<ThemeProps>`
	margin: 2rem 0;
	height: 1px;
	background-color: ${({ theme }) => theme.colors.borderColorPrimary};
`;
