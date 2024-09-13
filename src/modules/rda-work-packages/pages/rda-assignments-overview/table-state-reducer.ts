import {
	DEFAULT_SETTINGS_LIST,
	findDefaultOption,
} from 'modules/auth/components/profile-settings-form/profile-tabs/edit-default-settings';
import { DISPOSITION_CARD_VIEW_TYPES } from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/disposition-card/disposition-card';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';

import { selectDefaultSettingsData } from 'app/store/user/user-selectors';

import { DEFAULT_PAGINATION_PAGE_SIZE } from 'shared/hooks/use-manage-pagination';

import { TABLE_TOTAL } from '../rda-work-packages-overview/use-rda-work-packages-overview';

export type TableStateReducerStateType = {
	search: string;
	page: number;
	pageSize: number;
	orderBy: string;
	tableView: DISPOSITION_CARD_VIEW_TYPES;
};

type TableStateReducerActionType =
	| { type: 'search'; payload: string }
	| { type: 'orderBy'; payload: string }
	| { type: 'tableView'; payload: DISPOSITION_CARD_VIEW_TYPES }
	| { type: 'page'; payload: { page: number } }
	| { type: 'pageSize'; payload: number };

export function getInitialTableStateReducer(
	initialParams: URLSearchParams,
): TableStateReducerStateType {
	const defaultSettings = selectDefaultSettingsData();
	const initialSettings = MemoryManagingTableSettings.getSavedSettings(
		'rda-assignments-overview',
	);
	const totalSettings =
		MemoryManagingTableSettings.getSavedSettings(TABLE_TOTAL);
	let tableView = DISPOSITION_CARD_VIEW_TYPES.ROW;
	if (totalSettings && totalSettings.tableView) {
		tableView = totalSettings.tableView;
	} else {
		const view = findDefaultOption(
			defaultSettings,
			DEFAULT_SETTINGS_LIST.PREFERRED_VIEW,
		)?.value as DISPOSITION_CARD_VIEW_TYPES;
		if (view) {
			tableView = view;
		}
	}
	const page = Number(initialParams.get('p') || 1);
	const orderBy = initialParams.get('orderBy') || '';
	const search = initialParams.get('s') || '';

	return {
		search,
		tableView,
		page,
		pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
		orderBy,
	};
}

export function tableStateReducer(
	state: TableStateReducerStateType,
	action: TableStateReducerActionType,
): TableStateReducerStateType {
	switch (action.type) {
		case 'search':
		case 'pageSize':
			return { ...state, [action.type]: action.payload, page: 1 };
		case 'tableView':
			return { ...state, [action.type]: action.payload };
		case 'orderBy': {
			let order = action.payload;

			if (state.orderBy === order) {
				order = '-' + order;
			}
			if (state.orderBy === `-${order}`) {
				order = '';
			}

			return { ...state, orderBy: order };
		}

		default:
			return { ...state, ...action.payload };
	}
}
