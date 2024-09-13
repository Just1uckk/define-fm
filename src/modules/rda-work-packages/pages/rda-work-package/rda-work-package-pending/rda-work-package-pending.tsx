import React from 'react';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import { ApproverAvatar } from 'modules/rda-work-packages/components/approver-avatar/approver-avatar';
import { ChangeApproversModal } from 'modules/rda-work-packages/features/change-approvers/change-approvers-modal';
import { ChangeSettingsWorkPackageModal } from 'modules/rda-work-packages/features/change-settings-work-package/change-settings-work-package';
import { DeleteWorkPackageModal } from 'modules/rda-work-packages/features/delete-work-package/delete-work-package';
import { FilesTable } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-pending/components/files-table/files-table';
import {
	RdaWorkPackageTabs,
	useRdaWorkPackage,
} from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-pending/use-rda-work-package';
import styled from 'styled-components';

import { APPROVER_STATES } from 'shared/constants/constans';

import { useDate } from 'shared/hooks/use-date';
import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ButtonMultipleActions } from 'shared/components/button/button-multiple-actions';
import { ExternalTranslation } from 'shared/components/external-translation';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { SearchBar } from 'shared/components/search-bar/search-bar';
import { Spinner } from 'shared/components/spinner/spinner';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
import { ManageColumnsButton } from 'shared/components/table-controls/manage-columns-button';
import { TableActionPanel } from 'shared/components/table-controls/table-action-panel';
import { TabList } from 'shared/components/tabs/tab-list';
import { TabWithLabel } from 'shared/components/tabs/tab-with-label';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';
import { Toggle } from 'shared/components/toggle/toggle';
import { UserAvatarList } from 'shared/components/user-avatar-list/user-avatar-list';

const Page = styled.div``;

const PageHeader = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
`;

const PageTitle = styled(Title)`
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
`;

const PageHeaderRight = styled.div`
	display: flex;
	align-items: center;
`;

const Approvers = styled.div`
	display: flex;
	align-items: center;
	margin-right: 1rem;
`;

const StyledUserAvatarList = styled(UserAvatarList)`
	margin-left: 0.8rem;
`;

const PageContent = styled.div`
	display: flex;
	flex-direction: column;
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

const tabIndex: Record<RdaWorkPackageTabs, number> = {
	included_items: 0,
	excluded_items: 1,
};

export const RdaWorkPackagePendingPage: React.FC = () => {
	const { t, currentLang } = useTranslation();
	const date = useDate();

	const {
		models: {
			approvers,
			workPackage,
			fileList,
			filesData,
			tableState,
			selectedRows,
			tableCurrentTab,
			tableName,
			includedItemsCount,
			excludedItemsCount,
			isWorkPackageLoading,
			isDispositionTableTabsLoading,
			isApproversLoading,
			isFileListLoading,
			isFileListSearchLoading,
			isFileListRefetching,
			isFilterPanelOpen,
			isExcludeSelectedItemsLoading,
			isIncludeSelectedItemsMutationLoading,
			modals,
			primaryButtonActions,
		},
		commands,
	} = useRdaWorkPackage();

	useTitle(workPackage?.multilingual?.name[currentLang] ?? workPackage?.name);

	const isPageLoading =
		isFileListLoading ||
		isApproversLoading ||
		isWorkPackageLoading ||
		isDispositionTableTabsLoading;

	if (isPageLoading) {
		return (
			<Page>
				<PageContent>
					<Spinner />
				</PageContent>
			</Page>
		);
	}

	const isNoResult = !fileList.length && !tableState.search?.trim().length;
	const isNoSearchResult =
		!fileList.length && !!tableState.search?.trim().length;
	const { currentTab } = tableState;

	return (
		<Page>
			{modals.manageTableColumns}
			<DeleteWorkPackageModal
				onDeleted={commands.handleSuccessDeleteWorkPackage}
			/>
			<ChangeSettingsWorkPackageModal />
			<ChangeApproversModal />
			<FetchLoader active={isFileListRefetching} />

			<PageHeader>
				<PageTitle subHeader={date.formats.pageHead()}>
					<ExternalTranslation
						field="name"
						translations={workPackage?.multilingual}
						fallbackValue={workPackage?.name}
					/>
				</PageTitle>

				<PageHeaderRight>
					<Approvers>
						<Text variant="body_3_primary_bold">
							{t('disposition.approvers')}
						</Text>
						<StyledUserAvatarList
							hasAdd
							onAdd={commands.handleChangingApprovers}
						>
							{approvers.map((approver) => (
								<ApproverAvatar
									key={approver.userId}
									userId={approver.userId}
									userName={approver.userDisplayName}
									profileImage={approver.userProfileImage}
									isHidden={approver.state === APPROVER_STATES.COMPLETE}
									isActive={approver.state === APPROVER_STATES.ACTIVE}
								/>
							))}
						</StyledUserAvatarList>
					</Approvers>
					<ButtonList>
						<Button
							variant="primary_outlined"
							icon={ICON_COLLECTION.settings}
							onClick={commands.handleChangeWorkPackageSettings}
						/>

						<ButtonMultipleActions options={primaryButtonActions} />
					</ButtonList>
				</PageHeaderRight>
			</PageHeader>
			<PageContent>
				<TabList value={tabIndex[currentTab]}>
					<TabWithLabel
						onClick={commands.handleChangeTab(
							RdaWorkPackageTabs.included_items,
						)}
						label={includedItemsCount}
					>
						{t('disposition.tabs.report_items')}
					</TabWithLabel>
					<TabWithLabel
						onClick={commands.handleChangeTab(
							RdaWorkPackageTabs.excluded_items,
						)}
						label={excludedItemsCount}
					>
						{t('disposition.tabs.excluded_items')}
					</TabWithLabel>
				</TabList>

				<ControlPanel>
					<ControlPanelLeft>
						<SearchBar
							placeholder={t('disposition.table_controls.search')}
							value={tableState.search}
							onChange={commands.handleSearch}
							onClear={commands.handleClearSearch}
							isLoading={isFileListSearchLoading}
							fulfilled
						/>
					</ControlPanelLeft>
					<ControlPanelRight>
						<TableControlWrapper>
							<Toggle
								onChange={commands.toggleFilterPanel}
								checked={isFilterPanelOpen}
								label={t('disposition.table_controls.show_filters')}
							/>
						</TableControlWrapper>
						<ManageColumnsButton onClick={commands.handleManageTableColumns} />
					</ControlPanelRight>
				</ControlPanel>
				<FilesTable
					tableName={tableName}
					data={fileList}
					filters={filesData?.stats.filters}
					activeFilters={tableState.filters[currentTab]}
					sortBy={tableState.orderBy}
					currentTab={tableCurrentTab}
					page={tableState.page - 1}
					pageSize={filesData?.query.pageSize ?? tableState.pageSize}
					totalPages={filesData?.stats.pages ?? 0}
					totalItems={filesData?.stats.objects ?? 0}
					isFilterPanelOpen={isFilterPanelOpen}
					isNoSearchResult={isNoSearchResult}
					isNoResult={isNoResult}
					selectedRows={selectedRows}
					onOpenFileInfo={commands.handleOpenFileInfo}
					onChangePageSize={commands.handleChangePageSize}
					onChangePage={commands.handleChangePage}
					onSortChanged={commands.handleChangeSorting}
					onChangeFilter={commands.handleChangeFilterOption}
					onClearFilters={commands.handleClearFilters}
					onSelectRow={commands.handleSelectRow}
					toggleSelectingAllRows={commands.toggleSelectingAllRows}
				>
					{({ state }) => {
						const selectedItemsCount = Object.keys(state.rowSelection).length;

						if (!selectedItemsCount) return null;

						return (
							<TableActionPanel
								selectedCountItems={selectedItemsCount}
								allCountItems={fileList.length}
								onSelectAll={commands.handleSelectAllRows}
							>
								<ButtonList>
									{tableCurrentTab === RdaWorkPackageTabs.included_items && (
										<>
											<Button
												label={t('disposition.actions.exclude_items')}
												onClick={commands.handleExcludeSelectedItems}
												loading={isExcludeSelectedItemsLoading}
											/>
											<Button
												variant="primary_ghost"
												label={t('disposition.actions.cancel_selection')}
												icon={ICON_COLLECTION.cross}
												onClick={commands.handleResetSelectedRows}
											/>
										</>
									)}
									{tableCurrentTab === RdaWorkPackageTabs.excluded_items && (
										<>
											<Button
												label={t('disposition.actions.include_items')}
												onClick={commands.handleIncludeSelectedItems}
												loading={isIncludeSelectedItemsMutationLoading}
											/>
											<Button
												variant="primary_ghost"
												label={t('disposition.actions.cancel_selection')}
												icon={ICON_COLLECTION.cross}
												onClick={commands.handleResetSelectedRows}
											/>
										</>
									)}
								</ButtonList>
							</TableActionPanel>
						);
					}}
				</FilesTable>
			</PageContent>
		</Page>
	);
};
