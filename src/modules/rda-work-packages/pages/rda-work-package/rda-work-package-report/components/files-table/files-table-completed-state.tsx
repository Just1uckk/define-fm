import React from 'react';
import { useQuery } from 'react-query';
import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { ApproverAvatar } from 'modules/rda-work-packages/components/approver-avatar/approver-avatar';
import { ParentPathCell } from 'modules/rda-work-packages/components/files-table-components/parent-path-cell';
import { ColumnOrder } from 'modules/rda-work-packages/modals/manage-columns-modal/manage-table-columns-modal';
import { NoFiles } from 'modules/rda-work-packages/pages/rda-assignment/components/no-files';
import { NoFilesSearchResult } from 'modules/rda-work-packages/pages/rda-assignment/components/no-search-result';
import { ApprovalHistoryTable } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/files-table/approval-history-table';
import {
	TAB_INDEX_FOR_COMPLETED_STATE,
	TABLE_NAMES,
} from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/use-rda-report';
import styled from 'styled-components';

import { RdaItemApi } from 'app/api/rda-item-api/rda-item-api';
import {
	FindEntityRequest,
	FindEntityResponseFilterGroup,
} from 'app/api/types';

import { IFile } from 'shared/types/dispositions';

import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useManageTableSettings } from 'shared/hooks/use-manage-table-settings';
import { useTranslation } from 'shared/hooks/use-translation';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
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

const columnHelper = createColumnHelper<IFile>();

interface FilesTableProps {
	tableName?: keyof typeof TABLE_NAMES;
	filters?: FindEntityResponseFilterGroup[];
	selectedFilters: FindEntityRequest['elements'];
	tabIndex: TAB_INDEX_FOR_COMPLETED_STATE;
	data: IFile[];
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	selectedRows: Record<IFile['id'], boolean>;
	isSelectableRows?: boolean;
	isNoSearchResult: boolean;
	isNoResult: boolean;
	isFilterPanelOpen: boolean;
	onSelectEntity?: () => void;
	toggleSelectingAllRows?: (data: Record<number, boolean>) => void;
	onChangePageSize: (size: number) => void;
	onChangePage: (page: number) => void;
	onSelectRow?: (row: Row<IFile>) => void;
	onChangeFilter: FilterPanelProps['onChange'];
	onClearFilters: FilterPanelProps['onClearFilters'];
}

export const FilesTableCompletedState: React.FC<
	React.PropsWithChildren<FilesTableProps>
> = ({
	tabIndex,
	tableName,
	filters,
	selectedFilters,
	data,
	page,
	pageSize,
	totalPages,
	totalItems,
	selectedRows,
	isNoSearchResult,
	isNoResult,
	isFilterPanelOpen,
	onChangePage,
	onChangePageSize,
	onSelectRow,
	onChangeFilter,
	onClearFilters,
	toggleSelectingAllRows,
	children,
}) => {
	const { t, currentLang } = useTranslation();
	const {
		formats: { base },
	} = useDate();

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

	const columns = React.useMemo(() => {
		const columns: ColumnDef<IFile, any>[] = [
			columnHelper.accessor('name', {
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
			columnHelper.accessor('classificationName', {
				header: () => t('rda_report.table.columns.rm_class'),
				cell: ({ getValue }) => {
					const value = getValue();

					return value ? base(value) : '-';
				},
				size: 99,
			}),
		];

		if (tabIndex === TAB_INDEX_FOR_COMPLETED_STATE.APPROVED) {
			columns.splice(
				1,
				0,
				columnHelper.accessor('action', {
					id: 'action',
					header: () => t('rda_report.table.columns.action'),
					cell: ({ row }) => {
						const value = row.original.dispositionAction.name;

						return value;
					},
					size: 80,
					enableSorting: false,
				}),
			);
		}

		if (
			tabIndex === TAB_INDEX_FOR_COMPLETED_STATE.UNDECIDED ||
			tabIndex === TAB_INDEX_FOR_COMPLETED_STATE.APPROVED
		) {
			columns.push(
				columnHelper.accessor('approvals', {
					header: () => t('rda_report.table.columns.approval_status'),
					cell: ({ row }) => {
						return row.original.approvals.map((approval) => (
							<ApproverAvatar
								key={approval.userId}
								userId={approval.userId}
								profileImage={Number(approval.userProfile)}
								userName={approval.userDisplay}
								approvalState={approval.state}
							/>
						));
					},
					enableSorting: false,
					size: 99,
				}),
			);
		}

		if (tabIndex === TAB_INDEX_FOR_COMPLETED_STATE.REJECTED) {
			columns.push(
				columnHelper.accessor('approvalHistory', {
					id: 'exclusion_reason',
					header: () => t('rda_report.table.columns.exclusion_reason'),
					cell: ({ row }) => {
						const lastDecision = row.original.approvalHistory.at(-1);

						return lastDecision ? lastDecision.reason : '-';
					},
					size: 160,
					enableSorting: false,
				}),
				columnHelper.accessor('approvalHistory', {
					id: 'exclusion_comment',
					header: () => t('rda_report.table.columns.exclusion_comment'),
					cell: ({ row }) => {
						const lastDecision = row.original.approvalHistory.at(-1);

						return lastDecision ? lastDecision.itemComment : '-';
					},
					size: 160,
					enableSorting: false,
				}),

				columnHelper.accessor('id', {
					id: 'expanding',
					header: () => '',
					enableSorting: false,
					cell: ({ row }) => {
						return (
							<IconButton
								onPress={row.getToggleExpandedHandler()}
								icon={
									row.getIsExpanded()
										? ICON_COLLECTION.chevron_down
										: ICON_COLLECTION.chevron_right
								}
							/>
						);
					},
					size: 30,
				}),
			);
		}

		if (tabIndex === TAB_INDEX_FOR_COMPLETED_STATE.EXCLUDED_ITEMS) {
			columns.push(
				columnHelper.accessor('comment', {
					header: () => t('rda_report.table.columns.comment'),
					cell: ({ getValue, row }) => {
						const value = getValue();

						return value ? (
							<a
								href={DISPOSITIONS_ROUTES.RDA_WORK_PACKAGE.generateExternal(
									row.original.rdaId,
								)}
								rel="noreferrer"
								target="_blank"
							>
								{value}
							</a>
						) : (
							'-'
						);
					},
					size: 140,
				}),
			);
		}

		return columns;
	}, [tabIndex, currentLang, fullPath]);

	const renderSubComponent = ({ row }: { row: Row<IFile> }) => {
		return <ApprovalHistoryTable data={row.original.approvalHistory} />;
	};

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
						selectedRowIds={selectedRows}
						isSelectableRows={
							tabIndex === TAB_INDEX_FOR_COMPLETED_STATE.APPROVED ||
							tabIndex === TAB_INDEX_FOR_COMPLETED_STATE.REJECTED
						}
						onChangePage={onChangePage}
						onChangePageSize={onChangePageSize}
						renderSubComponent={renderSubComponent}
						onSelectRow={onSelectRow}
						toggleSelectingAllRows={toggleSelectingAllRows}
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
