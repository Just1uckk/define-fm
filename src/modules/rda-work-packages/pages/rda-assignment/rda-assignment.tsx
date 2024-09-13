import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useMutation, useQuery } from 'react-query';
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router-dom';
import { Row } from '@tanstack/react-table';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import update from 'immutability-helper';
import {
	DEFAULT_SETTINGS_LIST,
	findDefaultOption,
} from 'modules/auth/components/profile-settings-form/profile-tabs/edit-default-settings';
import { ApproverAvatar } from 'modules/rda-work-packages/components/approver-avatar/approver-avatar';
import { ModifyFeedbackModal } from 'modules/rda-work-packages/features/modify-feedback-users/modify-feedback-users';
import { RejectExtendRdaItem } from 'modules/rda-work-packages/features/reject-extend-rda-item/reject-extend-rda-item';
import { RequestRdaItemFeedbackModal } from 'modules/rda-work-packages/features/request-rda-item-feedback/request-rda-item-feedback-modal';
import { AboutRdaWorkPackageModal } from 'modules/rda-work-packages/features/show-rda-work-package-info/about-disposition-modal';
import { sortApprovers } from 'modules/rda-work-packages/helpers/sort-approvers';
import { ColumnOrder } from 'modules/rda-work-packages/modals/manage-columns-modal/manage-table-columns-modal';
import { CompleteReviewSection } from 'modules/rda-work-packages/pages/rda-assignment/components/complete-review-section';
import { useModalManager } from 'shared/context/modal-manager';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';
import styled from 'styled-components';

import {
	ApproverApi,
	CompleteApproverDto,
} from 'app/api/approver-api/approver-api';
import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import {
	DispositionsApi,
	RejectAndExtendDto,
	RequestFeedbackDto,
} from 'app/api/dispositions-api/dispositions-api';
import {
	FindRdaAssignmentFilesDto,
	RdaAssignmentsApi,
} from 'app/api/rda-assignments/rda-assignments-api';
import { FindRdaFilesDto, RdaItemApi } from 'app/api/rda-item-api/rda-item-api';

import {
	selectDefaultSettingsData,
	selectUserData,
} from 'app/store/user/user-selectors';

import { ICoreConfig } from 'shared/types/core-config';
import { IApprover, IRdaAssignmentItem } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import {
	APPROVER_STATES,
	RDA_ASSIGNMENT_ITEM_STATES,
} from 'shared/constants/constans';
import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import {
	CORE_CONFIG_LIST_QUERY_KEYS,
	DISPOSITIONS_QUERY_KEYS,
} from 'shared/constants/query-keys';
import { COMMON_ROUTES, DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { DEFAULT_PAGINATION_PAGE_SIZE } from 'shared/hooks/use-manage-pagination';
import { useManageTableColumns } from 'shared/hooks/use-manage-table-columns';
import { useManageTableSettings } from 'shared/hooks/use-manage-table-settings';
import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';
import { useEvent } from 'shared/hooks/useEvent';

import { NotFoundPage } from 'shared/components/404/not-found-page';
import { Breadcrumb } from 'shared/components/breadcrumbs/breadcrumb';
import { BreadcrumbPortal } from 'shared/components/breadcrumbs/breadcrumb-portal';
import { BREADCRUMB_CONTAINER } from 'shared/components/breadcrumbs/breadcrumbs';
import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { SearchBar } from 'shared/components/search-bar/search-bar';
import { Spinner } from 'shared/components/spinner/spinner';
import {
	TableChildrenFunctionParams,
	TableSortState,
} from 'shared/components/table/table';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
import { ManageColumnsButton } from 'shared/components/table-controls/manage-columns-button';
import { TableActionPanel } from 'shared/components/table-controls/table-action-panel';
import { TabList } from 'shared/components/tabs/tab-list';
import { TabWithLabel } from 'shared/components/tabs/tab-with-label';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';
import { Toggle } from 'shared/components/toggle/toggle';
import { UserAvatarList } from 'shared/components/user-avatar-list/user-avatar-list';

import { FilesTable } from './components/files-table/files-table';

const Page = styled.div``;

const PageHeader = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
`;

const PageTitle = styled(Title)`
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
`;

const PageHeaderRight = styled.div`
	display: flex;
	align-items: center;
`;

const Approvers = styled.div`
	display: flex;
	align-items: center;
	margin-right: 1rem;
`;

const StyledUserAvatarList = styled(UserAvatarList)`
	margin-left: 0.8rem;
`;

const PageContent = styled.div`
	display: flex;
	flex-direction: column;
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

export type RdaAssignmentsTabs =
	| 'pending'
	| 'approved'
	| 'rejected'
	| 'feedback_pending';

const tabIndex: Record<RdaAssignmentsTabs, number> = {
	pending: 0,
	approved: 1,
	rejected: 2,
	feedback_pending: 3,
};

type TableFindParams = {
	search: string;
	pageSize: number;
	page: number;
	orderBy: string;
	currentTab: RdaAssignmentsTabs;
};

const DEFAULT_TAB = 'pending';
const TABLE_NAME = 'rda-assignment';

const RdaAssignmentPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const navigate = useNavigate();
	const { t, multilingualT, currentLang } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams({
		t: DEFAULT_TAB,
	});

	const defaultUserSettings = selectDefaultSettingsData();
	const currentUser = selectUserData() as IUser;
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
	const [wasOnPendingPage, setWasOnPendingPage] = useState(false);
	const [queryParams, setQueryParams] = useState<TableFindParams>(() => {
		const initialSettings =
			MemoryManagingTableSettings.getSavedSettings('rda-assignment');

		return {
			currentTab: searchParams.get('t') as TableFindParams['currentTab'],
			orderBy: 'item.name',
			search: '',
			page: 1,
			pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
		};
	});
	const [selectedRows, setSelectedRows] = useState<
		Record<
			TableFindParams['currentTab'],
			Record<IRdaAssignmentItem['id'], boolean>
		>
	>({
		pending: {},
		approved: {},
		rejected: {},
		feedback_pending: {},
	});

	const modalManager = useModalManager();

	const queryCurrentTab =
		(searchParams.get('t') as TableFindParams['currentTab']) ||
		queryParams.currentTab;

	const {
		data: workPackage,
		isLoading: iswWorkPackageLoading,
		isFetched: isWorkPackageFetched,
		isError: isWorkPackageError,
		refetch: refetchWorkPackage,
	} = useQuery(DISPOSITIONS_QUERY_KEYS.disposition(Number(id)), () =>
		DispositionsApi.getDisposition({ id: Number(id) }),
	);

	const {
		data: appConfigs,
		isLoading: isLoadingAppConfigs,
		isFetched: isFetchedAppConfigs,
	} = useQuery({
		queryKey: CORE_CONFIG_LIST_QUERY_KEYS.config_list,
		queryFn: CoreConfigApi.getConfigList,
		enabled: isWorkPackageFetched,
		select: useCallback((data: ICoreConfig[]) => {
			const allowFeedbackRequests = data.find(
				(setting) => setting.property === 'rda.General.AllowFeedbackRequests',
			);
			const defaultTab = data.find(
				(setting) => setting.property === 'rda.AutomaticEscalation.DefaultTab',
			);
			const defaultFeedbackMessage = data.find(
				(setting) => setting.property === 'rda.General.DefaultFeedbackMessage',
			);

			return {
				allowFeedbackRequests: allowFeedbackRequests?.value === 'true',
				defaultTab: defaultTab?.value,
				defaultFeedbackMessage: defaultFeedbackMessage?.value,
			};
		}, []),
		onSuccess: (data) => {
			const defaultTab = data.defaultTab as RdaAssignmentsTabs;

			if (
				defaultTab in tabIndex &&
				!searchParams.get('t') &&
				!workPackage?.pendingItemCount
			) {
				setQueryParams((prevValue) => ({
					...prevValue,
					currentTab: defaultTab,
					page: 1,
				}));
			}
		},
	});

	const {
		data: filesData,
		refetchData: refetchFiles,
		searchData: searchFiles,
		isInitialLoading: isFileListLoading,
		isSearching: isSearchingFileList,
		isRefetching: isRefetchingFileList,
	} = useFilterRequest<
		IRdaAssignmentItem[],
		Partial<TableFindParams>,
		FindRdaAssignmentFilesDto
	>({
		enabled: isFetchedAppConfigs,
		request: (params) => {
			return RdaAssignmentsApi.findAssignmentItems(getFindFilesParams(params));
		},
		searchRequest: (params) => {
			return RdaAssignmentsApi.findAssignmentItems(params);
		},
	});
	const fileList = filesData?.results ?? [];

	const isLoading =
		!isFileListLoading && !isSearchingFileList && !isRefetchingFileList;
	const isData = filesData && filesData?.results.length === 0;
	const isDefaultSettings =
		defaultUserSettings &&
		findDefaultOption(defaultUserSettings, DEFAULT_SETTINGS_LIST.DEFAULT_TAB)
			?.value &&
		findDefaultOption(defaultUserSettings, DEFAULT_SETTINGS_LIST.DEFAULT_TAB)
			?.value !== 'pending';
	if (
		isData &&
		isLoading &&
		isDefaultSettings &&
		location.search.length === 0 &&
		!wasOnPendingPage
	) {
		const defaultUserSettingsTab = findDefaultOption(
			defaultUserSettings,
			DEFAULT_SETTINGS_LIST.DEFAULT_TAB,
		)?.value;
		queryParams.currentTab = defaultUserSettingsTab as RdaAssignmentsTabs;
	}

	const {
		data: approvers = [],
		refetch: refetchApprovers,
		isLoading: isApproversLoading,
	} = useQuery(
		DISPOSITIONS_QUERY_KEYS.approvers(Number(id)),
		() => ApproverApi.getRdaApproversById({ id: Number(id) }),
		{
			select: useCallback((approvers) => sortApprovers(approvers), []),
		},
	);

	useTitle(workPackage?.multilingual?.name[currentLang] ?? workPackage?.name);
	const date = useDate();

	const tableColumnList = useMemo(() => {
		const list = {
			name: {
				id: 'item.name',
				name: t('disposition.table_columns.full_name'),
				required: true,
			},
			parent: {
				id: 'item.parent',
				name: t('disposition.table_columns.location'),
			},
			uniqueId: {
				id: 'item.uniqueId',
				name: t('disposition.table_columns.unique_id'),
				visible: false,
			},
			classificationName: {
				id: 'item.classificationName',
				name: t('disposition.table_columns.rm_class'),
			},
			status: {
				id: 'item.status',
				name: t('disposition.table_columns.status'),
			},
			statusDate: {
				id: 'item.statusDate',
				name: t('disposition.table_columns.status_date'),
			},
			calculatedDate: {
				id: 'item.calculatedDate',
				name: t('disposition.table_columns.calc_date'),
			},
		};

		return list;
	}, [currentLang]);

	const manageTableColumns = useManageTableColumns({
		tableName: TABLE_NAME,
		columns: tableColumnList,
	});

	const manageTableSettingsss = useManageTableSettings();
	const settings = manageTableSettingsss.getSavedSettings<{
		columns?: ColumnOrder[];
	}>(TABLE_NAME);

	const isEnabled = () => {
		if (settings.columns) {
			const column = settings.columns.find(
				(element) => element.id === 'parent',
			);
			if (column) {
				const status = column['visible'];
				if (status) {
					return true;
				} else if (status === undefined) {
					return true;
				} else {
					return false;
				}
			}
			return true;
		}
		return true;
	};

	const { data: totalFullPath } = useQuery({
		enabled: fileList.length >= 1 && isEnabled(),
		queryKey: ['fullPath', fileList[fileList.length - 1]?.itemId],
		queryFn: async () => {
			const arrayIds: number[] = [];
			fileList.forEach((element) => arrayIds.push(element.itemId));
			return await RdaItemApi.getFileFullPathTotal({ arrayIds });
		},
	});

	const approveSelectedItemsMutation = useMutation({
		mutationFn: async (ids: string[]) => {
			const currentTab = queryParams.currentTab;

			await RdaAssignmentsApi.approveFile({
				rdaItemApprovals: ids,
				state: RDA_ASSIGNMENT_ITEM_STATES.APPROVED,
			});

			setSelectedRows((prevVal) =>
				update(prevVal, { [currentTab]: { $set: {} } }),
			);

			const newFilesData = await refetchFiles();
			const newFileList = newFilesData?.results ?? [];
			refreshFilePopups(ids, newFileList);

			await refetchWorkPackage();
		},
	});

	const completeReviewWorkPackageMutation = useMutation({
		mutationFn: async (payload: CompleteApproverDto) => {
			await ApproverApi.completeApprover(payload);

			await refetchWorkPackage();
			await refetchApprovers();
		},
	});

	const moveToPendingSelectedItemsMutation = useMutation({
		mutationFn: async (ids: string[]) => {
			const currentTab = queryParams.currentTab;

			await RdaAssignmentsApi.moveToPendingFile({
				rdaItemApprovals: ids,
				state: RDA_ASSIGNMENT_ITEM_STATES.PENDING,
			});

			setSelectedRows((prevVal) =>
				update(prevVal, { [currentTab]: { $set: {} } }),
			);

			const newFilesData = await refetchFiles();
			const newFileList = newFilesData?.results ?? [];
			refreshFilePopups(ids, newFileList);

			await refetchWorkPackage();
		},
	});

	useEffectAfterMount(() => {
		refetchFiles(undefined, { silently: false });
	}, [
		queryParams.page,
		queryParams.pageSize,
		queryParams.currentTab,
		queryParams.orderBy,
	]);
	useEffectAfterMount(() => {
		refetchFiles(undefined, { silently: false }).then(() =>
			setSearchParams(
				{ t: queryParams.currentTab },
				{
					replace: true,
				},
			),
		);
	}, [queryParams.currentTab]);
	useEffectAfterMount(() => {
		searchFiles(() => getFindFilesParams(queryParams));
	}, [queryParams.search]);

	useEffect(() => {
		const currentTab = queryParams.currentTab;

		window.onmessage = async (e) => {
			if (e.data.type === 'updateFileList') {
				setSelectedRows((prevVal) =>
					update(prevVal, { [currentTab]: { $set: {} } }),
				);

				const newFileList = await refetchFiles(undefined, { silently: false });

				refreshFilePopups([e.data.assignment.id], newFileList?.results ?? []);
				await refetchWorkPackage();
			}
		};
	}, [queryParams]);

	const currentUserApproverData = useMemo(() => {
		const currentApprover = approvers.find(
			(approver) => approver.userId === currentUser.id,
		);
		if (approvers.length && !currentApprover) {
			navigate(COMMON_ROUTES.MAIN_PATH);
		}
		return currentApprover;
	}, [approvers]);

	const canCompleteReviewWorkPackage = useMemo(() => {
		const noMorePendingItems = workPackage?.pendingItemCount === 0;
		const noMoreFeedbackItems = workPackage?.feedbackPendingItemCount === 0;

		return Boolean(
			currentUserApproverData?.state === APPROVER_STATES.ACTIVE &&
				noMorePendingItems &&
				noMoreFeedbackItems,
		);
	}, [workPackage, currentUserApproverData]);

	const currentFeedbackUser: any = useMemo(() => {
		let feedbackUserInfo: IApprover | boolean = false;
		if (workPackage && currentUser) {
			workPackage.feedbackUsers.forEach((element) => {
				if (element.userId === currentUser.id) {
					feedbackUserInfo = element;
				}
			});
			return feedbackUserInfo;
		}
		return feedbackUserInfo;
	}, [workPackage]);

	function getFindFilesParams(params) {
		const combinedParams = {
			...queryParams,
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
				{
					fields: ['approver_userId'],
					modifier: 'equal',
					values: [currentUser.id],
				},
			],
			filters: true,
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.currentTab === 'pending') {
			parsedParams.elements.push({
				fields: ['state'],
				modifier: 'equal',
				values: [RDA_ASSIGNMENT_ITEM_STATES.PENDING],
			});
		}
		if (combinedParams.currentTab === 'approved') {
			parsedParams.elements.push({
				fields: ['state'],
				modifier: 'equal',
				values: [RDA_ASSIGNMENT_ITEM_STATES.APPROVED],
			});
		}
		if (combinedParams.currentTab === 'rejected') {
			parsedParams.elements.push({
				fields: ['state'],
				modifier: 'equal',
				values: [RDA_ASSIGNMENT_ITEM_STATES.REJECTED],
			});
		}
		if (combinedParams.currentTab === 'feedback_pending') {
			parsedParams.elements.push({
				fields: ['state'],
				modifier: 'equal',
				values: [RDA_ASSIGNMENT_ITEM_STATES.FEEDBACK_PENDING],
			});
		}

		if (combinedParams.search.trim().length) {
			parsedParams.elements.push({
				fields: ['item_name'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		return parsedParams;
	}

	function refreshFilePopups(
		oldIds: Array<IRdaAssignmentItem['id'] | string>,
		newAssignmentItems: IRdaAssignmentItem[],
	) {
		//update window with opened file
		oldIds.forEach((id) => {
			if (id in fileModals.current) {
				const oldWindow = fileModals.current[id];
				const newFileData = newAssignmentItems[oldWindow.idx];

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
						workPackageId: newFileData.item.rdaId,
					});
				}
			}
		});
	}

	const handleOpenFileInfo = useEvent(
		(
			e: React.MouseEvent<HTMLAnchorElement>,
			assignment: IRdaAssignmentItem,
			idx: number,
		) => {
			e.preventDefault();

			fileModals.current[assignment.id] = {
				idx,
				window: window.open(
					DISPOSITIONS_ROUTES.FILE_INFO.generate.external(
						assignment.item.rdaId,
						assignment.id,
						queryParams.currentTab,
					),
					`${assignment.item.rdaId}${assignment.item.id}`,
					'left=300,top=250,width=650,height=515',
				),
			};

			const windowReference = fileModals.current[assignment.id].window;
			if (!windowReference) return;

			windowReference.onload = function () {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				this.onbeforeunload = function () {
					delete fileModals.current[assignment.id];
				};
			};
		},
	);

	const onChangeTab = (tabName: RdaAssignmentsTabs) => () => {
		setQueryParams((prevValue) => ({
			...prevValue,
			currentTab: tabName,
			page: 1,
		}));
	};

	const toggleFilters = () => setIsFilterPanelOpen((prevValue) => !prevValue);

	const onSearch = async (value: string) => {
		setQueryParams((prevValue) => ({
			...prevValue,
			search: value,
			page: 1,
		}));
	};

	const onClearSearch = async () => {
		setQueryParams((prevValue) => ({
			...prevValue,
			search: '',
			page: 1,
		}));
	};

	const onChangePage = useEvent((page: number) => {
		setQueryParams((prevValue) => ({
			...prevValue,
			page: page + 1,
		}));
	});

	const onChangePageSize = useEvent((size: number) => {
		setQueryParams((prevValue) => ({
			...prevValue,
			pageSize: size,
		}));
	});

	const onSortChanged = useEvent((state: TableSortState) => {
		const value = state[0];
		let parsedValue = '';

		if (value) {
			parsedValue = value.desc ? `-${value.id}` : value.id;
		}

		setQueryParams((prevValue) => ({
			...prevValue,
			orderBy: parsedValue,
		}));
	});

	const onApproveItems = async (idList: Record<number, boolean>) => {
		const ids = Object.keys(idList);

		await approveSelectedItemsMutation.mutateAsync(ids);
	};

	const onMoveToPendingItems = async (idList: Record<number, boolean>) => {
		const ids = Object.keys(idList);

		await moveToPendingSelectedItemsMutation.mutateAsync(ids);
	};

	const onRejectExtendItems = async (ids: Record<number, boolean>) => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.USE_REJECT_EXTEND,
			Object.keys(ids),
		);
	};

	const onModifyFeedbackUsers = async (ids: Record<number, boolean>) => {
		if (fileList.length) {
			const rightIds: number[] = [];
			const arrayWorkId: any[] = Object.keys(ids);
			const numberIds: number[] = arrayWorkId.map((element) => Number(element));
			numberIds.forEach((element) => {
				const findFile = fileList.find((el) => el.id === element);
				if (findFile) {
					console.log(findFile);
					rightIds.push(findFile.item.id);
				}
			});
			modalManager.open(
				RDA_WORK_PACKAGE_MODAL_NAMES.MODIFY_FEEDBACK_USERS,
				Object.keys(ids),
				appConfigs?.defaultFeedbackMessage,
				rightIds,
			);
		}
	};

	const onRequestFeedback = async (ids: Record<number, boolean>) => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.USE_REQUEST_FEEDBACK,
			Object.keys(ids),
			appConfigs?.defaultFeedbackMessage,
		);
	};

	const handleSuccessRequestFeedback = async (
		payload: RequestFeedbackDto,
		currentTab: TableFindParams['currentTab'],
	) => {
		setSelectedRows((prevVal) =>
			update(prevVal, { [currentTab]: { $set: {} } }),
		);

		const newFilesData = await refetchFiles();
		const newFileList = newFilesData?.results ?? [];
		refreshFilePopups(payload.rdaItemApprovals, newFileList);

		await refetchWorkPackage();
	};

	const handleSuccessRejectRdaItem = async (
		payload: RejectAndExtendDto,
		currentTab: TableFindParams['currentTab'],
	) => {
		setSelectedRows((prevVal) =>
			update(prevVal, { [currentTab]: { $set: {} } }),
		);

		const newFilesData = await refetchFiles();
		const newFileList = newFilesData?.results ?? [];
		refreshFilePopups(payload.rdaItemApprovals, newFileList);

		await refetchWorkPackage();
	};

	const onOpenInfo = () => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.USE_ABOUT_DISPOSITION,
			Number(id),
		);
	};

	const handleCompleteReviewWorkPackage = async () => {
		if (!currentUserApproverData) return;

		await completeReviewWorkPackageMutation.mutateAsync({
			rdaApproverId: currentUserApproverData.approverId,
		});

		navigate(DISPOSITIONS_ROUTES.RDA_ASSIGNMENTS_OVERVIEW.path, {
			replace: true,
		});
	};

	const handleSelectRow = (row: Row<IRdaAssignmentItem>) => {
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

	const toggleSelectingAllRows = (
		data: Record<IRdaAssignmentItem['id'], boolean>,
	) => {
		setSelectedRows((prevValue) =>
			update(prevValue, { [queryCurrentTab]: { $set: data } }),
		);
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
			update(prevVal, { [queryCurrentTab]: { $set: {} } }),
		);
	};

	const getTablePanel = useCallback(
		({ state }: TableChildrenFunctionParams) => {
			const selectedItemsCount = Object.keys(state.rowSelection).length;

			if (!selectedItemsCount) return null;

			return (
				<TableActionPanel
					selectedCountItems={selectedItemsCount}
					allCountItems={fileList.length}
					onSelectAll={handleSelectAllRows}
				>
					<ButtonList>
						{queryCurrentTab === 'pending' && (
							<>
								<Button
									label={multilingualT({
										field: 'approveButtonLabel',
										translations: workPackage?.multilingual,
										fallbackValue: workPackage?.approveButtonLabel,
									})}
									onClick={() => {
										onApproveItems(state.rowSelection);
										setWasOnPendingPage(true);
									}}
									loading={approveSelectedItemsMutation.isLoading}
								/>
								<Button
									label={multilingualT({
										field: 'rejectButtonLabel',
										translations: workPackage?.multilingual,
										fallbackValue: workPackage?.rejectButtonLabel,
									})}
									variant="primary_outlined"
									onClick={() => {
										onRejectExtendItems(state.rowSelection);
										setWasOnPendingPage(true);
									}}
								/>
								{isRequestFeedbackAllowed && !currentFeedbackUser && (
									<Button
										label={t('disposition.actions.request_feedback')}
										variant="primary_outlined"
										onClick={() => {
											onRequestFeedback(state.rowSelection);
											setWasOnPendingPage(true);
										}}
									/>
								)}
							</>
						)}

						{queryCurrentTab === 'approved' && (
							<>
								<Button
									label={t('disposition.actions.move_to_pending')}
									icon={ICON_COLLECTION.chevron_right}
									onClick={() => onMoveToPendingItems(state.rowSelection)}
									loading={moveToPendingSelectedItemsMutation.isLoading}
								/>
								<Button
									label={multilingualT({
										field: 'rejectButtonLabel',
										translations: workPackage?.multilingual,
										fallbackValue: workPackage?.rejectButtonLabel,
									})}
									variant="primary_outlined"
									onClick={() => onRejectExtendItems(state.rowSelection)}
								/>
								{isRequestFeedbackAllowed && !currentFeedbackUser && (
									<Button
										label={t('disposition.actions.request_feedback')}
										variant="primary_outlined"
										onClick={() => onRequestFeedback(state.rowSelection)}
									/>
								)}
							</>
						)}
						{queryCurrentTab === 'rejected' && (
							<>
								<Button
									label={t('disposition.actions.move_to_pending')}
									icon={ICON_COLLECTION.chevron_right}
									onClick={() => onMoveToPendingItems(state.rowSelection)}
									loading={moveToPendingSelectedItemsMutation.isLoading}
								/>
								<Button
									label={multilingualT({
										field: 'approveButtonLabel',
										translations: workPackage?.multilingual,
										fallbackValue: workPackage?.approveButtonLabel,
									})}
									variant="primary_outlined"
									loading={approveSelectedItemsMutation.isLoading}
									onClick={() => onApproveItems(state.rowSelection)}
								/>
								{isRequestFeedbackAllowed && !currentFeedbackUser && (
									<Button
										label={t('disposition.actions.request_feedback')}
										variant="primary_outlined"
										onClick={() => onRequestFeedback(state.rowSelection)}
									/>
								)}
							</>
						)}
						{queryCurrentTab === 'feedback_pending' && (
							<>
								<Button
									label={t('disposition.actions.move_to_pending')}
									icon={ICON_COLLECTION.chevron_right}
									onClick={() => onMoveToPendingItems(state.rowSelection)}
									loading={moveToPendingSelectedItemsMutation.isLoading}
								/>
								<Button
									label={multilingualT({
										field: 'approveButtonLabel',
										translations: workPackage?.multilingual,
										fallbackValue: workPackage?.approveButtonLabel,
									})}
									variant="primary_outlined"
									loading={approveSelectedItemsMutation.isLoading}
									onClick={() => onApproveItems(state.rowSelection)}
								/>
								<Button
									label={multilingualT({
										field: 'rejectButtonLabel',
										translations: workPackage?.multilingual,
										fallbackValue: workPackage?.rejectButtonLabel,
									})}
									variant="primary_outlined"
									onClick={() => onRejectExtendItems(state.rowSelection)}
								/>
								{isRequestFeedbackAllowed && !currentFeedbackUser && (
									<Button
										label={t('disposition.actions.modify_feedback')}
										variant="primary_outlined"
										onClick={() => onModifyFeedbackUsers(state.rowSelection)}
									/>
								)}
							</>
						)}
						<Button
							variant="primary_ghost"
							label={t('disposition.actions.cancel_selection')}
							icon={ICON_COLLECTION.cross}
							onClick={handleResetSelectedRows}
						/>
					</ButtonList>
				</TableActionPanel>
			);
		},
		[
			workPackage,
			fileList,
			queryCurrentTab,
			approveSelectedItemsMutation.isLoading,
			moveToPendingSelectedItemsMutation.isLoading,
		],
	);

	const isPageLoading =
		isFileListLoading ||
		isApproversLoading ||
		iswWorkPackageLoading ||
		isLoadingAppConfigs;

	if (isPageLoading) {
		return (
			<Page>
				<PageContent>
					<Spinner />
				</PageContent>
			</Page>
		);
	}

	const isDisplayingFeedbackTab =
		appConfigs?.allowFeedbackRequests ||
		!!workPackage?.feedbackPendingItemCount;
	const isRequestFeedbackAllowed = appConfigs?.allowFeedbackRequests;
	const { currentTab } = queryParams;
	const isNoResult = !fileList.length && !queryParams.search?.trim().length;
	const isNoSearchResult =
		!fileList.length && !!queryParams.search?.trim().length;

	return (
		<>
			{!isWorkPackageError ? (
				<>
					{manageTableColumns.modal}
					<RejectExtendRdaItem
						workPackageId={workPackage?.id}
						rejectButtonLabel={
							multilingualT({
								field: 'rejectButtonLabel',
								translations: workPackage?.multilingual,
								fallbackValue: workPackage?.rejectButtonLabel,
							}) as string
						}
						requestMeta={queryParams.currentTab}
						onSuccess={handleSuccessRejectRdaItem}
					/>
					<AboutRdaWorkPackageModal />
					<RequestRdaItemFeedbackModal
						workPackageId={workPackage?.id}
						requestMeta={queryParams.currentTab}
						onSuccess={handleSuccessRequestFeedback}
					/>
					<ModifyFeedbackModal
						workPackageId={workPackage?.id}
						requestMeta={queryParams.currentTab}
						onSuccess={handleSuccessRequestFeedback}
					/>
					<FetchLoader active={isRefetchingFileList} />

					<Page>
						<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
							<Breadcrumb
								breadcrumb={t('breadcrumbs.rda_assignments')}
								path={
									location.state?.from ||
									DISPOSITIONS_ROUTES.RDA_ASSIGNMENTS_OVERVIEW.path
								}
								isLast
							/>
						</BreadcrumbPortal>

						<PageHeader>
							<PageTitle subHeader={date.formats.pageHead()}>
								{multilingualT({
									field: 'name',
									translations: workPackage?.multilingual,
									fallbackValue: workPackage?.name,
								})}
							</PageTitle>

							<PageHeaderRight>
								<Approvers>
									<Text variant="body_3_primary_bold">
										{t('disposition.approvers')}
									</Text>
									<StyledUserAvatarList>
										{approvers.map((approver) => (
											<ApproverAvatar
												key={approver.userId}
												userId={approver.userId}
												userName={approver.userDisplayName}
												profileImage={approver.userProfileImage}
												isHidden={approver.state === APPROVER_STATES.COMPLETE}
												isActive={approver.state === APPROVER_STATES.ACTIVE}
											/>
										))}
									</StyledUserAvatarList>
								</Approvers>
								<ButtonList>
									<Button
										variant="primary_outlined"
										icon={ICON_COLLECTION.info}
										onClick={onOpenInfo}
									/>

									{canCompleteReviewWorkPackage && (
										<Button
											label={t('disposition.actions.complete')}
											icon={ICON_COLLECTION.chevron_right}
											onClick={handleCompleteReviewWorkPackage}
											loading={completeReviewWorkPackageMutation.isLoading}
										/>
									)}
								</ButtonList>
							</PageHeaderRight>
						</PageHeader>
						<PageContent>
							<TabList value={tabIndex[currentTab]}>
								<TabWithLabel
									onClick={onChangeTab('pending')}
									// label={workPackage?.pendingItemCount ?? 0}
									label={
										currentFeedbackUser
											? currentFeedbackUser.pending
											: workPackage?.pendingItemCount
									}
								>
									{t('disposition.tabs.pending')}
								</TabWithLabel>
								<TabWithLabel
									onClick={onChangeTab('approved')}
									// label={workPackage?.approvedItemCount ?? 0}
									label={
										currentFeedbackUser
											? currentFeedbackUser.approved
											: workPackage?.approvedItemCount
									}
								>
									{multilingualT({
										field: 'approveButtonLabel',
										translations: workPackage?.multilingual,
										fallbackValue:
											workPackage?.approveButtonLabel ??
											t('disposition.tabs.approved'),
									})}
								</TabWithLabel>
								<TabWithLabel
									onClick={onChangeTab('rejected')}
									// label={workPackage?.rejectedItemCount ?? 0}
									label={
										currentFeedbackUser
											? currentFeedbackUser.rejected
											: workPackage?.rejectedItemCount
									}
								>
									{multilingualT({
										field: 'rejectButtonLabel',
										translations: workPackage?.multilingual,
										fallbackValue:
											workPackage?.rejectButtonLabel ??
											t('disposition.tabs.rejected'),
									})}
								</TabWithLabel>
								{isDisplayingFeedbackTab && !currentFeedbackUser && (
									<TabWithLabel
										onClick={onChangeTab('feedback_pending')}
										// label={workPackage?.feedbackPendingItemCount}
										label={
											currentFeedbackUser
												? 0
												: workPackage?.feedbackPendingItemCount
										}
									>
										{t('disposition.tabs.feedback_pending')}
									</TabWithLabel>
								)}
							</TabList>

							<ControlPanel>
								<ControlPanelLeft>
									<SearchBar
										placeholder={t('disposition.table_controls.search')}
										value={queryParams.search}
										onChange={onSearch}
										onClear={onClearSearch}
										isLoading={isSearchingFileList}
										fulfilled
									/>
								</ControlPanelLeft>
								<ControlPanelRight>
									{/* <TableControlWrapper>
										<Toggle
											onChange={toggleFilters}
											checked={isFilterPanelOpen}
											label={t('disposition.table_controls.show_filters')}
										/>
									</TableControlWrapper> */}
									<ManageColumnsButton onClick={manageTableColumns.onManage} />
								</ControlPanelRight>
							</ControlPanel>

							{canCompleteReviewWorkPackage && queryCurrentTab === 'pending' ? (
								<CompleteReviewSection
									onComplete={handleCompleteReviewWorkPackage}
									isCompleteLoading={
										completeReviewWorkPackageMutation.isLoading
									}
								/>
							) : (
								<FilesTable
									tableName={TABLE_NAME}
									currentTab={queryCurrentTab}
									data={fileList}
									sortBy={queryParams.orderBy}
									page={queryParams.page - 1}
									pageSize={filesData?.query.pageSize ?? queryParams.pageSize}
									totalPages={filesData?.stats.pages ?? 0}
									totalItems={filesData?.stats.objects ?? 0}
									isFilterPanelOpen={isFilterPanelOpen}
									isNoSearchResult={isNoSearchResult}
									isNoResult={isNoResult}
									selectedRows={selectedRows[queryCurrentTab]}
									onSelectRow={handleSelectRow}
									onOpenFileInfo={handleOpenFileInfo}
									onChangePageSize={onChangePageSize}
									onChangePage={onChangePage}
									onSortChanged={onSortChanged}
									toggleSelectingAllRows={toggleSelectingAllRows}
									totalFullPath={totalFullPath}
								>
									{getTablePanel}
								</FilesTable>
							)}
						</PageContent>
					</Page>
				</>
			) : (
				<NotFoundPage />
			)}
		</>
	);
};

export default RdaAssignmentPage;
