import React from 'react';
import loadable from '@loadable/component';
import { AuthGuard } from 'app/AuthGuard';
import { RoleGuard } from 'app/RoleGuard';
import { RouteGuardActions, RouteGuardEntities } from 'casl/ability';
import { PageSpinner } from 'modules/rda-work-packages/pages/file-info/components/page-spinner';

import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

const RdaWorkPackagesOverviewPage = loadable(
	() =>
		import(
			'modules/rda-work-packages/pages/rda-work-packages-overview/rda-work-packages-overview'
		),
);
const RdaAssignmentsOverviewPage = loadable(
	() =>
		import(
			'modules/rda-work-packages/pages/rda-assignments-overview/rda-assignments-overview'
		),
);
const RdaAssignmnentPage = loadable(
	() => import('modules/rda-work-packages/pages/rda-assignment/rda-assignment'),
);
const DispositionVerifyApproverRightsPage = loadable(
	() =>
		import(
			'modules/rda-work-packages/pages/verify-approver-rights/verify-approver-rights'
		),
);
const FileInfoPage = loadable(
	() => import('modules/rda-work-packages/pages/file-info/file-info'),
);
const FileInfoCategoriesPage = loadable(
	() =>
		import('modules/rda-work-packages/pages/file-info/file-info-categories'),
);
const FileInfoSpecificPage = loadable(
	() => import('modules/rda-work-packages/pages/file-info/file-info-specific'),
);
const FileInfoRecordDetailPage = loadable(
	() =>
		import('modules/rda-work-packages/pages/file-info/file-info-record-detail'),
);
const RdaWorkPackagePage = loadable(
	() =>
		import('modules/rda-work-packages/pages/rda-work-package/rda-work-package'),
);

export const dispositionsRoutes = [
	{
		path: DISPOSITIONS_ROUTES.RDA_WORK_PACKAGES_OVERVIEW.path,
		element: (
			<AuthGuard>
				<RoleGuard
					I={RouteGuardActions.read}
					a={RouteGuardEntities.RdaWorkPackages}
				>
					<React.Suspense fallback={<PageSpinner />}>
						<RdaWorkPackagesOverviewPage />
					</React.Suspense>
				</RoleGuard>
			</AuthGuard>
		),
	},
	{
		path: DISPOSITIONS_ROUTES.RDA_WORK_PACKAGE.path,
		element: (
			<AuthGuard>
				<RoleGuard
					I={RouteGuardActions.read}
					a={RouteGuardEntities.RdaWorkPackages}
				>
					<React.Suspense fallback={<PageSpinner />}>
						<RdaWorkPackagePage />
					</React.Suspense>
				</RoleGuard>
			</AuthGuard>
		),
	},
	{
		path: DISPOSITIONS_ROUTES.RDA_ASSIGNMENTS_OVERVIEW.path,
		element: (
			<AuthGuard>
				<RoleGuard
					I={RouteGuardActions.manage}
					a={RouteGuardEntities.PersonalRecords}
				>
					<React.Suspense fallback={<PageSpinner />}>
						<RdaAssignmentsOverviewPage />
					</React.Suspense>
				</RoleGuard>
			</AuthGuard>
		),
	},
	{
		path: DISPOSITIONS_ROUTES.RDA_ASSIGNMENT.path,
		element: (
			<AuthGuard>
				<RoleGuard
					I={RouteGuardActions.manage}
					a={RouteGuardEntities.PersonalRecords}
				>
					<React.Suspense fallback={<PageSpinner />}>
						<RdaAssignmnentPage />
					</React.Suspense>
				</RoleGuard>
			</AuthGuard>
		),
	},
	{
		path: DISPOSITIONS_ROUTES.DISPOSITION_VERIFY_APPROVER_RIGHTS.path,
		element: (
			<AuthGuard>
				<React.Suspense fallback={<PageSpinner />}>
					<DispositionVerifyApproverRightsPage />
				</React.Suspense>
			</AuthGuard>
		),
	},
	{
		path: DISPOSITIONS_ROUTES.FILE_INFO.path,
		element: (
			<AuthGuard>
				<React.Suspense fallback={<PageSpinner />}>
					<FileInfoPage />
				</React.Suspense>
			</AuthGuard>
		),
	},
	{
		path: DISPOSITIONS_ROUTES.FILE_INFO_CATEGORIES.path,
		element: (
			<AuthGuard>
				<React.Suspense fallback={<PageSpinner />}>
					<FileInfoCategoriesPage />
				</React.Suspense>
			</AuthGuard>
		),
	},
	{
		path: DISPOSITIONS_ROUTES.FILE_INFO_SPECIFIC.path,
		element: (
			<AuthGuard>
				<React.Suspense fallback={<PageSpinner />}>
					<FileInfoSpecificPage />
				</React.Suspense>
			</AuthGuard>
		),
	},
	{
		path: DISPOSITIONS_ROUTES.FILE_INFO_RECORD_DETAILS.path,
		element: (
			<AuthGuard>
				<React.Suspense fallback={<PageSpinner />}>
					<FileInfoRecordDetailPage />
				</React.Suspense>
			</AuthGuard>
		),
	},
];
