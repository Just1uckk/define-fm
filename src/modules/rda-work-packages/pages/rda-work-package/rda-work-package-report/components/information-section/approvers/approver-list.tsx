import React, { useEffect, useRef } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { ApproverItem } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/information-section/approvers/approver-item';
import styled from 'styled-components';

import { IApprover, IWorkPackage } from 'shared/types/dispositions';

import {
	APPROVER_STATES,
	DISPOSITION_WORKFLOW_STATES,
} from 'shared/constants/constans';

import { useDate } from 'shared/hooks/use-date';
import { useTranslation } from 'shared/hooks/use-translation';

import { Text } from 'shared/components/text/text';

const Wrapper = styled.div`
	position: relative;
`;

const ApproversProgressRoot = styled.div`
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0.4rem;
	width: 2px;
	background-color: ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
`;

const ApproversProgressLine = styled.div<{ isRdaCompleted: boolean }>`
	position: absolute;
	top: 0;
	left: 0;
	width: 2px;
	height: 0;
	background-color: ${({ theme, isRdaCompleted }) =>
		isRdaCompleted ? theme.colors.green.style_1 : theme.colors.accent};

	&::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 6px;
		height: 6px;
		background-color: ${({ theme }) => theme.colors.white};
		border: 2px solid;
		border-color: ${({ theme, isRdaCompleted }) =>
			isRdaCompleted ? theme.colors.green.style_1 : theme.colors.accent};
		border-radius: 50%;
		transform: translateX(-50%);
		z-index: 1;
	}
`;

const ListWrapper = styled.div`
	margin-top: 1rem;

	&:first-child {
		margin-top: 0;
	}
`;

const List = styled.ul`
	padding-left: 1.5rem;
	margin: 0;
`;

const ListTitle = styled(Text)`
	margin-bottom: 1rem;
	padding-left: 1.5rem;
`;

interface ApproverListProps {
	workflowStatus: IWorkPackage['workflowStatus'];
	isAllowReassign: boolean;
	approvers: IApprover[];
	additionalApprovers: IApprover[];
	onChangeApproverOrder: (result: DropResult) => void;
	onReassign: (userId: number) => void;
	onDelete: (approverId: IApprover['approverId']) => void;
}

export const ApproverList: React.FC<ApproverListProps> = ({
	workflowStatus,
	approvers,
	isAllowReassign,
	additionalApprovers,
	onChangeApproverOrder,
	onReassign,
	onDelete,
}) => {
	const date = useDate();
	const { t } = useTranslation();
	const listRef = useRef<any>();
	const progressLineRef = useRef<any>();

	const userSubtext = (approver: IApprover) => {
		if (approver.state === APPROVER_STATES.WAITING) {
			return t('rda_report.approvers_section.approver.status.waiting');
		}
		if (approver.state === APPROVER_STATES.ACTIVE) {
			return t('rda_report.approvers_section.approver.status.active');
		}
		if (approver.state === APPROVER_STATES.COMPLETE && approver.completedDate) {
			return `${t(
				'rda_report.approvers_section.approver.status.done',
			)} (${date.formats.base(approver.completedDate)})`;
		}

		return '';
	};

	useEffect(() => {
		const wrapper = listRef.current;
		const progressLine = progressLineRef.current;

		if (
			(!additionalApprovers.length && !approvers.length) ||
			!wrapper ||
			!progressLine
		)
			return;

		let approverEl = wrapper.querySelector('.approver-item.is-active');
		if (
			[
				DISPOSITION_WORKFLOW_STATES.READY_TO_COMPLETE,
				DISPOSITION_WORKFLOW_STATES.ARCHIVE,
			].includes(workflowStatus)
		) {
			approverEl = wrapper.querySelectorAll('.approver-item.is-completed');
			approverEl = approverEl[approverEl.length - 1];
		}

		if (!approverEl) return;

		const parentPos = wrapper.getBoundingClientRect().top;
		const indicatorCircleHeight = 6;
		const approverElHeight =
			approverEl.offsetHeight / 2 + indicatorCircleHeight;
		const approverElPost = approverEl.getBoundingClientRect().top;
		const heightOfProgress = Math.abs(parentPos - approverElPost);

		progressLine.style.height = `${heightOfProgress + approverElHeight}px`;
	}, [
		approvers,
		additionalApprovers,
		listRef.current,
		progressLineRef.current,
		workflowStatus,
	]);

	return (
		<Wrapper ref={listRef}>
			<ApproversProgressRoot>
				<ApproversProgressLine
					ref={progressLineRef}
					isRdaCompleted={[
						DISPOSITION_WORKFLOW_STATES.READY_TO_COMPLETE,
						DISPOSITION_WORKFLOW_STATES.ARCHIVE,
					].includes(workflowStatus)}
				/>
			</ApproversProgressRoot>

			<ListWrapper>
				{!!approvers.length && (
					<ListTitle variant="body_2_primary">
						{t('rda_report.approvers_section.aprrovers')}
					</ListTitle>
				)}
				<DragDropContext onDragEnd={onChangeApproverOrder}>
					<Droppable droppableId="approvers">
						{(provided) => (
							<List ref={provided.innerRef} {...provided.droppableProps}>
								{approvers.map((approver, index) => (
									<ApproverItem
										key={approver.approverId}
										isAllowReassign={isAllowReassign}
										index={index}
										workflowStatus={workflowStatus}
										userId={approver.userId}
										userImage={approver.userProfileImage}
										approverId={approver.approverId}
										order={approver.orderBy}
										username={approver.userDisplayName}
										stateText={userSubtext(approver)}
										state={approver.state}
										pendingCount={approver.pending}
										approvedCount={approver.approved}
										rejectedCount={approver.rejected}
										onReassign={onReassign}
										onDelete={onDelete}
									/>
								))}
								{provided.placeholder}
							</List>
						)}
					</Droppable>
				</DragDropContext>
			</ListWrapper>

			<ListWrapper>
				{!!additionalApprovers.length && (
					<ListTitle variant="body_2_primary">
						{t('rda_report.approvers_section.conditional_approvers')}
					</ListTitle>
				)}
				<DragDropContext onDragEnd={onChangeApproverOrder}>
					<Droppable droppableId="additional-approvers">
						{(provided) => (
							<List ref={provided.innerRef} {...provided.droppableProps}>
								{additionalApprovers.map((approver, index) => (
									<ApproverItem
										key={approver.approverId}
										isAllowReassign={isAllowReassign}
										index={index}
										workflowStatus={workflowStatus}
										userId={approver.userId}
										userImage={approver.userProfileImage}
										approverId={approver.approverId}
										order={approvers.length + approver.orderBy}
										username={approver.userDisplayName}
										stateText={userSubtext(approver)}
										state={approver.state}
										pendingCount={approver.pending}
										approvedCount={approver.approved}
										rejectedCount={approver.rejected}
										onReassign={onReassign}
										onDelete={onDelete}
									/>
								))}
								{provided.placeholder}
							</List>
						)}
					</Droppable>
				</DragDropContext>
			</ListWrapper>
		</Wrapper>
	);
};
