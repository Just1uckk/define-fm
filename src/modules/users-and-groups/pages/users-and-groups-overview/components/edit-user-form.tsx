import React, { useContext } from 'react';

import { USERS_API_ERRORS } from 'app/api/user-api/user-api-error';

import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalContext, ModalContextProps } from 'shared/components/modal';

import {
	UserProfile,
	UserProfileFormRef,
	UserProfileProps,
} from './user-profile/user-profile';

interface EditUserFormProps {
	formRef?: React.MutableRefObject<UserProfileFormRef | undefined>;
	user?: IUser;
	localProviderId: number | null;
	isUpdating: boolean;
	error?: USERS_API_ERRORS;
	onSubmit: UserProfileProps['onSubmit'];
	onResetPassword: () => void;
	isResettingPassword: boolean;
	isPasswordReset: boolean;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({
	formRef,
	user,
	localProviderId,
	isUpdating,
	error,
	onResetPassword,
	onSubmit,
	isResettingPassword,
	isPasswordReset,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);
	const { t } = useTranslation();

	return (
		<UserProfile
			ref={formRef as React.Ref<UserProfileFormRef>}
			isEditMode
			user={user}
			error={error}
			onSubmit={onSubmit}
		>
			<ButtonList>
				<Button
					type="submit"
					icon={ICON_COLLECTION.chevron_right}
					label={t('users.edit_user_form.actions.save')}
					loading={isUpdating}
					disabled={isResettingPassword}
				/>
				<Button
					variant="primary_outlined"
					label={t('users.edit_user_form.actions.cancel')}
					onClick={modalContext.onClose}
					disabled={isUpdating || isResettingPassword}
				/>
			</ButtonList>
			{!isPasswordReset && user?.providerId === localProviderId && (
				<Button
					variant="primary_outlined"
					icon={ICON_COLLECTION.arrow_round}
					label={t('users.edit_user_form.actions.reset_password')}
					onClick={onResetPassword}
					loading={isResettingPassword}
				/>
			)}
			{isPasswordReset && user?.providerId === localProviderId && (
				<Button
					variant="success_outlined"
					icon={ICON_COLLECTION.check}
					label={t('users.edit_user_form.actions.password_reset')}
				/>
			)}
		</UserProfile>
	);
};
