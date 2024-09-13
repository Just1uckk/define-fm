import { LocalStorageService } from 'shared/services/local-storage-service';

import { THEME_TYPES } from 'shared/constants/constans';

export const getSavedAppTheme = () => {
	const persistedColorPreference: THEME_TYPES =
		LocalStorageService.get('color-mode');
	const hasPersistedPreference = typeof persistedColorPreference === 'string';
	// If the user has explicitly chosen light or dark,
	// let's use it. Otherwise, this value will be null.
	if (hasPersistedPreference) {
		if (persistedColorPreference !== THEME_TYPES.SYSTEM) {
			return persistedColorPreference;
		}
	}
	// If they haven't been explicit, let's check the media
	// query
	const mql = window.matchMedia('(prefers-color-scheme: dark)');
	const hasMediaQueryPreference = typeof mql.matches === 'boolean';
	if (hasMediaQueryPreference) {
		return mql.matches ? THEME_TYPES.DARK : THEME_TYPES.LIGHT;
	}
	// If they are using a browser/OS that doesn't support
	// color themes, let's default to 'light'.
	return THEME_TYPES.LIGHT;
};
