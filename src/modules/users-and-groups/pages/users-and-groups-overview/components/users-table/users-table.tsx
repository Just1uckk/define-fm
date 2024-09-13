import React, { useCallback } from 'react';
import { UsersAndGroupsListSkeleton } from 'modules/users-and-groups/pages/users-and-groups-overview/components/skeleton';
import { UsersTableList } from 'modules/users-and-groups/pages/users-and-groups-overview/components/users-table/users-table-list';
import styled from 'styled-components';

import { IAuthProvider } from 'shared/types/auth-provider';
import { IUser } from 'shared/types/users';

import { useManagePagination } from 'shared/hooks/use-manage-pagination';
import { useTranslation } from 'shared/hooks/use-translation';
import { useEvent } from 'shared/hooks/useEvent';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Pagination } from 'shared/components/table-controls/pagination/pagination';

const Container = styled.div`
	display: flex;
	align-items: flex-start;
	margin-top: 0.75rem;
`;

const TableWrapper = styled.div`
	width: 100%;
	padding-left: 1rem;
	padding-right: 1rem;
	padding-bottom: 1rem;
	margin-top: -0.75rem;
	margin-left: -1rem;
	margin-right: -1rem;
	overflow: auto;
`;

const Table = styled.div`
	display: table;
	width: 100%;
`;

const TableFooter = styled.div`
	margin: 1.5rem 0;
`;

interface UsersTableProps {
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	isLoadingData?: boolean;
	selectedUserId?: number | null;
	users?: IUser[];
	authProviders: Record<IAuthProvider['id'], IAuthProvider>;
	selectedUsers?: Map<IUser['id'], IUser>;
	isEnabledMultipleSelect: boolean;
	rightPanel?: React.ReactNode;
	onClickRow: (user: IUser) => void;
	onSelectRow: (user: IUser, e?: React.ChangeEvent<HTMLInputElement>) => void;
	onEditUser: (id: IUser['id']) => void;
	onDeleteUser: (user: IUser) => void;
	toggleDisablingUser: (user) => void;
	onChangedPageSize: (size: number) => void;
	onChangePage: (page: number) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
	page,
	pageSize,
	totalPages,
	totalItems,
	isLoadingData,
	selectedUserId,
	users = [],
	selectedUsers = new Map(),
	authProviders,
	isEnabledMultipleSelect,
	rightPanel,
	onClickRow,
	onSelectRow,
	onEditUser,
	onDeleteUser,
	toggleDisablingUser,
	onChangedPageSize,
	onChangePage,
}) => {
	const { t } = useTranslation();
	const { onChangePageSize } = useManagePagination({ tableName: 'users' });

	const handleChangePageSize = (size: number) => {
		onChangePageSize(size);
		onChangedPageSize(size);
	};

	const getNameAuthProvider = useEvent(
		(user: IUser) => authProviders[user.providerId]?.name ?? '',
	);

	const isRowSelected = useCallback(
		(userId: IUser['id']) => selectedUsers.has(userId),
		[selectedUsers],
	);
	const isRowHighlighted = useCallback(
		(userId: IUser['id']) => selectedUserId === userId,
		[selectedUserId],
	);

	const getUserActions = useCallback(
		(user: IUser) => {
			const options = [
				{
					key: 'edit',
					label: t('users.table.actions.edit'),
					onSelect: () => onEditUser(user.id),
					icon: ICON_COLLECTION.edit,
				},
				{
					key: user.enabled ? 'disable' : 'enable',
					label: user.enabled
						? t('users.table.actions.disable')
						: t('users.table.actions.enable'),
					onSelect: () => toggleDisablingUser(user),
					icon: user.enabled ? ICON_COLLECTION.cross : ICON_COLLECTION.check,
				},
			];

			if (!authProviders[user.providerId]?.syncable) {
				options.push({
					key: 'delete',
					label: t('users.table.actions.delete'),
					onSelect: () => onDeleteUser(user),
					icon: ICON_COLLECTION.delete,
				});
			}

			return options;
		},
		[authProviders],
	);

	if (isLoadingData) {
		return (
			<Container>
				<UsersAndGroupsListSkeleton />
			</Container>
		);
	}

	return (
		<Container>
			<TableWrapper>
				<Table>
					<UsersTableList
						users={users}
						isRowSelected={isRowSelected}
						isRowHighlighted={isRowHighlighted}
						isEnabledMultipleSelect={isEnabledMultipleSelect}
						getNameAuthProvider={getNameAuthProvider}
						getUserActions={getUserActions}
						onClickRow={onClickRow}
						onSelectRow={onSelectRow}
					/>
				</Table>
				{!!users.length && (
					<TableFooter>
						<Pagination
							page={page}
							pageSize={pageSize}
							itemsCount={totalItems}
							totalPages={totalPages}
							onChangePage={onChangePage}
							onChangePageSize={handleChangePageSize}
						/>
					</TableFooter>
				)}
			</TableWrapper>
			{rightPanel}
		</Container>
	);
};
