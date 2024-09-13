import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { GroupFormData } from 'modules/users-and-groups/pages/users-and-groups-overview/components/group-form';
import { AddGroupModal } from 'modules/users-and-groups/pages/users-and-groups-overview/modals/add-group-modal';
import { useStateModalManager } from 'shared/context/modal-manager';
import { EventBus, GROUP_GLOBAL_EVENTS } from 'shared/utils/event-bus';

import { GROUP_API_ERRORS } from 'app/api/groups-api/errors';
import { CreateGroupDto, GroupApi } from 'app/api/groups-api/group-api';
import { IValidationApiError } from 'app/api/types';

import { IGroup } from 'shared/types/group';

import { GROUPS_MODAL_NAMES } from 'shared/constants/constans';
import { GROUPS_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

interface CreateGroupProps {
	onSuccess: () => Promise<unknown>;
}

export const CreateGroup: React.FC<CreateGroupProps> = ({ onSuccess }) => {
	const client = useQueryClient();
	const modalState = useStateModalManager(GROUPS_MODAL_NAMES.CREATE_GROUP);

	const createGroupMutation = useMutation<
		IGroup,
		IValidationApiError<GROUP_API_ERRORS>,
		CreateGroupDto,
		unknown
	>({
		onMutate: async (payload) => {
			await GroupApi.createGroup(payload);
			await onSuccess;
		},
		onSuccess: () => {
			EventBus.emit(GROUP_GLOBAL_EVENTS.findGroups);
			client.refetchQueries(GROUPS_QUERY_KEYS.groups_count);
			modalState.close();
		},
	});

	const onAfterClose = () => {
		if (createGroupMutation.isError) {
			createGroupMutation.reset();
		}
	};

	const onSubmit = (data: GroupFormData) => {
		createGroupMutation.mutate({
			name: data.name,
			comment: data.comment,
			enabled: data.enabled,
		});
	};

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={modalState.close}
			onAfterClose={onAfterClose}
		>
			<Modal.Page>
				<AddGroupModal
					error={createGroupMutation.error?.message}
					isLoading={createGroupMutation.isLoading}
					onSubmit={onSubmit}
				/>
			</Modal.Page>
		</Modal.Root>
	);
};
