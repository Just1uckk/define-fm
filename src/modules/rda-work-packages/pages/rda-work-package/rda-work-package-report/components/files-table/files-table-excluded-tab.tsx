import React from 'react';
import { useQuery } from 'react-query';
import { createColumnHelper, Row } from '@tanstack/react-table';
import { ParentPathCell } from 'modules/rda-work-packages/components/files-table-components/parent-path-cell';
import { ColumnOrder } from 'modules/rda-work-packages/modals/manage-columns-modal/manage-table-columns-modal';
import { NoFiles } from 'modules/rda-work-packages/pages/rda-assignment/components/no-files';
import { NoFilesSearchResult } from 'modules/rda-work-packages/pages/rda-assignment/components/no-search-result';
import { ApprovalHistoryTable } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/files-table/approval-history-table';
import { TABLE_NAMES } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/use-rda-report';
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
import { Image } from 'shared/components/image/image';
import { Table } from 'shared/components/table/table';
import {
	FilterPanel,
	FilterPanelProps,
} from 'shared/components/table-controls/filter-panel/filter-panel';

import { RdaWorkPackageTabs } from '../../../rda-work-package-pending/use-rda-work-package';

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

export const FilesTableExcludedTab: React.FC<
	React.PropsWithChildren<FilesTableProps>
> = ({
	tableName,
	filters,
	selectedFilters,
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
	const {
		formats: { base },
	} = useDate();

	const onOpenFileInfo = (
		e: React.MouseEvent<HTMLAnchorElement>,
		item: IFile,
	) => {
		e.preventDefault();

		window.open(
			DISPOSITIONS_ROUTES.FILE_INFO.generate.external(
				item.rdaId,
				item.id,
				RdaWorkPackageTabs.excluded_items,
			),
			`${item.rdaId}${item.id}`,
			'left=300,top=250,width=548,height=523',
		);
	};

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

	const columns = React.useMemo(() => {
		const columns = [
			columnHelper.accessor('name', {
				header: () => t('rda_report.table.columns.full_name'),
				cell: ({ getValue, row }) => {
					const value = getValue();

					return (
						<>
							{row.original.gif && (
								<FileIcon src={row.original.gif} loading="lazy" />
							)}
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
			columnHelper.accessor('status', {
				header: () => t('rda_report.table.columns.status'),
				size: 99,
			}),
			columnHelper.accessor('statusDate', {
				header: () => t('rda_report.table.columns.status_date'),
				cell: ({ getValue }) => {
					const value = getValue();

					return value ? base(value) : '-';
				},
				size: 99,
			}),
			columnHelper.accessor('calculatedDate', {
				header: () => t('rda_report.table.columns.calc_date'),
				cell: ({ getValue }) => {
					const value = getValue();

					return value ? base(value) : '-';
				},
				size: 99,
			}),
		];

		return columns;
	}, [currentLang, fullPath]);

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
						isSelectableRows={isSelectableRows}
						onChangePage={onChangePage}
						onChangePageSize={onChangePageSize}
						renderSubComponent={renderSubComponent}
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
