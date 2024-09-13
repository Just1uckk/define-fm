import React, { useCallback, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { sortBy } from 'lodash';
import { WorkPackageInfoModal } from 'modules/rda-work-packages/features/show-work-package-info/work-package-info';
import { ColumnOrder } from 'modules/rda-work-packages/modals/manage-columns-modal/manage-table-columns-modal';
import { ApproverRightsTable } from 'modules/rda-work-packages/pages/verify-approver-rights/components/approver-rights-table';
import { useModalManager } from 'shared/context/modal-manager';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';
import styled from 'styled-components';

import { ApproverApi } from 'app/api/approver-api/approver-api';
import { DispositionsApi } from 'app/api/dispositions-api/dispositions-api';
import {
	FindRdaAssignmentFilesDto,
	RdaAssignmentsApi,
} from 'app/api/rda-assignments/rda-assignments-api';
import { FindRdaFilesDto } from 'app/api/rda-item-api/rda-item-api';

import { IRdaAssignmentItem } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { DISPOSITIONS_QUERY_KEYS } from 'shared/constants/query-keys';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { DEFAULT_PAGINATION_PAGE_SIZE } from 'shared/hooks/use-manage-pagination';
import { useManageTableColumns } from 'shared/hooks/use-manage-table-columns';
import { useTranslation } from 'shared/hooks/use-translation';

import { Breadcrumb } from 'shared/components/breadcrumbs/breadcrumb';
import { BreadcrumbPortal } from 'shared/components/breadcrumbs/breadcrumb-portal';
import { BREADCRUMB_CONTAINER } from 'shared/components/breadcrumbs/breadcrumbs';
import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { SearchBar } from 'shared/components/search-bar/search-bar';
import { Spinner } from 'shared/components/spinner/spinner';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
import { ManageColumnsButton } from 'shared/components/table-controls/manage-columns-button';
import { Title } from 'shared/components/title/title';
import { Toggle } from 'shared/components/toggle/toggle';

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

const PageContent = styled.div`
	margin-top: 1.7rem;
`;

const TableWrapper = styled.div`
	margin-top: 1.5rem;
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
	included?: number;
};

const TABLE_NAME = 'verify-approver-rights';

const DispositionVerifyApproverRightsPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t, currentLang } = useTranslation();
	const modalManager = useModalManager();

	const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
	const [queryParams, setQueryParams] = useState<TableFindParams>(() => {
		const initialSettings =
			MemoryManagingTableSettings.getSavedSettings(TABLE_NAME);

		return {
			search: '',
			page: 1,
			pageSize: initialSettings.pageSize || DEFAULT_PAGINATION_PAGE_SIZE,
			orderBy: '',
		};
	});

	const { data: disposition, isLoading: isDispositionLoading } = useQuery(
		DISPOSITIONS_QUERY_KEYS.disposition(Number(id)),
		() => DispositionsApi.getDisposition({ id: Number(id) }),
	);

	const { data: approvers = {}, isLoading: isApproversLoading } = useQuery(
		DISPOSITIONS_QUERY_KEYS.approvers(Number(id)),
		{
			queryFn: () => ApproverApi.getRdaApproversById({ id: Number(id) }),
			select: useCallback((approvers) => sortBy(approvers, 'approverId'), []),
		},
	);

	const {
		data: filesData,
		refetchData: refetchFiles,
		searchData: searchFiles,
		isInitialLoading: isRdaFileListLoading,
		isSearching: isRdaFilesSearchLoading,
	} = useFilterRequest<
		IRdaAssignmentItem[],
		Partial<TableFindParams>,
		FindRdaAssignmentFilesDto
	>({
		request: (params) => {
			return RdaAssignmentsApi.findAssignmentItems(getFindFilesParams(params));
		},
		searchRequest: (params) => {
			return RdaAssignmentsApi.findAssignmentItems(params);
		},
	});
	const fileList = filesData?.results ?? [];

	const tableColumnList: Record<ColumnOrder['id'], ColumnOrder> =
		useMemo(() => {
			return {
				name: {
					id: 'name',
					name: t('disposition.table_columns.full_name'),
					required: true,
				},
				parent: {
					id: 'parent',
					name: t('disposition.table_columns.location'),
				},
			};
		}, [currentLang]);

	const manageTableColumns = useManageTableColumns({
		tableName: TABLE_NAME,
		columns: tableColumnList,
	});

	useEffectAfterMount(() => {
		searchFiles(() => getFindFilesParams(queryParams));
	}, [queryParams]);

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
			],
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.search.trim().length) {
			parsedParams.elements.push({
				fields: ['name', 'location'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		return parsedParams;
	}

	const onOpenInfo = () => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.DISPOSITION_INFO,
			Number(id),
		);
	};

	const onSearch = async (value: string) => {
		const params = {
			...queryParams,
			name: value,
			page: 1,
		};
		setQueryParams(params);
	};

	const onClearSearch = async () => {
		const params = {
			...queryParams,
			name: '',
			page: 1,
		};
		setQueryParams(params);
	};

	const onChangePage = (page: number) => {
		setQueryParams((prevValue) => ({
			...prevValue,
			page: page + 1,
		}));

		refetchFiles({ page: page + 1 });
	};

	const onChangePageSize = (size: number) => {
		setQueryParams((prevValue) => ({
			...prevValue,
			pageSize: size,
		}));

		refetchFiles({ pageSize: size });
	};

	const toggleFilters = () => setIsFilterPanelOpen((prevValue) => !prevValue);

	const isNoResult = !fileList?.length && !queryParams.search?.trim().length;
	const isNoSearchResult =
		!fileList?.length && !!queryParams.search?.trim().length;

	const isDataLoading = isDispositionLoading || isApproversLoading;

	if (isDataLoading || !disposition) {
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
			{manageTableColumns.modal}
			<WorkPackageInfoModal />
			<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
				<Breadcrumb
					breadcrumb={t('breadcrumbs.rda_work_packages')}
					path={DISPOSITIONS_ROUTES.RDA_WORK_PACKAGES_OVERVIEW.path}
					isLast
				/>
			</BreadcrumbPortal>
			<Page>
				<PageHeader>
					<PageTitle>Verify Approver Rights: {disposition?.name}</PageTitle>

					<PageHeaderRight>
						<Button
							variant="primary_outlined"
							icon={ICON_COLLECTION.info}
							label={t('disposition_report.actions.info')}
							onClick={onOpenInfo}
						/>
					</PageHeaderRight>
				</PageHeader>
				<PageContent>
					<TableWrapper>
						<ControlPanel>
							<ControlPanelLeft>
								<SearchBar
									placeholder={t('disposition.table_controls.search')}
									value={queryParams.search}
									onChange={onSearch}
									onClear={onClearSearch}
									isLoading={isRdaFilesSearchLoading}
									fulfilled
								/>
							</ControlPanelLeft>
							<ControlPanelRight>
								<TableControlWrapper>
									<Toggle
										onChange={toggleFilters}
										checked={isFilterPanelOpen}
										label={t('disposition.table_controls.show_filters')}
									/>
								</TableControlWrapper>
								<ManageColumnsButton onClick={manageTableColumns.onManage} />
							</ControlPanelRight>
						</ControlPanel>
						{!isRdaFileListLoading && (
							<ApproverRightsTable
								tableName={TABLE_NAME}
								approvers={approvers}
								data={fileList}
								filters={filesData?.stats.filters}
								page={queryParams.page - 1}
								pageSize={filesData?.query?.pageSize ?? queryParams.pageSize}
								totalPages={filesData?.stats.pages ?? 0}
								totalItems={filesData?.stats.objects ?? 0}
								isFilterPanelOpen={isFilterPanelOpen}
								isNoSearchResult={isNoSearchResult}
								isNoResult={isNoResult}
								onChangePageSize={onChangePageSize}
								onChangePage={onChangePage}
							/>
						)}
						{isRdaFileListLoading && <Spinner />}
					</TableWrapper>
				</PageContent>
			</Page>
		</>
	);
};

export default DispositionVerifyApproverRightsPage;
