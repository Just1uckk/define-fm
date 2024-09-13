import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { ConfirmUserDeletingModal } from 'modules/users-and-groups/modals/confirm-user-deleting-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { UserApi } from 'app/api/user-api/user-api';

import { IUser } from 'shared/types/users';

import { USERS_MODAL_NAMES } from 'shared/constants/constans';
import { USERS_QUERY_KEYS } from 'shared/constants/query-keys';

interface DeleteUserProps {
	onSuccess: () => Promise<void>;
}

export const DeleteUser: React.FC<DeleteUserProps> = ({ onSuccess }) => {
	const client = useQueryClient();
	const [users, setUsers] = useState<IUser[]>([]);

	const modalState = useStateModalManager(USERS_MODAL_NAMES.DELETE_USER, {
		onBeforeOpen: (users: IUser[]) => {
			setUsers(users);
		},
	});

	const deleteUserMutation = useMutation({
		mutationFn: async () => {
			const promises = users.map((user) => UserApi.deleteUser({ id: user.id }));
			await Promise.all(promises);
			await onSuccess();
		},
		onSuccess: () => {
			client.refetchQueries(USERS_QUERY_KEYS.users_count);
			modalState.resolveCallback();
			modalState.close();
		},
	});

	const onConfirm = () => {
		if (!users.length) return;

		deleteUserMutation.mutate();
	};

	return (
		<ConfirmUserDeletingModal
			users={users}
			isLoading={deleteUserMutation.isLoading}
			onAccept={onConfirm}
			onRegret={modalState.close}
			open={modalState.open}
		/>
	);
};
