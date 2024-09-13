import React, { useCallback, useState } from 'react';
import { useQuery } from 'react-query';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import { keyBy } from 'lodash';
import { CreateDataSyncProvider } from 'modules/settings/features/create-data-sync-provider';
import { DeleteDataSyncProvider } from 'modules/settings/features/delete-data-sync-provider';
import { UpdateDataSyncProvider } from 'modules/settings/features/update-data-sync-provider';
import { DataSyncProvidersTable } from 'modules/settings/pages/general-settings/components/data-sync-providers-table';
import { useModalManager } from 'shared/context/modal-manager';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';
import styled from 'styled-components';

import { FindAuthProvidersDto } from 'app/api/auth-provider-api/auth-provider-api';
import {
	DataSyncProviderApi,
	FindDataSyncProviderDto,
} from 'app/api/data-sync-provider-api/data-sync-provider-api';

import { IDataSyncProvider } from 'shared/types/data-sync-provider';

import { DATA_SYNC_MODAL_NAMES } from 'shared/constants/modal-names';
import { DATA_SYNC_PROVIDES_QUERY_KEYS } from 'shared/constants/query-keys';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { DEFAULT_PAGINATION_PAGE_SIZE } from 'shared/hooks/use-manage-pagination';
import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { SearchBar } from 'shared/components/search-bar/search-bar';
import { Spinner } from 'shared/components/spinner/spinner';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
import {
	SortByButton,
	SortOption,
} from 'shared/components/table-controls/sort-button';
import { TableActionPanel } from 'shared/components/table-controls/table-action-panel';
import { Toggle } from 'shared/components/toggle/toggle';

import { FormBody } from '../../components/form-body';
import { FormTitle } from '../../components/form-title';

const ControlPanel = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 0.8rem;
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

const StyledTableControlWrapper = styled(TableControlWrapper)`
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
`;

const StyledSortByButton = styled(SortByButton)`
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
`;

const SORT_OPTIONS = [
	{
		label: 'general_settings.data_sync_providers.providers_table.sort_by.name',
		value: 'name',
	},
	{
		label:
			'general_settings.data_sync_providers.providers_table.sort_by.provider_type',
		value: 'providerTypeId',
	},
] as const;

type TableFindParams = {
	page: number;
	search: string;
	pageSize: number;
	orderBy: string;
};

const GeneralSettingsDataSyncProvidersPage: React.FC = () => {
	const { t } = useTranslation();
	const modalManager = useModalManager();

	const [isSelectableTable, setIsSelectableTable] = useState(false);
	const [selectedRows, setSelectedRows] = useState<
		Record<IDataSyncProvider['id'], IDataSyncProvider>
	>({});
	const [findProvidersParams, setFindProvidersParams] = useState(() => {
		const initialSettings = MemoryManagingTableSettings.getSavedSettings(
			'data-sync-providers',
		);

		return {
			page: 1,
			search: '',
			pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
			orderBy: '',
		};
	});

	const {
		data: providersData,
		refetchData: refetchProviders,
		searchData: searchProviders,
		isInitialLoading: isInitialProvidersLoading,
		isSearching: isSearchingProviders,
		isRefetching: isRefetchingProviders,
	} = useFilterRequest<
		IDataSyncProvider[],
		Partial<TableFindParams>,
		FindDataSyncProviderDto
	>({
		request: (params) => {
			return DataSyncProviderApi.find(getFindProvidersParams(params));
		},
		searchRequest: (params) => {
			return DataSyncProviderApi.find(params);
		},
	});
	const providers = providersData?.results ?? [];

	const { data: providerTypeList = {}, isLoading: isProviderTypeListLoading } =
		useQuery(
			DATA_SYNC_PROVIDES_QUERY_KEYS.data_sync_provider_type_list,
			DataSyncProviderApi.getDataSyncProviderTypes,
			{
				select: useCallback((response) => keyBy(response, 'id'), []),
			},
		);

	useEffectAfterMount(() => {
		refetchProviders(undefined, { silently: false });
	}, [
		findProvidersParams.page,
		findProvidersParams.pageSize,
		findProvidersParams.orderBy,
	]);
	useEffectAfterMount(() => {
		searchProviders(() => getFindProvidersParams(findProvidersParams));
	}, [findProvidersParams.search]);

	function getFindProvidersParams(params) {
		const combinedParams = {
			...findProvidersParams,
			...params,
		};

		const parsedParams: FindAuthProvidersDto = {
			orderBy: combinedParams.orderBy,
			elements: [],
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.search.trim().length) {
			parsedParams.elements.push({
				fields: ['name', 'comment'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		return parsedParams;
	}

	const toggleSelectingRows = () => {
		setIsSelectableTable((prevState) => {
			const newState = !prevState;

			if (!newState) {
				setSelectedRows({});
			}

			return newState;
		});
	};

	const onSearchProviders = (value: string) => {
		setFindProvidersParams((prevValue) => ({
			...prevValue,
			search: value,
			page: 1,
		}));
	};

	const onClearSearchProviders = () => {
		setFindProvidersParams((prevValue) => ({
			...prevValue,
			search: '',
			page: 1,
		}));
	};

	const onChangedPageSize = (size: number) => {
		setFindProvidersParams((prevValue) => ({
			...prevValue,
			pageSize: size,
		}));
	};

	const onChangePage = (page: number) => {
		setFindProvidersParams((prevValue) => ({
			...prevValue,
			page: page + 1,
		}));
	};

	const handleCreateProvider = () => {
		modalManager.open(DATA_SYNC_MODAL_NAMES.CREATE_DATA_SYNC_PROVIDER);
	};

	const onEditProvider = (provider: IDataSyncProvider) => {
		modalManager.open(
			DATA_SYNC_MODAL_NAMES.UPDATE_DATA_SYNC_PROVIDER,
			provider,
		);
	};

	const onDeleteProvider = (provider: IDataSyncProvider) => {
		modalManager
			.open(DATA_SYNC_MODAL_NAMES.DELETE_PROVIDER, [provider])
			.then(() => {
				setSelectedRows({});
			});
	};

	const onDeleteSelectedRows = () => {
		modalManager
			.open(DATA_SYNC_MODAL_NAMES.DELETE_PROVIDER, Object.values(selectedRows))
			.then(() => {
				setSelectedRows({});
			});
	};

	const onSelectRow = (provider: IDataSyncProvider) => {
		setSelectedRows((prevState) => {
			const newList = { ...prevState };

			if (newList[provider.id]) {
				delete newList[provider.id];
			} else {
				newList[provider.id] = provider;
			}

			return newList;
		});
	};

	const onSelectRowsAll = () => {
		const list = providers.reduce((current, next) => {
			const list = current;

			list[next.id] = next;

			return current;
		}, {});

		setSelectedRows(list);
	};

	const onCancelSelectedRows = () => {
		setSelectedRows({});
	};

	const onChangeSorting = (value: SortOption['value']) => {
		let order = value;

		if (findProvidersParams.orderBy === value) {
			order = '-' + value;
		}
		if (findProvidersParams.orderBy === `-${value}`) {
			order = '';
		}

		setFindProvidersParams((prevValue) => ({
			...prevValue,
			orderBy: order,
		}));
	};

	const selectedRowsCount = Object.keys(selectedRows).length;

	const isInitialDataLoading =
		isInitialProvidersLoading || isProviderTypeListLoading;

	if (isInitialDataLoading) {
		return (
			<FormBody data-search-field-name="data-sync-providers-table">
				<FormTitle variant="h2_primary_semibold">
					{t('general_settings.data_sync_providers.title')}
				</FormTitle>

				<ControlPanel>
					<Spinner mt="1rem" />
				</ControlPanel>
			</FormBody>
		);
	}

	return (
		<>
			<CreateDataSyncProvider onCreated={refetchProviders} />
			<UpdateDataSyncProvider onUpdated={refetchProviders} />
			<DeleteDataSyncProvider onSuccess={refetchProviders} />

			<FetchLoader active={isRefetchingProviders} />

			<FormBody data-search-field-name="data-sync-providers-table">
				<FormTitle variant="h2_primary_semibold">
					{t('general_settings.data_sync_providers.title')}
				</FormTitle>
				<ControlPanel>
					<ControlPanelLeft>
						<SearchBar
							placeholder={t(
								'general_settings.data_sync_providers.actions.search',
							)}
							value={findProvidersParams.search}
							isLoading={isSearchingProviders}
							onChange={onSearchProviders}
							onClear={onClearSearchProviders}
							fulfilled
						/>
					</ControlPanelLeft>
					<ControlPanelRight>
						<StyledTableControlWrapper>
							<Toggle
								onChange={toggleSelectingRows}
								checked={isSelectableTable}
								label={t('components.table.multiple_select')}
							/>
						</StyledTableControlWrapper>

						<StyledSortByButton
							sortBy={findProvidersParams.orderBy}
							options={SORT_OPTIONS}
							onSelect={onChangeSorting}
							onOptionLabel={(_, idx) => t(SORT_OPTIONS[idx].label)}
							onSelectedOptionLabel={(option) => t(option.label)}
						/>

						<Button
							icon={ICON_COLLECTION.add}
							label={t(
								'general_settings.data_sync_providers.actions.create_provider',
							)}
							onClick={handleCreateProvider}
							ml="0.75rem"
						/>
					</ControlPanelRight>
				</ControlPanel>
				<DataSyncProvidersTable
					page={findProvidersParams.page - 1}
					totalPages={providersData?.stats.pages ?? 0}
					totalItems={providersData?.stats.objects ?? 0}
					pageSize={
						providersData?.query?.pageSize ?? findProvidersParams.pageSize
					}
					data={providers}
					providerTypes={providerTypeList}
					isEnabledMultipleSelect={isSelectableTable}
					selectedRows={selectedRows}
					onChangePage={onChangePage}
					onChangedPageSize={onChangedPageSize}
					onSelectRow={onSelectRow}
					onEditProvider={onEditProvider}
					onDeleteProvider={onDeleteProvider}
				/>
				{!!selectedRowsCount && (
					<TableActionPanel
						allCountItems={providers.length}
						selectedCountItems={selectedRowsCount}
						onSelectAll={onSelectRowsAll}
					>
						<ButtonList>
							<Button
								label={t(
									'general_settings.data_sync_providers.providers_table.action_panel.delete',
								)}
								icon={ICON_COLLECTION.delete}
								onClick={onDeleteSelectedRows}
							/>
							<Button
								variant="primary_ghost"
								icon={ICON_COLLECTION.cross}
								label={t(
									'general_settings.data_sync_providers.providers_table.action_panel.cancel_selection',
								)}
								onClick={onCancelSelectedRows}
							/>
						</ButtonList>
					</TableActionPanel>
				)}
			</FormBody>
		</>
	);
};

export default GeneralSettingsDataSyncProvidersPage;
