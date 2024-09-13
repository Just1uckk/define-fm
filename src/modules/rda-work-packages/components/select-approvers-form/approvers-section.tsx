import React from 'react';
import {
	DragDropContext,
	Droppable,
	DropResult,
	ResponderProvided,
} from 'react-beautiful-dnd';
import { IApproverShort } from 'modules/rda-work-packages/components/select-approvers-form/select-approvers';
import styled from 'styled-components';

import { IUser } from 'shared/types/users';

import { UserSearchInput } from 'shared/components/input/user-search-input';
import { FormField } from 'shared/components/modal-form/form-field';
import { UserLineOrder } from 'shared/components/user-line/user-line-order';

const UserLineOrderList = styled.div`
	margin-top: 0.75rem;
`;

interface ApproversSectionProps {
	unsavedIsOpen?: boolean;
	dragDisabled?: boolean;
	label?: string;
	errorMessage?: string;
	droppableId: string;
	reassign?: boolean;
	selectedApprovers: IApproverShort[];
	selectedApproverIds: number[];
	onSelectApprover: (user: IUser) => void;
	onDeleteApprover: (id: number) => void;
	onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
}

export const ApproversSection: React.FC<ApproversSectionProps> = ({
	dragDisabled,
	unsavedIsOpen,
	droppableId,
	label,
	errorMessage,
	reassign = true,
	selectedApprovers,
	selectedApproverIds,
	onSelectApprover,
	onDeleteApprover,
	onDragEnd,
}) => {
	return (
		<>
			<FormField>
				<UserSearchInput
					unsavedIsOpen={unsavedIsOpen}
					approvers
					label={label}
					error={errorMessage}
					reassign={reassign}
					selectedUsers={selectedApproverIds}
					onSelectUser={onSelectApprover}
					fulfilled
				/>
			</FormField>
			<DragDropContext onDragEnd={onDragEnd}>
				<Droppable droppableId={droppableId}>
					{(provided) => (
						<UserLineOrderList
							ref={provided.innerRef}
							{...provided.droppableProps}
						>
							{selectedApprovers.map((approver, idx) => {
								return (
									<UserLineOrder
										dragDisabled={dragDisabled}
										key={approver.userId}
										index={idx}
										userId={approver.userId}
										userImage={approver.userProfileImage}
										username={approver.displayName}
										state={approver.state}
										order={idx + 1}
										onClose={() => onDeleteApprover(approver.userId)}
									/>
								);
							})}
							{provided.placeholder}
						</UserLineOrderList>
					)}
				</Droppable>
			</DragDropContext>
		</>
	);
};
