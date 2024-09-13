import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import clsx from 'clsx';
import {
	ApproverStats,
	ApproverStatsProps,
} from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/information-section/approvers/approver-stats/approver-stats';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IApprover, IWorkPackage } from 'shared/types/dispositions';

import { APPROVER_STATES } from 'shared/constants/constans';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { Text } from 'shared/components/text/text';
import { UserAvatarWithLabel } from 'shared/components/user-avatar/user-avatar-with-label';

const DragIcon = styled(Icon)`
	width: 1rem;
`;

const Order = styled(Text)`
	margin-left: 1rem;
`;

const User = styled(UserAvatarWithLabel)``;

const Container = styled.li<ThemeProps>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.5rem 1rem;
	border: ${({ theme }) => theme.border.base};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	background-color: ${({ theme }) => theme.colors.background.secondary};
	transition: box-shadow 0.3s ease;

	& + & {
		margin-top: 0.75rem;
	}

	&.is-completed {
		background-color: ${({ theme }) => theme.colors.background.secondary};
		filter: contrast(1.05);
	}

	&.is-completed,
	&.is-active {
		${DragIcon} {
			opacity: 0.3;
		}
	}

	&.is-waiting {
		${User}, ${Order} {
			opacity: 0.4;
		}
	}

	&.is-dragging {
		box-shadow: 0 12px 32px rgba(0, 0, 0, var(--box-shadow-opacity, 0.15));
	}
`;

const ContainerLeft = styled.div`
	display: flex;
	align-items: center;
	flex-shrink: 0;
	margin-right: 1rem;
`;

const ContainerCenter = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	width: 258px;
	min-width: 0;

	&::after {
		content: '';
		position: absolute;
		top: 50%;
		right: 0;
		width: 1px;
		height: 100%;
		background-color: ${({ theme }) => theme.colors.secondary};
		opacity: 0.23;
		transform: translateY(-50%);
	}
`;

const ContainerRight = styled.div`
	margin-left: 1rem;
	flex-grow: 1;
`;

const ActionButton = styled(IconButton)`
	width: 2rem;
	height: 2rem;
	margin: 0 0.6rem;

	svg {
		width: 0.85rem;
		height: auto;
	}
`;

interface ApproverItemProps extends ApproverStatsProps {
	index: number;
	isAllowReassign?: boolean;
	workflowStatus: IWorkPackage['workflowStatus'];
	userId: IApprover['userId'];
	userImage: IApprover['userProfileImage'];
	approverId: IApprover['approverId'];
	order: number;
	username: string;
	state: IApprover['state'];
	stateText: string;
	onReassign: (userId: number) => void;
	onDelete: (approverId: IApprover['approverId']) => void;
}

export const ApproverItem: React.FC<ApproverItemProps> = ({
	index,
	isAllowReassign = true,
	workflowStatus,
	userId,
	userImage,
	approverId,
	order,
	username,
	state,
	stateText,
	approvedCount,
	pendingCount,
	rejectedCount,
	onReassign,
	onDelete,
}) => {
	const isCompletedState = state === APPROVER_STATES.COMPLETE;
	const isActiveState = state === APPROVER_STATES.ACTIVE;
	const isWaitingState = state === APPROVER_STATES.WAITING;

	return (
		<Draggable
			key={approverId}
			index={index}
			draggableId={String(approverId)}
			isDragDisabled={isCompletedState || isActiveState}
			shouldRespectForcePress
		>
			{(provided, snapshot) => (
				<Container
					ref={provided.innerRef}
					className={clsx('approver-item', {
						'is-dragging': snapshot.isDragging,
						'is-active': isActiveState,
						'is-waiting': isWaitingState,
						'is-completed': isCompletedState,
					})}
					{...provided.dragHandleProps}
					{...provided.draggableProps}
				>
					{order && (
						<ContainerLeft>
							<DragIcon icon={ICON_COLLECTION.order_dots_vertical} />
							<Order variant="body_3_primary_bold">{order}</Order>
						</ContainerLeft>
					)}
					<ContainerCenter>
						<User
							userId={userId}
							name={username}
							label={username}
							subText={stateText}
							url={getUserAvatarUrl(userId, userImage)}
						/>
						{state === APPROVER_STATES.ACTIVE && (
							<ActionButton
								isDisabled={!isAllowReassign}
								icon={ICON_COLLECTION.edit}
								onPress={() => {
									onReassign(userId);
								}}
							/>
						)}
						{state === APPROVER_STATES.WAITING && (
							<ActionButton
								icon={ICON_COLLECTION.delete}
								onPress={() => onDelete(approverId)}
							/>
						)}
					</ContainerCenter>
					<ContainerRight>
						<ApproverStats
							workflowStatus={workflowStatus}
							approvedCount={approvedCount}
							pendingCount={pendingCount}
							rejectedCount={rejectedCount}
						/>
					</ContainerRight>
				</Container>
			)}
		</Draggable>
	);
};
