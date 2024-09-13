import React, { useContext } from 'react';

import { USERS_API_ERRORS } from 'app/api/user-api/user-api-error';

import { IUser } from 'shared/types/users';

import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { ModalContext, ModalContextProps } from 'shared/components/modal';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Spinner } from 'shared/components/spinner/spinner';

import { EditUserForm } from '../components/edit-user-form';
import {
	UserProfileFormRef,
	UserProfileProps,
} from '../components/user-profile/user-profile';

interface EditUserModalProps {
	formRef?: React.MutableRefObject<UserProfileFormRef | undefined>;
	user?: IUser;
	localProviderId: number | null;
	isLoading: boolean;
	isUpdating: boolean;
	error?: USERS_API_ERRORS;
	onSubmit: UserProfileProps['onSubmit'];
	onResetPassword: () => void;
	isResettingPassword: boolean;
	isPasswordReset: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
	formRef,
	user,
	localProviderId,
	isLoading,
	isUpdating,
	error,
	isResettingPassword,
	isPasswordReset,
	onSubmit,
	onResetPassword,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);

	return (
		<>
			<ModalNavbar onClose={modalContext.onClose} />
			{isLoading && <Spinner />}
			{!isLoading && (
				<>
					<PageHeader>
						<HeaderTitle variant="h2_primary_semibold">
							<LocalTranslation
								tk="users.edit_user_modal.title"
								options={{ userName: user?.display }}
							/>
						</HeaderTitle>
					</PageHeader>
					<EditUserForm
						formRef={formRef}
						user={user}
						localProviderId={localProviderId}
						isUpdating={isUpdating}
						error={error}
						onSubmit={onSubmit}
						onResetPassword={onResetPassword}
						isResettingPassword={isResettingPassword}
						isPasswordReset={isPasswordReset}
					/>
				</>
			)}
		</>
	);
};
