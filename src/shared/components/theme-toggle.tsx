import React from 'react';
import { PressEvent } from '@react-types/shared/src/events';
import styled from 'styled-components';

import { THEME_TYPES } from 'shared/constants/constans';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';

const StyledIconButton = styled(IconButton)`
	border-radius: ${({ theme }) => theme.borderRadius.base};
	border: 1px solid ${({ theme }) => theme.borderColorPrimary};
`;

const icons = {
	[THEME_TYPES.DARK]: ICON_COLLECTION.dark,
	[THEME_TYPES.LIGHT]: ICON_COLLECTION.light,
};

interface ThemeToggleProps {
	currentTheme: THEME_TYPES.DARK | THEME_TYPES.LIGHT;
	onClick: (e: PressEvent) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
	currentTheme,
	onClick,
}) => {
	return <StyledIconButton icon={icons[currentTheme]} onPress={onClick} />;
};
