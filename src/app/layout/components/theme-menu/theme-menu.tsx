import React, { Key } from 'react';
import { Item } from 'react-stately';
import {
	DEFAULT_SETTINGS_LIST,
	findDefaultOption,
} from 'modules/auth/components/profile-settings-form/profile-tabs/edit-default-settings';
import { LocalStorageService } from 'shared/services/local-storage-service';
import styled from 'styled-components';

import {
	selectDefaultSettingsData,
	selectUserData,
} from 'app/store/user/user-selectors';

import { IUser } from 'shared/types/users';

import { THEME_TYPES } from 'shared/constants/constans';

import { useTranslation } from 'shared/hooks/use-translation';

import { DropdownSimpleButton } from 'shared/components/dropdown/dropdown-simple-button';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	MenuButton,
	MenuButtonProps,
} from 'shared/components/menu-button/menu-button';

import { ThemeMenuButton } from './theme-menu-button';

const StyledMenuButton = styled(MenuButton)<{
	fulfilled?: boolean;
}>`
	width: ${({ fulfilled }) => (fulfilled ? '12.625rem' : 'auto')};
`;

const DropdownOptionContent = styled(DropdownSimpleButton)`
	display: flex;
	gap: 0.5rem;
	align-items: center;
`;

const ThemeIcon = styled(Icon)`
	color: currentColor;
`;

export const THEME_MENU_OPTIONS = {
	dark: {
		type: THEME_TYPES.DARK,
		icon: ICON_COLLECTION.dark,
	},
	system: {
		type: THEME_TYPES.SYSTEM,
		icon: ICON_COLLECTION.system_theme,
	},
	light: {
		type: THEME_TYPES.LIGHT,
		icon: ICON_COLLECTION.light,
	},
} as const;

export const THEME_MENU_OPTION_LIST = Object.values(THEME_MENU_OPTIONS);

type IThemeOption = {
	type: THEME_TYPES;
	icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
};

interface LanguageMenuProps {
	className?: string;
	fulfilled?: boolean;
	currentTheme?: THEME_TYPES;
	onChangeTheme: (theme: THEME_TYPES) => void;
}

export const ThemeMenu: React.FC<LanguageMenuProps> = ({
	className,
	fulfilled,
	currentTheme,
	onChangeTheme,
}) => {
	const { t } = useTranslation();
	const defaultSettings = selectDefaultSettingsData();

	const handleSelectOption = (theme: Key) => {
		const themeType = theme as THEME_TYPES;

		onChangeTheme(themeType);

		LocalStorageService.set('color-mode', themeType);
	};

	return (
		<StyledMenuButton<React.ComponentType<MenuButtonProps<IThemeOption>>>
			items={THEME_MENU_OPTION_LIST}
			onAction={handleSelectOption}
			closeOnSelect
			placement="top start"
			fulfilled={fulfilled}
			handler={
				<ThemeMenuButton
					className={className}
					fulfilled={fulfilled}
					currentTheme={
						currentTheme ||
						findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.THEME)
							?.value
					}
				/>
			}
		>
			{({ type, icon }) => {
				const label = t(`app_theme.${type}`);

				return (
					<Item key={type} textValue={label}>
						<DropdownOptionContent isActive={currentTheme === type}>
							<ThemeIcon icon={icon} />
							{label}
						</DropdownOptionContent>
					</Item>
				);
			}}
		</StyledMenuButton>
	);
};
