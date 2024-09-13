import React from 'react';

import { USERS_API_ERRORS } from 'app/api/user-api/user-api-error';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';

import {
	UserFormData,
	UserProfile,
	UserProfileFormRef,
} from './user-profile/user-profile';

interface CreateUserFormProps {
	formRef?: React.Ref<UserProfileFormRef>;
	isSending?: boolean;
	error?: USERS_API_ERRORS;
	onSubmit: (data: UserFormData) => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
	formRef,
	isSending,
	error,
	onSubmit,
}) => {
	const { t } = useTranslation();

	return (
		<UserProfile ref={formRef} error={error} onSubmit={onSubmit}>
			<Button
				icon={ICON_COLLECTION.chevron_right}
				label={t('users.create_user_form.actions.create')}
				loading={isSending}
				disabled={isSending}
			/>
		</UserProfile>
	);
};
