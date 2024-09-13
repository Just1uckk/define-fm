import update from 'immutability-helper';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';

import {
	FindEntityRequest,
	FindEntityResponseFilterGroup,
	FindEntityResponseFilterGroupField,
} from 'app/api/types';

import { DEFAULT_PAGINATION_PAGE_SIZE } from 'shared/hooks/use-manage-pagination';

export type RequestUsersParamsReducerStateType = {
	search: string;
	page: number;
	pageSize: number;
	orderBy: string;
	elements: FindEntityRequest['elements'];
};

type RequestUsersParamsReducerActionType =
	| { type: 'search'; payload: string }
	| { type: 'orderBy'; payload: string }
	| { type: 'page'; payload: { page: number } }
	| { type: 'pageSize'; payload: { pageSize: number } }
	| { type: 'clearFilters' }
	| {
			type: 'filterOption';
			payload: {
				group: FindEntityResponseFilterGroup;
				field: FindEntityResponseFilterGroupField;
			};
	  };

export function getInitialStateRequestUsersParamsReducer(): RequestUsersParamsReducerStateType {
	const initialSettings = MemoryManagingTableSettings.getSavedSettings('users');

	return {
		search: '',
		page: 1,
		pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
		orderBy: 'username',
		elements: [],
	};
}

export function requestUsersParamsReducer(
	state: RequestUsersParamsReducerStateType,
	action: RequestUsersParamsReducerActionType,
): RequestUsersParamsReducerStateType {
	switch (action.type) {
		case 'search':
			return { ...state, search: action.payload, page: 1 };
		case 'pageSize':
			return { ...state, pageSize: action.payload.pageSize, page: 1 };
		case 'filterOption': {
			const { group, field } = action.payload;

			const addedGroupIdx = state.elements.findIndex((option) =>
				option.fields.includes(group.field),
			);
			const addedFilterToGroupIdx = state.elements[
				addedGroupIdx
			]?.values.findIndex((value) => value === field.value);

			//If elements already have an element with passed field name and field value
			if (addedFilterToGroupIdx > -1) {
				let updatedList = update(state, {
					elements: {
						[addedGroupIdx]: (element) =>
							update(element, {
								values: { $splice: [[addedFilterToGroupIdx, 1]] },
							}),
					},
					page: { $set: 1 },
				});

				//If element has empty values remove element from list
				if (!updatedList.elements[addedGroupIdx].values.length) {
					updatedList = update(state, {
						elements: { $splice: [[addedGroupIdx, 1]] },
						page: { $set: 1 },
					});
				}

				return updatedList;
			}

			//If elements have already element with passed field name just push field value to element values
			if (addedGroupIdx > -1) {
				return update(state, {
					elements: {
						[addedGroupIdx]: (element) =>
							update(element, { values: { $push: [field.value] } }),
					},
					page: { $set: 1 },
				});
			}

			//If elements doesn't have an element with passed field name
			return {
				...state,
				elements: [
					...state.elements,
					{
						fields: [group.field],
						modifier: 'equal',
						values: [field.value],
						filter: false,
					},
				],
				page: 1,
			};
		}

		case 'clearFilters': {
			return { ...state, elements: [], page: 1 };
		}

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

export type RequestGroupsParamsReducerStateType = {
	search: string;
	page: number;
	pageSize: number;
	orderBy: string;
};

type RequestGroupsParamsReducerActionType =
	| { type: 'search'; payload: string }
	| { type: 'orderBy'; payload: string }
	| { type: 'page'; payload: { page: number } }
	| { type: 'pageSize'; payload: { pageSize: number } };

export function getInitialStateRequestGroupsParamsReducer(): RequestGroupsParamsReducerStateType {
	const initialSettings =
		MemoryManagingTableSettings.getSavedSettings('groups');

	return {
		search: '',
		page: 1,
		pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
		orderBy: '',
	};
}

export function requestGroupsParamsReducer(
	state: RequestGroupsParamsReducerStateType,
	action: RequestGroupsParamsReducerActionType,
): RequestGroupsParamsReducerStateType {
	switch (action.type) {
		case 'search':
			return { ...state, search: action.payload, page: 1 };
		case 'pageSize':
			return { ...state, pageSize: action.payload.pageSize, page: 1 };
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
