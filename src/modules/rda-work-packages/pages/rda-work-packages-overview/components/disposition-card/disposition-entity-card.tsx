import React from 'react';
import { Link } from 'react-router-dom';
import { RdaWorkPackageFilesCount } from 'modules/rda-work-packages/components/rda-work-package-files-count';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import {
	APPROVER_STATES,
	DISPOSITION_WORKFLOW_STATES,
} from 'shared/constants/constans';

import { MoreButton } from 'shared/components/button/more-button';
import { Checkbox } from 'shared/components/checkbox/checkbox';
import { ExternalTranslation } from 'shared/components/external-translation';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { CircleProgressBar } from 'shared/components/progress-bar/circle-progress-bar';
import { TableEntity } from 'shared/components/table-elements/table-entity';
import { Text } from 'shared/components/text/text';
import { UserAvatarList } from 'shared/components/user-avatar-list/user-avatar-list';

import { ApproverAvatar } from '../../../../components/approver-avatar/approver-avatar';

import { DispositionBaseCardProps } from './disposition-card';
import { DispositionStatus } from './disposition-status';

const CardWrapper = styled(TableEntity)<ThemeProps & { disable?: boolean }>`
	flex-direction: column;
	width: 20.1875rem;
	margin-left: 0.75rem;
	opacity: ${(props) => (props.disable ? 0.5 : 1)};
	cursor: ${(props) => (props.disable ? 'not-allowed' : 'pointer')};
`;

const CadHeader = styled.div``;

const CardHeaderTop = styled.div`
	display: flex;
	align-items: center;
`;

const CardTitle = styled(Text)`
	flex-grow: 1;
	padding-right: 0.8rem;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
`;

const CardBody = styled.div`
	display: flex;
	justify-content: space-between;
	padding-top: 1.4rem;
	padding-bottom: 1.6rem;
`;

const StyledUserAvatarList = styled(UserAvatarList)`
	margin-left: -0.3rem;
`;

const Progress = styled.div`
	display: flex;
	align-items: center;
`;

const ProgressLabel = styled(Text)`
	margin-right: 0.5rem;
`;

const CardFooter = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const OpenCardButton = styled(Link)<ThemeProps>`
	position: absolute;
	top: -0.25rem;
	right: -0.4rem;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.5rem;
	height: 1.5rem;
	color: ${({ theme }) => theme.colors.primary};
`;

const StaledCircleProgressBar = styled(CircleProgressBar)<{
	numberOfDaysLeftToComplete: number;
}>`
	.circle-progress__progress {
		${({ numberOfDaysLeftToComplete }) =>
			numberOfDaysLeftToComplete <= 0 &&
			css`
				stroke: ${({ theme }) => theme.progressBar.progressOutstanding};
			`}
		${({ numberOfDaysLeftToComplete }) =>
			numberOfDaysLeftToComplete > 0 &&
			numberOfDaysLeftToComplete <= 5 &&
			css`
				stroke: ${({ theme }) => theme.progressBar.progressAlmostOutstanding};
			`}
	}
`;

type DispositionEntityCardProps = Omit<
	DispositionBaseCardProps,
	'view' | 'initiateDate'
>;

export const DispositionEntityCard: React.FC<DispositionEntityCardProps> = ({
	disable,
	id,
	to,
	linkState,
	name,
	multilingual,
	daysLeft,
	daysTotal,
	sourceName,
	approvers,
	isSelectable,
	isSelected,
	includedItemsCount,
	feedbackItemsCount,
	pendingItemsCount,
	approvedItemsCount,
	rejectedItemsCount,
	currentFeedbackUser,
	moreOptions,
	workflowStatus,
	onSelect,
}) => {
	const isTimeExpired = daysLeft <= 0;
	const progressPercentage = !isTimeExpired
		? (daysLeft / daysTotal) * 100
		: 100;

	return (
		<CardWrapper
			disable={disable}
			isSelected={isSelected && isSelected(id)}
			isSelectable={isSelectable}
		>
			<CadHeader>
				<CardHeaderTop>
					<CardTitle variant="body_3_primary_bold">
						<ExternalTranslation
							field="name"
							translations={multilingual}
							fallbackValue={name}
						/>
					</CardTitle>
					{isSelectable && (
						<Checkbox
							disabled={disable}
							onChange={onSelect ? () => onSelect(id) : undefined}
							checked={isSelected && isSelected(id)}
						/>
					)}
					{!isSelectable && moreOptions && (
						<MoreButton
							disabled={
								workflowStatus === DISPOSITION_WORKFLOW_STATES.BUILDING_NEW ||
								workflowStatus ===
									DISPOSITION_WORKFLOW_STATES.BUILDING_INITIATED ||
								workflowStatus === DISPOSITION_WORKFLOW_STATES.BUILDING_PENDING
							}
							options={moreOptions}
						/>
					)}
				</CardHeaderTop>
				<DispositionStatus
					workflowStatus={workflowStatus}
					isTimeExpired={isTimeExpired}
					sourceName={sourceName}
				/>
			</CadHeader>
			<CardBody>
				<StyledUserAvatarList>
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
				</StyledUserAvatarList>

				{workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED && (
					<Progress>
						<ProgressLabel variant="body_4_secondary_semibold">
							<LocalTranslation tk="disposition.progressbar.days_left" />
						</ProgressLabel>
						<StaledCircleProgressBar
							percentage={progressPercentage}
							numberOfDaysLeftToComplete={daysLeft}
							text={Math.abs(daysLeft)}
						/>
					</Progress>
				)}
			</CardBody>
			<CardFooter>
				<RdaWorkPackageFilesCount
					workflowStatus={workflowStatus}
					includedItemsCount={includedItemsCount}
					pendingItemsCount={pendingItemsCount}
					approvedItemsCount={approvedItemsCount}
					rejectedItemsCount={rejectedItemsCount}
					feedbackItemsCount={feedbackItemsCount}
					currentFeedbackUser={currentFeedbackUser}
				/>
				{to && !disable && (
					<OpenCardButton to={to} state={linkState}>
						<Icon icon={ICON_COLLECTION.chevron_right} />
					</OpenCardButton>
				)}
			</CardFooter>
		</CardWrapper>
	);
};
