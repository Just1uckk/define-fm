import React from 'react';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import { Can, useAbilityContext } from 'casl';
import { RouteGuardActions, RouteGuardEntities } from 'casl/ability';
import { CreateGroup } from 'modules/users-and-groups/features/groups/create-group';
import { DeleteGroup } from 'modules/users-and-groups/features/groups/delete-group';
import { EditGroup } from 'modules/users-and-groups/features/groups/edit-group';
import { CreateUser } from 'modules/users-and-groups/features/users/create-user';
import { DeleteUser } from 'modules/users-and-groups/features/users/delete-user';
import { EditUser } from 'modules/users-and-groups/features/users/edit-user';
import { GroupsTable } from 'modules/users-and-groups/pages/users-and-groups-overview/components/groups-table.tsx/groups-table';
import { useUsersAndGroupsOverview } from 'modules/users-and-groups/pages/users-and-groups-overview/use-users-and-groups-overview';
import styled from 'styled-components';

import { USERS_AND_GROUPS_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';

import { Breadcrumb } from 'shared/components/breadcrumbs/breadcrumb';
import { BreadcrumbPortal } from 'shared/components/breadcrumbs/breadcrumb-portal';
import { BREADCRUMB_CONTAINER } from 'shared/components/breadcrumbs/breadcrumbs';
import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { SearchBar } from 'shared/components/search-bar/search-bar';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
import { FilterPanel } from 'shared/components/table-controls/filter-panel/filter-panel';
import { SortByButton } from 'shared/components/table-controls/sort-button';
import { TableActionPanel } from 'shared/components/table-controls/table-action-panel';
import { TabList } from 'shared/components/tabs/tab-list';
import { TabWithLabel } from 'shared/components/tabs/tab-with-label';
import { Title } from 'shared/components/title/title';
import { Toggle } from 'shared/components/toggle/toggle';

import { GroupUserListPanel } from './components/groups-table.tsx/group-user-list-panel';
import { UserGroupsStatsPanel } from './components/groups-table.tsx/user-groups-stats-panel';
import { UserGroupPanel } from './components/users-table/user-group-panel';
import { UsersTable } from './components/users-table/users-table';

const Page = styled.div``;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const PageHeaderRight = styled.div`
	display: flex;
	align-items: center;
`;

const PageContent = styled.div`
	margin-top: 1.7rem;
`;

const ControlPanel = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 1.4rem;
`;

const ControlPanelLeft = styled.div`
	width: 100%;
	max-width: 566px;
`;

const ControlPanelRight = styled.div`
	display: flex;
	flex-shrink: 0;
	gap: 0.85rem;
	margin-left: 0.85rem;
`;

export const UsersGroupsOverviewPage: React.FC = () => {
	const ability = useAbilityContext();
	const { t } = useTranslation();
	const date = useDate();
	useTitle(t('users_and_groups.title'));

	const {
		models,
		commands,
		usersModels,
		usersCommands,
		groupsModels,
		groupsCommands,
	} = useUsersAndGroupsOverview();

	return (
		<>
			<CreateGroup onSuccess={groupsCommands.refetchGroups} />
			<EditGroup onSuccess={groupsCommands.refetchGroups} />
			<DeleteGroup onSuccess={groupsCommands.refetchGroups} />

			<CreateUser onSuccess={usersCommands.refetchList} />
			<EditUser
				providerTypes={usersModels.providerTypes}
				onSuccess={usersCommands.refetchList}
			/>
			<DeleteUser onSuccess={usersCommands.refetchList} />
			<FetchLoader
				active={
					usersModels.isRefetchingUsers || groupsModels.isRefetchingGroups
				}
			/>

			<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
				<Breadcrumb
					breadcrumb={t('breadcrumbs.users_and_groups')}
					path={USERS_AND_GROUPS_ROUTES.OVERVIEW.path}
					isLast
				/>
			</BreadcrumbPortal>

			<Page>
				<PageHeader>
					<Title subHeader={date.formats.pageHead()}>
						{t('users_and_groups.title')}
					</Title>

					<PageHeaderRight>
						{models.currentTab === 'users' && (
							<Can I={RouteGuardActions.manage} a={RouteGuardEntities.User}>
								<Button
									icon={ICON_COLLECTION.add}
									label={t('users.create_new')}
									onClick={usersCommands.handleCreateUser}
								/>
							</Can>
						)}
						{models.currentTab === 'groups' && (
							<Can I={RouteGuardActions.create} a={RouteGuardEntities.Group}>
								<Button
									icon={ICON_COLLECTION.add}
									label={t('groups.create_new')}
									onClick={groupsCommands.handleCreateGroup}
								/>
							</Can>
						)}
					</PageHeaderRight>
				</PageHeader>
				<PageContent>
					<TabList value={models.currentTabIdx}>
						<TabWithLabel
							onClick={commands.handleChangeTab('users')}
							label={usersModels.userCount}
						>
							{t('users_and_groups.tabs.users')}
						</TabWithLabel>
						<TabWithLabel
							onClick={commands.handleChangeTab('groups')}
							label={groupsModels.groupsData?.stats.objects ?? 0}
						>
							{t('users_and_groups.tabs.groups')}
						</TabWithLabel>
					</TabList>

					{models.currentTab === 'users' && (
						<>
							<ControlPanel>
								<ControlPanelLeft>
									<SearchBar
										placeholder={t('users_and_groups.search_users')}
										value={usersModels.tableUsersParams.search}
										isLoading={usersModels.isSearchingUsers}
										onChange={usersCommands.handleSearchUsers}
										onClear={usersCommands.handleClearSearchUsers}
										fulfilled
									/>
								</ControlPanelLeft>
								<ControlPanelRight>
									<Can I={RouteGuardActions.manage} a={RouteGuardEntities.User}>
										<TableControlWrapper>
											<Toggle
												checked={models.isEnabledMultipleSelect}
												onChange={commands.toggleSelectingMultiRows}
												label={t('components.table.multiple_select')}
											/>
										</TableControlWrapper>
									</Can>

									<SortByButton
										sortBy={usersModels.tableUsersParams.orderBy}
										options={usersModels.SORT_OPTIONS}
										onSelect={usersCommands.handleSortUsers}
										onOptionLabel={(_, idx) =>
											t(usersModels.SORT_OPTIONS[idx].label)
										}
										onSelectedOptionLabel={(option) => t(option.label)}
									/>
								</ControlPanelRight>
							</ControlPanel>

							<UsersTable
								page={usersModels.tableUsersParams.page - 1}
								pageSize={
									usersModels.usersData?.query.pageSize ??
									usersModels.tableUsersParams.pageSize
								}
								totalPages={usersModels.usersData?.stats.pages ?? 0}
								totalItems={usersModels.usersData?.stats.objects ?? 0}
								isLoadingData={
									usersModels.isLoadingUsers ||
									usersModels.isAuthProvidersLoading ||
									usersModels.isProviderTypesLoading
								}
								selectedUserId={usersModels.selectedUser?.id}
								users={usersModels.userList}
								selectedUsers={usersModels.selectedUsers}
								authProviders={usersModels.authProviders}
								isEnabledMultipleSelect={models.isEnabledMultipleSelect}
								onClickRow={usersCommands.handleClickRow}
								onSelectRow={usersCommands.handleSelectRow}
								onEditUser={usersCommands.handleEditUser}
								onDeleteUser={usersCommands.handleDeleteUser}
								toggleDisablingUser={usersCommands.toggleDisablingUser}
								onChangedPageSize={usersCommands.handleChangePageSize}
								onChangePage={usersCommands.handleChangePage}
								rightPanel={
									<>
										{!usersModels.selectedUser && (
											<FilterPanel
												dataList={usersModels.userList}
												activeFilters={usersModels.tableUsersParams.elements}
												filters={usersModels.usersData?.stats.filters ?? []}
												onChange={usersCommands.handleChangeFilter}
												onClearFilters={usersCommands.handleClearFilters}
											/>
										)}
										{usersModels.selectedUser && (
											<UserGroupPanel
												isLoadingData={
													usersModels.isLoadingGroupsWhereIsSelectedUser
												}
												username={usersModels.selectedUser?.display}
												groups={usersModels.groupsWhereIsSelectedUser}
												onClosePanel={usersCommands.handleCloseGroupsPanel}
												onClickGroup={commands.handleClickGroup}
											/>
										)}
									</>
								}
							/>
						</>
					)}
					{models.currentTab === 'groups' && (
						<>
							<ControlPanel>
								<ControlPanelLeft>
									<SearchBar
										placeholder={t('users_and_groups.search_groups')}
										value={groupsModels.tableGroupsParams.search}
										isLoading={groupsModels.isSearchingGroups}
										onChange={groupsCommands.handleSearchGroups}
										onClear={groupsCommands.handleClearSearchGroups}
										fulfilled
									/>
								</ControlPanelLeft>
								<ControlPanelRight>
									{/* Multiple select for groups */}
									{/* {(ability.can(
										RouteGuardActions.update,
										RouteGuardEntities.Group,
									) ||
										ability.can(
											RouteGuardActions.delete,
											RouteGuardEntities.Group,
										)) && (
										<TableControlWrapper>
											<Toggle
												checked={models.isEnabledMultipleSelect}
												onChange={commands.toggleSelectingMultiRows}
												label={t('components.table.multiple_select')}
											/>
										</TableControlWrapper>
									)} */}
									<SortByButton
										sortBy={groupsModels.tableGroupsParams.orderBy}
										options={groupsModels.SORT_OPTIONS}
										onSelect={groupsCommands.handleSortGroups}
										onOptionLabel={(_, idx) =>
											t(groupsModels.SORT_OPTIONS[idx].label)
										}
										onSelectedOptionLabel={(option) => t(option.label)}
									/>
								</ControlPanelRight>
							</ControlPanel>

							<GroupsTable
								groups={groupsModels.groupList}
								page={groupsModels.tableGroupsParams.page - 1}
								pageSize={
									groupsModels.groupsData?.query.pageSize ??
									groupsModels.tableGroupsParams.pageSize
								}
								totalPages={groupsModels.groupsData?.stats.pages ?? 0}
								totalItems={groupsModels.groupsData?.stats.objects ?? 0}
								isLoadingData={groupsModels.isLoadingGroups}
								isMultipleSelect={models.isEnabledMultipleSelect}
								isSelected={groupsCommands.isGroupSelected}
								selectedGroupId={groupsModels.selectedGroup?.id}
								onClickGroup={groupsCommands.handleClickRow}
								onSelectRow={groupsCommands.handleSelectRow}
								onEditGroup={groupsCommands.handleEditGroup}
								toggleDisablingGroup={groupsCommands.toggleDisablingGroup}
								onDeleteGroup={groupsCommands.handleDeleteGroup}
								onChangedPageSize={groupsCommands.handleChangePageSize}
								onChangePage={groupsCommands.handleChangePage}
								rightPanel={
									<>
										{!groupsModels.selectedGroup && (
											<UserGroupsStatsPanel
												usersCount={usersModels.totalUsersCount}
												groupsCount={groupsModels.totalGroupsCount}
											/>
										)}
										{!!groupsModels.selectedGroup && (
											<GroupUserListPanel
												groupName={groupsModels.selectedGroup.name}
												users={groupsModels.usersBySelectedGroup}
												isLoadingData={
													groupsModels.isLoadingUsersBySelectedGroup
												}
												onClosePanel={groupsCommands.handleCloseUsersPanel}
											/>
										)}
									</>
								}
							/>
						</>
					)}

					{!!usersModels.selectedUsers.size &&
						models.currentTab === 'users' && (
							<TableActionPanel
								selectedCountItems={usersModels.selectedUsers.size}
								allCountItems={usersModels.userList.length}
								onSelectAll={usersCommands.handleSelectAllUsers}
							>
								<ButtonList>
									{ability.can(
										RouteGuardActions.delete,
										RouteGuardEntities.User,
									) && (
										<Button
											variant="primary_outlined"
											icon={ICON_COLLECTION.delete}
											label={t('users_and_groups.actions.delete_users')}
											disabled={
												usersModels.isSelectedUsersUpdating ||
												usersModels.isSelectedSyncable
											}
											onClick={usersCommands.handleDeleteSelectedUsers}
										/>
									)}
									{usersModels.isSelectedUsersDisabled &&
										ability.can(
											RouteGuardActions.update,
											RouteGuardEntities.User,
										) && (
											<Button
												variant="primary_outlined"
												label={t('users_and_groups.actions.enable_users')}
												loading={usersModels.isSelectedUsersUpdating}
												onClick={usersCommands.handleEnableSelectedUsers}
											/>
										)}
									{usersModels.isSelectedUsersEnabled &&
										ability.can(
											RouteGuardActions.update,
											RouteGuardEntities.User,
										) && (
											<Button
												variant="primary_outlined"
												label={t('users_and_groups.actions.disable_users')}
												loading={usersModels.isSelectedUsersUpdating}
												onClick={usersCommands.handleDisableSelectedUsers}
											/>
										)}

									<Button
										variant="primary_ghost"
										icon={ICON_COLLECTION.cross}
										label={t('users_and_groups.actions.cancel_selection')}
										onClick={usersCommands.handleCancelAllUserSelection}
									/>
								</ButtonList>
							</TableActionPanel>
						)}

					{!!groupsModels.selectedGroups.size &&
						models.currentTab === 'groups' && (
							<TableActionPanel
								selectedCountItems={groupsModels.selectedGroups.size}
								allCountItems={groupsModels.groupsData?.results.length ?? 0}
								onSelectAll={groupsCommands.handleSelectAllGroups}
							>
								<ButtonList>
									{ability.can(
										RouteGuardActions.delete,
										RouteGuardEntities.Group,
									) && (
										<Button
											variant="primary_outlined"
											icon={ICON_COLLECTION.delete}
											label={t('users_and_groups.actions.delete_groups')}
											disabled={groupsModels.isLoadingUpdatingSelectedGroups}
											onClick={groupsCommands.handleDeleteSelectedGroups}
										/>
									)}

									{groupsModels.isSelectedGroupsEnabled &&
										ability.can(
											RouteGuardActions.update,
											RouteGuardEntities.Group,
										) && (
											<Button
												variant="primary_outlined"
												label={t('users_and_groups.actions.disable_groups')}
												loading={groupsModels.isLoadingUpdatingSelectedGroups}
												onClick={groupsCommands.handleDisableSelectedGroups}
											/>
										)}
									{groupsModels.isSelectedGroupsDisabled &&
										ability.can(
											RouteGuardActions.update,
											RouteGuardEntities.Group,
										) && (
											<Button
												variant="primary_outlined"
												label={t('users_and_groups.actions.enable_groups')}
												loading={groupsModels.isLoadingUpdatingSelectedGroups}
												onClick={groupsCommands.handleEnableSelectedGroups}
											/>
										)}
									<Button
										variant="primary_ghost"
										icon={ICON_COLLECTION.cross}
										label={t('users_and_groups.actions.cancel_selection')}
										onClick={groupsCommands.handleCancelAllGroupSelection}
									/>
								</ButtonList>
							</TableActionPanel>
						)}
				</PageContent>
			</Page>
		</>
	);
};
