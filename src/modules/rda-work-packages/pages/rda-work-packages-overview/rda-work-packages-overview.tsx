import React from 'react';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import { map } from 'lodash';
import {
	DEFAULT_SETTINGS_LIST,
	findDefaultOption,
} from 'modules/auth/components/profile-settings-form/profile-tabs/edit-default-settings';
import { ChangeApproversModal } from 'modules/rda-work-packages/features/change-approvers/change-approvers-modal';
import { CreateRdaWorkPackageModal } from 'modules/rda-work-packages/features/create-rda-work-package/create-rda-work-package';
import { DeleteWorkPackageModal } from 'modules/rda-work-packages/features/delete-work-package/delete-work-package';
import { ForceApproverModal } from 'modules/rda-work-packages/features/force-approver/force-approver';
import { ReassignApproverModal } from 'modules/rda-work-packages/features/reassign-approver/reassign-approver';
import { RecallWorkPackageModal } from 'modules/rda-work-packages/features/recall-work-package/recall-work-package';
import { WorkPackageOverviewFilterModal } from 'modules/rda-work-packages/features/work-package-overview-filter/work-package-overview-filter';
import { NoRdaResult } from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/no-result';
import { RdaWorkPackagesListSkeleton } from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/skeleton';
import { useRdaWorkPackagesOverview } from 'modules/rda-work-packages/pages/rda-work-packages-overview/use-rda-work-packages-overview';
import styled from 'styled-components';

import { selectDefaultSettingsData } from 'app/store/user/user-selectors';

import { DISPOSITION_WORKFLOW_STATES } from 'shared/constants/constans';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

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
import { Spinner } from 'shared/components/spinner/spinner';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
import { FilterButton } from 'shared/components/table-controls/filter-button';
import { SortByButton } from 'shared/components/table-controls/sort-button';
import { TableActionPanel } from 'shared/components/table-controls/table-action-panel';
import { ViewTableToggle } from 'shared/components/table-controls/view-toggle';
import { TabList } from 'shared/components/tabs/tab-list';
import { TabWithLabel } from 'shared/components/tabs/tab-with-label';
import { Title } from 'shared/components/title/title';
import { Toggle } from 'shared/components/toggle/toggle';

import { DISPOSITION_CARD_VIEW_TYPES } from './components/disposition-card/disposition-card';
import { NoRdaSearchResult } from './components/no-search-result';
import { Table } from './components/table';

const Page = styled.div``;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
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

const SORT_OPTIONS = [
	{ label: 'dispositions.sort_by.name', value: 'name' },
	{ label: 'dispositions.sort_by.added_date', value: 'createDate' },
	{ label: 'dispositions.sort_by.days_left', value: 'daysLeft' },
] as const;

const RdaWorkPackagesOverviewPage: React.FC = () => {
	const { t } = useTranslation();
	useTitle(t('dispositions.title'));
	const date = useDate();

	const {
		commands,
		models,
		models: { isLoading },
	} = useRdaWorkPackagesOverview();

	const isDataLoading = models.isLoading.dispositionTableTabs;

	const isFetchLoaderActive =
		models.dispositions.isRefetching ||
		isLoading.generateAudit ||
		isLoading.initiateWorkPackage;

	const tableView = selectDefaultSettingsData();

	return (
		<>
			<ChangeApproversModal onSuccess={commands.handleSuccessChangeApprovers} />
			<ReassignApproverModal />
			<RecallWorkPackageModal
				onSuccess={commands.handleSuccessRecallWorkPackages}
			/>
			<ForceApproverModal onSuccess={commands.handleSuccessForceApprover} />
			<WorkPackageOverviewFilterModal
				initialActiveFilters={models.initialActiveFilters}
				externalFilters={models.dispositions.data?.stats.filters}
				onSave={commands.handleSuccessSaveFilters}
			/>
			<CreateRdaWorkPackageModal onCreated={commands.refetchList} />
			<DeleteWorkPackageModal onDeleted={commands.refetchList} />

			<FetchLoader active={isFetchLoaderActive} />

			<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
				<Breadcrumb
					breadcrumb={t('breadcrumbs.rda_work_packages')}
					path={DISPOSITIONS_ROUTES.RDA_WORK_PACKAGES_OVERVIEW.path}
					isLast
				/>
			</BreadcrumbPortal>

			<Page>
				<PageHeader>
					<Title subHeader={date.formats.pageHead()}>
						{t('dispositions.title')}
					</Title>
					<Button
						icon={ICON_COLLECTION.add}
						label={t('dispositions.actions.creat_new')}
						onClick={commands.handleCreateWorkPackage}
					/>
				</PageHeader>
				{isDataLoading && (
					<PageContent>
						<Spinner />
					</PageContent>
				)}

				{!isDataLoading && (
					<PageContent>
						<TabList value={models.tableState.currentTabIdx}>
							{map(models.dispositionTableTabs, (tab) => (
								<TabWithLabel
									key={tab.tabIndex}
									onClick={commands.handleChangingTab(tab)}
									label={tab.count}
								>
									{tab.tabLabel}
								</TabWithLabel>
							))}
						</TabList>
						<ControlPanel>
							<ControlPanelLeft>
								<SearchBar
									placeholder={t('dispositions.table_controls.search')}
									value={models.tableState.search}
									isLoading={models.dispositions.isSearching}
									onChange={commands.handleSearching}
									onClear={commands.handleClearSearching}
									fulfilled
								/>
							</ControlPanelLeft>
							<ControlPanelRight>
								<TableControlWrapper>
									<Toggle
										onChange={commands.handleTogglingSelectingRows}
										checked={models.tableState.isSelectableTable}
										label={t('components.table.multiple_select')}
									/>
								</TableControlWrapper>
								<SortByButton
									sortBy={models.tableState.orderBy}
									options={SORT_OPTIONS}
									onSelect={commands.handleSorting}
									onOptionLabel={(_, idx) => t(SORT_OPTIONS[idx].label)}
									onSelectedOptionLabel={(option) => t(option.label)}
								/>
								<FilterButton
									isActive={models.isActiveFilters}
									onClick={commands.handleOpeningTableFilters}
								/>
								<ViewTableToggle
									active={
										(findDefaultOption(
											tableView,
											DEFAULT_SETTINGS_LIST.PREFERRED_VIEW,
										)?.value as DISPOSITION_CARD_VIEW_TYPES) ||
										DISPOSITION_CARD_VIEW_TYPES.ROW
									}
									onChange={commands.handleChangingTableView}
								/>
							</ControlPanelRight>
						</ControlPanel>
						<>
							{!models.dispositions.isInitialLoading && (
								<>
									{!models.dispositions.list.length &&
										!!models.tableState.search.trim().length && (
											<NoRdaSearchResult />
										)}
									{!models.dispositions.list.length &&
										!models.tableState.search.trim().length && <NoRdaResult />}
								</>
							)}
						</>

						{models.dispositions.isInitialLoading && (
							<RdaWorkPackagesListSkeleton />
						)}
						{!models.dispositions.isInitialLoading && (
							<Table
								defaultSettings={models.defaultSettings}
								workPackageConfigs={models.workPackageConfigs}
								view={
									findDefaultOption(
										tableView,
										DEFAULT_SETTINGS_LIST.PREFERRED_VIEW,
									)?.value as DISPOSITION_CARD_VIEW_TYPES
								}
								page={models.tableState.page - 1}
								pageSize={
									models.dispositions.data?.query?.pageSize ??
									models.tableState.pageSize
								}
								totalPages={models.tableState.totalPages}
								totalItems={models.tableState.totalItems}
								dispositions={models.dispositions.list}
								currentUser={models.currentUser}
								isSelectableTable={models.tableState.isSelectableTable}
								isEntitySelected={commands.isRowSelected}
								onSelectEntity={commands.handleSelectingEntity}
								onVerifyApproverRights={commands.handleVerifyingApproverRights}
								onGenerateAudit={commands.handleGeneratingAudit}
								onInitiate={commands.handleInitiatingWorkPackage}
								onDeleteEntity={commands.handleDeletingEntity}
								onReassign={commands.handleReassigning}
								onRecall={commands.handleRecall}
								onForceApproval={commands.handleForcingApprover}
								onModifyApprovers={commands.handleModifyingApprovers}
								onComplete={commands.handleCompletingEntity}
								onChangedPageSize={commands.handleChangingPageSize}
								onChangePage={commands.handleChangingPage}
							/>
						)}
						{!!models.dispositions.selectedTableEntitiesCountByCurrentTab && (
							<TableActionPanel
								selectedCountItems={
									models.dispositions.selectedTableEntitiesCountByCurrentTab
								}
								allCountItems={models.dispositions.list.length}
								onSelectAll={commands.handleSelectingAllEntities}
							>
								<ButtonList>
									{models.dispositionTableTabs[
										models.tableState.currentTab
									]?.workflowStatus?.includes(
										DISPOSITION_WORKFLOW_STATES.PENDING,
									) && (
										<>
											<Button
												label={t('dispositions.actions.initiate')}
												onClick={commands.handleInitiatingSelectedEntities}
												loading={isLoading.initiateSelectedEntities}
											/>
											<Button
												variant="primary_outlined"
												label={t('dispositions.actions.delete')}
												icon={ICON_COLLECTION.delete}
												onClick={commands.handleDeletingSelectedEntities}
												disabled={isLoading.initiateSelectedEntities}
											/>
										</>
									)}
									{models.dispositionTableTabs[
										models.tableState.currentTab
									]?.workflowStatus?.includes(
										DISPOSITION_WORKFLOW_STATES.INITIATED,
									) && (
										<>
											<Button
												icon={ICON_COLLECTION.arrow_round_left}
												label={t('dispositions.actions.recall')}
												disabled={isLoading.archiveSelectedEntities}
												onClick={commands.handleRecallingSelectedEntities}
											/>
											<Button
												variant="primary_outlined"
												label={t('dispositions.actions.archive')}
												icon={ICON_COLLECTION.chevron_right}
												loading={isLoading.archiveSelectedEntities}
												onClick={commands.handleArchivingSelectedEntities}
											/>
										</>
									)}
									{models.dispositionTableTabs[
										models.tableState.currentTab
									]?.workflowStatus?.includes(
										DISPOSITION_WORKFLOW_STATES.ARCHIVE,
									) && (
										<>
											<Button
												icon={ICON_COLLECTION.arrow_round_left}
												label={t('dispositions.actions.recall')}
												onClick={commands.handleRecallingSelectedEntities}
											/>
											<Button
												variant="primary_outlined"
												label={t('dispositions.actions.delete')}
												icon={ICON_COLLECTION.delete}
												onClick={commands.handleDeletingSelectedEntities}
											/>
										</>
									)}
									<Button
										variant="primary_ghost"
										icon={ICON_COLLECTION.cross}
										label={t('dispositions.actions.cancel_selection')}
										onClick={commands.handleCancelingAllSelectedEntities}
									/>
								</ButtonList>
							</TableActionPanel>
						)}
					</PageContent>
				)}
			</Page>
		</>
	);
};

export default RdaWorkPackagesOverviewPage;
