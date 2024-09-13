import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import {
	GroupFormData,
	GroupFormRef,
} from 'modules/users-and-groups/pages/users-and-groups-overview/components/group-form';
import { EditGroupModal } from 'modules/users-and-groups/pages/users-and-groups-overview/modals/edit-group-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { GroupApi, UpdateGroupDto } from 'app/api/groups-api/group-api';
import { UpdateUserDto } from 'app/api/user-api/user-api';

import { getCurrentUserData } from 'app/store/user/user-actions';
import { selectUserData } from 'app/store/user/user-selectors';

import { IGroup } from 'shared/types/group';
import { IUser } from 'shared/types/users';

import { GROUPS_MODAL_NAMES } from 'shared/constants/constans';
import { GROUPS_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

interface EditGroupProps {
	onSuccess: () => Promise<unknown>;
}

export const EditGroup: React.FC<EditGroupProps> = ({ onSuccess }) => {
	const queryClient = useQueryClient();
	const currentUser = selectUserData() as IUser;
	const getCurrentUserDataAction = getCurrentUserData();

	const [editableGroup, setEditableGroup] = useState<IGroup | null>(null);
	const formRef = useRef<GroupFormRef>();

	const modalState = useStateModalManager(GROUPS_MODAL_NAMES.EDIT_GROUP, {
		onBeforeOpen: (group: IGroup) => {
			setEditableGroup(group);
		},
	});

	const unsavedModalState = useStateModalManager(
		GROUPS_MODAL_NAMES.UNSAVED_CHANGES_EDIT_GROUP,
	);

	const updateGroupMutation = useMutation({
		mutationFn: async ({
			groupPayload,
			selectedUsers,
		}: {
			groupPayload?: UpdateGroupDto;
			selectedUsers: IUser[];
		}) => {
			if (groupPayload) {
				const updatedGroup = await GroupApi.updateGroup(groupPayload);

				queryClient.setQueryData(
					GROUPS_QUERY_KEYS.group(updatedGroup.id),
					updatedGroup,
				);
			}

			const oldUsers = groupUsersData;
			let changedUserList = false;
			let changedCurrentUser = false;

			for (const idx in oldUsers) {
				const oldUser = oldUsers[idx];
				const deletedUserIdx = selectedUsers.findIndex(
					(user) => user.id === oldUser.id,
				);
				const isDeleted = deletedUserIdx < 0;

				if (!isDeleted) continue;

				changedUserList = true;
				if (currentUser.id === oldUser.id) {
					changedCurrentUser = true;
				}

				await GroupApi.deleteUserFromGroup({
					userId: oldUser.id,
					groupId: editableGroup!.id!,
				});
				await queryClient.refetchQueries(`user-groups-${oldUser.username}`);
			}

			for (const idx in selectedUsers) {
				const selectedUser = selectedUsers[idx];
				const user = oldUsers.find((user) => user.id === selectedUser.id);
				const isNewUser = !user;

				if (!isNewUser) continue;

				changedUserList = true;
				if (currentUser.id === selectedUser.id) {
					changedCurrentUser = true;
				}

				await GroupApi.addUserToGroup({
					group: editableGroup as IGroup,
					user: selectedUser,
				});
				await queryClient.refetchQueries(
					`user-groups-${selectedUser.username}`,
				);
			}

			if (changedUserList) {
				await queryClient.refetchQueries([
					GROUPS_QUERY_KEYS.group_users,
					editableGroup?.id,
				]);
			}

			if (changedCurrentUser) {
				await getCurrentUserDataAction({ silent: true });
			}

			await onSuccess();
		},
		onSuccess: () => {
			modalState.close();
			unsavedModalState.close();
		},
	});

	const { data: groupData, isLoading } = useQuery({
		queryKey: GROUPS_QUERY_KEYS.group(editableGroup?.id as number),
		queryFn: () => GroupApi.getGroupById({ id: editableGroup?.id as number }),
		enabled: !!editableGroup,
	});

	const { data: groupUsersData = [], isLoading: isLoadingGroupUsers } =
		useQuery({
			queryKey: [GROUPS_QUERY_KEYS.group_users, editableGroup?.id],
			queryFn: () =>
				GroupApi.getGroupUsersByName({ name: editableGroup?.name as string }),
			enabled: !!editableGroup,
		});

	const onCloseGroupSettings = () => {
		if (
			formRef.current?.formState.isDirty &&
			Object.keys(formRef.current?.formState.dirtyFields).length
		) {
			unsavedModalState.openModal();
			return;
		}

		modalState.close();
	};

	const onRegret = () => {
		modalState.close();
		unsavedModalState.close();
	};

	const onAccept = () => {
		const payload = formRef.current?.getValues();
		const dirtyFields = formRef.current?.formState.dirtyFields;
		const selectedUsers = formRef.current?.selectedUsers ?? [];

		if (!payload) return;

		onEditGroup(payload, dirtyFields, selectedUsers);
	};

	async function onEditGroup(
		data: GroupFormData,
		dirtyFields,
		selectedUsers: IUser[],
	) {
		if (editableGroup === null) return;

		const payloadData: Omit<UpdateUserDto, 'id'> = {};
		let payload: UpdateUserDto | undefined = undefined;

		for (const field in data) {
			if (!(field in dirtyFields)) continue;

			payloadData[field] = data[field];
		}

		if (Object.keys(payloadData).length) {
			payload = {
				id: editableGroup.id,
				...payloadData,
			};
		}

		updateGroupMutation.mutate({ groupPayload: payload, selectedUsers });
	}

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={onCloseGroupSettings}
		>
			<Modal.Page>
				{editableGroup && (
					<EditGroupModal
						formRef={formRef}
						groupName={editableGroup.name}
						group={groupData}
						users={groupUsersData}
						isLoading={isLoading || isLoadingGroupUsers}
						isUpdating={updateGroupMutation.isLoading}
						onSubmit={onEditGroup}
					/>
				)}
			</Modal.Page>
			<UnsavedChangesModal
				container="parent"
				isUpdating={updateGroupMutation.isLoading}
				onAccept={onAccept}
				onRegret={onRegret}
				open={unsavedModalState.open}
				onClose={unsavedModalState.close}
			/>
		</Modal.Root>
	);
};
