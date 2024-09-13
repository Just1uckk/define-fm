import React from 'react';
import loadable from '@loadable/component';
import { AuthGuard } from 'app/AuthGuard';
import { RoleGuard } from 'app/RoleGuard';
import { RouteGuardActions, RouteGuardEntities } from 'casl/ability';
import { PageSpinner } from 'modules/rda-work-packages/pages/file-info/components/page-spinner';

import { SETTINGS_ROUTES } from 'shared/constants/routes';

const CoreSettingsPage = loadable(
	() => import('modules/settings/pages/general-settings/general-settings'),
);
const GeneralSettingsAuthProviderPage = loadable(
	() => import('modules/settings/pages/general-settings/auth-providers'),
);
const GeneralSettingsDataSyncProvidersPage = loadable(
	() => import('modules/settings/pages/general-settings/data-sync-providers'),
);
const SettingPage = loadable(
	() => import('modules/settings/pages/components/setting-page'),
);
const RdaSettingsPage = loadable(
	() => import('modules/settings/pages/rda-settings/rda-settings'),
);

export const settingsRoutes = [
	{
		path: SETTINGS_ROUTES.CORE_ROOT.path,
		element: (
			<AuthGuard>
				<RoleGuard
					I={RouteGuardActions.manage}
					a={RouteGuardEntities.CoreAppSettings}
				>
					<React.Suspense fallback={<PageSpinner />}>
						<CoreSettingsPage />
					</React.Suspense>
				</RoleGuard>
			</AuthGuard>
		),
		children: [
			{
				path: SETTINGS_ROUTES.CORE_AUTH_PROVIDER.path,
				element: (
					<React.Suspense fallback={<PageSpinner />}>
						<GeneralSettingsAuthProviderPage />
					</React.Suspense>
				),
			},
			{
				path: SETTINGS_ROUTES.CORE_DATA_SYNC_PROVIDERS.path,
				element: (
					<React.Suspense fallback={<PageSpinner />}>
						<GeneralSettingsDataSyncProvidersPage />
					</React.Suspense>
				),
			},
			{
				path: SETTINGS_ROUTES.CORE_SETTING.path,
				element: (
					<React.Suspense fallback={<PageSpinner />}>
						<SettingPage />
					</React.Suspense>
				),
			},
		],
	},
	{
		path: SETTINGS_ROUTES.RDA_ROOT.path,
		element: (
			<AuthGuard>
				<RoleGuard
					I={RouteGuardActions.manage}
					a={RouteGuardEntities.RdaAppSettings}
				>
					<React.Suspense fallback={<PageSpinner />}>
						<RdaSettingsPage />
					</React.Suspense>
				</RoleGuard>
			</AuthGuard>
		),
		children: [
			{
				path: SETTINGS_ROUTES.RDA_SETTING.path,
				element: (
					<React.Suspense fallback={<PageSpinner />}>
						<SettingPage />
					</React.Suspense>
				),
			},
		],
	},
];
