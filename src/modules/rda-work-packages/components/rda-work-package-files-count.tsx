import React from 'react';
import { DispositionBaseCardProps } from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/disposition-card/disposition-card';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IApprover, IWorkPackage } from 'shared/types/dispositions';

import { DISPOSITION_WORKFLOW_STATES } from 'shared/constants/constans';

import { useTranslation } from 'shared/hooks/use-translation';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Text } from 'shared/components/text/text';
import { BaseTooltip } from 'shared/components/tooltip/base-tooltip';

const Statuses = styled.div`
	display: flex;
	align-items: center;
`;

const StatusCount = styled.div<ThemeProps>`
	display: flex;
	align-items: center;
	cursor: default;

	& + & {
		margin-left: 0.75rem;
	}
`;

const StatusCountIcon = styled(Icon)<ThemeProps>`
	margin-right: 0.4375rem;
	color: ${({ theme }) => theme.colors.secondary};
`;

interface DispositionFilesCountProps {
	workflowStatus: DispositionBaseCardProps['workflowStatus'];
	includedItemsCount: IWorkPackage['includedCount'];
	pendingItemsCount: IWorkPackage['pendingItemCount'];
	approvedItemsCount: IWorkPackage['approvedItemCount'];
	rejectedItemsCount: IWorkPackage['rejectedItemCount'];
	feedbackItemsCount?: IWorkPackage['feedbackPendingItemCount'];
	currentFeedbackUser?: IApprover | boolean;
}

export const RdaWorkPackageFilesCount: React.FC<DispositionFilesCountProps> = ({
	workflowStatus,
	includedItemsCount,
	pendingItemsCount,
	approvedItemsCount,
	rejectedItemsCount,
	feedbackItemsCount,
	currentFeedbackUser,
}) => {
	const { t } = useTranslation();

	const initialState =
		workflowStatus === DISPOSITION_WORKFLOW_STATES.PENDING ||
		workflowStatus === DISPOSITION_WORKFLOW_STATES.BUILDING_NEW;

	return (
		<Statuses>
			{initialState && (
				<BaseTooltip
					text={t('disposition.files_state_count.items_count')}
					placement="top"
					target={
						<StatusCount>
							<StatusCountIcon icon={ICON_COLLECTION.document} />
							<Text variant="body_4_primary">{includedItemsCount}</Text>
						</StatusCount>
					}
				/>
			)}

			{workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED && (
				<BaseTooltip
					text={t('disposition.files_state_count.pending')}
					placement="top"
					target={
						<StatusCount>
							<StatusCountIcon icon={ICON_COLLECTION.document} />
							<Text variant="body_4_primary">{pendingItemsCount}</Text>
						</StatusCount>
					}
				/>
			)}

			{!initialState && (
				<>
					<BaseTooltip
						text={t('disposition.files_state_count.approved')}
						placement="top"
						target={
							<StatusCount>
								<StatusCountIcon icon={ICON_COLLECTION.document_approved} />
								<Text variant="body_4_primary">{approvedItemsCount}</Text>
							</StatusCount>
						}
					/>
					<BaseTooltip
						text={t('disposition.files_state_count.rejected')}
						placement="top"
						target={
							<StatusCount>
								<StatusCountIcon icon={ICON_COLLECTION.document_dismiss} />
								<Text variant="body_4_primary">{rejectedItemsCount}</Text>
							</StatusCount>
						}
					/>
				</>
			)}

			{workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED &&
				!currentFeedbackUser && (
					<BaseTooltip
						text={t('disposition.files_state_count.feedback')}
						placement="top"
						target={
							<StatusCount>
								<StatusCountIcon icon={ICON_COLLECTION.document_feedback} />
								<Text variant="body_4_primary">{feedbackItemsCount}</Text>
							</StatusCount>
						}
					/>
				)}
		</Statuses>
	);
};
