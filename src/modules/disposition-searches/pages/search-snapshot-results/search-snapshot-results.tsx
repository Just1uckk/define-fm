import React, { useReducer } from 'react';
import { useQuery } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import update from 'immutability-helper';
import { DispositionSearchSnapshotResultsTable } from 'modules/disposition-searches/pages/search-snapshot-results/components/results-table';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';
import styled from 'styled-components';

import {
	DispositionSearcheApi,
	FindDispositionSearchSnapshotItemsDto,
} from 'app/api/disposition-searches-api/disposition-searche-api';
import { FindGroupsDto } from 'app/api/groups-api/group-api';
import {
	FindEntityRequest,
	FindEntityResponseFilterGroup,
	FindEntityResponseFilterGroupField,
} from 'app/api/types';

import { IDispositionSearchSnapshotItem } from 'shared/types/disposition-search';

import { DISPOSITION_SEARCHES_KEYS } from 'shared/constants/query-keys';
import { DISPOSITION_SEARCH_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { DEFAULT_PAGINATION_PAGE_SIZE } from 'shared/hooks/use-manage-pagination';
import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';
import { useEvent } from 'shared/hooks/useEvent';

import { Breadcrumb } from 'shared/components/breadcrumbs/breadcrumb';
import { BreadcrumbPortal } from 'shared/components/breadcrumbs/breadcrumb-portal';
import { BREADCRUMB_CONTAINER } from 'shared/components/breadcrumbs/breadcrumbs';
import { SearchBar } from 'shared/components/search-bar/search-bar';
import { Spinner } from 'shared/components/spinner/spinner';
import { TableSortState } from 'shared/components/table/table';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
import { Title } from 'shared/components/title/title';
import { Toggle } from 'shared/components/toggle/toggle';

const Page = styled.div``;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const PageContent = styled.div`
	margin-top: 1.7rem;
`;

const ControlPanel = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 1.4rem;
`;

const ControlPanelLeft = styled.div`
	width: 100%;
	max-width: 566px;
`;

const ControlPanelRight = styled.div`
	display: flex;
	flex-shrink: 0;
	gap: 0.85rem;
	margin-left: 0.85rem;
`;

type RequestParamsReducerStateType = {
	isVisibleFilterPanel: boolean;
	search: string;
	page: number;
	pageSize: number;
	orderBy: string;
	elements: FindEntityRequest['elements'];
};

type RequestParamsReducerActionType =
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

function requestParamsReducer(
	state: RequestParamsReducerStateType,
	action: RequestParamsReducerActionType,
): RequestParamsReducerStateType {
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

function getInitialStateRequestParamsReducer(): RequestParamsReducerStateType {
	const initialSettings = MemoryManagingTableSettings.getSavedSettings(
		'disposition-search-snapshot-items',
	);

	return {
		isVisibleFilterPanel: false,
		search: '',
		page: 1,
		pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
		orderBy: '',
		elements: [],
	};
}

const SearchSnapshotResults: React.FC = () => {
	const { id } = useParams<{
		id: string;
		dispositionId: string;
	}>();
	const { t } = useTranslation();
	const date = useDate();
	const location = useLocation();

	const [tableParams, dispatchTableParams] = useReducer(
		requestParamsReducer,
		getInitialStateRequestParamsReducer(),
	);

	const {
		data: dispositionSearchSnapshot,
		isLoading: isLoadingDispositionSearchSnapshot,
	} = useQuery({
		queryKey: DISPOSITION_SEARCHES_KEYS.snapshot(Number(id)),
		queryFn: () => DispositionSearcheApi.getSearchSnapshot({ id: Number(id) }),
		enabled: !!id,
	});

	const pageTitle = dispositionSearchSnapshot
		? `${t(
				'disposition_search_snapshot_results.title',
		  )} ${date.formats.baseWithTime(dispositionSearchSnapshot.snapdate)}`
		: t('disposition_search_snapshot_results.title');

	useTitle(pageTitle);

	const {
		data: snapshotItemsData,
		refetchData: refetchSearchSnapshotItems,
		searchData: searchDispositionSearchItems,
		isInitialLoading: isInitialLoadingDispositionSearches,
		isRefetching: isRefetchingFiles,
		isSearching: isSearchingDispositionSearchItems,
	} = useFilterRequest<
		IDispositionSearchSnapshotItem[],
		Partial<Omit<RequestParamsReducerStateType, 'isVisibleFilterPanel'>>,
		FindDispositionSearchSnapshotItemsDto
	>({
		request: (params) => {
			return DispositionSearcheApi.findSearchSnapshotItems(
				getFindParams(params),
			);
		},
		searchRequest: (params) => {
			return DispositionSearcheApi.findSearchSnapshotItems(params);
		},
	});
	const snapshotItems = snapshotItemsData?.results ?? [];

	useEffectAfterMount(() => {
		refetchSearchSnapshotItems(undefined, { silently: false });
	}, [
		tableParams.orderBy,
		tableParams.page,
		tableParams.pageSize,
		tableParams.elements,
	]);
	useEffectAfterMount(() => {
		searchDispositionSearchItems(() => getFindParams(tableParams));
	}, [tableParams.search]);

	function getFindParams(
		params: Partial<
			Omit<RequestParamsReducerStateType, 'isVisibleFilterPanel'> &
				FindEntityRequest
		>,
	) {
		const combinedParams = {
			...tableParams,
			...params,
		};

		const { orderBy, filters = true } = combinedParams;

		const resultedParams: FindGroupsDto = {
			orderBy: orderBy,
			filters: filters,
			elements: [
				{
					fields: ['snapshot'],
					modifier: 'equal',
					values: [id],
				},
				...combinedParams.elements,
			],
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.search.trim().length) {
			resultedParams.elements.push({
				fields: [
					'dataid',
					'mediaType',
					'official',
					'subtype',
					'addressee',
					'classificationName',
					'comment',
					'essential',
					'establishment',
					'fileNumber',
					'gif',
					'groupOwner',
					'location',
					'mimeType',
					'name',
					'objectCreator',
					'objectOwner',
					'originator',
					'rsi',
					'sentTo',
					'status',
					'subject',
					'uniqueId',
				],
				modifier: 'contain',
				filter: false,
				values: [combinedParams.search],
			});
		}

		return resultedParams;
	}

	const onSearch = (value: string) => {
		dispatchTableParams({ type: 'search', payload: value });
	};

	const onClearSearch = () => {
		dispatchTableParams({ type: 'search', payload: '' });
	};

	const onSortChanged = useEvent((state: TableSortState) => {
		dispatchTableParams({ type: 'orderBy', payload: state });
	});

	const onChangePage = useEvent((page: number) => {
		dispatchTableParams({ type: 'page', payload: { page: page + 1 } });
	});

	const onChangeTablePageSize = useEvent((size: number) => {
		dispatchTableParams({
			type: 'pageSize',
			payload: { pageSize: size },
		});
	});

	const onChangeFilter = useEvent(
		(
			group: FindEntityResponseFilterGroup,
			field: FindEntityResponseFilterGroupField,
		) => {
			dispatchTableParams({
				type: 'filterOption',
				payload: { group, field },
			});
		},
	);

	const onClearFilters = useEvent(() => {
		dispatchTableParams({
			type: 'clearFilters',
		});
	});

	const toggleDisplayingFilters = () => {
		dispatchTableParams({
			type: 'toggleFilterPanel',
		});
	};

	const isPageLoading = isLoadingDispositionSearchSnapshot;

	if (isPageLoading || !dispositionSearchSnapshot) {
		return (
			<Page>
				<PageContent>
					<Spinner />
				</PageContent>
			</Page>
		);
	}

	const isNoResult =
		!snapshotItems.length && !tableParams.search?.trim().length;
	const isNoSearchResult =
		!snapshotItems.length && !!tableParams.search?.trim().length;

	return (
		<>
			<FetchLoader active={isRefetchingFiles} />
			{dispositionSearchSnapshot && (
				<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
					<Breadcrumb
						breadcrumb={t('breadcrumbs.disposition_searches')}
						path={
							location.state?.fromSearches ??
							DISPOSITION_SEARCH_ROUTES.OVERVIEW.path
						}
					/>
					<Breadcrumb
						breadcrumb={dispositionSearchSnapshot.name}
						path={
							location.state?.fromSnapshots ??
							DISPOSITION_SEARCH_ROUTES.SEARCH.generate(
								dispositionSearchSnapshot.dispositionId,
							)
						}
						isLast
					/>
				</BreadcrumbPortal>
			)}

			<Page>
				<PageHeader>
					<Title subHeader={date.formats.pageHead()}>{pageTitle}</Title>
				</PageHeader>
				<PageContent>
					<ControlPanel>
						<ControlPanelLeft>
							<SearchBar
								placeholder={t(
									'disposition_search_snapshot_results.table_controls.search',
								)}
								value={tableParams.search}
								isLoading={isSearchingDispositionSearchItems}
								onChange={onSearch}
								onClear={onClearSearch}
								fulfilled
							/>
						</ControlPanelLeft>
						<ControlPanelRight>
							<TableControlWrapper>
								<Toggle
									label={t(
										'disposition_search_snapshot_results.table_controls.show_filters',
									)}
									checked={tableParams.isVisibleFilterPanel}
									onChange={toggleDisplayingFilters}
								/>
							</TableControlWrapper>
						</ControlPanelRight>
					</ControlPanel>

					<DispositionSearchSnapshotResultsTable
						isLoadingData={isInitialLoadingDispositionSearches}
						data={snapshotItems}
						isNoResult={isNoResult}
						isNoSearchResult={isNoSearchResult}
						filters={snapshotItemsData?.stats.filters ?? []}
						selectedFilters={tableParams.elements}
						page={tableParams.page - 1}
						pageSize={
							snapshotItemsData?.query?.pageSize ?? tableParams.pageSize
						}
						totalPages={snapshotItemsData?.stats.pages ?? 0}
						totalItems={snapshotItemsData?.stats.objects ?? 0}
						isDisplayingFilters={tableParams.isVisibleFilterPanel}
						onSortChanged={onSortChanged}
						onChangePage={onChangePage}
						onChangePageSize={onChangeTablePageSize}
						onChangeFilter={onChangeFilter}
						onClearFilters={onClearFilters}
					/>
				</PageContent>
			</Page>
		</>
	);
};

export default SearchSnapshotResults;
