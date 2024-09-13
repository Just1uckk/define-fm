import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { keyBy } from 'lodash';
import { ApproverAvatar } from 'modules/rda-work-packages/components/approver-avatar/approver-avatar';
import { ParentPathCell } from 'modules/rda-work-packages/components/files-table-components/parent-path-cell';
import { ColumnOrder } from 'modules/rda-work-packages/modals/manage-columns-modal/manage-table-columns-modal';
import { NoFiles } from 'modules/rda-work-packages/pages/rda-assignment/components/no-files';
import { NoFilesSearchResult } from 'modules/rda-work-packages/pages/rda-assignment/components/no-search-result';
import { TABLE_NAMES } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/use-rda-report';
import styled from 'styled-components';

import { RdaItemApi } from 'app/api/rda-item-api/rda-item-api';
import {
	FindEntityRequest,
	FindEntityResponseFilterGroup,
} from 'app/api/types';

import { IApprover, IFile } from 'shared/types/dispositions';

import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useManageTableSettings } from 'shared/hooks/use-manage-table-settings';
import { useTranslation } from 'shared/hooks/use-translation';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Image } from 'shared/components/image/image';
import { Table } from 'shared/components/table/table';
import {
	FilterPanel,
	FilterPanelProps,
} from 'shared/components/table-controls/filter-panel/filter-panel';

const Container = styled.div`
	display: flex;
	align-items: flex-start;
`;

const TableWrapper = styled.div`
	flex-grow: 1;
	margin-top: 0.875rem;
	overflow: hidden;
`;

const FileIcon = styled(Image)`
	width: 20px;
	margin-right: 0.5rem;
`;

const InfoLink = styled.a`
	display: flex;
	align-items: center;
	margin-left: 0.6rem;
`;

const StyledFilterPanel = styled(FilterPanel)`
	margin-top: 0.875rem;
`;

// const Feedback = styled.div`
// 	display: flex;
// 	gap: 12px;
// `;

// const FeedbackSeparator = styled(Icon)`
// 	margin: 0 12px;
// `;

const columnHelper = createColumnHelper<IFile>();

interface FilesTableProps {
	tableName?: keyof typeof TABLE_NAMES;
	filters?: FindEntityResponseFilterGroup[];
	selectedFilters: FindEntityRequest['elements'];
	selectedRows: Record<IFile['id'], boolean>;
	approvers: IApprover[];
	// data: IRdaAssignmentItem[];
	data: IFile[];
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	isSelectableRows?: boolean;
	isNoSearchResult: boolean;
	isNoResult: boolean;
	isFilterPanelOpen: boolean;
	onSelectEntity?: () => void;
	onChangePageSize: (size: number) => void;
	onChangePage: (page: number) => void;
	onChangeFilter: FilterPanelProps['onChange'];
	onClearFilters: FilterPanelProps['onClearFilters'];
}

export const FilesTable: React.FC<React.PropsWithChildren<FilesTableProps>> = ({
	tableName,
	filters,
	selectedFilters,
	selectedRows,
	approvers,
	data,
	page,
	pageSize,
	totalPages,
	totalItems,
	isSelectableRows = true,
	isNoSearchResult,
	isNoResult,
	isFilterPanelOpen,
	onChangePage,
	onChangePageSize,
	onChangeFilter,
	onClearFilters,
	children,
}) => {
	const { t, currentLang } = useTranslation();

	const sortedApprovers = useMemo(() => {
		return keyBy(approvers, 'approverId');
	}, [approvers]);

	const manageTableSettingsss = useManageTableSettings();
	const settings = manageTableSettingsss.getSavedSettings<{
		columns?: ColumnOrder[];
	}>(tableName);

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

	const { data: fullPath } = useQuery({
		enabled: data.length >= 1 && isEnabled(),
		queryKey: ['fullPathComplete', data[data.length - 1]?.id],
		queryFn: async () => {
			const arrayIds: number[] = [];
			data.forEach((element) => arrayIds.push(element.id));
			return await RdaItemApi.getFileFullPathTotal({ arrayIds });
		},
	});

	const onOpenFileInfo = (
		e: React.MouseEvent<HTMLAnchorElement>,
		item: IFile,
	) => {
		e.preventDefault();

		window.open(
			DISPOSITIONS_ROUTES.FILE_INFO.generate.external(
				item.rdaId,
				item.id,
				'report',
			),
			`${item.rdaId}${item.id}`,
			'left=300,top=250,width=548,height=523',
		);
	};

	const transformDate = (date: string): string => {
		const newDate = new Date(date);
		const day = newDate.getDate();
		const month = newDate.getMonth() + 1;
		const year = newDate.getFullYear();

		const formattedDate = `${day}/${month}/${year}`;

		return formattedDate;
	};

	const columns = React.useMemo(() => {
		const columns: ColumnDef<IFile, any>[] = [
			columnHelper.accessor('name', {
				id: 'name',
				header: () => t('rda_report.table.columns.full_name'),
				cell: ({ getValue, row }) => {
					const value = getValue();

					return (
						<>
							{row.original.gif && <FileIcon src={row.original.gif} />}

							{row.original.namePath ? (
								<a
									href={row.original.namePath}
									target="_blank"
									rel="noreferrer"
								>
									{value}
								</a>
							) : (
								value
							)}
							<InfoLink
								href={DISPOSITIONS_ROUTES.FILE_INFO.generate.external(
									row.original.rdaId,
									row.original.id,
									'report',
								)}
								target="popup"
								onClick={(e) => onOpenFileInfo(e, row.original)}
							>
								<Icon icon={ICON_COLLECTION.info} />
							</InfoLink>
						</>
					);
				},
				size: 296,
			}),
			columnHelper.accessor('parent', {
				header: () => t('rda_report.table.columns.location'),
				cell: ({ getValue, row }) => (
					<ParentPathCell
						fileId={row.original.id}
						fileName={row.original.name}
						parentName={getValue() || '-'}
						parentPath={fullPath}
					/>
				),
				size: 136,
			}),
			columnHelper.accessor('uniqueId', {
				header: () => t('rda_report.table.columns.unique_id'),
				size: 99,
			}),
			// columnHelper.accessor('calculatedDate', {
			// 	header: () => t('rda_report.table.columns.calc_date'),
			// 	cell: ({ getValue }) => {
			// 		const value = getValue();

			// 		return value ? transformDate(value) : '-';
			// 	},
			// 	size: 99,
			// }),
			columnHelper.accessor('approvals', {
				header: () => t('rda_report.table.columns.approval_status'),
				cell: ({ row }) => {
					if (row.original.approvals && row.original.approvals.length) {
						return row.original.approvals.map((approval) => (
							<ApproverAvatar
								key={approval.userId}
								userId={approval.userId}
								profileImage={Number(approval.userProfile)}
								userName={approval.userDisplay}
								approvalState={approval.state === 0 ? 3 : approval.state}
							/>
						));
					} else {
						return null;
					}
				},
				enableSorting: false,
				size: 99,
			}),
			// columnHelper.accessor('state', {
			// 	header: () => t('rda_report.table.columns.status'),
			// 	cell: ({ row }) => {
			// 		const state = row.original.state;

			// 		return (
			// 			<Badge>{t('rda_item_state', { returnObjects: true })[state]}</Badge>
			// 		);
			// 	},
			// 	size: 99,
			// }),

			// columnHelper.accessor('feedback', {
			// 	header: () => t('rda_report.table.columns.feedback_users'),
			// 	cell: ({ row }) => {
			// 		const feedbackList = row.original.feedback;
			// 		const initiatedUser = sortedApprovers[row.original.approverId];

			// 		return (
			// 			<>
			// 				{!!feedbackList.length && (
			// 					<>
			// 						<ApproverAvatar userName={initiatedUser.userDisplayName} />
			// 						<FeedbackSeparator icon={ICON_COLLECTION.chevron_right} />
			// 					</>
			// 				)}

			// 				{feedbackList.map((approverId) => {
			// 					const user = sortedApprovers[approverId];

			// 					if (!user) return null;

			// 					return (
			// 						<Feedback key={approverId}>
			// 							<ApproverAvatar
			// 								userId={user.userId}
			// 								userName={user.userDisplayName}
			// 								profileImage={user.userProfileImage}
			// 							/>
			// 						</Feedback>
			// 					);
			// 				})}
			// 			</>
			// 		);
			// 	},
			// 	enableSorting: false,
			// 	size: 99,
			// }),

			// columnHelper.accessor('reason', {
			// 	header: () => t('rda_report.table.columns.reason'),
			// 	cell: ({ getValue }) => {
			// 		const value = getValue();

			// 		return value || '-';
			// 	},
			// 	size: 99,
			// }),

			// columnHelper.accessor('itemComment', {
			// 	header: () => t('rda_report.table.columns.comment'),
			// 	cell: ({ getValue }) => {
			// 		const value = getValue();

			// 		return value || '-';
			// 	},
			// 	size: 99,
			// }),
		];

		return columns;
	}, [currentLang, fullPath]);

	return (
		<Container>
			<TableWrapper>
				{isNoResult && <NoFiles />}
				{isNoSearchResult && <NoFilesSearchResult />}
				{!isNoSearchResult && !isNoResult && (
					<Table<IFile>
						name={tableName}
						data={data}
						columns={columns}
						page={page}
						totalPages={totalPages}
						pageSize={pageSize}
						totalItems={totalItems}
						isSelectableRows={isSelectableRows}
						selectedRowIds={selectedRows}
						onChangePage={onChangePage}
						onChangePageSize={onChangePageSize}
					>
						{children}
					</Table>
				)}
			</TableWrapper>
			{isFilterPanelOpen && (
				<StyledFilterPanel
					dataList={data}
					filters={filters}
					activeFilters={selectedFilters}
					onChange={onChangeFilter}
					onClearFilters={onClearFilters}
				/>
			)}
		</Container>
	);
};
