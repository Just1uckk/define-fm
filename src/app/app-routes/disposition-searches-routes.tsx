import React from 'react';
import loadable from '@loadable/component';
import { AuthGuard } from 'app/AuthGuard';
import { RoleGuard } from 'app/RoleGuard';
import { RouteGuardActions, RouteGuardEntities } from 'casl/ability';
import { PageSpinner } from 'modules/rda-work-packages/pages/file-info/components/page-spinner';

import { DISPOSITION_SEARCH_ROUTES } from 'shared/constants/routes';

const SearchesOverviewPage = loadable(
	() =>
		import(
			'modules/disposition-searches/pages/searches-overview/searches-overview'
		),
);
const SearchSnapshots = loadable(
	() =>
		import(
			'modules/disposition-searches/pages/search-snapshots/search-snapshots'
		),
);
const SearchSnapshotResults = loadable(
	() =>
		import(
			'modules/disposition-searches/pages/search-snapshot-results/search-snapshot-results'
		),
);

export const dispositionSearchesRoutes = [
	{
		path: DISPOSITION_SEARCH_ROUTES.OVERVIEW.path,
		element: (
			<AuthGuard>
				<RoleGuard
					I={RouteGuardActions.read}
					a={RouteGuardEntities.DispositionSearches}
				>
					<React.Suspense fallback={<PageSpinner />}>
						<SearchesOverviewPage />
					</React.Suspense>
				</RoleGuard>
			</AuthGuard>
		),
	},
	{
		path: DISPOSITION_SEARCH_ROUTES.SEARCH.path,
		element: (
			<AuthGuard>
				<RoleGuard
					I={RouteGuardActions.read}
					a={RouteGuardEntities.DispositionSearches}
				>
					<React.Suspense fallback={<PageSpinner />}>
						<SearchSnapshots />
					</React.Suspense>
				</RoleGuard>
			</AuthGuard>
		),
	},
	{
		path: DISPOSITION_SEARCH_ROUTES.SNAPSHOT.path,
		element: (
			<AuthGuard>
				<RoleGuard
					I={RouteGuardActions.read}
					a={RouteGuardEntities.DispositionSearches}
				>
					<React.Suspense fallback={<PageSpinner />}>
						<SearchSnapshotResults />
					</React.Suspense>
				</RoleGuard>
			</AuthGuard>
		),
	},
];
