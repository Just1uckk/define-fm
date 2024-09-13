import React from 'react';
import { Link } from 'react-router-dom';
import { RdaWorkPackageFilesCount } from 'modules/rda-work-packages/components/rda-work-package-files-count';
import styled, { css } from 'styled-components';

import {
	APPROVER_STATES,
	DISPOSITION_WORKFLOW_STATES,
} from 'shared/constants/constans';

import { MoreButton } from 'shared/components/button/more-button';
import { ExternalTranslation } from 'shared/components/external-translation';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { HorizontalProgressBar } from 'shared/components/progress-bar/horizontal-progress-bar';
import { TableCol } from 'shared/components/table-elements/table-col';
import { TableEntity } from 'shared/components/table-elements/table-entity';
import { Text } from 'shared/components/text/text';
import { UserAvatarList } from 'shared/components/user-avatar-list/user-avatar-list';

import { ApproverAvatar } from '../../../../components/approver-avatar/approver-avatar';

import { DispositionBaseCardProps } from './disposition-card';
import { DispositionStatus } from './disposition-status';

const Row = styled(TableEntity)<any>`
	align-items: stretch;
	height: 5.125rem;
	text-decoration: none;
	opacity: ${(props) => (props.disable ? 0.5 : 1)};
	cursor: ${(props) => (props.disable ? 'not-allowed' : 'pointer')};
`;

const RowText = styled.div`
	display: inline-flex;
	align-items: center;
`;

const InfoCol = styled(TableCol)`
	max-width: 340px;
`;

const NameCol = styled(TableCol)`
	flex-shrink: 500;
	width: 500px;
	padding-right: 6px;

	&& {
		flex-grow: 0;
	}
`;

const Name = styled(Text)`
	margin-top: 0.2rem;
	padding-bottom: 0.5rem;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
`;

const FilesCol = styled(TableCol)`
	max-width: 175px;
`;

const ProgressCol = styled(TableCol)`
	align-items: center;
`;

const ProgressBar = styled.div`
	width: 140px;
`;

const ProgressBarText = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 0.5rem;

	& > * {
		* + * {
			margin-left: 0.5rem;
		}
	}
`;

const ProgressBarLabel = styled(Text)`
	display: inline-block;
	margin-right: 0.2rem;
`;

const StyledHorizontalProgressBar = styled(HorizontalProgressBar)<{
	numberOfDaysLeftToComplete: number;
}>`
	& .horizontal-progressbar__progress {
		${({ numberOfDaysLeftToComplete }) =>
			numberOfDaysLeftToComplete > 0 &&
			numberOfDaysLeftToComplete <= 5 &&
			css`
				background-color: ${({ theme }) =>
					theme.progressBar.progressAlmostOutstanding};
			`}
	}
`;

const UserAvatarListCol = styled(TableCol)`
	justify-content: flex-end;
	align-items: center;
	flex-direction: row;
	width: 10.75rem;
	margin-left: auto;
`;

const LabelText = styled(Text)`
	width: 4.375rem;
	margin-right: 1.125rem;
`;

const InfoRowText = styled(RowText)`
	&:not(:first-child) {
		margin-top: 0.4rem;
	}
`;

const StyledMoreButton = styled(MoreButton)`
	margin-left: 1.25rem;
`;

type DispositionEntityRowProps = Omit<
	DispositionBaseCardProps,
	'view' | 'initiateDate'
>;

export const DispositionEntityRow: React.FC<DispositionEntityRowProps> = ({
	disable,
	id,
	to,
	linkState,
	name,
	multilingual,
	createDate,
	createdBy,
	sourceName,
	daysLeft,
	daysTotal,
	approvers,
	includedItemsCount,
	pendingItemsCount,
	approvedItemsCount,
	rejectedItemsCount,
	feedbackItemsCount,
	currentFeedbackUser,
	isSelectable,
	isSelected,
	onSelect,
	moreOptions,
	workflowStatus,
}) => {
	const isTimeExpired = daysLeft <= 0;

	return (
		<Row
			disable={disable}
			tag={to && !disable ? Link : undefined}
			to={to}
			state={linkState}
			isSelectable={isSelectable}
			isSelected={isSelected && isSelected(id)}
			hasCheckbox
			onSelect={onSelect ? () => onSelect(id) : undefined}
		>
			<NameCol>
				<Name variant="body_3_primary_bold">
					<ExternalTranslation
						field="name"
						translations={multilingual}
						fallbackValue={name}
					/>
				</Name>
				<DispositionStatus
					workflowStatus={workflowStatus}
					isTimeExpired={isTimeExpired}
					sourceName={sourceName}
				/>
			</NameCol>
			<InfoCol>
				<InfoRowText>
					<LabelText variant="body_4_secondary">
						<LocalTranslation tk="dispositions.table_columns.createdBy" />
					</LabelText>
					<Text variant="body_4_primary">{createdBy}</Text>
				</InfoRowText>
				<InfoRowText>
					<LabelText variant="body_4_secondary">
						<LocalTranslation tk="dispositions.table_columns.dateCreated" />
					</LabelText>
					<Text variant="body_4_primary">{createDate}</Text>
				</InfoRowText>
			</InfoCol>
			<FilesCol>
				<RdaWorkPackageFilesCount
					workflowStatus={workflowStatus}
					includedItemsCount={includedItemsCount}
					pendingItemsCount={pendingItemsCount}
					approvedItemsCount={approvedItemsCount}
					rejectedItemsCount={rejectedItemsCount}
					feedbackItemsCount={feedbackItemsCount}
					currentFeedbackUser={currentFeedbackUser}
				/>
			</FilesCol>
			{workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED && (
				<ProgressCol>
					<ProgressBar>
						<ProgressBarText>
							<ProgressBarLabel variant="body_4_primary">
								<LocalTranslation tk="disposition.progressbar.days_left" />
							</ProgressBarLabel>

							<Text tag="span" variant="body_4_primary">
								{daysLeft}/{daysTotal}
							</Text>
						</ProgressBarText>
						<StyledHorizontalProgressBar
							numberOfDaysLeftToComplete={daysLeft}
							percentage={daysTotal ? (daysLeft / daysTotal) * 100 : 0}
						/>
					</ProgressBar>
				</ProgressCol>
			)}
			<UserAvatarListCol>
				<UserAvatarList>
					{approvers.map((approver) => (
						<ApproverAvatar
							disable={disable}
							key={approver.approverId}
							userId={approver.userId}
							userName={approver.userDisplayName}
							profileImage={approver.userProfileImage}
							isHidden={approver.state === APPROVER_STATES.COMPLETE}
							isActive={approver.state === APPROVER_STATES.ACTIVE}
						/>
					))}
				</UserAvatarList>
				{moreOptions && (
					<StyledMoreButton
						disabled={
							workflowStatus === DISPOSITION_WORKFLOW_STATES.BUILDING_NEW ||
							workflowStatus ===
								DISPOSITION_WORKFLOW_STATES.BUILDING_INITIATED ||
							workflowStatus === DISPOSITION_WORKFLOW_STATES.BUILDING_PENDING
						}
						options={moreOptions}
					/>
				)}
			</UserAvatarListCol>
		</Row>
	);
};
