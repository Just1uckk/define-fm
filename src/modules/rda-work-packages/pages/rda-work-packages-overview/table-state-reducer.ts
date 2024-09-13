import { DISPOSITION_CARD_VIEW_TYPES } from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/disposition-card/disposition-card';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';

import { IDispositionTableTab } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { DEFAULT_PAGINATION_PAGE_SIZE } from 'shared/hooks/use-manage-pagination';

import { IDate } from 'shared/components/input/input-date';

import {
	DefaultRdaWorkPackagesTab,
	TABLE_NAME,
	TABLE_TOTAL,
} from './use-rda-work-packages-overview';

export type DispositionTableFilterType = Record<`${string}:${string}`, boolean>;

export type TableStateReducerStateType = {
	currentTab: IDispositionTableTab['tabIndex'];
	tableView: DISPOSITION_CARD_VIEW_TYPES;
	search: string;
	page: number;
	pageSize: number;
	orderBy: string;
	filters: {
		filters: Record<
			IDispositionTableTab['tabIndex'],
			Record<`${string}:${string}`, boolean>
		>;
		createdBy: IUser[];
		approvers: IUser[];
		createdAt: [IDate, IDate] | [null, null];
		daysLeft: [number, number] | [undefined, undefined];
	};
};

type TableStateReducerActionType =
	| { type: 'search'; payload: string }
	| { type: 'orderBy'; payload: string }
	| { type: 'tableView'; payload: DISPOSITION_CARD_VIEW_TYPES }
	| { type: 'page'; payload: { page: number } }
	| { type: 'pageSize'; payload: number }
	| { type: 'currentTab'; payload: IDispositionTableTab['tabIndex'] }
	| {
			type: 'filters';
			payload: Omit<TableStateReducerStateType['filters'], 'filters'> & {
				filters: DispositionTableFilterType;
			};
	  };

const initialFiltersState: TableStateReducerStateType['filters'] = {
	filters: {},
	createdBy: [],
	approvers: [],
	createdAt: [null, null],
	daysLeft: [undefined, undefined],
};

export function getInitialTableStateReducer(
	searchParams: URLSearchParams,
): TableStateReducerStateType {
	const initialSettings =
		MemoryManagingTableSettings.getSavedSettings(TABLE_NAME);
	const totalSettings =
		MemoryManagingTableSettings.getSavedSettings(TABLE_TOTAL);
	const currentTab = Number(searchParams.get('t') || DefaultRdaWorkPackagesTab);
	const tableView = totalSettings.tableView || DISPOSITION_CARD_VIEW_TYPES.ROW;
	const page = Number(searchParams.get('p') || 1);
	const search = searchParams.get('s') || '';
	const orderBy = searchParams.get('orderBy') || '';

	return {
		currentTab,
		tableView,
		search,
		page,
		pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
		orderBy,
		filters: initialFiltersState,
	};
}

export function tableStateReducer(
	state: TableStateReducerStateType,
	action: TableStateReducerActionType,
): TableStateReducerStateType {
	switch (action.type) {
		case 'search':
		case 'pageSize':
		case 'currentTab':
			return { ...state, [action.type]: action.payload, page: 1 };
		case 'tableView':
			return { ...state, [action.type]: action.payload };
		case 'filters': {
			const { filters, ...restData } = action.payload;

			return {
				...state,
				filters: {
					...state.filters,
					...restData,
					filters: { ...state.filters.filters, [state.currentTab]: filters },
				},
				page: 1,
			};
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
