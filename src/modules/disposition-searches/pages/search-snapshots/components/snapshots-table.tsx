import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DispositionSearchSnapshotListSkeleton } from 'modules/disposition-searches/pages/search-snapshots/components/skeleton';
import styled from 'styled-components';

import { IDispositionSearchSnapshot } from 'shared/types/disposition-search';

import { DISPOSITION_SEARCH_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useManagePagination } from 'shared/hooks/use-manage-pagination';
import { useTranslation } from 'shared/hooks/use-translation';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { Pagination } from 'shared/components/table-controls/pagination/pagination';
import { TableCol } from 'shared/components/table-elements/table-col';
import { TableEntity } from 'shared/components/table-elements/table-entity';
import { Text } from 'shared/components/text/text';

import { EmptyList } from './empty-list';

const Container = styled.div`
	display: flex;
	align-items: flex-start;
	margin-top: 0.75rem;
`;

const TableContainer = styled.div`
	flex-grow: 1;
	overflow: hidden;
`;

const TableWrapper = styled.div`
	flex-grow: 1;
	margin-top: -0.75rem;
	padding-bottom: 0.75rem;
	overflow: auto;
`;

const Table = styled.div`
	display: table;
	width: 100%;
`;

const TableFooter = styled.div`
	flex-grow: 1;
	margin-top: 1.5rem;
`;

const Row = styled(TableEntity)`
	padding: 1.1rem 1rem;
	text-decoration: none;
`;

const Col = styled(TableCol)`
	min-width: 0;
	flex-shrink: 0;
	flex-basis: auto;
`;

const GroupNameCol = styled(Col)`
	flex-grow: 255;
	width: 255px;
`;

interface DispositionSearchesTableProps {
	page: number;
	pageSize?: number | string;
	totalPages: number;
	totalItems: number;
	isLoadingData?: boolean;
	data?: IDispositionSearchSnapshot[];
	isEmptyList: boolean;
	isMultipleSelect: boolean;
	isRowSelected: (id: number) => boolean;
	onSelectRow: (entity: IDispositionSearchSnapshot) => void;
	onDeleteEntity: (entity: IDispositionSearchSnapshot) => void;
	onChangedPageSize: (size: number) => void;
	onChangePage: (size: number) => void;
}

const DispositionSearchSnapshotsTableComponent: React.FC<
	DispositionSearchesTableProps
> = ({
	page,
	pageSize,
	totalPages,
	totalItems,
	isLoadingData,
	data = [],
	isEmptyList,
	isMultipleSelect,
	isRowSelected,
	onSelectRow,
	onDeleteEntity,
	onChangedPageSize,
	onChangePage,
}) => {
	const location = useLocation();
	const date = useDate();
	const { t } = useTranslation();
	const { onChangePageSize } = useManagePagination({
		tableName: 'disposition-search-snapshots',
	});

	const handleChangePageSize = (size: number) => {
		onChangePageSize(size);
		onChangedPageSize(size);
	};

	const handleDeleting = (entity: IDispositionSearchSnapshot) => {
		onDeleteEntity(entity);
	};

	if (isLoadingData) {
		return (
			<Container>
				<TableWrapper>
					<DispositionSearchSnapshotListSkeleton />
				</TableWrapper>
			</Container>
		);
	}

	if (isEmptyList) {
		return <EmptyList />;
	}

	return (
		<Container>
			<TableContainer>
				<TableWrapper>
					<Table>
						{data.map((entity) => {
							return (
								<Row
									key={entity.id}
									tag={entity.ready ? Link : undefined}
									to={DISPOSITION_SEARCH_ROUTES.SNAPSHOT.generate(
										entity.dispositionId,
										entity.id,
									)}
									state={{
										fromSearches: location.state?.from,
										fromSnapshots: location.pathname + location.search,
									}}
									hasCheckbox
									isSelectable={isMultipleSelect}
									isSelected={isRowSelected(entity.id)}
									onSelect={() => onSelectRow(entity)}
								>
									<GroupNameCol>
										<Text variant="body_2_primary_semibold" mb="0.2rem">
											{entity.name}
										</Text>
									</GroupNameCol>

									<TableCol>
										<Text variant="body_4_secondary" mb="0.2rem">
											{t('disposition_search_snapshots.table.date/time')}
										</Text>
										<Text variant="body_4_primary">
											{date.formats.baseWithTime(entity.snapdate)}
										</Text>
									</TableCol>
									<TableCol>
										<Text variant="body_4_secondary" mb="0.2rem">
											{t('disposition_search_snapshots.table.results')}
										</Text>
										<Text variant="body_4_primary">{entity.count}</Text>
									</TableCol>
									<TableCol>
										<Text variant="body_4_secondary" mb="0.2rem">
											{t('disposition_search_snapshots.table.status.field')}
										</Text>
										<Text variant="body_4_primary">
											{entity.ready
												? t('disposition_search_snapshots.table.status.ready')
												: t(
														'disposition_search_snapshots.table.status.not_ready',
												  )}
										</Text>
									</TableCol>

									<TableCol>
										<IconButton
											icon={ICON_COLLECTION.delete}
											onPress={() => handleDeleting(entity)}
										/>
									</TableCol>
								</Row>
							);
						})}
					</Table>
				</TableWrapper>
				{!!data.length && (
					<TableFooter>
						<Pagination
							pageSize={pageSize}
							page={page}
							itemsCount={totalItems}
							totalPages={totalPages}
							onChangePage={onChangePage}
							onChangePageSize={handleChangePageSize}
						/>
					</TableFooter>
				)}
			</TableContainer>
		</Container>
	);
};

DispositionSearchSnapshotsTableComponent.displayName =
	'DispositionSearchSnapshotsTable';

export const DispositionSearchSnapshotsTable = memo(
	DispositionSearchSnapshotsTableComponent,
);
