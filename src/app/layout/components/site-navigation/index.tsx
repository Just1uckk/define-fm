import React, { useEffect, useState } from 'react';
import { Header } from 'app/layout/components/site-navigation/header/header';
import { LeftMenu } from 'app/layout/components/site-navigation/left-menu/left-menu';

import { selectCurrentUserLang } from 'app/store/user/user-selectors';

import { LanguageTypes } from 'shared/types/users';

import { useManageAppTheme } from 'shared/hooks/use-manage-app-theme';
import { useManageSiteLanguage } from 'shared/hooks/use-manage-site-language';

export const SiteNavigationComponent: React.FC = () => {
	const currentUserLang = selectCurrentUserLang() as LanguageTypes;
	const [isOpen, setIsOpen] = useState(false);

	const manageSiteLanguage = useManageSiteLanguage();
	const manageAppTheme = useManageAppTheme();

	useEffect(() => {
		if (isOpen) {
			document.body.classList.add('is-left-menu-open');
		}

		if (!isOpen) {
			document.body.classList.remove('is-left-menu-open');
		}
	}, [isOpen]);

	const toggleMenu = () => setIsOpen((prevValue) => !prevValue);

	const onChangeLang = (lang) => {
		manageSiteLanguage.changLanguage(lang.code);
	};

	return (
		<>
			<Header isLeftMenuOpen={isOpen} />
			<LeftMenu
				isOpen={isOpen}
				languages={manageSiteLanguage.languages}
				currentLang={manageSiteLanguage.currentLang}
				userTheme={manageAppTheme.savedThemeType || manageAppTheme.theme}
				onChangeLang={onChangeLang}
				onChangeTheme={manageAppTheme.changeTheme}
				onChange={toggleMenu}
			/>
		</>
	);
};

export const SiteNavigation = React.memo(SiteNavigationComponent);
