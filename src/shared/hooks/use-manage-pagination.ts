import { useMemo, useState } from 'react';

import { useManageTableSettings } from 'shared/hooks/use-manage-table-settings';

export const DEFAULT_PAGINATION_PAGE_SIZE = 12;

interface UseManagePaginationParams<T> {
	tableName?: string;
	data?: T[];
	perPage?: number;
	itemsCount?: number;
	totalPages?: number;
}

export function useManagePagination<T>(params: UseManagePaginationParams<T>) {
	const manageTableSettings = useManageTableSettings();
	const {
		tableName,
		data = [],
		perPage = DEFAULT_PAGINATION_PAGE_SIZE,
		itemsCount = 0,
		totalPages = Math.ceil(itemsCount / perPage),
	} = params;

	const [paginationState, setPaginationState] = useState(() => {
		const settings = manageTableSettings.getSavedSettings<{
			page?: number;
			pageSize?: number;
		}>(tableName);

		return {
			page: settings.page || 0,
			pageSize: settings.pageSize || perPage,
		};
	});

	const saveSettingsInLS = ({ pageSize }: { pageSize: number }) => {
		if (!tableName) return;
		manageTableSettings.saveSettingsInLS(tableName, { pageSize });
	};

	const pageData = useMemo(() => {
		const begin = paginationState.page * paginationState.pageSize;
		const end = begin + paginationState.pageSize;

		return data.slice(begin, end);
	}, [data, paginationState.pageSize, paginationState.page]);

	const onChangePage = (page: number) => {
		setPaginationState((prevState) => ({
			...prevState,
			page,
		}));
	};

	const onChangePageSize = (size: number) => {
		const topRowIndex = paginationState.pageSize * paginationState.page;
		const newPage = Math.floor(topRowIndex / paginationState.pageSize);

		setPaginationState((prevState) => ({
			...prevState,
			pageSize: size,
			page: newPage,
		}));

		saveSettingsInLS({ pageSize: size });
	};

	return {
		data: pageData,
		page: paginationState.page,
		pageSize: paginationState.pageSize,
		totalPages,
		onChangePage,
		onChangePageSize,
	};
}
