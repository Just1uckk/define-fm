export const APP_TITLE = 'Cassia';

export enum RDA_ASSIGNMENT_ITEM_STATES {
	PENDING = 0,
	APPROVED = 1,
	REJECTED = 2,
	FEEDBACK_PENDING = 3,
	DISPOSED = -99,
}

export const RDA_ITEM_APPROVAL_STATES_UNDECIDED = [
	RDA_ASSIGNMENT_ITEM_STATES.PENDING,
	RDA_ASSIGNMENT_ITEM_STATES.FEEDBACK_PENDING,
];

export enum APPROVER_STATES {
	WAITING = 0,
	ACTIVE = 1,
	COMPLETE = 2,
}

export enum DISPOSITION_WORKFLOW_STATES {
	BUILDING_PENDING = -11,
	BUILDING_INITIATED = -10,
	BUILDING_NEW = -1,
	DISPOSITIONING = -90,
	PENDING = 0,
	INITIATED = 1,
	READY_TO_COMPLETE = 2,
	ARCHIVE = 3,
}

export const DISPOSITION_WORKFLOW_STATES_COMPLETED = [
	DISPOSITION_WORKFLOW_STATES.READY_TO_COMPLETE,
	DISPOSITION_WORKFLOW_STATES.ARCHIVE,
];

export enum APP_ROLES {
	GLOBAL_USER = 'global-user',
	GLOBAL_ADMIN = 'global-admin',
	APPROVER = 'rda-approver',
	RECORD_MANAGER = 'rda-records-manager',
	GROUP_MANAGER = 'group-management',
}

export enum LANGUAGE_CODES {
	EN = 'en',
	FR_CD = 'fr_CA',
}

export enum THEME_TYPES {
	LIGHT = 'light',
	DARK = 'dark',
	SYSTEM = 'system',
}

export enum APPROVAL_STATES {
	PENDING = 0,
	APPROVED = 1,
	REJECTED = 2,
	FEEDBACK_PENDING = 3,
	DISPOSED = -99,
}

export enum RDA_WORK_PACKAGE_MODAL_NAMES {
	USE_CREATE_RDA_WORK_PACKAGE = 'USE_CREATE_RDA_WORK_PACKAGE',
	UNSAVED_CHANGES_CREATE_RDA_WORK_PACKAGE = 'UNSAVED_CHANGES_CREATE_RDA_WORK_PACKAGE',
	CHANGE_APPROVERS = 'CHANGE_APPROVERS',
	SETTINGS_RDA = 'SETTINGS_RDA',
	UNSAVED_CHANGES_SETTINGS_RDA = 'UNSAVED_CHANGES_SETTINGS_RDA',
	USE_DELETE_RDA = 'USE_DELETE_RDA',
	USE_ABOUT_DISPOSITION = 'USE_ABOUT_DISPOSITION',
	DISPOSITION_INFO = 'DISPOSITION_INFO',
	USE_REJECT_EXTEND = 'USE_REJECT_EXTEND',
	MODIFY_FEEDBACK_USERS = 'MODIFY_FEEDBACK_USERS',
	USE_REQUEST_FEEDBACK = 'USE_REQUEST_FEEDBACK',
	DISPOSITIONS_FILTER_MODAL = 'DISPOSITIONS_FILTER_MODAL',
	FORCE_APPROVER = 'FORCE_APPROVER',
	RECALL_DISPOSITION = 'RECALL_DISPOSITION',
	REASSIGN_APPROVER = 'REASSIGN_APPROVER',
	PROCESSING_RDA_ITEMS = 'PROCESSING_RDA_ITEMS',
	CHANGE_DISPOSITION_ACTION = 'CHANGE_DISPOSITION_ACTION',
	UPDATE_RECORDS_MANAGEMENT_METADATA = 'UPDATE_RECORDS_MANAGEMENT_METADATA',
	UPDATE_PHYSICAL_OBJECT_METADATA = 'UPDATE_PHYSICAL_OBJECT_METADATA',
	MOVE_RDA_ITEMS = 'MOVE_RDA_ITEMS',
	OVERRIDE_APPROVAL_STATE = 'OVERRIDE_APPROVAL_STATE',
	APPLY_REMOVE_HOLD = 'APPLY_REMOVE_HOLD',
}

export enum USERS_MODAL_NAMES {
	CREATE_USER = 'CREATE_USER',
	UNSAVED_CHANGES_CREATE_USER = 'UNSAVED_CHANGES_CREATE_USER',
	EDIT_USER = 'EDIT_USER',
	UNSAVED_CHANGES_EDIT_USER = 'UNSAVED_CHANGES_EDIT_USER',
	DELETE_USER = 'DELETE_USER',
	PROFILE_USER = 'PROFILE_USER',
	EDIT_USER_FROM_PROFILE = 'EDIT_USER_FROM_PROFILE',
}

export enum GROUPS_MODAL_NAMES {
	CREATE_GROUP = 'CREATE_GROUP',
	EDIT_GROUP = 'EDIT_GROUP',
	UNSAVED_CHANGES_EDIT_GROUP = 'UNSAVED_CHANGES_EDIT_GROUP',
	DELETE_GROUP = 'DELETE_GROUP',
}
