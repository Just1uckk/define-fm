import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Text } from 'shared/components/text/text';

const UserAvatarMoreRoot = styled.button<ThemeProps>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.77rem;
	height: 2.77rem;
	padding: 0;
	border: 2px solid ${({ theme }) => theme.colors.white};
	border-radius: 50%;
	color: ${({ theme }) => theme.userAvatarMore.color};
	background-color: ${({ theme }) => theme.userAvatarMore.bg};
	pointer-events: none;
`;

interface UserAvatarMoreProps {
	count: number | string;
}

export const UserAvatarMore: React.FC<UserAvatarMoreProps> = ({ count }) => {
	return (
		<UserAvatarMoreRoot tabIndex={-1}>
			<Text variant="body_3_primary">+{count}</Text>
		</UserAvatarMoreRoot>
	);
};
