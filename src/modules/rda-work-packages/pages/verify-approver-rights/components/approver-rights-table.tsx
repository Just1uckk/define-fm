import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { ApproverAvatar } from 'modules/rda-work-packages/components/approver-avatar/approver-avatar';
import { ParentPathCell } from 'modules/rda-work-packages/components/files-table-components/parent-path-cell';
import { NoFiles } from 'modules/rda-work-packages/pages/rda-assignment/components/no-files';
import { NoFilesSearchResult } from 'modules/rda-work-packages/pages/rda-assignment/components/no-search-result';
import styled from 'styled-components';

import { FindEntityResponseFilterGroup } from 'app/api/types';

import { IApprover, IRdaAssignmentItem } from 'shared/types/dispositions';

import { RDA_ASSIGNMENT_ITEM_STATES } from 'shared/constants/constans';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useTranslation } from 'shared/hooks/use-translation';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Image } from 'shared/components/image/image';
import { Table } from 'shared/components/table/table';
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

const APPROVER_ICON_STATE = {
	[RDA_ASSIGNMENT_ITEM_STATES.APPROVED]: ICON_COLLECTION.approver_approved,
	[RDA_ASSIGNMENT_ITEM_STATES.REJECTED]: ICON_COLLECTION.approver_declined,
};

const columnHelper = createColumnHelper<IRdaAssignmentItem>();

interface FilesTableProps {
	tableName: string;
	data: IRdaAssignmentItem[];
	approvers: Record<IApprover['approverId'], IApprover>;
	filters?: FindEntityResponseFilterGroup[];
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	isNoSearchResult: boolean;
	isNoResult: boolean;
	isFilterPanelOpen: boolean;
	onSelectEntity?: () => void;
	onChangePageSize: (size: number) => void;
	onChangePage: (page: number) => void;
}

export const ApproverRightsTable: React.FC<
	React.PropsWithChildren<FilesTableProps>
> = ({
	tableName,
	data,
	filters,
	approvers,
	page,
	pageSize,
	totalPages,
	totalItems,
	isNoSearchResult,
	isNoResult,
	isFilterPanelOpen,
	onChangePage,
	onChangePageSize,
	children,
}) => {
	const { t, currentLang } = useTranslation();

	const onOpenFileInfo = (
		e: React.MouseEvent<HTMLAnchorElement>,
		item: IRdaAssignmentItem,
	) => {
		e.preventDefault();

		window.open(
			DISPOSITIONS_ROUTES.FILE_INFO.generate.external(
				item.item.rdaId,
				item.item.id,
			),
			`${item.item.rdaId}${item.item.id}`,
			'left=300,top=250,width=548,height=523',
		);
	};

	const columns = React.useMemo(() => {
		const columns = [
			columnHelper.accessor('item.name', {
				id: 'name',
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
								onClick={(e) => onOpenFileInfo(e, row.original)}
							>
								<Icon icon={ICON_COLLECTION.info} />
							</InfoLink>
						</>
					);
				},
				size: 196,
			}),
			columnHelper.accessor('item.parent', {
				id: 'parent',
				header: () => t('disposition.table_columns.location'),
				cell: ({ getValue, row }) => (
					<ParentPathCell
						fileId={row.original.item.id}
						fileName={row.original.item.name}
						parentName={getValue() || '—'}
						parentPath={row.original.item.parentPath}
					/>
				),
				size: 148,
			}),
		];

		Object.values(approvers).forEach((approver) => {
			columns.push(
				columnHelper.accessor(() => 'item.approvalHistory', {
					id: String(approver.approverId),
					enableSorting: false,
					header: () => (
						<ApproverAvatar
							userId={approver.userId}
							profileImage={approver.userProfileImage}
							userName={approver.userDisplayName}
						/>
					),
					cell: ({ row, column }) => {
						const approvalHistory = row.original.item.approvalHistory;
						const columnApproverId = Number(column.id);
						const decision = approvalHistory.find(
							(history) => history.approverId === columnApproverId,
						);

						return (
							!!decision && <Icon icon={APPROVER_ICON_STATE[decision.state]} />
						);
					},
					size: 30,
					maxSize: 30,
				}),
			);
		});

		return columns;
	}, [approvers, currentLang]);

	return (
		<Container>
			<TableWrapper>
				{isNoResult && <NoFiles />}
				{isNoSearchResult && <NoFilesSearchResult />}
				{!isNoSearchResult && !isNoResult && (
					<Table<IRdaAssignmentItem>
						name={tableName}
						isSelectableRows={false}
						data={data}
						columns={columns}
						page={page}
						totalPages={totalPages}
						pageSize={pageSize}
						totalItems={totalItems}
						onChangePage={onChangePage}
						onChangePageSize={onChangePageSize}
					>
						{children}
					</Table>
				)}
			</TableWrapper>
			{isFilterPanelOpen && (
				<StyledFilterPanel dataList={data} filters={filters} />
			)}
		</Container>
	);
};
