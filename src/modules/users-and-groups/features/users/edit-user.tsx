import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import {
	UserFormData,
	UserProfileFormRef,
} from 'modules/users-and-groups/pages/users-and-groups-overview/components/user-profile/user-profile';
import { EditUserModal } from 'modules/users-and-groups/pages/users-and-groups-overview/modals/edit-user-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { AuthApi, ForgotPasswordDataDto } from 'app/api/auth-api/auth-api';
import { AUTH_API_ERRORS } from 'app/api/auth-api/auth-api-error';
import { ResponseError } from 'app/api/error-entity';
import { UpdateUserDto, UserApi } from 'app/api/user-api/user-api';
import { USERS_API_ERRORS } from 'app/api/user-api/user-api-error';

import { getCurrentUserData } from 'app/store/user/user-actions';
import { selectUserData } from 'app/store/user/user-selectors';

import { IAuthProviderType } from 'shared/types/auth-provider';
import { IUser } from 'shared/types/users';

import { USERS_MODAL_NAMES } from 'shared/constants/constans';
import { USERS_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

type EditUserProps = {
	modalName?: string;
	providerTypes: IAuthProviderType[] | [];
	onSuccess?: () => Promise<unknown>;
};

export const EditUser: React.FC<EditUserProps> = ({
	modalName = USERS_MODAL_NAMES.EDIT_USER,
	providerTypes,
	onSuccess,
}) => {
	const queryClient = useQueryClient();
	const currentUser = selectUserData() as IUser;
	const getCurrentUserDataAction = getCurrentUserData();
	const [editableUserId, setEditableUserId] = useState<number | null>(null);
	const formRef = useRef<UserProfileFormRef>();
	const localProviderId = (): number | null => {
		if (providerTypes.length) {
			const localProvider = providerTypes.find(
				(el) => el.clazz === 'com.cassiacm.core.provider.LocalProvider',
			);
			return localProvider?.id || null;
		}
		return null;
	};

	const modalState = useStateModalManager(modalName, {
		onBeforeOpen: (userId: IUser['id']) => {
			setEditableUserId(userId);
			userDataMutation.mutate(userId);
		},
	});
	const unsavedModalState = useStateModalManager(
		USERS_MODAL_NAMES.UNSAVED_CHANGES_EDIT_USER,
	);

	const updateUserMutation = useMutation<
		IUser,
		ResponseError<USERS_API_ERRORS>,
		UpdateUserDto & { avatar?: File }
	>({
		mutationFn: async ({ avatar, ...payload }) => {
			if (avatar) {
				await UserApi.setAvatar({ file: avatar, id: payload.id });
			}
			if (avatar === null) {
				await UserApi.deleteAvatar({ id: payload.id });
			}

			const updatedUser = await UserApi.updateUser(payload);
			if (onSuccess) await onSuccess();

			return updatedUser;
		},
		onSuccess: (updatedUser) => {
			if (currentUser.id === updatedUser.id) {
				getCurrentUserDataAction({ silent: true });
			}

			queryClient.setQueryData(
				[USERS_QUERY_KEYS.user, editableUserId!],
				updatedUser,
			);

			modalState.close();
			unsavedModalState.close();
		},
	});
	const resetPassword = useMutation<
		string,
		ResponseError<AUTH_API_ERRORS>,
		ForgotPasswordDataDto
	>(AuthApi.forgotPassword);

	const userDataMutation = useMutation({
		mutationFn: async (id: number) => await UserApi.getUserById({ id }),
	});

	// const { data: userData, isLoading } = useQuery({
	// 	queryKey: [USERS_QUERY_KEYS.user, editableUserId!],
	// 	queryFn: () => UserApi.getUserById({ id: editableUserId! }),
	// 	enabled: editableUserId !== null,
	// 	initialData: undefined,
	// });

	const onAfterCloseModal = () => {
		resetPassword.reset();
	};

	const onCloseProfileSettings = () => {
		if (formRef.current?.isDirty) {
			unsavedModalState.openModal();
			return;
		}

		modalState.close();
	};

	const onEditUser = (data: UserFormData, dirtyFields) => {
		if (editableUserId === null) return;

		const payload: UpdateUserDto = {
			id: editableUserId,
		};

		for (const field in data) {
			if (!(field in dirtyFields)) continue;

			payload[field] = data[field];
		}

		updateUserMutation.mutate(payload);
	};

	const onResetPassword = () => {
		if (!userDataMutation.data) return;

		resetPassword.mutate({ usernameOrEmail: userDataMutation.data.username });
	};

	const onRegret = () => {
		modalState.close();
		unsavedModalState.close();
	};

	const onAccept = () => {
		formRef.current?.onSubmit();
		unsavedModalState.close();
	};

	return (
		<Modal.Root
			open={modalState.open}
			fulfilled
			hasClose={false}
			onAfterClose={onAfterCloseModal}
			isClosable={!resetPassword.isLoading || !updateUserMutation.isLoading}
			onClose={onCloseProfileSettings}
		>
			<Modal.Page>
				<EditUserModal
					formRef={formRef}
					localProviderId={localProviderId()}
					user={userDataMutation.data}
					isLoading={userDataMutation.isLoading}
					isUpdating={updateUserMutation.isLoading}
					error={updateUserMutation.error?.message}
					onSubmit={onEditUser}
					onResetPassword={onResetPassword}
					isResettingPassword={resetPassword.isLoading}
					isPasswordReset={resetPassword.isSuccess}
				/>
			</Modal.Page>
			<UnsavedChangesModal
				container="parent"
				isUpdating={updateUserMutation.isLoading}
				onAccept={onAccept}
				onRegret={onRegret}
				open={unsavedModalState.open}
				onClose={unsavedModalState.close}
			/>
		</Modal.Root>
	);
};
