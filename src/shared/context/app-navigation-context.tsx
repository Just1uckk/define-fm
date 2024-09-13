import { createContext, useContext } from 'react';
import { NavbarLinkType } from 'app/layout/components/site-navigation/left-menu/left-menu-navbar';

export const AppNavigationContext = createContext<{
	navigationLinks: NavbarLinkType[];
}>({
	navigationLinks: [],
});

export const useAppNavigationContext = () => useContext(AppNavigationContext);
