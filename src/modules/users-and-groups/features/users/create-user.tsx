import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import {
	UserFormData,
	UserProfileFormRef,
} from 'modules/users-and-groups/pages/users-and-groups-overview/components/user-profile/user-profile';
import { AddUserModal } from 'modules/users-and-groups/pages/users-and-groups-overview/modals/add-user-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { ResponseError } from 'app/api/error-entity';
import { CreateUserDto, UserApi } from 'app/api/user-api/user-api';
import { USERS_API_ERRORS } from 'app/api/user-api/user-api-error';

import { IUser } from 'shared/types/users';

import { USERS_MODAL_NAMES } from 'shared/constants/constans';
import { USERS_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

type CreateUserProps = {
	onSuccess: () => Promise<unknown>;
};

export const CreateUser: React.FC<CreateUserProps> = ({ onSuccess }) => {
	const client = useQueryClient();
	const modalState = useStateModalManager(USERS_MODAL_NAMES.CREATE_USER);
	const unsavedModalState = useStateModalManager(
		USERS_MODAL_NAMES.UNSAVED_CHANGES_CREATE_USER,
	);
	const formRef = React.useRef<UserProfileFormRef>();

	const createUserMutation = useMutation<
		IUser,
		ResponseError<USERS_API_ERRORS>,
		CreateUserDto & { avatar?: File }
	>({
		mutationFn: async ({ avatar, ...data }) => {
			const user = await UserApi.createUser(data);
			if (avatar) {
				await UserApi.setAvatar({ file: avatar, id: user.id });
			}
			await onSuccess();

			return user;
		},
		onSuccess: async () => {
			client.refetchQueries(USERS_QUERY_KEYS.users_count);
			modalState.close();
		},
	});

	const onAccept = () => {
		formRef.current?.onSubmit();
		unsavedModalState.close();
	};

	const onRegret = () => {
		modalState.close();
		unsavedModalState.close();
	};

	const handleCloseModal = () => {
		if (formRef.current?.isDirty) {
			unsavedModalState.openModal();
			return;
		}

		modalState.close();
	};

	const onCreateUser = (data: UserFormData) => {
		createUserMutation.mutate({
			avatar: data.avatar,
			username: data.username as string,
			display: data.display as string,
			password: data.password as string,
			enabled: data.enabled,
			email: data.email as string,
			providerId: data.providerId,
			groups: data.groups,
		});
	};

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={handleCloseModal}
			isClosable={!createUserMutation.isLoading}
		>
			<Modal.Page>
				<AddUserModal
					formRef={formRef as React.Ref<UserProfileFormRef> | undefined}
					isSending={createUserMutation.isLoading}
					error={createUserMutation.error?.message}
					onSubmit={onCreateUser}
				/>
			</Modal.Page>

			<UnsavedChangesModal
				container="parent"
				isUpdating={createUserMutation.isLoading}
				onAccept={onAccept}
				onRegret={onRegret}
				open={unsavedModalState.open}
				onClose={unsavedModalState.close}
			/>
		</Modal.Root>
	);
};
