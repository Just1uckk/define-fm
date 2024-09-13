export const AUTH_PROVIDES_QUERY_KEYS = {
	provider: 'auth-provider',
	auth_provider_list: 'auth-provider-list',
	auth_provider_type_list: 'auth-provider-type-list',
	auth_sync_schedule_list: 'auth-sync-schedule-list',
	auth_provider_implementations: `auth-provider-implementations`,
};

export const DATA_SYNC_PROVIDES_QUERY_KEYS = {
	provider: (id: number) => `${id}_provider`,
	provider_list: `provider_list`,
	data_sync_provider_type_list: 'data_sync_provider_type_list',
};

export const DISPOSITIONS_QUERY_KEYS = {
	disposition: (id: number) => `disposition-${id}`,
	approvers: (id: number) => `rda-approvers-${id}`,
	approvers_reassign: (id: number) => `rda-approvers-${id}-reassign`,
	dispositions_filters: `dispositions-filters`,
	disposition_types: () => `disposition-types`,
	disposition_snapshot: `disposition-snapshot`,
	disposition_status_counts: `disposition-status-counts`,
	disposition_status_codes: `disposition-status-codes`,
	disposition_table_tabs: `disposition-table-tabs`,
	rda_work_package_extension_reason_list: `rda_work_package_extension_reason_list`,
};
export const DISPOSITIONS_ACTIONS_KEYS = {
	actions: `all-disposition-actions`,
};

export const DISPOSITION_SEARCHES_KEYS = {
	search: (id: number) => `${id}_search`,
	snapshot: (id: number) => `${id}_search_snapshot`,
};

export const WORK_PACKAGE_FILES_KEYS = {
	file: (id: number) => `disposition-file-${id}`,
	additionalInfo: (id: number) => `additional-info-${id}`,
	fileFullPath: (id: number) => `file-full-path-${id}`,
	fileCategories: (id: number) => `file-categories-${id}`,
	fileSpecifics: (id: number) => `file-specific-${id}`,
	configs: 'item_config_key',
};

export const RDA_ASSIGNMENT = {
	assignment: (id: number) => `rda-assignment-${id}`,
};

export const USERS_QUERY_KEYS = {
	all_users: 'all-users',
	user: 'user',
	users_count: 'users-count',
};

export const GROUPS_QUERY_KEYS = {
	group: (id: number) => `group-${id}`,
	groups_count: 'groups-count',
	group_users: 'group-users',
};

export const CORE_CONFIG_LIST_QUERY_KEYS = {
	config_list: 'core-config-list',
	config_list_settings_page: 'core-config-list-setting-page',
	config_section_group_list: 'core-config-section-group-list',
};

export const BULK_ACTION_MENU_QUERY_KEYS = {
	hold_information: 'bulk-hold-information',
	update_records_management_metadata: 'update-records-management-metadata',
	update_physical_object_metadata: 'update-physical-object-metadata',
	move_information: 'move-information',
};

export const DASHBOARD_QUERY_KEYS = {
	status_stats: 'dashboard-status-stats',
	space_saved: 'dashboard-space-saved',
	rejections_total_records_review: 'dashboard_rejections_total_records_review',
	top_approvers: 'dashboard-top-approvers',
	top_approvers_last_month: 'dashboard-top-approvers-last-month',
	total_records_current_state: 'total-records-current-state',
	number_of_records: 'number-of-records',
	number_of_records_by_state: 'number-of-records-by-state',
};

export const PERSONAL_DASHBOARD_QUERY_KEYS = {
	top_approvers: 'personal-dashboard-top-approvers',
	number_of_records: 'personal-dashboard-number-of-records',
};
