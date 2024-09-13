import React, { useCallback, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import { keyBy } from 'lodash';
import { CreateSearch } from 'modules/disposition-searches/features/create-search';
import { DeleteDispositionSearch } from 'modules/disposition-searches/features/delete-search';
import { UpdateSearch } from 'modules/disposition-searches/features/update-search';
import { DispositionSearchesTable } from 'modules/disposition-searches/pages/searches-overview/components/disposition-searches-table';
import { useModalManager } from 'shared/context/modal-manager';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';
import styled from 'styled-components';

import {
	CreateDispositionSearchSnapshot,
	DispositionSearcheApi,
	FindDispositionSearchesDto,
} from 'app/api/disposition-searches-api/disposition-searche-api';
import { FindGroupsDto } from 'app/api/groups-api/group-api';

import { IDispositionSearch } from 'shared/types/disposition-search';

import { DISPOSITION_SEARCH_MODAL_NAMES } from 'shared/constants/modal-names';
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
import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { SearchBar } from 'shared/components/search-bar/search-bar';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
import {
	SortByButton,
	SortOption,
} from 'shared/components/table-controls/sort-button';
import { TableActionPanel } from 'shared/components/table-controls/table-action-panel';
import { Title } from 'shared/components/title/title';
import { Toggle } from 'shared/components/toggle/toggle';

const Page = styled.div``;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const PageHeaderRight = styled.div`
	display: flex;
	align-items: center;
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

type TableFindParams = {
	search: string;
	pageSize: number;
	page: number;
	orderBy: string;
};

const SORT_OPTIONS = [
	{ label: 'disposition_searches.sort_by.name', value: 'name' },
	{
		label: 'disposition_searches.sort_by.created_by',
		value: 'createByDisplay',
	},
	{ label: 'disposition_searches.sort_by.date_added', value: 'createdOn' },
	{ label: 'disposition_searches.sort_by.last_run', value: 'lastRun' },
] as const;

const SearchesOverviewPage: React.FC = () => {
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams({
		sortBy: '',
		p: String(1),
		s: '',
	});
	const { t } = useTranslation();
	const date = useDate();
	const modalManager = useModalManager();
	useTitle(t('disposition_searches.title'));

	const [selectedDispositionSearches, setSelectedDispositionSearches] =
		useState<Record<IDispositionSearch['id'], IDispositionSearch>>({});
	const [isSelectableTable, setIsSelectableTable] = useState(false);
	const [findDispositionSearchesParams, setFindDispositionSearchesParams] =
		useState<TableFindParams>(() => {
			const initialSettings = MemoryManagingTableSettings.getSavedSettings(
				'disposition-searches',
			);

			const locationState = (location.state as object) || {};
			const search = searchParams.get('s') || '';
			const page = Number(searchParams.get('p') || 1);
			const orderBy = searchParams.get('orderBy') || '';

			return {
				search,
				page,
				pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
				orderBy,
				...locationState,
			};
		});

	const startSearchMutation = useMutation(
		async (payload: CreateDispositionSearchSnapshot) => {
			await DispositionSearcheApi.createSearchSnapshot(payload);
			await refetchDispositionSearches();
		},
	);

	const {
		data: dispositionSearchesData,
		refetchData: refetchDispositionSearches,
		searchData: searchDispositionSearches,
		isInitialLoading: isInitialLoadingDispositionSearches,
		isRefetching: isRefetchingDispositionSearches,
		isSearching: isSearchingDispositionSearches,
	} = useFilterRequest<
		IDispositionSearch[],
		Partial<TableFindParams>,
		FindDispositionSearchesDto
	>({
		request: (params) => {
			return DispositionSearcheApi.findDispositionSearches(
				getFindDispositionSearchesParams(params),
			);
		},
		searchRequest: (params) => {
			return DispositionSearcheApi.findDispositionSearches(params);
		},
	});
	const dispositionSearches = dispositionSearchesData?.results ?? [];

	useEffectAfterMount(() => {
		refetchDispositionSearches(undefined, { silently: false }).then(() => {
			setSearchParams(
				(prev) => {
					prev.set('p', String(findDispositionSearchesParams.page));
					prev.set('orderBy', findDispositionSearchesParams.orderBy);

					return prev;
				},
				{
					replace: true,
				},
			);
		});
	}, [
		findDispositionSearchesParams.orderBy,
		findDispositionSearchesParams.page,
		findDispositionSearchesParams.pageSize,
	]);

	useEffectAfterMount(() => {
		searchDispositionSearches(
			() => getFindDispositionSearchesParams(findDispositionSearchesParams),
			() => {
				setSearchParams(
					(prev) => {
						prev.set('s', findDispositionSearchesParams.search);

						return prev;
					},
					{
						replace: true,
					},
				);
			},
		);
	}, [findDispositionSearchesParams.search]);

	function getFindDispositionSearchesParams(params) {
		const combinedParams = {
			...findDispositionSearchesParams,
			...params,
		};

		const parsedParams: FindGroupsDto = {
			orderBy: combinedParams.orderBy,
			elements: [],
			page: 1,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.search.trim().length) {
			parsedParams.elements.push({
				fields: ['name', 'query', 'createdByDisplay'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		return parsedParams;
	}

	const onCreateSearch = () =>
		modalManager.open(DISPOSITION_SEARCH_MODAL_NAMES.CREATE_SEARCH);

	const toggleSelectingRows = () =>
		setIsSelectableTable((prevState) => {
			const newState = !prevState;

			if (!newState) {
				setSelectedDispositionSearches({});
			}

			return newState;
		});

	const onSearch = (value: string) => {
		setFindDispositionSearchesParams((prevValue) => ({
			...prevValue,
			search: value,
			page: 1,
		}));
	};

	const onClearSearch = () => {
		setFindDispositionSearchesParams((prevValue) => ({
			...prevValue,
			search: '',
			page: 1,
		}));
	};

	const onSort = (value: SortOption['value']) => {
		let order = value;

		if (findDispositionSearchesParams.orderBy === value) {
			order = '-' + value;
		}
		if (findDispositionSearchesParams.orderBy === `-${value}`) {
			order = '';
		}

		setFindDispositionSearchesParams((prevValue) => ({
			...prevValue,
			orderBy: order,
		}));
	};

	const isRowSelected = useCallback(
		(id: number) => !!selectedDispositionSearches[id],
		[selectedDispositionSearches],
	);

	const onChangedTablePageSize = useEvent((size: number) => {
		setFindDispositionSearchesParams((prevValue) => ({
			...prevValue,
			pageSize: size,
		}));
	});

	const onSelectRow = useEvent((entity: IDispositionSearch) => {
		const isSelected = !!selectedDispositionSearches[entity.id];

		if (isSelected) {
			setSelectedDispositionSearches((prevValue) => {
				const updatedList = { ...prevValue };
				delete updatedList[entity.id];

				return updatedList;
			});

			return;
		}

		setSelectedDispositionSearches((prevValue) => {
			const updatedList = { ...prevValue };
			updatedList[entity.id] = entity;

			return updatedList;
		});
	});

	const onStartSearch = useEvent((entity: IDispositionSearch) => {
		startSearchMutation.mutate({ dispositionId: entity.id });
	});

	const onEditDispositionSearch = useEvent((entity: IDispositionSearch) => {
		modalManager.open(DISPOSITION_SEARCH_MODAL_NAMES.EDIT_SEARCH, entity);
	});

	const onDeleteDispositionSearch = useEvent((entity: IDispositionSearch) => {
		modalManager
			.open(DISPOSITION_SEARCH_MODAL_NAMES.DELETE_SEARCH, [entity])
			.then(() => setSelectedDispositionSearches({}));
	});

	const onDeleteSelectedDispositionSearches = () => {
		modalManager
			.open(
				DISPOSITION_SEARCH_MODAL_NAMES.DELETE_SEARCH,
				Object.values(selectedDispositionSearches),
			)
			.then(() => setSelectedDispositionSearches({}));
	};

	const onSelectAllTableEntities = () => {
		setSelectedDispositionSearches(keyBy(dispositionSearches, 'id'));
	};

	const onUnselectAllTableEntities = () => {
		setSelectedDispositionSearches({});
	};

	const countSelectedDispositionSearches = useMemo(
		() => Object.keys(selectedDispositionSearches).length,
		[selectedDispositionSearches],
	);

	return (
		<>
			<CreateSearch
				searchAfterEvent={onStartSearch}
				onCreated={refetchDispositionSearches}
			/>
			<UpdateSearch
				searchAfterEvent={onStartSearch}
				onUpdated={refetchDispositionSearches}
			/>
			<DeleteDispositionSearch onDeleted={refetchDispositionSearches} />
			<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
				<Breadcrumb
					breadcrumb={t('breadcrumbs.disposition_searches')}
					path={DISPOSITION_SEARCH_ROUTES.OVERVIEW.path}
					isLast
				/>
			</BreadcrumbPortal>
			<FetchLoader
				active={
					isRefetchingDispositionSearches || startSearchMutation.isLoading
				}
			/>
			<Page>
				<PageHeader>
					<Title subHeader={date.formats.pageHead()}>
						{t('disposition_searches.title')}
					</Title>

					<PageHeaderRight>
						<Button
							icon={ICON_COLLECTION.add}
							label={t('disposition_searches.actions.create')}
							onClick={onCreateSearch}
						/>
					</PageHeaderRight>
				</PageHeader>
				<PageContent>
					<ControlPanel>
						<ControlPanelLeft>
							<SearchBar
								placeholder={t('disposition_searches.table_controls.search')}
								value={findDispositionSearchesParams.search}
								isLoading={isSearchingDispositionSearches}
								onChange={onSearch}
								onClear={onClearSearch}
								fulfilled
							/>
						</ControlPanelLeft>
						<ControlPanelRight>
							<TableControlWrapper>
								<Toggle
									onChange={toggleSelectingRows}
									checked={isSelectableTable}
									label={t('components.table.multiple_select')}
								/>
							</TableControlWrapper>
							<SortByButton
								sortBy={findDispositionSearchesParams.orderBy}
								options={SORT_OPTIONS}
								onSelect={onSort}
								onOptionLabel={(_, idx) => t(SORT_OPTIONS[idx].label)}
								onSelectedOptionLabel={(option) => t(option.label)}
							/>
						</ControlPanelRight>
					</ControlPanel>

					<DispositionSearchesTable
						pageSize={findDispositionSearchesParams.pageSize}
						page={findDispositionSearchesParams.page - 1}
						isLoadingData={isInitialLoadingDispositionSearches}
						isMultipleSelect={isSelectableTable}
						isRowSelected={isRowSelected}
						data={dispositionSearches}
						isEmptyList={!dispositionSearches.length}
						onSelectRow={onSelectRow}
						onStartSearch={onStartSearch}
						onEditEntity={onEditDispositionSearch}
						onDeleteEntity={onDeleteDispositionSearch}
						onChangedPageSize={onChangedTablePageSize}
					/>

					{!!countSelectedDispositionSearches && (
						<TableActionPanel
							selectedCountItems={countSelectedDispositionSearches}
							allCountItems={dispositionSearches.length}
							onSelectAll={onSelectAllTableEntities}
						>
							<ButtonList>
								<Button
									icon={ICON_COLLECTION.delete}
									label={t('disposition_searches.actions.delete')}
									onClick={onDeleteSelectedDispositionSearches}
								/>
								<Button
									variant="primary_ghost"
									icon={ICON_COLLECTION.cross}
									label={t('disposition_searches.actions.cancel_selection')}
									onClick={onUnselectAllTableEntities}
								/>
							</ButtonList>
						</TableActionPanel>
					)}
				</PageContent>
			</Page>
		</>
	);
};

export default SearchesOverviewPage;
