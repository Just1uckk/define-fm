import { generatePath } from 'react-router-dom';
import { RdaAssignmentsTabs } from 'modules/rda-work-packages/pages/rda-assignment/rda-assignment';
import { RdaWorkPackageTabs } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-pending/use-rda-work-package';

export const DASHBOARD_ROUTES = {
	MAIN: {
		path: '/dashboard',
	},
} as const;

export const AUTH_ROUTES = {
	LOGIN: {
		path: '/login',
	},
	FORGOT_PASSWORD: {
		path: '/forgot-password',
	},
	NEW_PASSWORD: {
		path: '/new-password',
	},
} as const;

export const COMMON_ROUTES = {
	MAIN: () => '/',
	MAIN_PATH: '/',
} as const;

export const DISPOSITIONS_ROUTES = {
	RDA_WORK_PACKAGES_OVERVIEW: {
		path: '/rda-work-packages',
	},
	RDA_WORK_PACKAGE: {
		path: '/rda-work-packages/:id',
		generate: (id: number) =>
			generatePath('/rda-work-packages/:id', { id: String(id) }),
		generateExternal: (id: number) =>
			generatePath('/app/rda-work-packages/:id', { id: String(id) }),
	},
	DISPOSITION_VERIFY_APPROVER_RIGHTS: {
		path: '/rda-work-packages/:id/approver-rights',
		generate: (id: number) =>
			generatePath('/rda-work-packages/:id/approver-rights', {
				id: String(id),
			}),
	},
	FILE_INFO: {
		path: '/rda-work-packages/:id/file/:fileId',
		generate: {
			external: (
				id: number,
				fileId: number,
				tab?: RdaAssignmentsTabs | RdaWorkPackageTabs | 'report',
			) =>
				generatePath(`/app/rda-work-packages/:id/file/:fileId`, {
					id: String(id),
					fileId: String(fileId),
				}) + `${tab ? `?t=${tab}` : ''}`,
			local: (
				id: number,
				fileId: number,
				tab?: RdaAssignmentsTabs | RdaWorkPackageTabs,
			) =>
				generatePath(`/rda-work-packages/:id/file/:fileId`, {
					id: String(id),
					fileId: String(fileId),
				}) + `${tab ? `?t=${tab}` : ''}`,
		},
	},
	FILE_INFO_CATEGORIES: {
		path: '/rda-work-packages/:id/file/:fileId/categories',
		generate: {
			external: (id: number, fileId: number) =>
				generatePath('/app/rda-work-packages/:id/file/:fileId/categories', {
					id: String(id),
					fileId: String(fileId),
				}),
			local: (id: number, fileId: number) =>
				generatePath('/rda-work-packages/:id/file/:fileId/categories', {
					id: String(id),
					fileId: String(fileId),
				}),
		},
	},
	FILE_INFO_SPECIFIC: {
		path: '/rda-work-packages/:id/file/:fileId/specific',
		generate: {
			external: (id: number, fileId: number) =>
				generatePath('/app/rda-work-packages/:id/file/:fileId/specific', {
					id: String(id),
					fileId: String(fileId),
				}),
			local: (id: number, fileId: number) =>
				generatePath('/rda-work-packages/:id/file/:fileId/specific', {
					id: String(id),
					fileId: String(fileId),
				}),
		},
	},
	FILE_INFO_RECORD_DETAILS: {
		path: '/rda-work-packages/:id/file/:fileId/record-details',
		generate: {
			external: (id: number, fileId: number) =>
				generatePath('/app/rda-work-packages/:id/file/:fileId/record-details', {
					id: String(id),
					fileId: String(fileId),
				}),
			local: (id: number, fileId: number) =>
				generatePath('/rda-work-packages/:id/file/:fileId/record-details', {
					id: String(id),
					fileId: String(fileId),
				}),
		},
	},
	RDA_ASSIGNMENTS_OVERVIEW: {
		path: '/rda-assignments',
	},
	RDA_ASSIGNMENT: {
		path: '/rda-assignments/:id',
		generate: (id: number) =>
			generatePath('/rda-assignments/:id', { id: String(id) }),
	},
} as const;

export const DISPOSITION_SEARCH_ROUTES = {
	OVERVIEW: {
		path: '/disposition-searches',
	},
	SEARCH: {
		path: '/disposition-searches/:id',
		generate: (id: number) =>
			generatePath('/disposition-searches/:id', { id: String(id) }),
	},
	SNAPSHOT: {
		path: '/disposition-searches/:dispositionId/snapshot/:id',
		generate: (dispositionId: number, id: number) =>
			generatePath('/disposition-searches/:dispositionId/snapshot/:id', {
				dispositionId: String(dispositionId),
				id: String(id),
			}),
	},
} as const;

export const USERS_AND_GROUPS_ROUTES = {
	OVERVIEW: {
		path: '/users-and-groups',
	},
} as const;

export const SETTINGS_ROUTES = {
	RDA_ROOT: {
		path: `/settings/rda`,
	},
	RDA_SETTING: {
		path: '/settings/rda/:group',
		generate: (group: string) =>
			generatePath('/settings/rda/:group', { group }),
	},

	CORE_ROOT: {
		path: `/settings/core`,
	},
	CORE_AUTH_PROVIDER: {
		path: '/settings/core/auth-provider',
	},
	CORE_DATA_SYNC_PROVIDERS: {
		path: '/settings/core/data-sync-providers',
	},
	CORE_SETTING: {
		path: '/settings/core/:group',
		generate: (group: string) =>
			generatePath('/settings/core/:group', { group }),
	},
} as const;
