import React, { useContext } from 'react';

import { USERS_API_ERRORS } from 'app/api/user-api/user-api-error';

import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { ModalContext, ModalContextProps } from 'shared/components/modal';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Text } from 'shared/components/text/text';

import { CreateUserForm } from '../components/create-user-form';
import {
	UserFormData,
	UserProfileFormRef,
} from '../components/user-profile/user-profile';

interface AddUserModalProps {
	formRef?: React.Ref<UserProfileFormRef>;
	isSending?: boolean;
	error?: USERS_API_ERRORS;
	onSubmit: (data: UserFormData) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
	formRef,
	isSending,
	error,
	onSubmit,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);

	return (
		<>
			<ModalNavbar onClose={modalContext.onClose} />
			<PageHeader>
				<HeaderTitle variant="h2_primary_semibold">
					<LocalTranslation tk="users.create_user_modal.title" />
				</HeaderTitle>
				<Text variant="body_2_secondary">
					<LocalTranslation tk="users.create_user_modal.sub_title" />
				</Text>
			</PageHeader>
			<CreateUserForm
				formRef={formRef}
				isSending={isSending}
				error={error}
				onSubmit={onSubmit}
			/>
		</>
	);
};
