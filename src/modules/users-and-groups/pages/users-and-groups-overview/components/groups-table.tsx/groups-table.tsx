import React, { useCallback } from 'react';
import { useAbilityContext } from 'casl';
import { RouteGuardActions, RouteGuardEntities } from 'casl/ability';
import { UsersAndGroupsListSkeleton } from 'modules/users-and-groups/pages/users-and-groups-overview/components/skeleton';
import styled from 'styled-components';

import { IGroup } from 'shared/types/group';

import { useManagePagination } from 'shared/hooks/use-manage-pagination';
import { useTranslation } from 'shared/hooks/use-translation';

import { MoreButtonProps } from 'shared/components/button/more-button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Pagination } from 'shared/components/table-controls/pagination/pagination';

import { GroupsTableList } from './groups-table-list';

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

interface GroupsTableProps {
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	isLoadingData?: boolean;
	groups?: IGroup[];
	selectedGroupId?: number;
	isMultipleSelect: boolean;
	isSelected: (id: IGroup['id']) => boolean;
	rightPanel: React.ReactNode;
	onClickGroup: (group: IGroup) => void;
	onSelectRow: (group: IGroup) => void;
	onEditGroup: (group: IGroup) => void;
	toggleDisablingGroup: (group: IGroup) => void;
	onDeleteGroup: (group: IGroup) => void;
	onChangedPageSize: (size: number) => void;
	onChangePage: (page: number) => void;
}

export const GroupsTable: React.FC<GroupsTableProps> = ({
	page,
	pageSize,
	totalPages,
	totalItems,
	isLoadingData,
	groups = [],
	isMultipleSelect,
	isSelected,
	selectedGroupId,
	rightPanel,
	onClickGroup,
	onSelectRow,
	onEditGroup,
	toggleDisablingGroup,
	onDeleteGroup,
	onChangedPageSize,
	onChangePage,
}) => {
	const ability = useAbilityContext();
	const { t } = useTranslation();
	const { onChangePageSize } = useManagePagination({
		tableName: 'user-groups',
	});

	const handleChangePageSize = (size: number) => {
		onChangePageSize(size);
		onChangedPageSize(size);
	};

	const isRowHighlighted = useCallback(
		(groupId: IGroup['id']) => selectedGroupId === groupId,
		[selectedGroupId],
	);

	const getGroupActions = useCallback(
		(group: IGroup) => {
			const moreOptions: MoreButtonProps['options'] = [];

			if (ability.can(RouteGuardActions.delete, RouteGuardEntities.Group)) {
				moreOptions.unshift({
					key: 'delete',
					label: t('groups.groups_table.actions.delete'),
					onSelect: () => onDeleteGroup(group),
					icon: ICON_COLLECTION.delete,
				});
			}

			if (ability.can(RouteGuardActions.update, RouteGuardEntities.Group)) {
				moreOptions.unshift({
					key: 'edit',
					label: t('groups.groups_table.actions.edit'),
					icon: ICON_COLLECTION.edit,
					onSelect: () => onEditGroup(group),
				});
				// Disable ability for groups
				// if (!group.appGroup) {
				// 	moreOptions.push({
				// 		key: group.enabled ? 'disable' : 'enable',
				// 		label: group.enabled
				// 			? t('groups.groups_table.actions.disable')
				// 			: t('groups.groups_table.actions.enable'),
				// 		onSelect: () => toggleDisablingGroup(group),
				// 		icon: group.enabled ? ICON_COLLECTION.cross : ICON_COLLECTION.check,
				// 	});
				// }
			}

			return moreOptions;
		},
		[ability.can],
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
			<TableContainer>
				<TableWrapper>
					<Table>
						<GroupsTableList
							groups={groups}
							isRowSelected={isSelected}
							isRowHighlighted={isRowHighlighted}
							isEnabledMultipleSelect={isMultipleSelect}
							getGroupActions={getGroupActions}
							onClickRow={onClickGroup}
							onSelectRow={onSelectRow}
						/>
					</Table>
				</TableWrapper>
				{!!groups.length && (
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

			{rightPanel}
		</Container>
	);
};
