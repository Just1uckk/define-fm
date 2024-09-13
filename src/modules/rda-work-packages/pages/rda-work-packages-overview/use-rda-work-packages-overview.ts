import { useMemo, useReducer, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { keyBy } from 'lodash';
import { DEFAULT_SETTINGS_LIST } from 'modules/auth/components/profile-settings-form/profile-tabs/edit-default-settings';
import { RdaWorkPackageFilterFormFilterList } from 'modules/rda-work-packages/components/dispositions-filter-modal-form';
import { DISPOSITION_CARD_VIEW_TYPES } from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/disposition-card/disposition-card';
import {
	getInitialTableStateReducer,
	tableStateReducer,
	TableStateReducerStateType,
} from 'modules/rda-work-packages/pages/rda-work-packages-overview/table-state-reducer';
import { useModalManager } from 'shared/context/modal-manager';

import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import {
	CompleteDispositionDto,
	DispositionsApi,
	FindDispositionsDto,
	InitiateDispositionDto,
} from 'app/api/dispositions-api/dispositions-api';
import { FindGroupsDto } from 'app/api/groups-api/group-api';
import {
	DefaultSettingsApi,
	SendDefaultSettingsDto,
} from 'app/api/user-api/user-api-default';

import { setDefaultSettings } from 'app/store/user/user-actions';
import {
	selectDefaultSettingsData,
	selectUserData,
} from 'app/store/user/user-selectors';

import { IDispositionTableTab, IWorkPackage } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { DISPOSITION_WORKFLOW_STATES } from 'shared/constants/constans';
import {
	DISPOSITIONS_QUERY_KEYS,
	WORK_PACKAGE_FILES_KEYS,
} from 'shared/constants/query-keys';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import {
	useFilterRequest,
	UseFilterRequestRequestParams,
} from 'shared/hooks/use-filter-request';
import { useTranslation } from 'shared/hooks/use-translation';

import { SortOption } from 'shared/components/table-controls/sort-button';

export const TABLE_NAME = 'rda-work-packages-overview';
export const TABLE_TOTAL = 'total';
export const DefaultRdaWorkPackagesTab = 1;
export enum IWorkPackageConfig {
	AllowReassign = 'rda.ApproverReassign.AllowReassign',
}

export function useRdaWorkPackagesOverview() {
	const navigate = useNavigate();
	const { currentLang } = useTranslation();

	const currentUser = selectUserData() as IUser;

	const [searchParams, setSearchParams] = useSearchParams({
		t: String(DefaultRdaWorkPackagesTab),
		p: String(1),
		s: '',
		orderBy: '',
	});
	const [selectedDispositions, setSelectedDispositions] = useState<
		Record<
			IDispositionTableTab['tabIndex'],
			Record<IWorkPackage['id'], IWorkPackage>
		>
	>({});
	const [tableState, dispatchTableState] = useReducer(
		tableStateReducer,
		getInitialTableStateReducer(searchParams),
	);
	const [isSelectableTable, setIsSelectableTable] = useState(false);

	const modalManager = useModalManager();

	const completeDispositionMutation = useMutation({
		mutationFn: async (payload: CompleteDispositionDto) => {
			await DispositionsApi.completeDisposition(payload);
			await refetchTableTabs();
		},
	});

	const initiateApprovalProcessMutation = useMutation({
		mutationFn: async (payload: InitiateDispositionDto) => {
			await DispositionsApi.initiateWorkPackage(payload);
			await refetchTableTabs();
		},
	});

	const generateAuditMutation = useMutation(DispositionsApi.generateAudit);

	const completeSelectedDispositionsMutation = useMutation({
		mutationFn: async (payload: Array<string | number>) => {
			const promises = payload.map((id) =>
				DispositionsApi.updateDisposition({
					id: Number(id),
					workflowStatus: DISPOSITION_WORKFLOW_STATES.ARCHIVE,
				}),
			);

			const response = await Promise.all(promises);
			await refetchTableTabs();

			return response;
		},
		onSuccess: () => {
			setSelectedDispositions((prevValue) => ({
				...prevValue,
				[DISPOSITION_WORKFLOW_STATES.READY_TO_COMPLETE]: {},
			}));
		},
	});

	const initiateSelectedEntitiesMutation = useMutation({
		mutationFn: async (ids: Array<string | number>) => {
			const promises = ids.map((id) =>
				DispositionsApi.initiateWorkPackage({ id: Number(id) }),
			);

			await Promise.all(promises);

			setSelectedDispositions((prevState) => ({
				...prevState,
				[tableState.currentTab]: {},
			}));
		},
	});

	const onChangeTableViewMutation = useMutation({
		mutationFn: async (view: DISPOSITION_CARD_VIEW_TYPES) => {
			dispatchTableState({ type: 'tableView', payload: view });
			const sendRequestBody: SendDefaultSettingsDto[] = [];
			sendRequestBody.push({
				userId: currentUser.id,
				value: `${view}`,
				property: DEFAULT_SETTINGS_LIST.PREFERRED_VIEW,
			});
			const updatedUserSettings =
				await DefaultSettingsApi.updateDefaultUserSettings(
					currentUser.id,
					sendRequestBody,
				);
			setDefaultSettingsUser(updatedUserSettings);

			return updatedUserSettings;
		},
	});

	const {
		data: dispositionTableTabs = {},
		isLoading: isDispositionTableTabsLoading,
		refetch: refetchTableTabs,
	} = useQuery({
		queryKey: [DISPOSITIONS_QUERY_KEYS.disposition_table_tabs, currentLang],
		queryFn: async () => {
			const data = await DispositionsApi.getDispositionTableTabs();
			const sortedList = keyBy(data, 'tabIndex');
			await refetchDispositions({ dispositionTableTabs: sortedList });

			return sortedList;
		},
	});

	const {
		data: dispositionsData,
		refetchData: refetchDispositions,
		searchData: searchDispositions,
		isInitialLoading: isInitialLoadingDispositions,
		isRefetching: isRefetchingDispositions,
		isSearching: isSearchingDispositions,
	} = useFilterRequest<
		IWorkPackage[],
		Partial<TableStateReducerStateType>,
		FindDispositionsDto
	>({
		searchFuncDependencies: [dispositionTableTabs],
		manualTriggering: true,
		request: async (params) => {
			return await DispositionsApi.findDispositions(
				getFindDispositionsParams(params),
			);
		},
		searchRequest: async (params) => {
			console.log(params);
			return await DispositionsApi.findDispositions(params);
		},
	});

	const {
		data: workPackageConfigs = [],
		isLoading: isWorkPackageConfigsLoading,
	} = useQuery(WORK_PACKAGE_FILES_KEYS.configs, {
		queryFn: CoreConfigApi.getConfigList,
	});

	const dispositions = dispositionsData?.results ?? [];
	const defaultSettings = selectDefaultSettingsData();
	const setDefaultSettingsUser = setDefaultSettings();

	useEffectAfterMount(() => {
		refetchDispositions(undefined, { silently: false }).then(() =>
			setSearchParams(
				(prev) => {
					prev.set('t', String(tableState.currentTab));
					prev.set('p', String(tableState.page));
					prev.set('orderBy', tableState.orderBy);

					return prev;
				},
				{
					replace: true,
				},
			),
		);
	}, [
		tableState.currentTab,
		tableState.orderBy,
		tableState.pageSize,
		tableState.page,
		tableState.filters,
	]);
	useEffectAfterMount(() => {
		searchDispositions(
			() => getFindDispositionsParams(tableState),
			() => {
				setSearchParams(
					(prev) => {
						prev.set('s', tableState.search);

						return prev;
					},
					{
						replace: true,
					},
				);
			},
		);
	}, [tableState.search]);

	function getFindDispositionsParams({
		dispositionTableTabs: tableTabs = dispositionTableTabs,
		...params
	}: (TableStateReducerStateType | UseFilterRequestRequestParams) & {
		dispositionTableTabs?: Record<
			IDispositionTableTab['tabIndex'],
			IDispositionTableTab
		>;
	} = {}) {
		const combinedParams = {
			...tableState,
			...params,
		};
		const activeFilterList = Object.keys(
			combinedParams.filters.filters?.[combinedParams.currentTab] ?? {},
		);

		const parsedParams: FindGroupsDto = {
			orderBy: combinedParams.orderBy,
			elements: [],
			filters: true,
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
		};

		if ('signal' in params) {
			parsedParams.signal = params.signal;
		}

		if (combinedParams.search.trim().length) {
			parsedParams.elements.push({
				fields: ['name'],
				modifier: 'contain',
				filter: false,
				values: [combinedParams.search],
			});
		}
		if (combinedParams.filters.createdBy.length) {
			parsedParams.elements.push({
				fields: ['createdBy'],
				modifier: 'equal',
				values: combinedParams.filters.createdBy.map((user) => user.id),
			});
		}
		if (activeFilterList.length) {
			activeFilterList.forEach((filter) => {
				const [groupName, fieldValue] = filter.split(':');

				const addedGroup = parsedParams.elements.find((element) =>
					element.fields.includes(groupName),
				);
				if (!addedGroup) {
					parsedParams.elements.push({
						fields: [groupName],
						modifier: 'equal',
						values: [fieldValue],
					});
					return;
				}

				addedGroup.values.push(fieldValue);
			});
		}
		if (combinedParams.filters.approvers.length) {
			parsedParams.elements.push({
				fields: ['approvers'],
				modifier: 'equal',
				values: combinedParams.filters.approvers.map((user) => user.id),
			});
		}
		if (
			combinedParams.filters.createdAt[0] ||
			combinedParams.filters.createdAt[1]
		) {
			parsedParams.elements.push({
				fields: ['createDate'],
				modifier: 'between',
				values: [
					combinedParams.filters.createdAt[0]?.date?.toISOString() ??
						new Date(0).toISOString(),
					combinedParams.filters.createdAt[1]?.date?.toISOString() ??
						new Date().toISOString(),
				],
			});
		}
		if (
			combinedParams.filters.daysLeft[0] ||
			combinedParams.filters.daysLeft[1]
		) {
			parsedParams.elements.push({
				fields: ['daysLeft'],
				modifier: 'between',
				values: [
					combinedParams.filters.daysLeft[0] || 0,
					combinedParams.filters.createdAt[1] || 999,
				],
			});
		}

		parsedParams.elements.push({
			fields: ['workflowStatus'],
			modifier: 'equal',
			values: tableTabs[combinedParams.currentTab].workflowStatus,
		});

		return parsedParams;
	}

	const handleCreateWorkPackage = () =>
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.USE_CREATE_RDA_WORK_PACKAGE);

	const handleVerifyingApproverRights = (disposition: IWorkPackage) => {
		navigate(
			DISPOSITIONS_ROUTES.DISPOSITION_VERIFY_APPROVER_RIGHTS.generate(
				disposition.id,
			),
		);
	};

	const handleGeneratingAudit = (data: IWorkPackage) => {
		generateAuditMutation.mutate({
			id: data.id,
			name: data.multilingual?.name[currentLang] ?? data.name,
		});
	};

	const handleInitiatingWorkPackage = (id: number) => {
		initiateApprovalProcessMutation.mutate({ id });
	};

	const handleReassigning = (id: number) => {
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.REASSIGN_APPROVER, id);
	};

	const handleRecall = (workPackage: IWorkPackage) => {
		modalManager
			.open(RDA_WORK_PACKAGE_MODAL_NAMES.RECALL_DISPOSITION, [workPackage])
			.then(() => refetchTableTabs());
	};

	const handleForcingApprover = (disposition: IWorkPackage) => {
		modalManager
			.open(RDA_WORK_PACKAGE_MODAL_NAMES.FORCE_APPROVER, [disposition])
			.then(() => handleSuccessForceApprover());
	};

	const handleModifyingApprovers = (id: number) => {
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.CHANGE_APPROVERS, id);
	};

	const handleCompletingEntity = (id: IWorkPackage['id']) => {
		completeDispositionMutation.mutate({ rdaIdsToComplete: [id] });
	};

	const handleDeletingEntity = (disposition: IWorkPackage) => {
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.USE_DELETE_RDA, [
			disposition,
		]);
	};

	const isRowSelected = (id: number) =>
		selectedDispositions[tableState.currentTab] &&
		id in selectedDispositions[tableState.currentTab];

	const handleSelectingEntity = (entity: IWorkPackage) => {
		setSelectedDispositions((prevValue) => {
			const isInList =
				selectedDispositions[tableState.currentTab] &&
				entity.id in selectedDispositions[tableState.currentTab];

			if (!isInList) {
				return {
					...prevValue,
					[tableState.currentTab]: {
						...prevValue[tableState.currentTab],
						[entity.id]: entity,
					},
				};
			}

			const newList = { ...prevValue[tableState.currentTab] };
			delete newList[entity.id];

			return {
				...prevValue,
				[tableState.currentTab]: newList,
			};
		});
	};

	const handleSelectingAllEntities = () => {
		setSelectedDispositions((prevValue) => {
			const newList = { ...prevValue[tableState.currentTab] };
			dispositions.forEach(
				(disposition) => (newList[disposition.id] = disposition),
			);

			return {
				...prevValue,
				[tableState.currentTab]: newList,
			};
		});
	};

	function handleCancelingAllSelectedEntities() {
		setSelectedDispositions((prevValue) => ({
			...prevValue,
			[tableState.currentTab]: {},
		}));
	}

	const handleArchivingSelectedEntities = () => {
		completeSelectedDispositionsMutation.mutate(
			Object.keys(selectedDispositions[tableState.currentTab]),
		);
	};

	const handleRecallingSelectedEntities = () => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.RECALL_DISPOSITION,
			Object.values(selectedDispositions[tableState.currentTab]),
		);
	};

	const handleDeletingSelectedEntities = () => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.USE_DELETE_RDA,
			Object.values(selectedDispositions[tableState.currentTab]),
		);
	};

	const refetchList = async () => await refetchTableTabs();

	const handleInitiatingSelectedEntities = () => {
		initiateSelectedEntitiesMutation.mutate(
			Object.keys(selectedDispositions[tableState.currentTab]),
		);
	};

	const handleChangingTab = (tab: IDispositionTableTab) => () => {
		dispatchTableState({ type: 'currentTab', payload: tab.tabIndex });
	};

	const handleChangingPageSize = (size: number) => {
		dispatchTableState({ type: 'pageSize', payload: size });
	};

	const handleChangingPage = (page: number) => {
		dispatchTableState({ type: 'page', payload: { page: page + 1 } });
	};

	const handleSorting = (value: SortOption['value']) => {
		dispatchTableState({ type: 'orderBy', payload: value });
	};

	const handleSearching = (value: string) => {
		dispatchTableState({ type: 'search', payload: value });
	};

	const handleClearSearching = () => {
		dispatchTableState({ type: 'search', payload: '' });
	};

	const handleOpeningTableFilters = () =>
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.DISPOSITIONS_FILTER_MODAL);

	const handleSuccessSaveFilters = (
		filters: RdaWorkPackageFilterFormFilterList,
	) => {
		dispatchTableState({ type: 'filters', payload: filters });
	};

	const handleSuccessRecallWorkPackages = async () => {
		await refetchTableTabs();
		handleCancelingAllSelectedEntities();
	};

	const handleSuccessChangeApprovers = async () => {
		await refetchTableTabs();
	};

	const handleSuccessForceApprover = async () => {
		await refetchTableTabs();
		handleCancelingAllSelectedEntities();
	};

	const handleTogglingSelectingRows = () => {
		setIsSelectableTable((prevState) => {
			const newState = !prevState;

			if (!newState) {
				setSelectedDispositions({});
			}

			return newState;
		});
	};

	const handleChangingTableView = (view: DISPOSITION_CARD_VIEW_TYPES) => {
		onChangeTableViewMutation.mutate(view);
	};

	const isActiveFilters = !!(
		tableState.filters.createdBy.length || tableState.filters.approvers.length
	);

	const selectedTableEntitiesCountByCurrentTab = useMemo(
		() => Object.keys(selectedDispositions[tableState.currentTab] ?? {}).length,
		[selectedDispositions, tableState.currentTab],
	);

	const initialActiveFilters = useMemo(() => {
		const { filters, ...restData } = tableState.filters;

		return { ...restData, filters: filters[tableState.currentTab] ?? {} };
	}, [tableState.filters]);

	return {
		models: {
			defaultSettings,
			workPackageConfigs,
			currentUser,
			isActiveFilters,
			initialActiveFilters,
			tableState: {
				...tableState,
				currentTabIdx: tableState.currentTab,
				isSelectableTable,
				totalPages: dispositionsData?.stats.pages ?? 0,
				totalItems: dispositionsData?.stats.objects ?? 0,
			},
			dispositionTableTabs,
			dispositions: {
				data: dispositionsData,
				selectedItems: selectedDispositions,
				selectedTableEntitiesCountByCurrentTab,
				list: dispositions,
				isInitialLoading: isInitialLoadingDispositions,
				isRefetching: isRefetchingDispositions,
				isSearching: isSearchingDispositions,
			},
			isLoading: {
				initiateWorkPackage: initiateApprovalProcessMutation.isLoading,
				isWorkPackageConfigsLoading: isWorkPackageConfigsLoading,
				initiateSelectedEntities: initiateSelectedEntitiesMutation.isLoading,
				completeSelectedEntities:
					completeSelectedDispositionsMutation.isLoading,
				archiveSelectedEntities: completeSelectedDispositionsMutation.isLoading,
				completeWorkPackage: completeDispositionMutation.isLoading,
				generateAudit: generateAuditMutation.isLoading,
				dispositionTableTabs: isDispositionTableTabsLoading,
			},
		},
		commands: {
			refetchList,
			handleSuccessChangeApprovers,
			handleSuccessRecallWorkPackages,
			handleSuccessForceApprover,
			handleSuccessSaveFilters,
			handleCreateWorkPackage,
			handleInitiatingWorkPackage,
			handleVerifyingApproverRights,
			handleModifyingApprovers,
			handleForcingApprover,
			handleDeletingEntity,
			handleReassigning,
			handleRecall,
			handleGeneratingAudit,
			handleCompletingEntity,
			isRowSelected,
			handleSelectingEntity,
			handleSelectingAllEntities,
			handleCancelingAllSelectedEntities,
			handleArchivingSelectedEntities,
			handleRecallingSelectedEntities,
			handleDeletingSelectedEntities,
			handleInitiatingSelectedEntities,
			handleChangingTab,
			handleChangingPageSize,
			handleChangingPage,
			handleSorting,
			handleSearching,
			handleClearSearching,
			handleOpeningTableFilters,
			handleTogglingSelectingRows,
			handleChangingTableView,
		},
	};
}
