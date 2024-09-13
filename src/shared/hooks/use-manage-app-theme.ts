import { useEffect, useMemo, useState } from 'react';
import { LocalStorageService } from 'shared/services/local-storage-service';
import { getSavedAppTheme } from 'shared/utils/get-saved-app-theme';

import { selectDefaultSettingsData } from 'app/store/user/user-selectors';

import { THEME_TYPES } from 'shared/constants/constans';

export function useManageAppTheme() {
	const defaultSettings = selectDefaultSettingsData();
	const [savedThemeType, setThemeType] = useState<THEME_TYPES>(
		THEME_TYPES.LIGHT,
	);

	useEffect(() => {
		const localTheme = LocalStorageService.get('color-mode');
		if (localTheme) {
			setThemeType(localTheme as THEME_TYPES);
		} else {
			if (defaultSettings && defaultSettings.length) {
				const themeProperty = defaultSettings.find(
					(element) => element.property === 'rda.preference.theme',
				);
				if (themeProperty) {
					LocalStorageService.set('color-mode', themeProperty.value);
					setThemeType(themeProperty.value as THEME_TYPES);
				}
			}
		}
	}, [defaultSettings]);

	useEffect(() => {
		// const mode = getSavedAppTheme();

		document
			.querySelector('html')
			?.setAttribute('data-color-scheme', savedThemeType);
	}, [savedThemeType]);

	const theme = useMemo(() => {
		return getSavedAppTheme();
	}, [savedThemeType]);

	const changeTheme = (themeType: THEME_TYPES) => {
		setThemeType(themeType);
		LocalStorageService.set('color-mode', themeType);
	};

	const getSavedAppThemeType = () => LocalStorageService.get('color-mode');

	const toggleTheme = () => {
		const updatedTheme =
			theme === THEME_TYPES.LIGHT ? THEME_TYPES.DARK : THEME_TYPES.LIGHT;

		changeTheme(updatedTheme);
	};

	return {
		theme,
		savedThemeType,
		changeTheme,
		getSavedAppThemeType,
		toggleTheme,
	};
}
