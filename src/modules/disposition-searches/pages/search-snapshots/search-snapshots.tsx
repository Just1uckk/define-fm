import React, { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import { keyBy } from 'lodash';
import { DeleteDispositionSearchSnapshot } from 'modules/disposition-searches/features/delete-search-snapshot';
import { UpdateSearch } from 'modules/disposition-searches/features/update-search';
import { DispositionSearchSnapshotsTable } from 'modules/disposition-searches/pages/search-snapshots/components/snapshots-table';
import { useModalManager } from 'shared/context/modal-manager';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';
import styled from 'styled-components';

import {
	CreateDispositionSearchSnapshot,
	DispositionSearcheApi,
	FindDispositionSearchSnapshotsDto,
} from 'app/api/disposition-searches-api/disposition-searche-api';
import { FindGroupsDto } from 'app/api/groups-api/group-api';

import {
	IDispositionSearch,
	IDispositionSearchSnapshot,
} from 'shared/types/disposition-search';

import { DISPOSITION_SEARCH_MODAL_NAMES } from 'shared/constants/modal-names';
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
import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { SearchBar } from 'shared/components/search-bar/search-bar';
import { Spinner } from 'shared/components/spinner/spinner';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
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
};

const SearchSnapshots: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams({
		p: String(1),
		s: '',
	});
	const { t, multilingualT } = useTranslation();
	const date = useDate();
	const modalManager = useModalManager();

	const [
		selectedDispositionSearchSnapshots,
		setSelectedDispositionSearchSnapshots,
	] = useState<
		Record<IDispositionSearchSnapshot['id'], IDispositionSearchSnapshot>
	>({});
	const [isSelectableTable, setIsSelectableTable] = useState(false);
	const [findDispositionSearchesParams, setFindDispositionSearchesParams] =
		useState<TableFindParams>(() => {
			const initialSettings = MemoryManagingTableSettings.getSavedSettings(
				'disposition-search-snapshots',
			);

			const search = searchParams.get('s') || '';
			const page = Number(searchParams.get('p') || 1);

			return {
				search,
				page,
				pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
			};
		});

	const { data: dispositionSearch, isLoading: isLoadingSearch } = useQuery({
		queryKey: DISPOSITION_SEARCHES_KEYS.search(Number(id)),
		queryFn: () => DispositionSearcheApi.getOne({ id: Number(id) }),
		enabled: !!id,
	});
	const dispositionSearchTitle = multilingualT({
		field: 'name',
		translations: dispositionSearch?.multilingual,
		fallbackValue: dispositionSearch?.name,
	});

	useTitle(dispositionSearchTitle);

	const {
		data: searchSnapshotsData,
		refetchData: refetchSearchSnapshots,
		searchData: searchDispositionSearches,
		isInitialLoading: isInitialLoadingSnapshots,
		isRefetching: isRefetchingSnapshots,
		isSearching: isSearchingDispositionSearches,
	} = useFilterRequest<
		IDispositionSearchSnapshot[],
		Partial<TableFindParams>,
		FindDispositionSearchSnapshotsDto
	>({
		request: (params) => {
			return DispositionSearcheApi.findSearchSnapshots(
				getFindDispositionSearchesParams(params),
			);
		},
		searchRequest: (params) => {
			return DispositionSearcheApi.findSearchSnapshots(params);
		},
	});
	const snapshots = searchSnapshotsData?.results ?? [];

	const startSearchMutation = useMutation({
		mutationFn: async (payload: CreateDispositionSearchSnapshot) => {
			await DispositionSearcheApi.createSearchSnapshot(payload);
			await refetchSearchSnapshots();
		},
	});

	function getFindDispositionSearchesParams(params) {
		const combinedParams = {
			...findDispositionSearchesParams,
			...params,
		};

		const parsedParams: FindGroupsDto = {
			elements: [
				{
					fields: ['dispositionId'],
					modifier: 'equal',
					values: [id],
				},
			],
			page: 1,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.search.trim().length) {
			parsedParams.elements.push({
				fields: ['name', 'snapdate'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		return parsedParams;
	}

	useEffectAfterMount(() => {
		refetchSearchSnapshots(undefined, { silently: false }).then(() => {
			setSearchParams(
				(prev) => {
					prev.set('p', String(findDispositionSearchesParams.page));

					return prev;
				},
				{
					replace: true,
				},
			);
		});
	}, [
		findDispositionSearchesParams.page,
		findDispositionSearchesParams.pageSize,
	]);

	useEffectAfterMount(() => {
		searchDispositionSearches(
			() => getFindDispositionSearchesParams(findDispositionSearchesParams),
			() => {
				setSearchParams(
					(prev) => {
						prev.set('s', String(findDispositionSearchesParams.search));

						return prev;
					},
					{
						replace: true,
					},
				);
			},
		);
	}, [findDispositionSearchesParams.search]);

	const onStartSearch = () => {
		if (!dispositionSearch) return;

		startSearchMutation.mutate({ dispositionId: dispositionSearch.id });
	};

	const onStartSearchAfterEvent = (data: IDispositionSearch) => {
		startSearchMutation.mutate({ dispositionId: data.id });
	};

	const toggleSelectingRows = () => {
		setIsSelectableTable((prevState) => {
			const newState = !prevState;

			if (!newState) {
				setSelectedDispositionSearchSnapshots({});
			}

			return newState;
		});
	};

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

	const isSearchSelected = useCallback(
		(id: number) => !!selectedDispositionSearchSnapshots[id],
		[selectedDispositionSearchSnapshots],
	);

	const onChangedTablePageSize = useEvent((size: number) => {
		setFindDispositionSearchesParams((prevValue) => ({
			...prevValue,
			pageSize: size,
		}));
	});

	const onChangedTablePage = useEvent((page: number) => {
		setFindDispositionSearchesParams((prevValue) => ({
			...prevValue,
			page: page + 1,
		}));
	});

	const onSelectRow = useCallback(
		(entity: IDispositionSearchSnapshot) => {
			const isSelected = !!selectedDispositionSearchSnapshots[entity.id];

			if (isSelected) {
				setSelectedDispositionSearchSnapshots((prevValue) => {
					const updatedList = { ...prevValue };
					delete updatedList[entity.id];

					return updatedList;
				});

				return;
			}

			setSelectedDispositionSearchSnapshots((prevValue) => {
				const updatedList = { ...prevValue };
				updatedList[entity.id] = entity;

				return updatedList;
			});
		},
		[selectedDispositionSearchSnapshots],
	);

	const onEditDispositionSearch = () => {
		if (!dispositionSearch) return;

		modalManager.open(
			DISPOSITION_SEARCH_MODAL_NAMES.EDIT_SEARCH,
			dispositionSearch,
		);
	};

	const onDeleteSnapshot = useEvent((snapshot: IDispositionSearchSnapshot) => {
		modalManager
			.open(DISPOSITION_SEARCH_MODAL_NAMES.DELETE_SEARCH_SNAPSHOT, [snapshot])
			.then(() => setSelectedDispositionSearchSnapshots({}));
	});

	const onDeleteSelectedDispositionSearches = () => {
		modalManager
			.open(
				DISPOSITION_SEARCH_MODAL_NAMES.DELETE_SEARCH_SNAPSHOT,
				Object.values(selectedDispositionSearchSnapshots),
			)
			.then(() => setSelectedDispositionSearchSnapshots({}));
	};

	const onSelectAllTableEntities = () => {
		setSelectedDispositionSearchSnapshots(keyBy(snapshots, 'id'));
	};

	const onUnselectAllTableEntities = () => {
		setSelectedDispositionSearchSnapshots({});
	};

	const countSelectedDispositionSearchSnapshots = useMemo(
		() => Object.keys(selectedDispositionSearchSnapshots).length,
		[selectedDispositionSearchSnapshots],
	);

	if (isLoadingSearch || !dispositionSearch) {
		return (
			<Page>
				<PageContent>
					<Spinner />
				</PageContent>
			</Page>
		);
	}

	return (
		<>
			<UpdateSearch searchAfterEvent={onStartSearchAfterEvent} />
			<DeleteDispositionSearchSnapshot onDeleted={refetchSearchSnapshots} />
			<FetchLoader active={isRefetchingSnapshots} />
			<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
				<Breadcrumb
					breadcrumb={t('breadcrumbs.disposition_searches')}
					path={location.state?.from ?? DISPOSITION_SEARCH_ROUTES.OVERVIEW.path}
					isLast
				/>
			</BreadcrumbPortal>
			<Page>
				<PageHeader>
					<Title subHeader={date.formats.pageHead()}>
						{dispositionSearchTitle}
					</Title>

					<PageHeaderRight>
						<ButtonList>
							<Button
								icon={ICON_COLLECTION.search}
								label={t('disposition_search_snapshots.actions.start_search')}
								loading={startSearchMutation.isLoading}
								onClick={onStartSearch}
							/>
							<Button
								variant="primary_outlined"
								icon={ICON_COLLECTION.settings}
								onClick={onEditDispositionSearch}
							/>
						</ButtonList>
					</PageHeaderRight>
				</PageHeader>
				<PageContent>
					<ControlPanel>
						<ControlPanelLeft>
							<SearchBar
								placeholder={t(
									'disposition_search_snapshots.table_controls.search',
								)}
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
						</ControlPanelRight>
					</ControlPanel>

					<DispositionSearchSnapshotsTable
						pageSize={findDispositionSearchesParams.pageSize}
						isLoadingData={isInitialLoadingSnapshots}
						data={snapshots}
						page={findDispositionSearchesParams.page - 1}
						totalPages={searchSnapshotsData?.stats.pages ?? 0}
						totalItems={searchSnapshotsData?.stats.objects ?? 0}
						isMultipleSelect={isSelectableTable}
						isRowSelected={isSearchSelected}
						isEmptyList={!snapshots.length}
						onSelectRow={onSelectRow}
						onDeleteEntity={onDeleteSnapshot}
						onChangedPageSize={onChangedTablePageSize}
						onChangePage={onChangedTablePage}
					/>

					{!!countSelectedDispositionSearchSnapshots && (
						<TableActionPanel
							selectedCountItems={countSelectedDispositionSearchSnapshots}
							allCountItems={snapshots.length}
							onSelectAll={onSelectAllTableEntities}
						>
							<ButtonList>
								<Button
									icon={ICON_COLLECTION.delete}
									label={t('disposition_search_snapshots.actions.delete')}
									onClick={onDeleteSelectedDispositionSearches}
								/>
								<Button
									variant="primary_ghost"
									icon={ICON_COLLECTION.cross}
									label={t(
										'disposition_search_snapshots.actions.cancel_selection',
									)}
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

export default SearchSnapshots;
