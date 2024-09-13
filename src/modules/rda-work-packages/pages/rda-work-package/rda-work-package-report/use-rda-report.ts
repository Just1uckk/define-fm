import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router-dom';
import { Row } from '@tanstack/react-table';
import update from 'immutability-helper';
import { differenceWith } from 'lodash';
import { sortApprovers } from 'modules/rda-work-packages/helpers/sort-approvers';
import { ColumnOrder } from 'modules/rda-work-packages/modals/manage-columns-modal/manage-table-columns-modal';
import {
	getInitialStateRequestParamsReducer,
	requestParamsReducer,
} from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/table-state';
import { useModalManager } from 'shared/context/modal-manager';

import {
	ApproverApi,
	DeleteApproverDto,
} from 'app/api/approver-api/approver-api';
import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import { DispositionActionApi } from 'app/api/disposition-action-api/disposition-action-api';
import { DispositionSearcheApi } from 'app/api/disposition-searches-api/disposition-searche-api';
import {
	CompleteDispositionDto,
	DispositionsApi,
} from 'app/api/dispositions-api/dispositions-api';
import { FindRdaFilesDto, RdaItemApi } from 'app/api/rda-item-api/rda-item-api';
import {
	FindEntityResponseFilterGroup,
	FindEntityResponseFilterGroupField,
} from 'app/api/types';

import { IApprover, IFile, IWorkPackage } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import {
	APPROVER_STATES,
	DISPOSITION_WORKFLOW_STATES,
	DISPOSITION_WORKFLOW_STATES_COMPLETED,
	RDA_ASSIGNMENT_ITEM_STATES,
	RDA_ITEM_APPROVAL_STATES_UNDECIDED,
} from 'shared/constants/constans';
import {
	DISPOSITION_SEARCHES_KEYS,
	DISPOSITIONS_ACTIONS_KEYS,
	DISPOSITIONS_QUERY_KEYS,
	WORK_PACKAGE_FILES_KEYS,
} from 'shared/constants/query-keys';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { useManageTableColumns } from 'shared/hooks/use-manage-table-columns';
import { useTranslation } from 'shared/hooks/use-translation';
import { useEvent } from 'shared/hooks/useEvent';

import { MoreButtonProps } from 'shared/components/button/more-button';

import { IWorkPackageConfig } from '../../rda-work-packages-overview/use-rda-work-packages-overview';

export enum TAB_INDEX_FOR_INITIATED_STATE {
	INCLUDED_ITEMS = 0,
	EXCLUDED_ITEMS = 1,
}

export enum TAB_INDEX_FOR_COMPLETED_STATE {
	UNDECIDED = 0,
	APPROVED = 1,
	REJECTED = 2,
	EXCLUDED_ITEMS = 3,
}

export const TABLE_NAMES = {
	'rda-report-page-initiated__included_items':
		'rda-report-page-initiated__included_items',
	'rda-report-page-initiated__excluded_items':
		'rda-report-page-initiated__excluded_items',
	'rda-report-page-completed__undecided_items':
		'rda-report-page-completed__undecided_items',
	'rda-report-page-completed__approved_items':
		'rda-report-page-completed__approved_items',
	'rda-report-page-completed__rejected_items':
		'rda-report-page-completed__rejected_items',
	'rda-report-page-completed__excluded_items':
		'rda-report-page-completed__excluded_items',
} as const;

const getTableName = (
	workflowStatus: IWorkPackage['workflowStatus'],
	tabIdx: TAB_INDEX_FOR_INITIATED_STATE | TAB_INDEX_FOR_COMPLETED_STATE,
) => {
	if (DISPOSITION_WORKFLOW_STATES.INITIATED === workflowStatus) {
		if (tabIdx === TAB_INDEX_FOR_INITIATED_STATE.INCLUDED_ITEMS)
			return TABLE_NAMES['rda-report-page-initiated__included_items'];
		if (tabIdx === TAB_INDEX_FOR_INITIATED_STATE.EXCLUDED_ITEMS)
			return TABLE_NAMES['rda-report-page-initiated__excluded_items'];
	}

	if (DISPOSITION_WORKFLOW_STATES_COMPLETED.includes(workflowStatus)) {
		if (tabIdx === TAB_INDEX_FOR_COMPLETED_STATE.UNDECIDED)
			return TABLE_NAMES['rda-report-page-completed__undecided_items'];
		if (tabIdx === TAB_INDEX_FOR_COMPLETED_STATE.APPROVED)
			return TABLE_NAMES['rda-report-page-completed__approved_items'];
		if (tabIdx === TAB_INDEX_FOR_COMPLETED_STATE.REJECTED)
			return TABLE_NAMES['rda-report-page-completed__rejected_items'];
		if (tabIdx === TAB_INDEX_FOR_COMPLETED_STATE.EXCLUDED_ITEMS)
			return TABLE_NAMES['rda-report-page-completed__excluded_items'];
	}

	return undefined;
};

type TableFindParams = {
	search: string;
	pageSize: number;
	page: number;
	orderBy: string;
	currentTab: TAB_INDEX_FOR_INITIATED_STATE | TAB_INDEX_FOR_COMPLETED_STATE;
};

export function useRdaReport() {
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const navigate = useNavigate();
	const { t, multilingualT, currentLang } = useTranslation();
	const date = useDate();
	const modalManager = useModalManager();

	const [searchParams, setSearchParams] = useSearchParams({ t: '0' });
	const queryCurrentTab = Number(searchParams.get('t'));
	const workPackageId = Number(id);
	const queryClient = useQueryClient();

	const [tableParams, dispatchTableParams] = useReducer(
		requestParamsReducer,
		getInitialStateRequestParamsReducer(searchParams),
	);
	const [selectedItems, setSelectedItems] = useState<{
		[TAB_INDEX_FOR_COMPLETED_STATE.APPROVED]: Record<IFile['id'], boolean>;
		[TAB_INDEX_FOR_COMPLETED_STATE.REJECTED]: Record<IFile['id'], boolean>;
	}>({
		[TAB_INDEX_FOR_COMPLETED_STATE.APPROVED]: {},
		[TAB_INDEX_FOR_COMPLETED_STATE.REJECTED]: {},
	});

	const {
		data: workPackage,
		isLoading: isDispositionLoading,
		refetch: refetchWorkPackage,
	} = useQuery({
		queryKey: DISPOSITIONS_QUERY_KEYS.disposition(workPackageId),
		queryFn: () => DispositionsApi.getDisposition({ id: workPackageId }),
		enabled: !!workPackageId,
	});

	const { data: allDispositionActions, isLoading: isActionsLoading } = useQuery(
		DISPOSITIONS_ACTIONS_KEYS.actions,
		DispositionActionApi.getAllActions,
	);

	const { data: dispositionSearch, isLoading: isDispositionSearchLoading } =
		useQuery(
			DISPOSITION_SEARCHES_KEYS.search(workPackage?.dispNodeId as number),
			{
				queryFn: () =>
					DispositionSearcheApi.getOne({
						id: workPackage?.dispNodeId as number,
					}),
				enabled: !!workPackage,
			},
		);

	const { data: dispositionSnapshot, isLoading: isDispositionSnapshotLoading } =
		useQuery([DISPOSITIONS_QUERY_KEYS.disposition_snapshot, workPackageId], {
			queryFn: () =>
				DispositionsApi.getDispositionSnapshot({
					// id: workPackage?.dispNodeId as number,
					id: workPackage?.id as number,
				}),
			enabled: !!workPackage,
		});

	const {
		data: approversFullList = [],
		isLoading: isFullListApproversLoading,
	} = useQuery({
		queryFn: () =>
			ApproverApi.find({
				elements: [
					{
						fields: ['rdaId'],
						values: [Number(id)],
						modifier: 'equal',
					},
				],
				page: 1,
				pageSize: 9999,
			}),
		select: useCallback((data) => data.results, []),
	});

	const { data: approvers = [], isLoading: isApproversLoading } = useQuery({
		queryKey: DISPOSITIONS_QUERY_KEYS.approvers(Number(id)),
		queryFn: () => ApproverApi.getRdaApproversById({ id: Number(id) }),
	});

	const { data: workPackageConfigs = [] } = useQuery(
		WORK_PACKAGE_FILES_KEYS.configs,
		{
			queryFn: CoreConfigApi.getConfigList,
		},
	);

	const generateAuditMutation = useMutation(DispositionsApi.generateAudit);

	const addApproverMutation = useMutation({
		mutationFn: ApproverApi.createApprover,
		onSuccess: (newApprover) => {
			queryClient.setQueryData(
				DISPOSITIONS_QUERY_KEYS.approvers(Number(id)),
				(prevValue: IApprover[] = []) => [...prevValue, newApprover],
			);
		},
	});
	const updateApproverMutation = useMutation({
		mutationFn: async (changedList: IApprover[]) => {
			for (const idx in changedList) {
				const approver = changedList[idx];

				await ApproverApi.updateApprover({
					approverId: approver.approverId,
					orderBy: approver.orderBy,
				});
			}
		},
	});
	const deleteApproverMutation = useMutation(ApproverApi.deleteApprover, {
		onSuccess: (_, payload: DeleteApproverDto) => {
			queryClient.setQueryData(
				DISPOSITIONS_QUERY_KEYS.approvers(Number(id)),
				(prevValue: IApprover[] = []) => {
					return prevValue.filter(
						(approver) => approver.approverId !== payload.approverId,
					);
				},
			);
		},
	});
	const completeWorkPackageMutation = useMutation({
		mutationFn: async (payload: CompleteDispositionDto) => {
			await DispositionsApi.completeDisposition(payload);
			navigate(
				location.state?.from ||
					DISPOSITIONS_ROUTES.RDA_WORK_PACKAGES_OVERVIEW.path,
			);
		},
	});

	const {
		data: filesData,
		fetchData: getRdaItems,
		refetchData: refetchRdaItems,
		searchData: searchRdaItems,
		isInitialLoading: isRdaItemsInitialLoading,
		isRefetching: isRdaItemsRefetching,
		isSearching: isRdaItemsSearchLoading,
	} = useFilterRequest<IFile[], Partial<TableFindParams>, FindRdaFilesDto>({
		manualTriggering: true,
		request: (params) => {
			return RdaItemApi.findFiles(getFindRdaItemsParams(params));
		},
		searchRequest: (params) => {
			return RdaItemApi.findFiles(params);
		},
	});
	const fileList = filesData?.results ?? [];

	const currentTableName = workPackage
		? getTableName(workPackage.workflowStatus, Number(searchParams.get('t')))
		: undefined;

	const sortedApprovers = useMemo(() => {
		const sortedApprovers = sortApprovers(approvers);
		const list: {
			approvers: IApprover[];
			additionalApprovers: IApprover[];
		} = {
			approvers: [],
			additionalApprovers: [],
		};

		sortedApprovers.forEach((approver) => {
			if (approver.conditionalApprover) {
				list.additionalApprovers.push(approver);
				return;
			}

			list.approvers.push(approver);
		});

		return list;
	}, [approvers]);

	const tableColumnList: Record<ColumnOrder['id'], ColumnOrder> =
		useMemo(() => {
			let list = {};

			if (
				currentTableName ===
				TABLE_NAMES['rda-report-page-completed__undecided_items']
			) {
				list = {
					name: {
						id: 'name',
						name: t('rda_report.table.columns.full_name'),
						required: true,
					},
					parent: {
						id: 'parent',
						name: t('rda_report.table.columns.location'),
					},
					uniqueId: {
						id: 'uniqueId',
						name: t('rda_report.table.columns.unique_id'),
					},
					classificationName: {
						id: 'classificationName',
						name: t('rda_report.table.columns.rm_class'),
					},
					approvals: {
						id: 'approvals',
						name: t('rda_report.table.columns.approval_status'),
					},
				};
			}

			if (
				currentTableName ===
				TABLE_NAMES['rda-report-page-completed__approved_items']
			) {
				list = {
					name: {
						id: 'name',
						name: t('rda_report.table.columns.full_name'),
						required: true,
					},
					parent: {
						id: 'parent',
						name: t('rda_report.table.columns.location'),
					},
					uniqueId: {
						id: 'uniqueId',
						name: t('rda_report.table.columns.unique_id'),
					},
					classificationName: {
						id: 'classificationName',
						name: t('rda_report.table.columns.rm_class'),
					},
					approvals: {
						id: 'approvals',
						name: t('rda_report.table.columns.approval_status'),
					},
				};
			}

			if (
				currentTableName ===
				TABLE_NAMES['rda-report-page-completed__rejected_items']
			) {
				list = {
					name: {
						id: 'name',
						name: t('rda_report.table.columns.full_name'),
						required: true,
					},
					parent: {
						id: 'parent',
						name: t('rda_report.table.columns.location'),
					},
					uniqueId: {
						id: 'uniqueId',
						name: t('rda_report.table.columns.unique_id'),
					},
					classificationName: {
						id: 'classificationName',
						name: t('rda_report.table.columns.rm_class'),
					},
					exclusion_reason: {
						id: 'exclusion_reason',
						name: t('rda_report.table.columns.exclusion_reason'),
					},
					exclusion_comment: {
						id: 'exclusion_comment',
						name: t('rda_report.table.columns.exclusion_comment'),
					},
				};
			}

			if (
				currentTableName ===
				TABLE_NAMES['rda-report-page-completed__excluded_items']
			) {
				list = {
					name: {
						id: 'name',
						name: t('rda_report.table.columns.full_name'),
						required: true,
					},
					parent: {
						id: 'parent',
						name: t('rda_report.table.columns.location'),
					},
					uniqueId: {
						id: 'uniqueId',
						name: t('rda_report.table.columns.unique_id'),
					},
					classificationName: {
						id: 'classificationName',
						name: t('rda_report.table.columns.rm_class'),
					},
					itemComment: {
						id: 'itemComment',
						name: t('rda_report.table.columns.comment'),
					},
				};
			}

			if (
				currentTableName ===
				TABLE_NAMES['rda-report-page-initiated__excluded_items']
			) {
				list = {
					name: {
						id: 'name',
						name: t('rda_report.table.columns.full_name'),
						required: true,
					},
					parent: {
						id: 'parent',
						name: t('rda_report.table.columns.location'),
					},
					uniqueId: {
						id: 'uniqueId',
						name: t('rda_report.table.columns.unique_id'),
					},
					classificationName: {
						id: 'classificationName',
						name: t('rda_report.table.columns.rm_class'),
					},
					status: {
						id: 'status',
						name: t('rda_report.table.columns.status'),
					},
					statusDate: {
						id: 'statusDate',
						name: t('rda_report.table.columns.status_date'),
					},
					calculatedDate: {
						id: 'calculatedDate',
						name: t('rda_report.table.columns.calc_date'),
					},
				};
			}

			if (
				currentTableName ===
				TABLE_NAMES['rda-report-page-initiated__included_items']
			) {
				list = {
					name: {
						id: 'name',
						name: t('rda_report.table.columns.full_name'),
						required: true,
					},
					status: {
						id: 'status',
						name: t('rda_report.table.columns.status'),
					},
					feedback: {
						id: 'feedback',
						name: t('rda_report.table.columns.feedback_users'),
					},
					reason: {
						id: 'reason',
						name: t('rda_report.table.columns.reason'),
					},
					itemComment: {
						id: 'itemComment',
						name: t('rda_report.table.columns.comment'),
					},
				};
			}

			return list;
		}, [currentTableName, currentLang]);

	const manageTableColumns = useManageTableColumns({
		tableName: currentTableName,
		columns: tableColumnList,
	});

	useEffect(() => {
		if (workPackage) {
			getRdaItems();
		}
	}, [workPackage]);

	useEffectAfterMount(() => {
		if (
			workPackage &&
			DISPOSITION_WORKFLOW_STATES_COMPLETED.includes(workPackage.workflowStatus)
		) {
			refetchRdaItems(undefined, { silently: false });
		}
		if (
			workPackage &&
			workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED &&
			tableParams.currentTab === TAB_INDEX_FOR_INITIATED_STATE.EXCLUDED_ITEMS
		) {
			refetchRdaItems(undefined, { silently: false });
		}
		if (
			workPackage &&
			workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED &&
			tableParams.currentTab === TAB_INDEX_FOR_INITIATED_STATE.INCLUDED_ITEMS
		) {
			refetchRdaItems(undefined, { silently: false });
		}
	}, [
		tableParams.page,
		tableParams.pageSize,
		tableParams.orderBy,
		tableParams.elements,
	]);

	useEffectAfterMount(() => {
		if (
			workPackage &&
			DISPOSITION_WORKFLOW_STATES_COMPLETED.includes(workPackage.workflowStatus)
		) {
			refetchRdaItems(undefined, { silently: false }).then(() =>
				setSearchParams(
					{ t: String(tableParams.currentTab) },
					{ replace: true },
				),
			);
		}
		if (
			workPackage &&
			workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED &&
			tableParams.currentTab === TAB_INDEX_FOR_INITIATED_STATE.EXCLUDED_ITEMS
		) {
			refetchRdaItems(undefined, { silently: false }).then(() =>
				setSearchParams(
					{ t: String(tableParams.currentTab) },
					{ replace: true },
				),
			);
		}
		if (
			workPackage &&
			workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED &&
			tableParams.currentTab === TAB_INDEX_FOR_INITIATED_STATE.INCLUDED_ITEMS
		) {
			refetchRdaItems(undefined, { silently: false }).then(() =>
				setSearchParams(
					{ t: String(tableParams.currentTab) },
					{
						replace: true,
					},
				),
			);
		}
	}, [tableParams.currentTab]);

	useEffectAfterMount(() => {
		if (
			workPackage &&
			workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED &&
			tableParams.currentTab === TAB_INDEX_FOR_INITIATED_STATE.INCLUDED_ITEMS
		) {
			searchRdaItems(() => getFindRdaItemsParams(tableParams));
		}
		if (
			workPackage &&
			workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED &&
			tableParams.currentTab === TAB_INDEX_FOR_INITIATED_STATE.EXCLUDED_ITEMS
		) {
			searchRdaItems(() => getFindRdaItemsParams(tableParams));
		}
		if (
			workPackage &&
			DISPOSITION_WORKFLOW_STATES_COMPLETED.includes(workPackage.workflowStatus)
		) {
			searchRdaItems(() => getFindRdaItemsParams(tableParams));
		}
	}, [tableParams.search]);

	function getFindRdaItemsParams(params) {
		const combinedParams = {
			...tableParams,
			...params,
		};

		const parsedParams: FindRdaFilesDto = {
			orderBy: combinedParams.orderBy,
			elements: [
				{
					fields: ['rdaId'],
					modifier: 'equal',
					values: [Number(id)],
				},
				...combinedParams.elements,
			],
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
			filters: true,
		};

		if (
			workPackage &&
			DISPOSITION_WORKFLOW_STATES_COMPLETED.includes(workPackage.workflowStatus)
		) {
			if (
				combinedParams.currentTab === TAB_INDEX_FOR_COMPLETED_STATE.UNDECIDED
			) {
				parsedParams.elements.push({
					fields: ['state'],
					modifier: 'equal',
					values: RDA_ITEM_APPROVAL_STATES_UNDECIDED,
				});
			}

			if (
				combinedParams.currentTab === TAB_INDEX_FOR_COMPLETED_STATE.APPROVED
			) {
				parsedParams.elements.push({
					fields: ['state'],
					modifier: 'equal',
					values: [RDA_ASSIGNMENT_ITEM_STATES.APPROVED],
				});
			}

			if (
				combinedParams.currentTab === TAB_INDEX_FOR_COMPLETED_STATE.REJECTED
			) {
				parsedParams.elements.push({
					fields: ['state'],
					modifier: 'equal',
					values: [RDA_ASSIGNMENT_ITEM_STATES.REJECTED],
				});
			}

			if (
				combinedParams.currentTab ===
				TAB_INDEX_FOR_COMPLETED_STATE.EXCLUDED_ITEMS
			) {
				parsedParams.elements.push({
					fields: ['included'],
					modifier: 'equal',
					values: [0],
				});
			}
		}

		if (
			workPackage &&
			workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED
		) {
			if (
				combinedParams.currentTab ===
				TAB_INDEX_FOR_INITIATED_STATE.EXCLUDED_ITEMS
			) {
				parsedParams.elements.push({
					fields: ['included'],
					modifier: 'equal',
					values: [0],
				});
			} else {
				parsedParams.elements.push({
					fields: ['included'],
					modifier: 'equal',
					values: [1],
				});
			}
		}

		if (combinedParams.search.trim().length) {
			parsedParams.elements.push({
				fields: ['name'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		return parsedParams;
	}

	const toggleFilters = () =>
		dispatchTableParams({
			type: 'toggleFilterPanel',
		});

	const handleEditWorkPackage = () => {
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.SETTINGS_RDA, Number(id));
	};

	const handleOpenInfo = () => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.DISPOSITION_INFO,
			Number(id),
		);
	};

	const handleForceApproval = () => {
		if (!workPackage) return;

		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.FORCE_APPROVER, [
			workPackage,
		]);
	};

	const handleAddApprover = (
		user: IUser,
		conditionalApprover: IApprover['conditionalApprover'],
	) => {
		const orderBy = conditionalApprover
			? sortedApprovers.additionalApprovers.length + 1
			: sortedApprovers.approvers.length + 1;

		addApproverMutation.mutate({
			rdaId: Number(id),
			conditionalApprover,
			userId: user.id,
			orderBy,
			assignedDate: new Date(),
		});
	};

	const handleReassignApprover = (userId: number) => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.REASSIGN_APPROVER,
			Number(id),
			userId,
			workPackage?.approvers,
		);
	};

	const handleChangeApproverOrder = async (result: DropResult) => {
		const approverList =
			result.destination?.droppableId === 'additional-approvers'
				? sortedApprovers.additionalApprovers
				: sortedApprovers.approvers;
		const notChangedList =
			result.destination?.droppableId === 'additional-approvers'
				? sortedApprovers.approvers
				: sortedApprovers.additionalApprovers;

		if (
			!result.destination ||
			result.source.index === result.destination.index
		) {
			return;
		}

		const approver = approverList[result.source.index];
		const replacedApprover = approverList[result.destination.index];

		if (
			replacedApprover?.state === APPROVER_STATES.ACTIVE ||
			replacedApprover?.state === APPROVER_STATES.COMPLETE
		) {
			return;
		}

		const updatedList = update(approverList, {
			$splice: [
				[result.source.index, 1],
				[result.destination.index, 0, approver],
			],
			$apply: (list) => {
				return list.map((item, idx) => ({ ...item, orderBy: idx + 1 }));
			},
		});

		queryClient.setQueryData(DISPOSITIONS_QUERY_KEYS.approvers(Number(id)), [
			...notChangedList,
			...updatedList,
		]);
		const differenceList = differenceWith(
			updatedList,
			approverList,
			(a: IApprover, b: IApprover) =>
				a.approverId === b.approverId && a.orderBy === b.orderBy,
		);

		updateApproverMutation.mutate(differenceList);
	};

	const handleDeleteApprover = (approverId: IApprover['approverId']) => {
		deleteApproverMutation.mutate({ approverId });
	};

	const handleGenerateAuditReport = () => {
		if (!workPackage) return;

		generateAuditMutation.mutate({
			id: workPackage.id,
			name: workPackage.multilingual?.name[currentLang] ?? workPackage.name,
		});
	};

	const handleChangeTab = (tab: number) => () => {
		dispatchTableParams({ type: 'changeTab', payload: tab });
	};

	const handleSearch = async (value: string) => {
		dispatchTableParams({ type: 'search', payload: value });
	};

	const handleClearSearch = async () => {
		dispatchTableParams({ type: 'search', payload: '' });
	};

	const handleChangePage = (page: number) => {
		dispatchTableParams({ type: 'page', payload: { page: page + 1 } });
	};

	const handleChangePageSize = (size: number) => {
		dispatchTableParams({
			type: 'pageSize',
			payload: { pageSize: size },
		});
	};

	const handleChangeFilter = useEvent(
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

	const handleClearFilters = useEvent(() => {
		dispatchTableParams({
			type: 'clearFilters',
		});
	});

	const handleManageTableColumns = manageTableColumns.onManage;

	const handleCompleteWorkPackage = () => {
		workPackage &&
			completeWorkPackageMutation.mutate({
				rdaIdsToComplete: [workPackage.id],
			});
	};

	const handleRecallWorkPackage = () => {
		workPackage &&
			modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.RECALL_DISPOSITION, [
				workPackage,
			]);
	};

	const handleDeleteWorkPackage = () => {
		if (!workPackage) return;

		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.USE_DELETE_RDA, [
			workPackage,
		]);
	};

	const handleSuccessDeleteWorkPackage = async () => {
		navigate(
			location.state?.from ||
				DISPOSITIONS_ROUTES.RDA_WORK_PACKAGES_OVERVIEW.path,
		);
	};

	const handleMoveItems = () => {
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.MOVE_RDA_ITEMS);
	};

	const handleUpdatePhysicalObjectMetadata = () => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.UPDATE_PHYSICAL_OBJECT_METADATA,
		);
	};

	const handleUpdateRecordsManagementMetadata = () => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.UPDATE_RECORDS_MANAGEMENT_METADATA,
		);
	};

	const handleChangeDispositionAction = () => {
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.CHANGE_DISPOSITION_ACTION);
	};

	const handleProcessSelectedRdaItems = () => {
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.PROCESSING_RDA_ITEMS, {
			id: workPackage?.id || null,
			select: Object.keys(selectedItems[queryCurrentTab]),
		});
	};

	const handleOverrideApprovalState = (
		currentTab: TableFindParams['currentTab'],
	) => {
		return (e: React.MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			modalManager.open(
				RDA_WORK_PACKAGE_MODAL_NAMES.OVERRIDE_APPROVAL_STATE,
				currentTab === TAB_INDEX_FOR_COMPLETED_STATE.APPROVED
					? 'approved'
					: 'rejected',
			);
		};
	};

	const handleApplyRemoveHold = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.APPLY_REMOVE_HOLD);
	};

	const handleProcessAllApprovedRdaItems = () => {
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.PROCESSING_RDA_ITEMS, {
			id: workPackage?.id || null,
			select: [],
		});
	};

	const handleSelectRow = (row: Row<IFile>) => {
		setSelectedItems((prevState) => {
			const newState = {
				...prevState,
				[queryCurrentTab]: { ...prevState[queryCurrentTab] },
			};
			const itemId = row.original.id;
			const currentTableList = newState[queryCurrentTab];
			const isAlreadySelected = currentTableList[itemId];

			if (isAlreadySelected) {
				delete currentTableList[itemId];
			} else {
				currentTableList[itemId] = true;
			}

			return newState;
		});
	};

	const handleClearSelected = () => {
		setSelectedItems({
			...selectedItems,
			[queryCurrentTab]: {},
		});
	};

	const handleToggleSelectingAllRows = (data: Record<number, boolean>) => {
		setSelectedItems((prevValue) =>
			update(prevValue, { [queryCurrentTab]: { $set: data } }),
		);
	};

	const isAllowReassign: boolean = useMemo(() => {
		if (workPackageConfigs && workPackageConfigs.length) {
			for (const config of workPackageConfigs) {
				if (config.property === IWorkPackageConfig.AllowReassign) {
					return config.value === 'true';
				}
			}
		}
		return false;
	}, [workPackageConfigs]);

	const additionalActionsForCompletedState: MoreButtonProps['options'] =
		useMemo(() => {
			if (!workPackage) return [];

			if (
				workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED
			) {
				return [
					{
						key: 'force_approval',
						label: t('disposition.actions.force_approval'),
						onSelect: handleForceApproval,
					},
					{
						key: 'edit',
						label: t('disposition.actions.edit'),
						onSelect: handleEditWorkPackage,
					},
					{
						key: 'recall',
						label: t('disposition.actions.recall'),
						onSelect: handleRecallWorkPackage,
					},
				];
			}

			if (
				workPackage.workflowStatus ===
					DISPOSITION_WORKFLOW_STATES.READY_TO_COMPLETE ||
				workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.ARCHIVE
			) {
				const actions: MoreButtonProps['options'] = [
					{
						key: 'recall',
						label: t('disposition.actions.recall'),
						onSelect: handleRecallWorkPackage,
					},
					{
						key: 'delete',
						label: t('disposition.actions.delete'),
						onSelect: handleDeleteWorkPackage,
					},
				];

				if (
					workPackage.workflowStatus ===
					DISPOSITION_WORKFLOW_STATES.READY_TO_COMPLETE
				) {
					actions.unshift({
						key: 'complete',
						label: t('disposition.actions.archive'),
						onSelect: handleCompleteWorkPackage,
					});
				}

				return actions;
			}

			return [];
		}, [workPackage]);

	const isDataLoading =
		isDispositionLoading ||
		isDispositionSearchLoading ||
		isApproversLoading ||
		isDispositionSnapshotLoading ||
		isFullListApproversLoading;

	return {
		models: {
			selectedItems: selectedItems[queryCurrentTab],
			workPackage,
			allDispositionActions,
			dispositionSearch,
			dispositionSnapshot,
			approverList: sortedApprovers,
			approversFullList,
			fileList,
			filesStats: filesData?.stats,
			filesQueryData: filesData?.query,
			tableParams,
			currentTableName,
			currentTab: queryCurrentTab,
			isDataLoading,
			isActionsLoading,
			isRdaItemsRefetching,
			isRdaItemsSearchLoading,
			isRdaItemsInitialLoading,
			isGenerateAuditReportLoading: generateAuditMutation.isLoading,
			isAddApproverLoading: addApproverMutation.isLoading,
			isAllowReassign,
			modals: {
				manageTableColumns: manageTableColumns.modal,
			},
			TABLE_NAMES,
			location,
			additionalActionsForCompletedState,
		},
		commands: {
			refetchWorkPackage,
			refetchRdaItems,
			handleMoveItems,
			handleUpdatePhysicalObjectMetadata,
			handleUpdateRecordsManagementMetadata,
			handleOverrideApprovalState,
			handleApplyRemoveHold,
			handleToggleSelectingAllRows,
			handleProcessAllApprovedRdaItems,
			handleClearSelected,
			handleProcessSelectedRdaItems,
			handleChangeDispositionAction,
			handleSuccessDeleteWorkPackage,
			handleAddApprover,
			handleChangeApproverOrder,
			handleReassignApprover,
			handleDeleteApprover,
			handleChangeTab,
			handleOpenInfo,
			handleForceApproval,
			handleEditWorkPackage,
			handleGenerateAuditReport,
			handleSearch,
			handleClearSearch,
			handleChangePage,
			handleChangePageSize,
			handleChangeFilter,
			handleClearFilters,
			handleManageTableColumns,
			handleSelectRow,
			toggleFilters,
		},
		hooks: {
			t,
			multilingualT,
			useDate: date,
		},
	};
}
