import React, { useEffect } from 'react';
import { AppRoutes } from 'app/app-routes';
import { Layout } from 'app/layout/layout';
import { AbilityContext } from 'casl';
import defineAbilityFor from 'casl/ability';
import { LocalStorageService } from 'shared/services/local-storage-service';
import { getSavedAppTheme } from 'shared/utils/get-saved-app-theme';
import { createGlobalStyle } from 'styled-components';

import {
	selectAuthUsername,
	selectIsUserAuth,
} from 'app/store/auth/auth-selectors';
import { getCurrentUserData } from 'app/store/user/user-actions';
import {
	selectIsGettingUser,
	selectUserData,
} from 'app/store/user/user-selectors';

import { THEME_COLORS } from 'app/settings/theme/theme';

import { THEME_TYPES } from 'shared/constants/constans';

import { useManageSiteLanguage } from 'shared/hooks/use-manage-site-language';

const GlobalStyles = createGlobalStyle`
	:root {
		--palette-accent: ${THEME_COLORS.accent};

		--palette-secondary: ${THEME_COLORS.secondary};
		--palette-accent-dark: ${THEME_COLORS.accentDark};
	}

	html[data-color-scheme="light"] {
		color-scheme: light;

		--palette-primary: ${THEME_COLORS.primary};
		--palette-primary-rgb: ${THEME_COLORS.primary_rgb};
		--palette-white: ${THEME_COLORS.white};
		--palette-white-inverted: ${THEME_COLORS.white};
		--palette-white-inverted_rgb: ${THEME_COLORS.white_rgb};
		--pallet-blue-secondary-inverted: ${THEME_COLORS.blue.secondary};
		--pallet-grey-o-inverted: ${THEME_COLORS.grey.style_0};

		--primary-text-color: ${THEME_COLORS.primary};
		--white-text-color: ${THEME_COLORS.white};

		--background-primary: ${THEME_COLORS.backgroundPrimary.light};
		--background-secondary: ${THEME_COLORS.backgroundSecondary.light};
		--icon-color: ${THEME_COLORS.primary};

		--border-color-primary: ${THEME_COLORS.borderColorPrimary.light};

		--visited-link-color: #5b1e97;

		--placeholder-color: rgba(0, 0, 0, 0.11);

		--progress-bar-bg: ${THEME_COLORS.blue.secondary};

		--tooltip-bg: ${THEME_COLORS.primary};
	}

	html[data-color-scheme="dark"] {
		color-scheme: dark;

		--palette-primary: ${THEME_COLORS.white_light};
		--palette-primary-rgb: ${THEME_COLORS.white_light_rgb};
		--palette-white: ${THEME_COLORS.white_light};
		--palette-white-inverted: #1b1b1f;
		--palette-white-inverted_rgb: 27, 27, 31;
		--pallet-blue-secondary-inverted: #353535;
		--pallet-grey-o-inverted: ${THEME_COLORS.grey.style_0_inverted};

		--primary-text-color: ${THEME_COLORS.white_light};
		--white-text-color: ${THEME_COLORS.white_light};

		--background-primary: ${THEME_COLORS.backgroundPrimary.dark};
		--background-secondary: ${THEME_COLORS.backgroundSecondary.dark};
		--icon-color: ${THEME_COLORS.white};

		--border-color-primary: ${THEME_COLORS.borderColorPrimary.dark};

		--visited-link-color: #97c2f3;

		--progress-bar-bg: #4b4b4b;

		--badge-brightness: 0.9;
		--image-brightness: 0.85;
		--avatar-brightness: 0.65;
		--box-shadow-opacity: 0.9;

		--tooltip-bg: ${THEME_COLORS.backgroundPrimary.dark};
	}
`;

function App() {
	const authUsername = selectAuthUsername();
	const userData = selectUserData();
	const isUserAuth = selectIsUserAuth();
	const isGettingUser = selectIsGettingUser();
	const manageSiteLanguage = useManageSiteLanguage();
	const getCurrentUserDataAction = getCurrentUserData();

	useEffect(() => {
		if (!authUsername) return;
		getCurrentUserDataAction();
	}, [authUsername]);

	useEffect(() => {
		const mode = getSavedAppTheme();

		document.querySelector('html')?.setAttribute('data-color-scheme', mode);
	}, []);

	useEffect(() => {
		const handleChangeSystemTheme = ({ matches }) => {
			const savedThemeType = LocalStorageService.get('color-mode');

			if (savedThemeType && savedThemeType !== THEME_TYPES.SYSTEM) {
				return;
			}

			const mode = matches ? THEME_TYPES.DARK : THEME_TYPES.LIGHT;

			document.querySelector('html')?.setAttribute('data-color-scheme', mode);
		};

		const matchThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

		matchThemeMedia.addEventListener('change', handleChangeSystemTheme);

		return () => {
			matchThemeMedia.removeEventListener('change', handleChangeSystemTheme);
		};
	}, []);

	const isDataPreparing = isGettingUser || manageSiteLanguage.isLoadingList;

	return (
		<>
			<GlobalStyles />

			<AbilityContext.Provider value={defineAbilityFor(userData)}>
				<Layout
					isLoading={isDataPreparing}
					isUserAuth={isUserAuth}
					userData={userData}
				>
					<AppRoutes />
				</Layout>
			</AbilityContext.Provider>
		</>
	);
}

export default App;
