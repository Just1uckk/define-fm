import React from 'react';
import { useQuery } from 'react-query';
import { createColumnHelper, Row } from '@tanstack/react-table';
import { ParentPathCell } from 'modules/rda-work-packages/components/files-table-components/parent-path-cell';
import { ColumnOrder } from 'modules/rda-work-packages/modals/manage-columns-modal/manage-table-columns-modal';
import { NoFiles } from 'modules/rda-work-packages/pages/rda-assignment/components/no-files';
import { NoFilesSearchResult } from 'modules/rda-work-packages/pages/rda-assignment/components/no-search-result';
import { RdaWorkPackageTabs } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-pending/use-rda-work-package';
import styled from 'styled-components';

import { RdaItemApi } from 'app/api/rda-item-api/rda-item-api';

import { IFile } from 'shared/types/dispositions';

import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useManageTableSettings } from 'shared/hooks/use-manage-table-settings';
import { useTranslation } from 'shared/hooks/use-translation';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Image } from 'shared/components/image/image';
import {
	Table,
	TableProps,
	TableSortState,
} from 'shared/components/table/table';
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
	tableName: string;
	currentTab: RdaWorkPackageTabs;
	data: IFile[];
	filters: FilterPanelProps['filters'];
	activeFilters: FilterPanelProps['activeFilters'];
	sortBy?: string | `-${string}`;
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	selectedRows: Record<IFile['id'], boolean>;
	isSelectableRows?: boolean;
	isNoSearchResult: boolean;
	isNoResult: boolean;
	isFilterPanelOpen: boolean;
	onOpenFileInfo: (
		e: React.MouseEvent<HTMLAnchorElement>,
		file: IFile,
		idx: number,
	) => void;
	onChangePageSize: (size: number) => void;
	onChangePage: (page: number) => void;
	onSortChanged: (state: TableSortState) => void;
	onChangeFilter: FilterPanelProps['onChange'];
	onClearFilters: FilterPanelProps['onClearFilters'];
	onSelectRow?: (row: Row<IFile>) => void;
	toggleSelectingAllRows: (row: Record<IFile['id'], boolean>) => void;
	children?: TableProps<IFile>['children'];
}

export const FilesTable: React.FC<FilesTableProps> = ({
	tableName,
	data,
	filters,
	activeFilters,
	sortBy,
	currentTab,
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
	onChangeFilter,
	onClearFilters,
	onSelectRow,
	toggleSelectingAllRows,
	children,
}) => {
	const {
		currentLang,
		formats: { base },
	} = useDate();
	const { t } = useTranslation();

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
		queryKey: ['fullPathPending', data[data.length - 1]?.id],
		queryFn: async () => {
			const arrayIds: number[] = [];
			data.forEach((element) => arrayIds.push(element.id));
			return await RdaItemApi.getFileFullPathTotal({ arrayIds });
		},
	});

	const columns = React.useMemo(() => {
		const columns = [
			columnHelper.accessor('name', {
				header: () => t('disposition.table_columns.full_name'),
				cell: ({ getValue, row }) => (
					<>
						{row.original.gif && (
							<FileIcon src={row.original.gif} loading="lazy" />
						)}
						{row.original.namePath ? (
							<a href={row.original.namePath} target="_blank" rel="noreferrer">
								{getValue()}
							</a>
						) : (
							getValue()
						)}
						{/* <InfoLink
							href={DISPOSITIONS_ROUTES.FILE_INFO.generate.external(
								row.original.rdaId,
								row.original.id,
							)}
							target="popup"
							onClick={(e) => onOpenFileInfo(e, row.original, row.index)}
						>
							<Icon icon={ICON_COLLECTION.info} />
						</InfoLink> */}
					</>
				),
				size: 296,
			}),
			columnHelper.accessor('parent', {
				header: () => t('disposition.table_columns.location'),
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
				header: () => t('disposition.table_columns.unique_id'),
				size: 99,
			}),
			columnHelper.accessor('classificationName', {
				header: () => t('disposition.table_columns.rm_class'),
				cell: ({ getValue }) => {
					const value = getValue();

					return value ? value : '-';
				},
				size: 99,
			}),
		];

		if (currentTab === RdaWorkPackageTabs.included_items) {
			columns.push(
				columnHelper.accessor('status', {
					header: () => t('disposition.table_columns.status'),
					size: 99,
				}),
				columnHelper.accessor('statusDate', {
					header: () => t('disposition.table_columns.status_date'),
					cell: ({ getValue }) => {
						const value = getValue();

						return value ? base(value) : '-';
					},
					size: 99,
				}),
				// columnHelper.accessor('calculatedDate', {
				// 	header: () => t('disposition.table_columns.calc_date'),
				// 	cell: ({ getValue }) => {
				// 		const value = getValue();

				// 		return value ? base(value) : '-';
				// 	},
				// 	size: 99,
				// }),
			);
		}

		if (currentTab === RdaWorkPackageTabs.excluded_items) {
			columns.push(
				columnHelper.accessor('comment', {
					header: () => t('disposition.table_columns.exclusion_reason'),
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
	}, [currentTab, currentLang, onOpenFileInfo, fullPath]);

	const getIsRowSelectDisabled = (row: Row<IFile>) => {
		const rowData = row.original;

		return currentTab === 'excluded_items' && rowData.includedIn !== null;
	};

	return (
		<Container>
			<TableWrapper>
				{isNoResult && <NoFiles />}
				{isNoSearchResult && <NoFilesSearchResult />}
				{!isNoSearchResult && !isNoResult && (
					<Table<IFile>
						name={tableName}
						sortable
						sortBy={sortBy}
						data={data}
						columns={columns}
						page={page}
						totalPages={totalPages}
						pageSize={pageSize}
						totalItems={totalItems}
						selectedRowIds={selectedRows}
						isSelectableRows={isSelectableRows}
						getIsRowSelectDisabled={getIsRowSelectDisabled}
						onChangePage={onChangePage}
						onChangePageSize={onChangePageSize}
						onSortChanged={onSortChanged}
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
					activeFilters={activeFilters}
					onChange={onChangeFilter}
					onClearFilters={onClearFilters}
				/>
			)}
		</Container>
	);
};
