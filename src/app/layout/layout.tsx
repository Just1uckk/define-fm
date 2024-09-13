import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SiteNavigation } from 'app/layout/components/site-navigation';
import { NavbarLinkType } from 'app/layout/components/site-navigation/left-menu/left-menu-navbar';
import { NotLoggedInLayout } from 'app/layout/not-logged-in-layout';
import { useAbilityContext } from 'casl';
import { RouteGuardActions, RouteGuardEntities } from 'casl/ability';
import { ViewProfileUser } from 'modules/users-and-groups/features/users/view-profile-user';
import { AppNavigationContext } from 'shared/context/app-navigation-context';
import { scrollableRootElementId } from 'shared/utils/scroll-helpers';
import styled, { createGlobalStyle } from 'styled-components';

import { IUser } from 'shared/types/users';

import {
	DASHBOARD_ROUTES,
	DISPOSITION_SEARCH_ROUTES,
	DISPOSITIONS_ROUTES,
	SETTINGS_ROUTES,
	USERS_AND_GROUPS_ROUTES,
} from 'shared/constants/routes';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Spinner } from 'shared/components/spinner/spinner';
import { ToastContainer } from 'shared/components/toats/toast-container';

const Content = styled.div`
	width: 100%;
	flex-grow: 1;
	padding-left: 4rem;
	margin-left: auto;
	transition: padding-left 0.3s ease;
`;

const Page = styled.div`
	flex-grow: 1;
	padding: 0 1.5rem;
	padding-bottom: 1.5rem;
	overflow: hidden;
`;

const LoadingWrapper = styled.div`
	position: absolute;
	top: 30%;
	left: 50%;
	transform: translateY(-50%);
`;

const GlobalStyles = createGlobalStyle`
	body.is-left-menu-open {
		${Content} {
			padding-left: 16rem;
		}
	}
`;

const GlobalPopUpStyles = createGlobalStyle`
	${Content} {
		padding-left: 0;
	}

	${Page} {
		min-height: 100vh;
		padding: 1rem;
	}
`;

interface LayoutProps {
	isUserAuth: boolean;
	userData?: IUser | null;
	isLoading: boolean;
}

export const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({
	isUserAuth,
	userData,
	isLoading,
	children,
}) => {
	const ability = useAbilityContext();

	const LINKS = useMemo(() => {
		const list: NavbarLinkType[] = [
			{
				label: 'site_navigation_menu.nav_links.dashboard',
				path: DASHBOARD_ROUTES.MAIN.path,
				icon: ICON_COLLECTION.dashboard,
				available: ability.can(
					RouteGuardActions.read,
					RouteGuardEntities.DashboardPage,
				),
			},
			{
				label: 'site_navigation_menu.nav_links.rda_work_packages',
				path: DISPOSITIONS_ROUTES.RDA_WORK_PACKAGES_OVERVIEW.path,
				icon: ICON_COLLECTION.home,
				available: ability.can(
					RouteGuardActions.read,
					RouteGuardEntities.RdaWorkPackages,
				),
			},
			{
				label: 'site_navigation_menu.nav_links.disposition_search',
				path: DISPOSITION_SEARCH_ROUTES.OVERVIEW.path,
				icon: ICON_COLLECTION.shield,
				available: ability.can(
					RouteGuardActions.read,
					RouteGuardEntities.DispositionSearches,
				),
			},
			{
				label: 'site_navigation_menu.nav_links.rda_assignments',
				path: DISPOSITIONS_ROUTES.RDA_ASSIGNMENTS_OVERVIEW.path,
				icon: ICON_COLLECTION.records,
				available: ability.can(
					RouteGuardActions.read,
					RouteGuardEntities.PersonalRecords,
				),
			},
			{
				label: 'site_navigation_menu.nav_links.users',
				path: USERS_AND_GROUPS_ROUTES.OVERVIEW.path,
				icon: ICON_COLLECTION.user_group,
				available:
					ability.can(RouteGuardActions.read, RouteGuardEntities.User) ||
					ability.can(RouteGuardActions.read, RouteGuardEntities.Group),
			},
			{
				label: 'site_navigation_menu.nav_links.settings.rda',
				path: SETTINGS_ROUTES.RDA_ROOT.path,
				icon: ICON_COLLECTION.settings,
				available: ability.can(
					RouteGuardActions.manage,
					RouteGuardEntities.RdaAppSettings,
				),
			},
			{
				label: 'site_navigation_menu.nav_links.settings.general',
				path: SETTINGS_ROUTES.CORE_ROOT.path,
				icon: ICON_COLLECTION.shield_gear,
				available: ability.can(
					RouteGuardActions.manage,
					RouteGuardEntities.CoreAppSettings,
				),
			},
		];

		return list.filter((link) => ('available' in link ? link.available : true));
	}, [ability.rules]);

	if (!isUserAuth) {
		return <NotLoggedInLayout>{children}</NotLoggedInLayout>;
	}

	if (isLoading || !userData) {
		return (
			<LoadingWrapper>
				<Spinner />
			</LoadingWrapper>
		);
	}

	return (
		<AppNavigationContext.Provider value={{ navigationLinks: LINKS }}>
			<AuthLayout userData={userData}>{children} </AuthLayout>
		</AppNavigationContext.Provider>
	);
};

export const AuthLayout: React.FC<
	React.PropsWithChildren<{ userData: IUser }>
> = ({ userData, children }) => {
	const location = useLocation();

	const isPopup = location.pathname.includes('file');

	return (
		<>
			<ViewProfileUser />
			<GlobalStyles />
			{isPopup && <GlobalPopUpStyles />}
			<Content id={scrollableRootElementId}>
				{userData && !isPopup && <SiteNavigation />}
				<Page id="page-wrapper">{children}</Page>
			</Content>
			<ToastContainer />
		</>
	);
};
