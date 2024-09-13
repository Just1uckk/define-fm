import React from 'react';
import styled from 'styled-components';

import {
	IDataSyncProvider,
	IDataSyncProviderType,
} from 'shared/types/data-sync-provider';

import { useDate } from 'shared/hooks/use-date';
import { useManagePagination } from 'shared/hooks/use-manage-pagination';
import { useTranslation } from 'shared/hooks/use-translation';

import { MoreButton } from 'shared/components/button/more-button';
import { ExternalTranslation } from 'shared/components/external-translation';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Pagination } from 'shared/components/table-controls/pagination/pagination';
import { TableCol } from 'shared/components/table-elements/table-col';
import { TableColText } from 'shared/components/table-elements/table-col-text';
import { TableEntity } from 'shared/components/table-elements/table-entity';
import { Text } from 'shared/components/text/text';

const Container = styled.div``;

const TableWrapper = styled.div`
	margin-top: -0.75rem;
	overflow: auto;
	padding: 0 1rem;
	padding-bottom: 1rem;
	margin: 0 -1rem;
	margin-bottom: -1rem;
`;

const Table = styled.div`
	display: table;
	width: 100%;
`;

const TableFooter = styled.div`
	margin: 1.5rem 0;
`;

const TableColName = styled(TableCol)`
	flex-grow: 180;
	width: 188px;
`;

const TableColType = styled(TableCol)`
	flex-grow: 176;
	width: 176px;
`;

const TableColComment = styled(TableCol)`
	flex-grow: 324;
	width: 324px;
`;

const StyledMoreButton = styled(MoreButton)`
	margin-left: 1.25rem;
`;

interface DataSyncProvidersTableProps {
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	data: IDataSyncProvider[];
	providerTypes: Record<IDataSyncProviderType['id'], IDataSyncProviderType>;
	selectedRows?: Record<IDataSyncProvider['id'], IDataSyncProvider>;
	isEnabledMultipleSelect: boolean;
	onChangedPageSize: (size: number) => void;
	onSelectRow: (
		provider: IDataSyncProvider,
		e?: React.ChangeEvent<HTMLInputElement>,
	) => void;
	onEditProvider: (provider: IDataSyncProvider) => void;
	onDeleteProvider: (provider: IDataSyncProvider) => void;
	onChangePage: (page: number) => void;
}

export const DataSyncProvidersTable: React.FC<DataSyncProvidersTableProps> = ({
	page,
	pageSize,
	totalPages,
	totalItems,
	data,
	providerTypes,
	selectedRows = {},
	isEnabledMultipleSelect,
	onChangedPageSize,
	onSelectRow,
	onEditProvider,
	onDeleteProvider,
	onChangePage,
}) => {
	const date = useDate();
	const { t } = useTranslation();
	const { onChangePageSize } = useManagePagination({
		tableName: 'data-sync-providers',
	});

	const handleChangePageSize = (size: number) => {
		onChangePageSize(size);
		onChangedPageSize(size);
	};

	return (
		<Container>
			<TableWrapper>
				<Table>
					{data.map((provider) => {
						const moreOptions = [
							{
								key: 'edit',
								label: t(
									'general_settings.data_sync_providers.providers_table.actions.edit',
								),
								icon: ICON_COLLECTION.edit,
								onSelect: () => onEditProvider(provider),
							},
							{
								key: 'delete',
								label: t(
									'general_settings.data_sync_providers.providers_table.actions.delete',
								),
								icon: ICON_COLLECTION.delete,
								onSelect: () => onDeleteProvider(provider),
							},
						];

						return (
							<TableEntity
								key={provider.id}
								isSelected={!!selectedRows[provider.id] || false}
								isSelectable={isEnabledMultipleSelect}
								hasCheckbox
								onSelect={(e) => onSelectRow(provider, e)}
							>
								<TableColName>
									<TableColText variant="body_3_primary_semibold" mb="0.2rem">
										<ExternalTranslation
											field="name"
											translations={provider.multilingual}
											fallbackValue={provider.name}
										/>
									</TableColText>
								</TableColName>
								<TableColType>
									<Text variant="body_4_secondary" mb="0.2rem">
										{t(
											'general_settings.data_sync_providers.providers_table.columns.provider_type',
										)}
									</Text>
									<TableColText variant="body_4_primary">
										{providerTypes[provider.providerTypeId]?.name}
									</TableColText>
								</TableColType>
								<TableColComment>
									<Text variant="body_4_secondary" mb="0.2rem">
										{t(
											'general_settings.data_sync_providers.providers_table.columns.comment',
										)}
									</Text>
									<TableColText variant="body_4_primary">
										<ExternalTranslation
											field="comment"
											translations={provider.multilingual}
											fallbackValue={provider.comment}
										/>
									</TableColText>
								</TableColComment>
								<TableCol>
									<Text variant="body_4_secondary" mb="0.2rem">
										{t(
											'general_settings.auth_provider.providers_table.columns.last_sync_date',
										)}
									</Text>
									<TableColText variant="body_4_primary">
										{provider.priorRun
											? date.formats.baseWithTime(provider.priorRun)
											: '—'}
									</TableColText>
								</TableCol>
								<TableCol>
									<StyledMoreButton options={moreOptions} />
								</TableCol>
							</TableEntity>
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
		</Container>
	);
};
