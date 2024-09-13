import React, { memo } from 'react';
import { createColumnHelper, Row } from '@tanstack/react-table';
import { ParentPathCell } from 'modules/rda-work-packages/components/files-table-components/parent-path-cell';
import { FeedbackHistory } from 'modules/rda-work-packages/pages/rda-assignment/components/files-table/feedback-history';
import { NoFiles } from 'modules/rda-work-packages/pages/rda-assignment/components/no-files';
import { NoFilesSearchResult } from 'modules/rda-work-packages/pages/rda-assignment/components/no-search-result';
import { RdaAssignmentsTabs } from 'modules/rda-work-packages/pages/rda-assignment/rda-assignment';
import styled from 'styled-components';

import { IRdaAssignmentItem } from 'shared/types/dispositions';

import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useTranslation } from 'shared/hooks/use-translation';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { Image } from 'shared/components/image/image';
import {
	Table,
	TableProps,
	TableSortState,
} from 'shared/components/table/table';
import { FilterPanel } from 'shared/components/table-controls/filter-panel/filter-panel';

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

const columnHelper = createColumnHelper<IRdaAssignmentItem>();

interface FilesTableProps {
	totalFullPath: any;
	tableName: string;
	currentTab: RdaAssignmentsTabs;
	data: IRdaAssignmentItem[];
	sortBy?: string | `-${string}`;
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	selectedRows: Record<IRdaAssignmentItem['id'], boolean>;
	isSelectableRows?: boolean;
	isNoSearchResult: boolean;
	isNoResult: boolean;
	isFilterPanelOpen: boolean;
	onOpenFileInfo: (
		e: React.MouseEvent<HTMLAnchorElement>,
		file: IRdaAssignmentItem,
		idx: number,
	) => void;
	onSelectRow?: (row: Row<IRdaAssignmentItem>) => void;
	onChangePageSize: (size: number) => void;
	onChangePage: (page: number) => void;
	onSortChanged: (state: TableSortState) => void;
	toggleSelectingAllRows: (
		data: Record<IRdaAssignmentItem['id'], boolean>,
	) => void;
	children?: TableProps<IRdaAssignmentItem>['children'];
}

const FilesTableComponent = ({
	totalFullPath,
	tableName,
	currentTab,
	data,
	sortBy,
	page,
	pageSize,
	totalPages,
	totalItems,
	selectedRows,
	isSelectableRows = true,
	isNoSearchResult,
	isNoResult,
	isFilterPanelOpen,
	onOpenFileInfo,
	onChangePage,
	onChangePageSize,
	onSortChanged,
	onSelectRow,
	toggleSelectingAllRows,
	children,
}: FilesTableProps) => {
	const {
		formats: { base },
	} = useDate();
	const { t, currentLang } = useTranslation();

	const renderSubComponent = ({ row }: { row: Row<IRdaAssignmentItem> }) => {
		return <FeedbackHistory id={row.id} />;
	};

	const columns = React.useMemo(() => {
		const columns = [
			columnHelper.accessor('item.name', {
				id: 'item.name',
				header: () => t('disposition.table_columns.full_name'),
				cell: ({ getValue, row }) => {
					const value = getValue();

					return (
						<>
							{row.original.item.gif && (
								<FileIcon src={row.original.item.gif} loading="lazy" />
							)}
							{row.original.item.namePath ? (
								<a
									href={row.original.item.namePath}
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
									row.original.item.rdaId,
									row.original.id,
								)}
								target="popup"
								onClick={(e) => onOpenFileInfo(e, row.original, row.index)}
							>
								<Icon icon={ICON_COLLECTION.info} />
							</InfoLink>
						</>
					);
				},
				size: 296,
			}),
			columnHelper.accessor('item.parent', {
				id: 'item.parent',
				header: () => t('disposition.table_columns.location'),
				cell: ({ getValue, row }) => (
					<ParentPathCell
						fileId={row.original.item.id}
						fileName={row.original.item.name}
						parentName={getValue() || '-'}
						parentPath={totalFullPath}
					/>
				),
				size: 136,
			}),

			columnHelper.accessor('item.uniqueId', {
				id: 'item.uniqueId',
				header: () => t('disposition.table_columns.unique_id'),
				size: 99,
			}),
			columnHelper.accessor('item.classificationName', {
				id: 'item.classificationName',
				header: () => t('disposition.table_columns.rm_class'),
				cell: ({ getValue }) => {
					const value = getValue();

					return value ? value : '-';
				},
				size: 99,
			}),
			columnHelper.accessor('item.status', {
				id: 'item.status',
				header: () => t('disposition.table_columns.status'),
				size: 99,
			}),
			columnHelper.accessor('item.statusDate', {
				id: 'item.statusDate',
				header: () => t('disposition.table_columns.status_date'),
				cell: ({ getValue }) => {
					const value = getValue();

					return value ? base(value) : '-';
				},
				size: 99,
			}),
			columnHelper.accessor('item.calculatedDate', {
				id: 'item.calculatedDate',
				header: () => t('disposition.table_columns.calc_date'),
				cell: ({ getValue }) => {
					const value = getValue();

					return value ? base(value) : '-';
				},
				size: 99,
			}),
		];

		if (currentTab === 'feedback_pending') {
			columns.push(
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				columnHelper.accessor('item.id', {
					id: 'item.toggle_button',
					header: () => null,
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
					enableSorting: false,
					size: 30,
				}),
			);
		}

		return columns;
	}, [currentLang, onOpenFileInfo, currentTab, totalFullPath]);

	return (
		<Container>
			<TableWrapper>
				{isNoResult && <NoFiles />}
				{isNoSearchResult && <NoFilesSearchResult />}
				{!isNoSearchResult && !isNoResult && (
					<Table<IRdaAssignmentItem>
						name={tableName}
						sortable
						data={data}
						columns={columns}
						sortBy={sortBy}
						page={page}
						totalPages={totalPages}
						pageSize={pageSize}
						totalItems={totalItems}
						selectedRowIds={selectedRows}
						isSelectableRows={isSelectableRows}
						onChangePage={onChangePage}
						onChangePageSize={onChangePageSize}
						onSortChanged={onSortChanged}
						onSelectRow={onSelectRow}
						toggleSelectingAllRows={toggleSelectingAllRows}
						renderSubComponent={renderSubComponent}
					>
						{children}
					</Table>
				)}
			</TableWrapper>
			{isFilterPanelOpen && <StyledFilterPanel />}
		</Container>
	);
};

FilesTableComponent.displayName = 'FilesTable';

export const FilesTable = memo(FilesTableComponent);
