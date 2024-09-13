import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { RejectExtendRdaItem } from 'modules/rda-work-packages/features/reject-extend-rda-item/reject-extend-rda-item';
import { RequestRdaItemFeedbackModal } from 'modules/rda-work-packages/features/request-rda-item-feedback/request-rda-item-feedback-modal';
import { RdaAssignmentsTabs } from 'modules/rda-work-packages/pages/rda-assignment/rda-assignment';
import { useModalManager } from 'shared/context/modal-manager';
import styled from 'styled-components';

import { ApproverApi } from 'app/api/approver-api/approver-api';
import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import { RdaAssignmentsApi } from 'app/api/rda-assignments/rda-assignments-api';
import { RdaItemApi } from 'app/api/rda-item-api/rda-item-api';

import { ThemeProps } from 'app/settings/theme/theme';

import { ICoreConfig } from 'shared/types/core-config';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { RDA_ASSIGNMENT_ITEM_STATES } from 'shared/constants/constans';
import {
	CORE_CONFIG_LIST_QUERY_KEYS,
	RDA_ASSIGNMENT,
	WORK_PACKAGE_FILES_KEYS,
} from 'shared/constants/query-keys';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Tab } from 'shared/components/tabs/tab';
import { TabList } from 'shared/components/tabs/tab-list';
import { TabWithLabel } from 'shared/components/tabs/tab-with-label';
import { Text } from 'shared/components/text/text';

import { FeedbackFromUsersTab } from './components/feedback-from-users-tab/feedback-from-users-tab';
import { FileInfoTab } from './components/file-info-tab';
import { GeneralFileInfo } from './components/general-file-info';
import { PageSpinner } from './components/page-spinner';

const PageBody = styled.div`
	padding-top: 1.5rem;
`;

const PageBodyFooter = styled.div`
	display: flex;
	justify-content: center;
	padding-top: 1.4rem;
`;

const Actions = styled(ButtonList)`
	justify-content: center;
	margin-top: 2.4rem;
`;

const PageLinkText = styled(Text)``;

const PageLink = styled.a<ThemeProps>`
	position: relative;
	display: inline-block;
	padding: 0 0.7rem;
	text-decoration: none;
	border-radius: ${({ theme }) => theme.borderRadius.secondary};

	// &:visited ${PageLinkText} {
	// 	color: #5b1e97;
	// }

	&:not(:last-child) {
		margin-right: 1.6rem;

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			right: -0.9rem;
			width: 1px;
			height: 0.8125rem;
			background-color: ${({ theme }) => theme.colors.primary};
			transform: translateY(-50%);
		}
	}
`;

const TabContent = styled.div`
	margin-top: 1.3rem;
`;

type TabTypes = 'file-info' | 'feedback-users';
const tabindex: Record<TabTypes, number> = {
	'file-info': 0,
	'feedback-users': 1,
};

const FileInfoPage: React.FC = () => {
	const { id, fileId } = useParams();
	const [searchParams] = useSearchParams({ t: '' });
	const { t, multilingualT } = useTranslation();

	const pageType = searchParams.get('t');
	const isAssignmentPage =
		!!pageType &&
		['pending', 'approved', 'rejected', 'feedback_pending'].includes(pageType);
	const isWorkPackagePage =
		!!pageType &&
		['report_items', 'excluded_items', 'report', 'included_items'].includes(
			pageType,
		);

	const hasActions =
		!!pageType &&
		[
			'pending',
			'approved',
			'rejected',
			'report_items',
			'excluded_items',
		].includes(pageType);

	const navigate = useNavigate();
	const modals = useRef<
		| object
		| Record<'categories' | 'specific' | 'recordDetails', Array<Window | null>>
	>({});

	const [currentTab, setCurrentTab] = useState<TabTypes>('file-info');
	const modalManager = useModalManager();

	const {
		data: fileData,
		refetch: refetchFileData,
		isLoading: isFileDataLoading,
	} = useQuery({
		queryKey: WORK_PACKAGE_FILES_KEYS.file(Number(fileId)),
		queryFn: () => RdaItemApi.getFileById({ id: Number(fileId) }),
		onSuccess(data) {
			additionalMutation.mutate(Number(data.id));
		},
		enabled: fileId !== undefined && isWorkPackagePage,
	});

	const {
		data: assignment,
		refetch: refetchAssignment,
		isLoading: isAssignmentLoading,
	} = useQuery({
		queryKey: RDA_ASSIGNMENT.assignment(Number(fileId)),
		queryFn: () => RdaAssignmentsApi.findOneById({ id: Number(fileId) }),
		onSuccess(data) {
			additionalMutation.mutate(Number(data.item.id));
		},
		enabled: fileId !== undefined && isAssignmentPage,
	});

	const additionalMutation = useMutation({
		mutationKey: WORK_PACKAGE_FILES_KEYS.additionalInfo(Number(fileId)),
		mutationFn: (id: number) =>
			RdaItemApi.getAdditionalInfo({ id: Number(id) }),
	});

	const {
		data: appConfigs,
		isLoading: isLoadingAppConfigs,
		isFetched: isFetchedAppConfigs,
	} = useQuery({
		queryKey: CORE_CONFIG_LIST_QUERY_KEYS.config_list,
		queryFn: CoreConfigApi.getConfigList,
		enabled: isAssignmentPage,
		select: useCallback((data: ICoreConfig[]) => {
			const allowFeedbackRequests = data.find(
				(setting) => setting.property === 'rda.General.AllowFeedbackRequests',
			);
			const defaultFeedbackMessage = data.find(
				(setting) => setting.property === 'rda.General.DefaultFeedbackMessage',
			);

			return {
				allowFeedbackRequests: allowFeedbackRequests?.value === 'true',
				defaultFeedbackMessage: defaultFeedbackMessage?.value,
			};
		}, []),
	});

	const file = fileData || assignment?.item;

	useEffectAfterMount(() => {
		if (!fileId) return;

		if (isWorkPackagePage) {
			refetchFileData();
		}
		if (isAssignmentPage) {
			refetchAssignment();
		}
	}, [fileId]);

	const { data: fileFullPath, isLoading: isFileFullPathLoading } = useQuery({
		queryFn: () => {
			const id = isAssignmentPage ? assignment?.item?.id : fileId;

			return RdaItemApi.getFileFullPathById({ id: Number(id) });
		},
		enabled: isAssignmentPage ? !!assignment : fileId !== undefined,
	});

	const {
		data: approvalHistory = [],
		isLoading: isApprovalHistoryLoading,
		refetch: refetchApprovalHistory,
	} = useQuery({
		queryKey: `approval-history-${fileData?.dataid}`,
		queryFn: () => ApproverApi.getApprovalHistoryById({ id: Number(fileId) }),
		enabled: fileId !== undefined,
	});

	const moveToPendingSelectedItemsMutation = useMutation({
		mutationFn: async () => {
			await RdaAssignmentsApi.moveToPendingFile({
				rdaItemApprovals: [assignment?.id as number],
				state: RDA_ASSIGNMENT_ITEM_STATES.PENDING,
			});

			window.opener?.postMessage({
				type: 'updateFileList',
				assignment: assignment,
			});
		},
	});

	const approveItemMutation = useMutation({
		mutationFn: async () => {
			console.log(assignment);

			await RdaAssignmentsApi.approveFile({
				rdaItemApprovals: [String(assignment?.id)],
				state: RDA_ASSIGNMENT_ITEM_STATES.APPROVED,
			});
			window.opener?.postMessage({
				type: 'updateFileList',
				assignment: assignment,
			});
		},
	});

	const excludeSelectedItemsMutation = useMutation({
		mutationFn: async () => {
			await RdaItemApi.updateFile({ id: Number(fileId), included: 0 });
			window.opener?.postMessage({
				type: 'updateFileList',
				workPackage: fileData,
			});
		},
	});

	const includeSelectedItemsMutation = useMutation({
		mutationFn: async () => {
			await RdaItemApi.updateFile({ id: Number(fileId), included: 1 });
			window.opener?.postMessage({
				type: 'updateFileList',
				workPackage: fileData,
			});
		},
	});

	useTitle(file?.name ?? '');

	useEffect(() => {
		window.onmessage = (e) => {
			if (e.data.type === 'changedFileId') {
				if (!file) return;

				for (const key in modals.current) {
					const fileWindow = modals.current[key];
					e.data.oldId = file?.id;
					fileWindow?.postMessage(e.data);
				}

				navigate(
					DISPOSITIONS_ROUTES.FILE_INFO.generate.local(
						e.data.workPackageId,
						e.data.newId,
						searchParams.get('t') as RdaAssignmentsTabs,
					),
				);
			}
		};
	}, [file]);

	const onChangeTab = (tab: TabTypes) => () => setCurrentTab(tab);

	const onOpenPage =
		(link: string, name: string) =>
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			e.preventDefault();
			if (!file?.id) {
				return;
			}

			let features = 'left=500,top=250,width=584,height=575';

			switch (link) {
				case DISPOSITIONS_ROUTES.FILE_INFO_CATEGORIES.generate.external(
					Number(id),
					Number(file.id),
				):
					features = 'left=700,top=250,width=584,height=575';
					break;
				case DISPOSITIONS_ROUTES.FILE_INFO_SPECIFIC.generate.external(
					Number(id),
					Number(file.id),
				):
					features = 'left=800,top=250,width=584,height=410';
					break;
				case DISPOSITIONS_ROUTES.FILE_INFO_RECORD_DETAILS.generate.external(
					Number(id),
					Number(file.id),
				):
					features = 'left=900,top=280,width=800,height=425';
					break;
			}

			const windowReference = (modals.current[name] = window.open(
				link,
				name + id + file.id,
				features,
			));

			if (!windowReference) return;

			windowReference.onload = function () {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				this.onbeforeunload = function () {
					delete modals.current[name];
				};
			};
		};

	const handleApproveItem = async () => {
		await approveItemMutation.mutateAsync();
	};

	const onMoveToPendingItems = async () => {
		await moveToPendingSelectedItemsMutation.mutateAsync();
	};

	const handleRejectExtendItems = async () => {
		modalManager.open(RDA_WORK_PACKAGE_MODAL_NAMES.USE_REJECT_EXTEND, [
			String(assignment?.id),
		]);
	};

	const handleRequestFeedback = async () => {
		modalManager.open(
			RDA_WORK_PACKAGE_MODAL_NAMES.USE_REQUEST_FEEDBACK,
			[String(assignment?.id)],
			appConfigs?.defaultFeedbackMessage,
		);
	};

	const handleExcludeSelectedItems = async () => {
		await excludeSelectedItemsMutation.mutateAsync();
	};

	const handleIncludeSelectedItems = async () => {
		await includeSelectedItemsMutation.mutateAsync();
	};

	const handleSuccessAction = async () => {
		window.opener?.postMessage({
			type: 'updateFileList',
			assignment: assignment,
		});
		await refetchApprovalHistory();
	};

	const isDataLoading =
		isFileDataLoading ||
		isApprovalHistoryLoading ||
		isFileFullPathLoading ||
		isAssignmentLoading;

	if (isDataLoading && additionalMutation.isLoading) {
		return <PageSpinner />;
	}

	return (
		<>
			{file && (
				<>
					<RejectExtendRdaItem
						workPackageId={assignment?.item?.rdamain?.id}
						rejectButtonLabel={
							multilingualT({
								field: 'rejectButtonLabel',
								translations: assignment?.item?.rdamain?.multilingual,
								fallbackValue: assignment?.item?.rdamain?.rejectButtonLabel,
							}) as string
						}
						onSuccess={handleSuccessAction}
					/>
					<RequestRdaItemFeedbackModal
						workPackageId={assignment?.item?.rdamain?.id}
						onSuccess={handleSuccessAction}
					/>
					<GeneralFileInfo file={file} fileFullPath={fileFullPath} />

					<PageBody>
						<TabList value={tabindex[currentTab]}>
							<Tab onClick={onChangeTab('file-info')}>
								{t('disposition.file_info_modal.tabs.file_info')}
							</Tab>
							<TabWithLabel
								label={approvalHistory.length}
								onClick={onChangeTab('feedback-users')}
							>
								{t('disposition.file_info_modal.tabs.feedback_from_others')}
							</TabWithLabel>
						</TabList>
						<TabContent>
							{currentTab === 'file-info' && (
								<FileInfoTab
									file={file}
									additionalData={additionalMutation.data}
								/>
							)}
							{currentTab === 'feedback-users' && (
								<FeedbackFromUsersTab historyList={approvalHistory} />
							)}
						</TabContent>
					</PageBody>
					<PageBodyFooter>
						<PageLink
							href={DISPOSITIONS_ROUTES.FILE_INFO_CATEGORIES.generate.external(
								Number(id),
								Number(file.id),
							)}
							onClick={onOpenPage(
								DISPOSITIONS_ROUTES.FILE_INFO_CATEGORIES.generate.external(
									Number(id),
									Number(file.id),
								),
								'categories',
							)}
							target="popup"
						>
							<PageLinkText variant="body_4_primary">
								{t('disposition.file_info_modal.links.categories')}
							</PageLinkText>
						</PageLink>
						<PageLink
							href={DISPOSITIONS_ROUTES.FILE_INFO_SPECIFIC.generate.external(
								Number(id),
								Number(file.id),
							)}
							onClick={onOpenPage(
								DISPOSITIONS_ROUTES.FILE_INFO_SPECIFIC.generate.external(
									Number(id),
									Number(file.id),
								),
								'specific',
							)}
							target="popup"
						>
							<PageLinkText variant="body_4_primary">
								{t('disposition.file_info_modal.links.specific')}
							</PageLinkText>
						</PageLink>
						<PageLink
							href={DISPOSITIONS_ROUTES.FILE_INFO_RECORD_DETAILS.generate.external(
								Number(id),
								Number(file.id),
							)}
							onClick={onOpenPage(
								DISPOSITIONS_ROUTES.FILE_INFO_RECORD_DETAILS.generate.external(
									Number(id),
									Number(file.id),
								),
								'recordDetails',
							)}
							target="popup"
						>
							<PageLinkText variant="body_4_primary">
								{t('disposition.file_info_modal.links.record_details')}
							</PageLinkText>
						</PageLink>
					</PageBodyFooter>

					{hasActions && (
						<Actions>
							{isAssignmentPage &&
								assignment?.state === RDA_ASSIGNMENT_ITEM_STATES.PENDING && (
									<>
										<Button
											label={assignment.item.rdamain?.approveButtonLabel}
											loading={approveItemMutation.isLoading}
											onClick={handleApproveItem}
										/>
										<Button
											label={assignment.item.rdamain?.rejectButtonLabel}
											variant="primary_outlined"
											onClick={handleRejectExtendItems}
										/>
										<Button
											label={t('disposition.actions.request_feedback')}
											variant="primary_outlined"
											onClick={handleRequestFeedback}
										/>
									</>
								)}

							{isAssignmentPage &&
								assignment?.state === RDA_ASSIGNMENT_ITEM_STATES.APPROVED && (
									<>
										<Button
											label={t('disposition.actions.move_to_pending')}
											icon={ICON_COLLECTION.chevron_right}
											onClick={onMoveToPendingItems}
											loading={moveToPendingSelectedItemsMutation.isLoading}
										/>
										<Button
											label={assignment.item.rdamain?.rejectButtonLabel}
											variant="primary_outlined"
											onClick={handleRejectExtendItems}
										/>
										<Button
											label={t('disposition.actions.request_feedback')}
											variant="primary_outlined"
											onClick={handleRequestFeedback}
										/>
									</>
								)}
							{isAssignmentPage &&
								assignment?.state === RDA_ASSIGNMENT_ITEM_STATES.REJECTED && (
									<>
										<Button
											label={t('disposition.actions.move_to_pending')}
											icon={ICON_COLLECTION.chevron_right}
											onClick={onMoveToPendingItems}
											loading={moveToPendingSelectedItemsMutation.isLoading}
										/>
										<Button
											label={assignment.item.rdamain?.approveButtonLabel}
											variant="primary_outlined"
											loading={approveItemMutation.isLoading}
											onClick={handleApproveItem}
										/>
										<Button
											label={t('disposition.actions.request_feedback')}
											variant="primary_outlined"
											onClick={handleRequestFeedback}
										/>
									</>
								)}
							{isAssignmentPage &&
								assignment?.state ===
									RDA_ASSIGNMENT_ITEM_STATES.FEEDBACK_PENDING && (
									<>
										<Button
											label={t('disposition.actions.move_to_pending')}
											icon={ICON_COLLECTION.chevron_right}
											onClick={onMoveToPendingItems}
											loading={moveToPendingSelectedItemsMutation.isLoading}
										/>
										<Button
											label={assignment.item.rdamain?.approveButtonLabel}
											variant="primary_outlined"
											loading={approveItemMutation.isLoading}
											onClick={handleApproveItem}
										/>
										<Button
											label={assignment.item.rdamain?.rejectButtonLabel}
											variant="primary_outlined"
											onClick={handleRejectExtendItems}
										/>
									</>
								)}
							{isWorkPackagePage && !file.included && !file.includedIn && (
								<Button
									label={t('disposition.actions.include_items')}
									onClick={handleIncludeSelectedItems}
									loading={includeSelectedItemsMutation.isLoading}
								/>
							)}
							{isWorkPackagePage && !!file.included && (
								<Button
									label={t('disposition.actions.exclude_items')}
									onClick={handleExcludeSelectedItems}
									loading={excludeSelectedItemsMutation.isLoading}
								/>
							)}
						</Actions>
					)}
				</>
			)}
		</>
	);
};

export default FileInfoPage;
