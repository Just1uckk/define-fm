import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DispositionSearchListSkeleton } from 'modules/disposition-searches/pages/searches-overview/components/skeleton';
import styled from 'styled-components';

import { IDispositionSearch } from 'shared/types/disposition-search';

import { DISPOSITION_SEARCH_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useManagePagination } from 'shared/hooks/use-manage-pagination';
import { useTranslation } from 'shared/hooks/use-translation';

import {
	MoreButton,
	MoreButtonOption,
} from 'shared/components/button/more-button';
import { ExternalTranslation } from 'shared/components/external-translation';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
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

const CreatedByCol = styled(Col)`
	flex-grow: 223;
	width: 223px;
`;

const CreatedDateCol = styled(Col)`
	flex-grow: 186;
	width: 186px;
`;

const StyledMoreButton = styled(MoreButton)`
	margin-left: auto;
`;

interface DispositionSearchesTableProps {
	pageSize?: number | string;
	page: number;
	isLoadingData?: boolean;
	data?: IDispositionSearch[];
	isEmptyList: boolean;
	isMultipleSelect: boolean;
	isRowSelected: (id: number) => boolean;
	onSelectRow: (entity: IDispositionSearch) => void;
	onStartSearch: (entity: IDispositionSearch) => void;
	onEditEntity: (entity: IDispositionSearch) => void;
	onDeleteEntity: (entity: IDispositionSearch) => void;
	onChangedPageSize: (size: number) => void;
}

const DispositionSearchesTableComponent: React.FC<
	DispositionSearchesTableProps
> = ({
	page,
	pageSize,
	isLoadingData,
	data = [],
	isEmptyList,
	isMultipleSelect,
	isRowSelected,
	onSelectRow,
	onStartSearch,
	onEditEntity,
	onDeleteEntity,
	onChangedPageSize,
}) => {
	const location = useLocation();
	const date = useDate();
	const { t } = useTranslation();
	const { onChangePage, onChangePageSize } = useManagePagination({
		tableName: 'disposition-searches',
	});

	const handleChangePageSize = (size: number) => {
		onChangePageSize(size);
		onChangedPageSize(size);
	};

	const getEntityActions = (entity: IDispositionSearch) =>
		[
			{
				key: 'start_search',
				label: t('disposition_searches.table.actions.start_search'),
				icon: ICON_COLLECTION.play,
				onSelect: () => onStartSearch(entity),
			},
			{
				key: 'edit',
				label: t('disposition_searches.table.actions.edit'),
				icon: ICON_COLLECTION.edit,
				onSelect: () => onEditEntity(entity),
			},
			{
				key: 'delete',
				label: t('disposition_searches.table.actions.delete'),
				onSelect: () => onDeleteEntity(entity),
				icon: ICON_COLLECTION.delete,
			},
		] as MoreButtonOption[];

	if (isLoadingData) {
		return (
			<Container>
				<TableWrapper>
					<DispositionSearchListSkeleton />
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
							const moreOptions = getEntityActions(entity);

							return (
								<Row
									key={entity.id}
									tag={Link}
									to={DISPOSITION_SEARCH_ROUTES.SEARCH.generate(entity.id)}
									state={{ from: location.pathname + location.search }}
									hasCheckbox
									isSelectable={isMultipleSelect}
									isSelected={isRowSelected(entity.id)}
									onSelect={() => onSelectRow(entity)}
								>
									<GroupNameCol>
										<Text variant="body_2_primary_semibold" mb="0.2rem">
											<ExternalTranslation
												field="name"
												translations={entity.multilingual}
												fallbackValue={entity.name}
											/>
										</Text>
									</GroupNameCol>
									<TableCol>
										<Text variant="body_4_secondary" mb="0.2rem">
											{t('disposition_searches.table.snapshots')}
										</Text>
										<Text variant="body_4_primary">{entity.snapshotCount}</Text>
									</TableCol>

									<CreatedByCol>
										<Text variant="body_4_secondary" mb="0.2rem">
											{t('disposition_searches.table.created_by')}
										</Text>
										<Text variant="body_4_primary">
											{entity.createdByDisplay}
										</Text>
									</CreatedByCol>
									<CreatedDateCol>
										<Text variant="body_4_secondary" mb="0.2rem">
											{t('disposition_searches.table.date_created')}
										</Text>
										<Text variant="body_4_primary">
											{date.formats.base(entity.createdOn)}
										</Text>
									</CreatedDateCol>
									<TableCol>
										<Text variant="body_4_secondary" mb="0.2rem">
											{t('disposition_searches.table.last_run')}
										</Text>
										<Text variant="body_4_primary">
											{entity.lastRun ? date.formats.base(entity.lastRun) : '-'}
										</Text>
									</TableCol>
									<TableCol>
										<Text variant="body_4_secondary" mb="0.2rem">
											{t('disposition_searches.table.results')}
										</Text>
										<Text variant="body_4_primary">
											{entity.lastRunCount ||
												t('disposition_searches.table.n/a')}
										</Text>
									</TableCol>

									<TableCol>
										<StyledMoreButton options={moreOptions} />
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
							itemsCount={data.length}
							onChangePage={onChangePage}
							onChangePageSize={handleChangePageSize}
						/>
					</TableFooter>
				)}
			</TableContainer>
		</Container>
	);
};

DispositionSearchesTableComponent.displayName = 'DispositionSearchesTable';

export const DispositionSearchesTable = memo(DispositionSearchesTableComponent);
