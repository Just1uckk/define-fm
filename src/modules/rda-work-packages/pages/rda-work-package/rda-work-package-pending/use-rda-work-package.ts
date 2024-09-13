import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useMutation, useQuery } from 'react-query';
import {
	Link,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router-dom';
import { Row } from '@tanstack/react-table';
import update from 'immutability-helper';
import { sortApprovers } from 'modules/rda-work-packages/helpers/sort-approvers';
import { useModalManager } from 'shared/context/modal-manager';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';

import { ApproverApi } from 'app/api/approver-api/approver-api';
import {
	DispositionsApi,
	InitiateDispositionDto,
} from 'app/api/dispositions-api/dispositions-api';
import { FindRdaFilesDto, RdaItemApi } from 'app/api/rda-item-api/rda-item-api';
import {
	FindEntityRequest,
	FindEntityResponseFilterGroup,
	FindEntityResponseFilterGroupField,
} from 'app/api/types';

import { IFile } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { DISPOSITION_WORKFLOW_STATES } from 'shared/constants/constans';
import { DISPOSITIONS_QUERY_KEYS } from 'shared/constants/query-keys';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { DEFAULT_PAGINATION_PAGE_SIZE } from 'shared/hooks/use-manage-pagination';
import { useManageTableColumns } from 'shared/hooks/use-manage-table-columns';
import { useTranslation } from 'shared/hooks/use-translation';
import { useEvent } from 'shared/hooks/useEvent';

import { MoreButtonProps } from 'shared/components/button/more-button';
import { TableSortState } from 'shared/components/table/table';

export enum RdaWorkPackageTabs {
	included_items = 'included_items',
	excluded_items = 'excluded_items',
}

const DEFAULT_TAB = RdaWorkPackageTabs.included_items;

const TABLE_NAMES = {
	included_items: 'rda-work-package_included-items',
	excluded_items: 'rda-work-package_excluded-items',
};

type TableFindParams = {
	search: string;
	pageSize: number;
	page: number;
	orderBy: string;
	currentTab: RdaWorkPackageTabs;
	filters: Record<RdaWorkPackageTabs, FindEntityRequest['elements']>;
};

export function useRdaWorkPackage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { t, currentLang } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams({
		t: DEFAULT_TAB,
		s: '',
		p: '1',
		orderBy: 'name',
	});

	const modalManager = useModalManager();

	const fileModals = useRef<
		Record<
			number,
			{
				idx: number;
				window: Window | null;
			}
		>
	>({});
	const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
	const [tableState, setTableState] = useState<TableFindParams>(() => {
		const currentTab = searchParams.get('t') as RdaWorkPackageTabs;
		const page = Number(searchParams.get('p') || 1);
		const orderBy = searchParams.get('orderBy') || 'name';
		const search = searchParams.get('s') || '';
		const initialSettings = MemoryManagingTableSettings.getSavedSettings(
			TABLE_NAMES[currentTab],
		);

		return {
			search,
			page,
			pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
			orderBy,
			currentTab: currentTab,
			filters: {
				[RdaWorkPackageTabs.excluded_items]: [],
				[RdaWorkPackageTabs.included_items]: [],
			},
		};
	});
	const [selectedRows, setSelectedRows] = useState<
		Record<TableFindParams['currentTab'], Record<IFile['id'], boolean>>
	>({
		[RdaWorkPackageTabs.excluded_items]: {},
		[RdaWorkPackageTabs.included_items]: {},
	});

	const tableName =
		TABLE_NAMES[
			(searchParams.get('t') as RdaWorkPackageTabs) || tableState.currentTab
		];
	const queryCurrentTab =
		(searchParams.get('t') as RdaWorkPackageTabs) || tableState.currentTab;

	const initiateApprovalProcessMutation = useMutation({
		mutationFn: async (payload: InitiateDispositionDto) => {
			await DispositionsApi.initiateWorkPackage(payload);
			await refetchWorkPackage();
		},
	});
	const excludeSelectedItemsMutation = useMutation({
		mutationFn: async (ids: string[]) => {
			const promises = ids.map((id) =>
				RdaItemApi.updateFile({ id, included: 0 }),
			);
			await Promise.all(promises);
			await refetchWorkPackage();
			const newFilesData = await refetchFiles();
			const newFileList = newFilesData?.results ?? [];

			refreshFilePopups(ids, newFileList);
		},
	});
	const includeSelectedItemsMutation = useMutation({
		mutationFn: async (ids: string[]) => {
			const promises = ids.map((id) =>
				RdaItemApi.updateFile({ id, included: 1 }),
			);
			await Promise.all(promises);
			await refetchWorkPackage();

			const newFilesData = await refetchFiles();
			const newFileList = newFilesData?.results ?? [];

			refreshFilePopups(ids, newFileList);
		},
	});
	const generateAuditMutation = useMutation(DispositionsApi.generateAudit);

	const {
		data: workPackage,
		isLoading: isWorkPackageLoading,
		refetch: refetchWorkPackage,
	} = useQuery(DISPOSITIONS_QUERY_KEYS.disposition(Number(id)), () =>
		DispositionsApi.getDisposition({ id: Number(id) }),
	);
	const { data: approvers = [], isLoading: isApproversLoading } = useQuery(
		DISPOSITIONS_QUERY_KEYS.approvers(Number(id)),
		() => ApproverApi.getRdaApproversById({ id: Number(id) }),
		{
			select: useCallback((approvers) => sortApprovers(approvers), []),
		},
	);
	const {
		data: dispositionTableTabs = [],
		isLoading: isDispositionTableTabsLoading,
	} = useQuery({
		queryKey: DISPOSITIONS_QUERY_KEYS.disposition_table_tabs,
		queryFn: DispositionsApi.getDispositionTableTabs,
	});

	const {
		data: filesData,
		refetchData: refetchFiles,
		searchData: searchFiles,
		isInitialLoading: isFileListLoading,
		isRefetching: isFileListRefetching,
		isSearching: isFileListSearchLoading,
	} = useFilterRequest<IFile[], Partial<TableFindParams>, FindRdaFilesDto>({
		request: (params) => {
			return RdaItemApi.findFiles(getFindFilesParams(params));
		},
		searchRequest: (params) => {
			return RdaItemApi.findFiles(params);
		},
	});
	const fileList = filesData?.results ?? [];

	const tableColumnList = useMemo(() => {
		const list = {
			name: {
				id: 'name',
				name: t('disposition.table_columns.full_name'),
				required: true,
			},
			parent: {
				id: 'parent',
				name: t('disposition.table_columns.location'),
			},
			uniqueId: {
				id: 'uniqueId',
				name: t('disposition.table_columns.unique_id'),
				visible: false,
			},
			classificationName: {
				id: 'classificationName',
				name: t('disposition.table_columns.rm_class'),
			},
		};

		if (tableState.currentTab === RdaWorkPackageTabs.included_items) {
			list['status'] = {
				id: 'status',
				name: t('disposition.table_columns.status'),
			};
			list['statusDate'] = {
				id: 'statusDate',
				name: t('disposition.table_columns.status_date'),
			};
			list['calculatedDate'] = {
				id: 'calculatedDate',
				name: t('disposition.table_columns.calc_date'),
			};
		}

		if (tableState.currentTab === RdaWorkPackageTabs.excluded_items) {
			list['comment'] = {
				id: 'comment',
				name: t('disposition.table_columns.exclusion_reason'),
			};
		}

		return list;
	}, [tableName, currentLang]);

	const manageTableColumns = useManageTableColumns({
		tableName,
		columns: tableColumnList,
	});

	useEffectAfterMount(() => {
		refetchFiles(undefined, { silently: false }).then(() => {
			setSearchParams(
				(prev) => {
					prev.set('t', tableState.currentTab);
					prev.set('p', String(tableState.page));
					prev.set('orderBy', tableState.orderBy);

					return prev;
				},
				{
					replace: true,
				},
			);
		});
	}, [
		tableState.filters,
		tableState.currentTab,
		tableState.page,
		tableState.pageSize,
		tableState.orderBy,
	]);
	useEffectAfterMount(() => {
		searchFiles(
			() => getFindFilesParams(tableState),
			() => {
				setSearchParams(
					(prev) => {
						prev.set('s', String(tableState.search));

						return prev;
					},
					{
						replace: true,
					},
				);
			},
		);
	}, [tableState.search]);

	useEffect(() => {
		const currentTab = tableState.currentTab;

		window.onmessage = async (e) => {
			if (e.data.type === 'updateFileList') {
				setSelectedRows((prevVal) =>
					update(prevVal, { [currentTab]: { $set: {} } }),
				);
				const newFileList = await refetchFiles(undefined, { silently: false });

				refreshFilePopups([e.data.workPackage.id], newFileList?.results ?? []);
			}
		};
	}, [tableState]);

	function getFindFilesParams(params) {
		const combinedParams = {
			...tableState,
			...params,
		};

		const parsedParams: FindRdaFilesDto = {
			orderBy: combinedParams.orderBy,
			filters: true,
			elements: [
				{
					fields: ['rdaId'],
					modifier: 'equal',
					values: [Number(id)],
				},
				...combinedParams.filters[combinedParams.currentTab],
			],
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.currentTab === RdaWorkPackageTabs.included_items) {
			parsedParams.elements.push({
				fields: ['included'],
				modifier: 'equal',
				values: [1],
			});
		}
		if (combinedParams.currentTab === RdaWorkPackageTabs.excluded_items) {
			parsedParams.elements.push({
				fields: ['included'],
				modifier: 'equal',
				values: [0],
			});
		}

		if (combinedParams.search.trim().length) {
			parsedParams.elements.push({
				fields: ['name', 'uniqueId', 'parent', 'description'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		return parsedParams;
	}

	function refreshFilePopups(
		oldIds: Array<IFile['id'] | string>,
		newFileList: IFile[],
	) {
		//update window with opened file
		oldIds.forEach((id) => {
			if (id in fileModals.current) {
				const oldWindow = fileModals.current[id];
				const newFileData = newFileList[oldWindow.idx];

				if (!newFileData) {
					oldWindow.window.close();
					delete fileModals.current[id];

					return;
				}

				fileModals.current[newFileData.id] = {
					...fileModals.current[id],
				};
				delete fileModals.current[id];

				const fileWindow = fileModals.current[newFileData.id].window;
				if (fileWindow !== null) {
					fileWindow.postMessage({
						type: 'changedFileId',
						newId: newFileData.id,
						workPackageId: newFileData.rdaId,
					});
				}
			}
		});
	}

	const handleChangingApprovers = () => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.CHANGE_APPROVERS,
			Number(id),
		);
	};

	const handleSearch = async (value: string) => {
		setTableState((prevValue) => ({
			...prevValue,
			search: value,
			page: 1,
		}));
	};

	const handleClearSearch = () => {
		setTableState((prevValue) => ({
			...prevValue,
			search: '',
			page: 1,
		}));
	};

	const handleChangePage = (page: number) => {
		setTableState((prevValue) => ({
			...prevValue,
			page: page + 1,
		}));
	};

	const handleChangePageSize = (size: number) => {
		setTableState((prevValue) => ({
			...prevValue,
			pageSize: size,
		}));
	};

	const handleChangeTab = (tabName: RdaWorkPackageTabs) => () => {
		setTableState((prevValue) => ({
			...prevValue,
			currentTab: tabName,
		}));
	};

	const handleChangeFilterOption = (
		group: FindEntityResponseFilterGroup,
		field: FindEntityResponseFilterGroupField,
	) => {
		const currentTab = tableState.currentTab;

		const addedGroupIdx = tableState.filters[currentTab].findIndex((option) =>
			option.fields.includes(group.field),
		);
		const addedFilterToGroupIdx = tableState.filters[currentTab][
			addedGroupIdx
		]?.values.findIndex((value) => value === field.value);

		//If elements already have an element with passed field name and field value
		if (addedFilterToGroupIdx > -1) {
			let updatedList = update(tableState, {
				filters: {
					[currentTab]: {
						[addedGroupIdx]: {
							values: { $splice: [[addedFilterToGroupIdx, 1]] },
						},
					},
				},
				page: { $set: 1 },
			});

			//If element has empty values remove element from list
			if (!updatedList.filters[currentTab][addedGroupIdx].values.length) {
				updatedList = update(tableState, {
					filters: {
						[tableState.currentTab]: { $splice: [[addedGroupIdx, 1]] },
					},
					page: { $set: 1 },
				});
			}

			return setTableState(updatedList);
		}

		//If elements have already element with passed field name just push field value to element values
		if (addedGroupIdx > -1) {
			return setTableState((prevValue) =>
				update(prevValue, {
					filters: {
						[currentTab]: {
							[addedGroupIdx]: { values: { $push: [field.value] } },
						},
					},
				}),
			);
		}

		//If elements doesn't have an element with passed field name
		return setTableState(
			update(tableState, {
				filters: {
					[currentTab]: {
						$push: [
							{
								fields: [group.field],
								modifier: 'equal',
								values: [field.value],
								filter: false,
							},
						],
					},
				},
				page: { $set: 1 },
			}),
		);
	};

	const toggleFilterPanel = () =>
		setIsFilterPanelOpen((prevValue) => !prevValue);

	const handleClearFilters = () => {
		setTableState((prevValue) =>
			update(prevValue, { filters: { [prevValue.currentTab]: { $set: [] } } }),
		);
	};

	const handleChangeWorkPackageSettings = () => {
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.SETTINGS_RDA, Number(id));
	};

	const handleChangeSorting = (state: TableSortState) => {
		const value = state[0];
		let parsedValue = '';

		if (value) {
			parsedValue = value.desc ? `-${value.id}` : value.id;
		}

		setTableState((prevValue) => ({
			...prevValue,
			orderBy: parsedValue,
		}));
	};

	const handleExcludeSelectedItems = async () => {
		const ids = Object.keys(selectedRows[RdaWorkPackageTabs.included_items]);

		await excludeSelectedItemsMutation.mutateAsync(ids);
		setSelectedRows((prevVal) =>
			update(prevVal, { [RdaWorkPackageTabs.included_items]: { $set: {} } }),
		);
	};

	const handleIncludeSelectedItems = async () => {
		const ids = Object.keys(selectedRows[RdaWorkPackageTabs.excluded_items]);

		await includeSelectedItemsMutation.mutateAsync(ids);
		setSelectedRows((prevVal) =>
			update(prevVal, { [RdaWorkPackageTabs.excluded_items]: { $set: {} } }),
		);
	};

	const handleInitiateApprovalProcess = async () => {
		await initiateApprovalProcessMutation.mutateAsync({ id: Number(id) });
		const tableTab = dispositionTableTabs.find((tab) =>
			tab.workflowStatus.includes(DISPOSITION_WORKFLOW_STATES.INITIATED),
		);
		navigate(DISPOSITIONS_ROUTES.RDA_WORK_PACKAGES_OVERVIEW.path + `?t=0`);
	};

	const handleManageTableColumns = manageTableColumns.onManage;

	const handleDeleteWorkPackage = () => {
		if (!workPackage) return;

		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.USE_DELETE_RDA, [
			workPackage,
		]);
	};

	const handleSuccessDeleteWorkPackage = async () => {
		const tableTab = dispositionTableTabs.find((tab) =>
			tab.workflowStatus.includes(DISPOSITION_WORKFLOW_STATES.INITIATED),
		);

		if (tableTab) {
			navigate(
				DISPOSITIONS_ROUTES.RDA_WORK_PACKAGES_OVERVIEW.path +
					`?t=${tableTab.tabIndex}`,
			);
		}
	};

	const handleGenerateAudit = () => {
		if (!workPackage) return;

		generateAuditMutation.mutate({
			id: workPackage.id,
			name: workPackage.multilingual?.name[currentLang] ?? workPackage.name,
		});
	};

	const handleSelectRow = (row: Row<IFile>) => {
		setSelectedRows((prevVal) => {
			const updatedList = {
				...prevVal,
				[queryCurrentTab]: { ...prevVal[queryCurrentTab] },
			};

			if (updatedList[queryCurrentTab][row.original.id]) {
				delete updatedList[queryCurrentTab][row.original.id];

				return updatedList;
			}

			updatedList[queryCurrentTab][row.original.id] = true;
			return updatedList;
		});
	};

	const handleSelectAllRows = () => {
		setSelectedRows((prevVal) =>
			update(prevVal, {
				[queryCurrentTab]: {
					$set: fileList.reduce((current, next) => {
						const list = current;
						list[next.id] = true;

						return list;
					}, {}),
				},
			}),
		);
	};

	const handleResetSelectedRows = () => {
		setSelectedRows((prevVal) =>
			update(prevVal, {
				[queryCurrentTab]: {
					$set: {},
				},
			}),
		);
	};

	const toggleSelectingAllRows = (data: Record<IFile['id'], boolean>) => {
		setSelectedRows((prevVal) =>
			update(prevVal, {
				[queryCurrentTab]: {
					$set: data,
				},
			}),
		);
	};

	const handleOpenFileInfo = useEvent(
		(e: React.MouseEvent<HTMLAnchorElement>, file: IFile, idx: number) => {
			e.preventDefault();

			fileModals.current[file.id] = {
				idx,
				window: window.open(
					DISPOSITIONS_ROUTES.FILE_INFO.generate.external(
						file.rdaId,
						file.id,
						tableState.currentTab,
					),
					`${file.rdaId}${file.id}`,
					'left=300,top=250,width=548,height=523',
				),
			};

			const windowReference = fileModals.current[file.id].window;
			if (!windowReference) return;

			windowReference.onload = function () {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				this.onbeforeunload = function () {
					delete fileModals.current[file.id];
				};
			};
		},
	);

	const primaryButtonActions: MoreButtonProps['options'] = useMemo(() => {
		if (!workPackage) return [];

		return [
			{
				key: 'initiate_approval_process',
				label: t('disposition.actions.initiate_approval_process'),
				loading: initiateApprovalProcessMutation.isLoading,
				onSelect: handleInitiateApprovalProcess,
			},
			{
				key: 'verify_approvers',
				label: t('disposition.actions.verify_approvers_rights'),
				tag: Link,
				to: DISPOSITIONS_ROUTES.DISPOSITION_VERIFY_APPROVER_RIGHTS.generate(
					workPackage.id,
				),
			},
			{
				key: 'generate_audit',
				label: t('disposition.actions.generate_audit_report'),
				loading: generateAuditMutation.isLoading,
				onSelect: handleGenerateAudit,
			},
			{
				key: 'delete',
				label: t('disposition.actions.delete'),
				onSelect: handleDeleteWorkPackage,
			},
		];
	}, [
		currentLang,
		workPackage,
		generateAuditMutation.isLoading,
		initiateApprovalProcessMutation.isLoading,
	]);

	return {
		models: {
			TABLE_NAMES,
			workPackage,
			approvers,
			fileList,
			filesData,
			tableState,
			tableCurrentTab: queryCurrentTab,
			tableName,
			selectedRows: selectedRows[queryCurrentTab],
			includedItemsCount: workPackage?.includedCount ?? 0,
			excludedItemsCount: workPackage?.excludedCount ?? 0,
			isWorkPackageLoading,
			isApproversLoading,
			isDispositionTableTabsLoading,
			isFileListLoading,
			isFileListSearchLoading,
			isFileListRefetching,
			isFilterPanelOpen,
			isExcludeSelectedItemsLoading: excludeSelectedItemsMutation.isLoading,
			isIncludeSelectedItemsMutationLoading:
				includeSelectedItemsMutation.isLoading,
			modals: {
				manageTableColumns: manageTableColumns.modal,
			},
			primaryButtonActions,
		},
		commands: {
			handleSuccessDeleteWorkPackage,
			handleChangingApprovers,
			handleSearch,
			handleClearSearch,
			handleChangeTab,
			handleChangePage,
			handleChangePageSize,
			toggleFilterPanel,
			handleChangeWorkPackageSettings,
			handleChangeFilterOption,
			handleChangeSorting,
			handleClearFilters,
			handleIncludeSelectedItems,
			handleExcludeSelectedItems,
			handleInitiateApprovalProcess,
			handleOpenFileInfo,
			handleManageTableColumns,
			handleSelectRow,
			handleSelectAllRows,
			handleResetSelectedRows,
			toggleSelectingAllRows,
		},
	};
}
