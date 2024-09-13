import React from 'react';
import styled from 'styled-components';

import { IAuthProvider } from 'shared/types/auth-provider';

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

const Column = styled(TableCol)`
	width: 100px;
`;

const TableColName = styled(Column)`
	flex-grow: 180;
	width: 188px;
`;

const TableColType = styled(Column)`
	flex-grow: 176;
	width: 176px;
`;

const TableColComment = styled(Column)`
	flex-grow: 324;
	width: 324px;
`;

const StyledMoreButton = styled(MoreButton)`
	margin-left: 1.25rem;
`;

interface AuthProvidersTableProps {
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	providers: IAuthProvider[];
	selectedRows?: Record<IAuthProvider['id'], IAuthProvider>;
	isEnabledMultipleSelect: boolean;
	onChangedPageSize: (size: number) => void;
	onSelectRow: (
		provider: IAuthProvider,
		e?: React.ChangeEvent<HTMLInputElement>,
	) => void;
	onEditProvider: (provider: IAuthProvider) => void;
	onDeleteProvider: (provider: IAuthProvider) => void;
	onChangePage: (page: number) => void;
}

export const AuthProvidersTable: React.FC<AuthProvidersTableProps> = ({
	page,
	pageSize,
	totalPages,
	totalItems,
	providers,
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
		tableName: 'auth-providers',
	});

	const handleChangePageSize = (size: number) => {
		onChangePageSize(size);
		onChangedPageSize(size);
	};

	return (
		<Container>
			<TableWrapper>
				<Table>
					{providers.map((provider) => {
						const moreOptions: MoreButtonOption[] = [
							{
								key: 'edit',
								label: t(
									'general_settings.auth_provider.providers_table.actions.edit',
								),
								icon: ICON_COLLECTION.edit,
								onSelect: () => onEditProvider(provider),
							},
						];

						if (provider.removable) {
							moreOptions.push({
								key: 'delete',
								label: t(
									'general_settings.auth_provider.providers_table.actions.delete',
								),
								icon: ICON_COLLECTION.delete,
								onSelect: () => onDeleteProvider(provider),
							});
						}

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
											'general_settings.auth_provider.providers_table.columns.provider_type',
										)}
									</Text>
									<TableColText variant="body_4_primary">
										{provider.typeName}
									</TableColText>
								</TableColType>
								<TableColComment>
									<Text variant="body_4_secondary" mb="0.2rem">
										{t(
											'general_settings.auth_provider.providers_table.columns.comment',
										)}
									</Text>
									<TableColText variant="body_4_primary">
										<ExternalTranslation
											field="comment"
											translations={provider.multilingual}
											fallbackValue={provider.comment}
											emptyValue="—"
										/>
									</TableColText>
								</TableColComment>
								<Column>
									{provider.syncable && (
										<>
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
										</>
									)}
								</Column>
								<TableCol>
									<StyledMoreButton options={moreOptions} />
								</TableCol>
							</TableEntity>
						);
					})}
				</Table>
			</TableWrapper>
			{!!providers.length && (
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
