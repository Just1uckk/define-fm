import update from 'immutability-helper';
import {
	TAB_INDEX_FOR_COMPLETED_STATE,
	TAB_INDEX_FOR_INITIATED_STATE,
} from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/use-rda-report';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';

import {
	FindEntityRequest,
	FindEntityResponseFilterGroup,
	FindEntityResponseFilterGroupField,
} from 'app/api/types';

import { DEFAULT_PAGINATION_PAGE_SIZE } from 'shared/hooks/use-manage-pagination';

import { TableSortState } from 'shared/components/table/table';

type RequestParamsReducerStateType = {
	isVisibleFilterPanel: boolean;
	search: string;
	page: number;
	pageSize: number;
	orderBy: string;
	currentTab: TAB_INDEX_FOR_INITIATED_STATE | TAB_INDEX_FOR_COMPLETED_STATE;
	elements: FindEntityRequest['elements'];
};

type RequestParamsReducerActionType =
	| {
			type: 'changeTab';
			payload: TAB_INDEX_FOR_INITIATED_STATE | TAB_INDEX_FOR_COMPLETED_STATE;
	  }
	| { type: 'search'; payload: string }
	| { type: 'orderBy'; payload: TableSortState }
	| { type: 'page'; payload: { page: number } }
	| { type: 'pageSize'; payload: { pageSize: number } }
	| { type: 'toggleFilterPanel' }
	| { type: 'clearFilters' }
	| {
			type: 'filterOption';
			payload: {
				group: FindEntityResponseFilterGroup;
				field: FindEntityResponseFilterGroupField;
			};
	  };

export function requestParamsReducer(
	state: RequestParamsReducerStateType,
	action: RequestParamsReducerActionType,
): RequestParamsReducerStateType {
	switch (action.type) {
		case 'changeTab':
			return { ...state, currentTab: action.payload, elements: [], page: 1 };
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

		case 'toggleFilterPanel': {
			return { ...state, isVisibleFilterPanel: !state.isVisibleFilterPanel };
		}

		case 'orderBy': {
			const value = action.payload[0];
			let parsedValue = '';

			if (value) {
				parsedValue = value.desc ? `-${value.id}` : value.id;
			}

			return { ...state, orderBy: parsedValue };
		}

		default:
			return { ...state, ...action.payload };
	}
}

export function getInitialStateRequestParamsReducer(
	params: URLSearchParams,
): RequestParamsReducerStateType {
	const initialSettings = MemoryManagingTableSettings.getSavedSettings(
		'rda-work-package_report',
	);
	const queryCurrentTab = Number(params.get('t'));

	return {
		isVisibleFilterPanel: true,
		search: '',
		page: 1,
		pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
		orderBy: '',
		currentTab: queryCurrentTab,
		elements: [],
	};
}
