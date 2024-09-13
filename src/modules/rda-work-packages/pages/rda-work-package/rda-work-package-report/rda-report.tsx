import React from 'react';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import { ApplyRemoveHold } from 'modules/rda-work-packages/features/apply-remove-hold/apply-remove-hold';
import { ChangeDispositionAction } from 'modules/rda-work-packages/features/change-disposition-action/change-disposition-action';
import { ChangeSettingsWorkPackageModal } from 'modules/rda-work-packages/features/change-settings-work-package/change-settings-work-package';
import { DeleteWorkPackageModal } from 'modules/rda-work-packages/features/delete-work-package/delete-work-package';
import { ForceApproverModal } from 'modules/rda-work-packages/features/force-approver/force-approver';
import { MoveRdaItems } from 'modules/rda-work-packages/features/move-rda-items/move-rda-items';
import { OverrideApprovalState } from 'modules/rda-work-packages/features/override-approval-state/override-approval-state';
import { ProcessingRdaItems } from 'modules/rda-work-packages/features/processing-rda-items/processing-rda-items';
import { ReassignApproverModal } from 'modules/rda-work-packages/features/reassign-approver/reassign-approver';
import { RecallWorkPackageModal } from 'modules/rda-work-packages/features/recall-work-package/recall-work-package';
import { WorkPackageInfoModal } from 'modules/rda-work-packages/features/show-work-package-info/work-package-info';
import { UpdatePhysicalObjectMetadata } from 'modules/rda-work-packages/features/update-physical-object-metadata/update-physical-object-metadata';
import { UpdateRecordsManagementMetadata } from 'modules/rda-work-packages/features/update-records-management-metadata/update-records-management-metadata';
import { FilesTable } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/files-table/files-table';
import { FilesTableCompletedState } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/files-table/files-table-completed-state';
import { FilesTableExcludedTab } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/files-table/files-table-excluded-tab';
import { InformationSection } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/information-section';
import { StatusSection } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/information-section/status-section';
import { PageSkeleton } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/page-skeleton';
import {
	TAB_INDEX_FOR_COMPLETED_STATE,
	TAB_INDEX_FOR_INITIATED_STATE,
	useRdaReport,
} from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/use-rda-report';
import styled from 'styled-components';

import {
	DISPOSITION_WORKFLOW_STATES,
	DISPOSITION_WORKFLOW_STATES_COMPLETED,
} from 'shared/constants/constans';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ButtonMultipleActions } from 'shared/components/button/button-multiple-actions';
import { MoreButton } from 'shared/components/button/more-button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { SearchBar } from 'shared/components/search-bar/search-bar';
import { Spinner } from 'shared/components/spinner/spinner';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
import { ManageColumnsButton } from 'shared/components/table-controls/manage-columns-button';
import { TabList } from 'shared/components/tabs/tab-list';
import { TabWithLabel } from 'shared/components/tabs/tab-with-label';
import { Title } from 'shared/components/title/title';
import { Toggle } from 'shared/components/toggle/toggle';

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

const PageContent = styled.div`
	margin-top: 1.7rem;
`;

const InformationContainer = styled.div`
	display: flex;
	align-items: stretch;
	margin: 0 -0.75rem;
`;

const InformationCol = styled.div`
	display: flex;
	padding: 0 0.75rem;
`;

const InformationSectionWrapper = styled(InformationCol)`
	width: 28.6%;
`;

const StatusSectionWrapper = styled(InformationCol)`
	flex-grow: 1;
`;

const TableWrapper = styled.div`
	margin-top: 1.5rem;
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

const ProcessItemsButton = styled(Button)`
	&.is-active .button__content-icon {
		transform: rotate(-90deg);
	}
`;

export const RdaWorkPackageReportPage: React.FC = () => {
	const {
		models,
		models: {
			workPackage,
			allDispositionActions,
			dispositionSearch,
			dispositionSnapshot,
			tableParams,
			fileList,
			filesStats,
			isAllowReassign,
			isDataLoading,
			isActionsLoading,
			isRdaItemsSearchLoading,
			isRdaItemsInitialLoading,
			TABLE_NAMES,
			additionalActionsForCompletedState,
			selectedItems,
		},
		commands,
		hooks: { t, multilingualT, useDate },
	} = useRdaReport();

	if (isDataLoading || !workPackage) {
		return (
			<Page>
				<PageContent>
					<PageSkeleton />
				</PageContent>
			</Page>
		);
	}

	const tabs = (
		<>
			{workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED && (
				<TabList value={tableParams.currentTab}>
					<TabWithLabel
						onClick={commands.handleChangeTab(
							TAB_INDEX_FOR_INITIATED_STATE.INCLUDED_ITEMS,
						)}
						label={workPackage.includedCount}
					>
						{t('disposition.tabs.report_items')}
					</TabWithLabel>
					<TabWithLabel
						onClick={commands.handleChangeTab(
							TAB_INDEX_FOR_INITIATED_STATE.EXCLUDED_ITEMS,
						)}
						label={workPackage.excludedCount}
					>
						{t('disposition.tabs.excluded_items')}
					</TabWithLabel>
				</TabList>
			)}

			{DISPOSITION_WORKFLOW_STATES_COMPLETED.includes(
				workPackage.workflowStatus,
			) && (
				<TabList value={tableParams.currentTab}>
					<TabWithLabel
						label={
							workPackage.pendingItemCount +
							workPackage.feedbackPendingItemCount
						}
						onClick={commands.handleChangeTab(
							TAB_INDEX_FOR_COMPLETED_STATE.UNDECIDED,
						)}
					>
						{t('disposition.tabs.unreviewed_items')}
					</TabWithLabel>
					<TabWithLabel
						label={workPackage.approvedItemCount}
						onClick={commands.handleChangeTab(
							TAB_INDEX_FOR_COMPLETED_STATE.APPROVED,
						)}
					>
						{multilingualT({
							field: 'approveButtonLabel',
							translations: workPackage.multilingual,
							fallbackValue: workPackage.approveButtonLabel,
						})}
					</TabWithLabel>
					<TabWithLabel
						label={workPackage.rejectedItemCount}
						onClick={commands.handleChangeTab(
							TAB_INDEX_FOR_COMPLETED_STATE.REJECTED,
						)}
					>
						{multilingualT({
							field: 'rejectButtonLabel',
							translations: workPackage.multilingual,
							fallbackValue: workPackage.rejectButtonLabel,
						})}
					</TabWithLabel>
					<TabWithLabel
						label={workPackage.excludedCount}
						onClick={commands.handleChangeTab(
							TAB_INDEX_FOR_COMPLETED_STATE.EXCLUDED_ITEMS,
						)}
					>
						{t('disposition.tabs.excluded_items')}
					</TabWithLabel>
				</TabList>
			)}
		</>
	);

	return (
		<>
			{models.modals.manageTableColumns}
			<ApplyRemoveHold
				fileList={fileList}
				selectedItems={selectedItems}
				workPackage={workPackage}
			/>
			<OverrideApprovalState
				refetchRdaItems={() => {
					commands.refetchWorkPackage();
					commands.refetchRdaItems();
				}}
				selectedItems={selectedItems}
				handleClearSelected={commands.handleClearSelected}
			/>
			<MoveRdaItems selectedItems={selectedItems} workPackage={workPackage} />
			<UpdatePhysicalObjectMetadata
				fileList={fileList}
				selectedItems={selectedItems}
				workPackage={workPackage}
			/>

			<UpdateRecordsManagementMetadata
				fileList={fileList}
				selectedItems={selectedItems}
				workPackage={workPackage}
			/>

			<ProcessingRdaItems handleClearSelected={commands.handleClearSelected} />
			<ChangeDispositionAction
				allDispositionActions={allDispositionActions || []}
				isActionsLoading={isActionsLoading}
			/>
			<ReassignApproverModal />
			<RecallWorkPackageModal />
			<ForceApproverModal />
			<WorkPackageInfoModal />
			<DeleteWorkPackageModal
				onDeleted={commands.handleSuccessDeleteWorkPackage}
			/>
			<ChangeSettingsWorkPackageModal />
			<FetchLoader active={models.isRdaItemsRefetching} />

			<Page>
				<PageHeader>
					<PageTitle subHeader={useDate.formats.pageHead()}>
						{multilingualT({
							field: 'name',
							translations: workPackage?.multilingual,
							fallbackValue: workPackage?.name,
						})}
					</PageTitle>

					<PageHeaderRight>
						<ButtonList>
							<Button
								variant="primary_outlined"
								icon={ICON_COLLECTION.info}
								label={t('disposition_report.actions.info')}
								onClick={commands.handleOpenInfo}
							/>

							<ButtonMultipleActions
								options={additionalActionsForCompletedState}
							/>
						</ButtonList>
					</PageHeaderRight>
				</PageHeader>
				<PageContent>
					<InformationContainer>
						<InformationSectionWrapper>
							<InformationSection
								disposition={workPackage}
								dispositionSearchName={
									multilingualT({
										field: 'name',
										translations: dispositionSearch?.multilingual,
										fallbackValue: dispositionSearch?.name,
									}) as string
								}
								dispositionSnapshotName={dispositionSnapshot?.name}
								onGenerateAuditReport={commands.handleGenerateAuditReport}
								isLoadingGenerateAuditReport={
									models.isGenerateAuditReportLoading
								}
							/>
						</InformationSectionWrapper>
						<StatusSectionWrapper>
							<StatusSection
								isAddingApprover={models.isAddApproverLoading}
								isAllowReassign={isAllowReassign}
								disposition={workPackage}
								approvers={models.approverList.approvers}
								additionalApprovers={models.approverList.additionalApprovers}
								onAddApprover={commands.handleAddApprover}
								onChangeApproverOrder={commands.handleChangeApproverOrder}
								onReassign={commands.handleReassignApprover}
								onDeleteApprover={commands.handleDeleteApprover}
							/>
						</StatusSectionWrapper>
					</InformationContainer>

					<TableWrapper>
						{tabs}
						<ControlPanel>
							<ControlPanelLeft>
								<SearchBar
									placeholder={t('disposition.table_controls.search')}
									value={tableParams.search}
									onChange={commands.handleSearch}
									onClear={commands.handleClearSearch}
									isLoading={isRdaItemsSearchLoading}
									fulfilled
								/>
							</ControlPanelLeft>
							<ControlPanelRight>
								{models.currentTab ===
									TAB_INDEX_FOR_COMPLETED_STATE.APPROVED && (
									<ButtonList>
										<MoreButton
											options={[
												{
													key: 'process_selected_rda_items',
													label: t(
														'disposition_report.actions.process_rda.selected_items',
													),
													onSelect: commands.handleProcessSelectedRdaItems,
												},
												{
													key: 'process_all_approved_rda_items',
													label: t(
														'disposition_report.actions.process_rda.all_items',
													),
													onSelect: commands.handleProcessAllApprovedRdaItems,
												},
											]}
											placement="bottom"
											handler={
												<ProcessItemsButton
													icon={ICON_COLLECTION.chevron_right}
													label={t(
														'disposition_report.actions.process_rda.label',
													)}
												/>
											}
										/>
										<MoreButton
											options={[
												{
													key: 'apply_remove_hold',
													label: 'Apply/Remove Hold',
													onClick: commands.handleApplyRemoveHold,
												},
												{
													key: 'change_disposition_action',
													label: t(
														'disposition_report.actions.action.change_disposition_action',
													),
													onSelect: commands.handleChangeDispositionAction,
												},
												{
													key: 'update_records_management_metadata',
													label: 'Update Records Management Metadata',
													onClick:
														commands.handleUpdateRecordsManagementMetadata,
												},
												{
													key: 'update_physical_object_metadata',
													label: 'Update Physical Object Metadata',
													onClick: commands.handleUpdatePhysicalObjectMetadata,
												},
												{
													key: 'override_approval_state',
													label: 'Override Approval State',
													onClick: commands.handleOverrideApprovalState(
														models.currentTab,
													),
												},
												{
													key: 'move',
													label: 'Move',
													onClick: commands.handleMoveItems,
												},
											]}
											placement="bottom"
											handler={
												<Button
													variant="white"
													icon={ICON_COLLECTION.chevron_down}
													label={t('disposition_report.actions.action.label')}
													disabled={
														Object.keys(models.selectedItems).length === 0
													}
												/>
											}
										/>
									</ButtonList>
								)}
								{models.currentTab ===
									TAB_INDEX_FOR_COMPLETED_STATE.REJECTED && (
									<MoreButton
										handler={
											<Button
												variant="white"
												icon={ICON_COLLECTION.chevron_down}
												label="Action"
											/>
										}
										options={[
											{
												key: 'apply_remove_hold',
												label: 'Apply/Remove Hold',
												onClick: commands.handleApplyRemoveHold,
											},
											{
												key: 'override_approval_state',
												label: 'Override Approval State',
												onClick: commands.handleOverrideApprovalState(
													models.currentTab,
												),
											},
											{
												key: 'update_records_management_metadata',
												label: 'Update Records Management Metadata',
												onClick: commands.handleUpdateRecordsManagementMetadata,
											},
											{
												key: 'update_physical_object_metadata',
												label: 'Update Physical Object Metadata',
												onClick: commands.handleUpdatePhysicalObjectMetadata,
											},
											{
												key: 'move',
												label: 'Move',
												onClick: commands.handleMoveItems,
											},
										]}
										placement="bottom"
									/>
								)}
								<TableControlWrapper>
									<Toggle
										onChange={commands.toggleFilters}
										checked={tableParams.isVisibleFilterPanel}
										label={t('disposition.table_controls.show_filters')}
									/>
								</TableControlWrapper>
								<ManageColumnsButton
									onClick={commands.handleManageTableColumns}
								/>
							</ControlPanelRight>
						</ControlPanel>
						{isRdaItemsInitialLoading && <Spinner />}
						{!isRdaItemsInitialLoading &&
							DISPOSITION_WORKFLOW_STATES_COMPLETED.includes(
								workPackage.workflowStatus,
							) && (
								<FilesTableCompletedState
									toggleSelectingAllRows={commands.handleToggleSelectingAllRows}
									tableName={models.currentTableName}
									tabIndex={models.currentTab}
									filters={filesStats?.filters}
									selectedFilters={tableParams.elements}
									selectedRows={models.selectedItems}
									data={fileList}
									page={tableParams.page - 1}
									pageSize={
										models.filesQueryData?.pageSize ?? tableParams.pageSize
									}
									totalPages={filesStats?.pages ?? 0}
									totalItems={filesStats?.objects ?? 0}
									isSelectableRows={false}
									isFilterPanelOpen={tableParams.isVisibleFilterPanel}
									isNoSearchResult={
										!fileList.length && !!tableParams.search?.trim().length
									}
									isNoResult={
										!fileList.length && !tableParams.search?.trim().length
									}
									onChangePageSize={commands.handleChangePageSize}
									onChangePage={commands.handleChangePage}
									onChangeFilter={commands.handleChangeFilter}
									onClearFilters={commands.handleClearFilters}
									onSelectRow={commands.handleSelectRow}
								/>
							)}
						{!isRdaItemsInitialLoading &&
							models.currentTableName ===
								TABLE_NAMES['rda-report-page-initiated__included_items'] && (
								<FilesTable
									tableName={models.currentTableName}
									filters={models.filesStats?.filters}
									selectedFilters={tableParams.elements}
									approvers={models.approversFullList}
									data={fileList}
									page={tableParams.page - 1}
									pageSize={
										models.filesQueryData?.pageSize ?? tableParams.pageSize
									}
									totalPages={models.filesStats?.pages ?? 0}
									totalItems={models.filesStats?.objects ?? 0}
									isSelectableRows
									selectedRows={models.selectedItems}
									isFilterPanelOpen={tableParams.isVisibleFilterPanel}
									isNoSearchResult={
										!fileList.length && !!tableParams.search?.trim().length
									}
									isNoResult={
										!fileList.length && !tableParams.search?.trim().length
									}
									onChangePageSize={commands.handleChangePageSize}
									onChangePage={commands.handleChangePage}
									onChangeFilter={commands.handleChangeFilter}
									onClearFilters={commands.handleClearFilters}
								/>
							)}
						{!isRdaItemsInitialLoading &&
							models.currentTableName ===
								TABLE_NAMES['rda-report-page-initiated__excluded_items'] && (
								<FilesTableExcludedTab
									tableName={models.currentTableName}
									filters={filesStats?.filters}
									selectedFilters={tableParams.elements}
									data={fileList}
									page={tableParams.page - 1}
									pageSize={
										models.filesQueryData?.pageSize ?? tableParams.pageSize
									}
									totalPages={filesStats?.pages ?? 0}
									totalItems={filesStats?.objects ?? 0}
									isSelectableRows={false}
									isFilterPanelOpen={tableParams.isVisibleFilterPanel}
									isNoSearchResult={
										!fileList.length && !!tableParams.search?.trim().length
									}
									isNoResult={
										!fileList.length && !tableParams.search?.trim().length
									}
									onChangePageSize={commands.handleChangePageSize}
									onChangePage={commands.handleChangePage}
									onChangeFilter={commands.handleChangeFilter}
									onClearFilters={commands.handleClearFilters}
								/>
							)}
					</TableWrapper>
				</PageContent>
			</Page>
		</>
	);
};
