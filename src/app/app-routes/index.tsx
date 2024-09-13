import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import loadable from '@loadable/component';
import { authRoutes } from 'app/app-routes/auth-routes';
import { dispositionSearchesRoutes } from 'app/app-routes/disposition-searches-routes';
import { dispositionsRoutes } from 'app/app-routes/dispositions-routes';
import { settingsRoutes } from 'app/app-routes/settings-routes';
import { AuthGuard } from 'app/AuthGuard';
import { RoleGuard } from 'app/RoleGuard';
import { RouteGuardActions, RouteGuardEntities } from 'casl/ability';
import {
	DEFAULT_SETTINGS_LIST,
	findDefaultOption,
} from 'modules/auth/components/profile-settings-form/profile-tabs/edit-default-settings';
import { UsersGroupsOverviewPage } from 'modules/users-and-groups/pages/users-and-groups-overview/users-groups-overview';

import { selectDefaultSettingsData } from 'app/store/user/user-selectors';

import {
	COMMON_ROUTES,
	DASHBOARD_ROUTES,
	DISPOSITION_SEARCH_ROUTES,
	DISPOSITIONS_ROUTES,
	USERS_AND_GROUPS_ROUTES,
} from 'shared/constants/routes';

import { NotFoundPage } from 'shared/components/404/not-found-page';

const DashboardPage = loadable(
	() => import('modules/dashboard/pages/dashboard/dashboard'),
);

export const MAIN_PATH = {
	PersonalDashboard: DASHBOARD_ROUTES.MAIN.path,
	RDA: DISPOSITIONS_ROUTES.RDA_ASSIGNMENTS_OVERVIEW.path,
	Dashboard: DASHBOARD_ROUTES.MAIN.path,
	WorkPackage: DISPOSITIONS_ROUTES.RDA_WORK_PACKAGES_OVERVIEW.path,
	DispositionSearches: DISPOSITION_SEARCH_ROUTES.OVERVIEW.path,
};

export const AppRoutes: React.FC = () => {
	const defaultSettings = selectDefaultSettingsData();
	const routes = useRoutes([
		...authRoutes,
		{
			path: COMMON_ROUTES.MAIN(),
			element: (
				<AuthGuard>
					{findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.HOME_PAGE)
						?.value ? (
						<Navigate
							to={
								MAIN_PATH[
									findDefaultOption(
										defaultSettings,
										DEFAULT_SETTINGS_LIST.HOME_PAGE,
									)!.value
								]
							}
							replace
						/>
					) : (
						<NotFoundPage />
					)}
				</AuthGuard>
			),
		},
		...dispositionsRoutes,
		...dispositionSearchesRoutes,
		...settingsRoutes,
		{
			path: USERS_AND_GROUPS_ROUTES.OVERVIEW.path,
			element: (
				<AuthGuard>
					<RoleGuard I={RouteGuardActions.read} a={RouteGuardEntities.Group}>
						<RoleGuard I={RouteGuardActions.read} a={RouteGuardEntities.User}>
							<UsersGroupsOverviewPage />
						</RoleGuard>
					</RoleGuard>
				</AuthGuard>
			),
		},
		{
			path: DASHBOARD_ROUTES.MAIN.path,
			element: (
				<AuthGuard>
					<RoleGuard
						I={RouteGuardActions.read}
						a={RouteGuardEntities.DashboardPage}
					>
						<DashboardPage />
					</RoleGuard>
				</AuthGuard>
			),
		},

		{
			path: '*',
			element: <NotFoundPage />,
		},
	]);
	return routes;
};
