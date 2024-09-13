import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import { CreateAuthProvider } from 'modules/settings/features/create-auth-provider';
import { DeleteAuthProvider } from 'modules/settings/features/delete-auth-provider';
import { UpdateAuthProvider } from 'modules/settings/features/update-auth-provider';
import { useModalManager } from 'shared/context/modal-manager';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';
import styled from 'styled-components';

import {
	AuthProviderApi,
	FindAuthProvidersDto,
	UpdateAuthProviderDto,
} from 'app/api/auth-provider-api/auth-provider-api';

import { IAuthProvider } from 'shared/types/auth-provider';

import { AUTH_PROVIDER_MODAL_NAMES } from 'shared/constants/modal-names';

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

import { AuthProvidersTable } from './components/auth-providers-table';

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

const StyledSortByButton = styled(SortByButton)`
	margin-right: 0.75rem;
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
`;

const StyledTableControlWrapper = styled(TableControlWrapper)`
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
`;

type TableFindParams = {
	page: number;
	search: string;
	pageSize: number;
	orderBy: string;
};

const SORT_OPTIONS = [
	{
		label: 'general_settings.auth_provider.providers_table.sort_by.name',
		value: 'name',
	},
	{
		label:
			'general_settings.auth_provider.providers_table.sort_by.provider_type',
		value: 'type',
	},
] as const;

const GeneralSettingsAuthProviderPage: React.FC = () => {
	const { t } = useTranslation();
	const modalManager = useModalManager();

	const [isSelectableTable, setIsSelectableTable] = useState(false);
	const [selectedRows, setSelectedRows] = useState<
		Record<IAuthProvider['id'], IAuthProvider>
	>({});
	const [findProvidersParams, setFindProvidersParams] = useState(() => {
		const initialSettings =
			MemoryManagingTableSettings.getSavedSettings('auth-providers');

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
		IAuthProvider[],
		Partial<TableFindParams>,
		FindAuthProvidersDto
	>({
		request: (params) => {
			return AuthProviderApi.findProviders(getFindProvidersParams(params));
		},
		searchRequest: (params) => {
			return AuthProviderApi.findProviders(params);
		},
	});
	const providers = providersData?.results ?? [];

	const toggleEnablingProvidersMutation = useMutation({
		mutationFn: async (payloads: Array<UpdateAuthProviderDto>) => {
			const promises = payloads.map((data) =>
				AuthProviderApi.updateProvider(data),
			);

			const results = await Promise.all(promises);

			const updatedList = results.reduce((current, next) => {
				const list = current;
				const provider = next;

				list[provider.id] = provider;

				return list;
			}, {});

			setSelectedRows((prevState) => ({
				...prevState,
				...updatedList,
			}));
		},
	});

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

	const onEditProvider = (provider: IAuthProvider) => {
		modalManager.open(AUTH_PROVIDER_MODAL_NAMES.EDIT_AUTH_PROVIDER, provider);
	};

	const onDeleteProvider = (provider: IAuthProvider) => {
		modalManager
			.open(AUTH_PROVIDER_MODAL_NAMES.DELETE_PROVIDER, [provider])
			.then(() => {
				setSelectedRows({});
			});
	};

	const onDeleteSelectedRows = () => {
		modalManager
			.open(
				AUTH_PROVIDER_MODAL_NAMES.DELETE_PROVIDER,
				Object.values(selectedRows),
			)
			.then(() => {
				setSelectedRows({});
			});
	};

	const onEnableSelectedRows = () => {
		const payload: UpdateAuthProviderDto[] = [];

		for (const providerId in selectedRows) {
			const provider = selectedRows[providerId];
			payload.push({ id: provider.id, synchronizeOn: 1 });
		}

		toggleEnablingProvidersMutation.mutate(payload);
	};

	const onDisableSelectedRows = () => {
		const payload: UpdateAuthProviderDto[] = [];

		for (const providerId in selectedRows) {
			const provider = selectedRows[providerId];
			payload.push({ id: provider.id, synchronizeOn: 0 });
		}

		toggleEnablingProvidersMutation.mutate(payload);
	};

	const onSelectRow = (provider: IAuthProvider) => {
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

	const handleCreateProvider = () => {
		modalManager.open(AUTH_PROVIDER_MODAL_NAMES.CREATE_AUTH_PROVIDER);
	};

	const isSelectedRowsDeletingAvailable = () => {
		let isDeletingAvailable = true;

		for (const providerId in selectedRows) {
			const provider = selectedRows[providerId];
			isDeletingAvailable = provider.removable;

			if (!isDeletingAvailable) {
				break;
			}
		}

		return isDeletingAvailable;
	};

	const isSelectedRowsEnablingAvailable = () => {
		let isAvailable = true;

		for (const providerId in selectedRows) {
			const provider = selectedRows[providerId];
			isAvailable = !provider.synchronizeOn;

			if (!isAvailable) {
				break;
			}
		}

		return isAvailable;
	};
	const isSelectedRowsDisablingAvailable = () => {
		let isAvailable = true;

		for (const providerId in selectedRows) {
			const provider = selectedRows[providerId];
			isAvailable = !!provider.synchronizeOn;

			if (!isAvailable) {
				break;
			}
		}

		return isAvailable;
	};

	const selectedRowsCount = Object.keys(selectedRows).length;

	const isInitialDataLoading = isInitialProvidersLoading;

	if (isInitialDataLoading) {
		return (
			<FormBody data-search-field-name="auth-providers-table">
				<FormTitle variant="h2_primary_semibold">
					{t('general_settings.auth_provider.title')}
				</FormTitle>

				<ControlPanel>
					<Spinner mt="1rem" />
				</ControlPanel>
			</FormBody>
		);
	}

	return (
		<>
			<CreateAuthProvider onCreated={refetchProviders} />
			<UpdateAuthProvider onUpdated={refetchProviders} />
			<DeleteAuthProvider onSuccess={refetchProviders} />

			<FetchLoader active={isRefetchingProviders} />

			<FormBody data-search-field-name="auth-providers-table">
				<FormTitle variant="h2_primary_semibold">
					{t('general_settings.auth_provider.title')}
				</FormTitle>
				<ControlPanel>
					<ControlPanelLeft>
						<SearchBar
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
								'general_settings.auth_provider.actions.create_provider',
							)}
							onClick={handleCreateProvider}
						/>
					</ControlPanelRight>
				</ControlPanel>
				<AuthProvidersTable
					page={findProvidersParams.page - 1}
					totalPages={providersData?.stats.pages ?? 0}
					totalItems={providersData?.stats.objects ?? 0}
					pageSize={
						providersData?.query?.pageSize ?? findProvidersParams.pageSize
					}
					providers={providers}
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
							{isSelectedRowsDeletingAvailable() && (
								<Button
									variant="primary_outlined"
									label={t(
										'general_settings.auth_provider.providers_table.action_panel.delete',
									)}
									icon={ICON_COLLECTION.delete}
									onClick={onDeleteSelectedRows}
								/>
							)}
							{isSelectedRowsEnablingAvailable() && (
								<Button
									variant="primary_outlined"
									label={t(
										'general_settings.auth_provider.providers_table.action_panel.enable',
									)}
									onClick={onEnableSelectedRows}
								/>
							)}
							{isSelectedRowsDisablingAvailable() && (
								<Button
									variant="primary_outlined"
									label={t(
										'general_settings.auth_provider.providers_table.action_panel.disable',
									)}
									onClick={onDisableSelectedRows}
								/>
							)}
							<Button
								variant="primary_ghost"
								icon={ICON_COLLECTION.cross}
								label={t(
									'general_settings.auth_provider.providers_table.action_panel.cancel_selection',
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

export default GeneralSettingsAuthProviderPage;
