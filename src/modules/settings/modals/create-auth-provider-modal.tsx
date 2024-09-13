import React, { useContext } from 'react';
import {
	AuthProviderForm,
	AuthProviderFormRef,
	ProviderFormProps,
} from 'modules/settings/forms/auth-provider-form';

import { AUTH_PROVIDER_API_ERRORS } from 'app/api/auth-provider-api/auth-provider-api-error';

import {
	IAuthProviderType,
	IAuthSyncSchedule,
} from 'shared/types/auth-provider';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalContext, ModalContextProps } from 'shared/components/modal';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';

export interface ModalAddProviderProps {
	formRef?: React.Ref<AuthProviderFormRef>;
	error?: AUTH_PROVIDER_API_ERRORS;
	isSubmitting: boolean;
	isDataLoading: boolean;
	authProviderTypeList: IAuthProviderType[];
	authProviderSyncScheduleList: IAuthSyncSchedule[];
	onSubmit: ProviderFormProps['onSubmit'];
}

export const CreateAuthProviderModal: React.FC<ModalAddProviderProps> = ({
	formRef,
	error,
	isSubmitting,
	isDataLoading,
	authProviderTypeList,
	authProviderSyncScheduleList,
	onSubmit,
}) => {
	const { t } = useTranslation();
	const modalContext = useContext<ModalContextProps>(ModalContext);

	return (
		<>
			<ModalNavbar onClose={modalContext.onClose} />
			<PageHeader>
				<HeaderTitle variant="h2_primary_semibold">
					{t('auth_provider.create_modal.title')}
				</HeaderTitle>
				<Text variant="body_2_secondary">
					{t('auth_provider.create_modal.sub_title')}
				</Text>
			</PageHeader>
			<PageBody>
				{isDataLoading && <Spinner />}
				{!isDataLoading && (
					<AuthProviderForm
						formRef={formRef}
						error={error}
						authProviderTypeList={authProviderTypeList}
						authProviderSyncScheduleList={authProviderSyncScheduleList}
						onSubmit={onSubmit}
					>
						{({ formState: { isDirty } }) => (
							<Button
								type="submit"
								icon={ICON_COLLECTION.chevron_right}
								label={t('auth_provider.create_modal.actions.submit')}
								loading={isSubmitting}
								disabled={!isDirty}
							/>
						)}
					</AuthProviderForm>
				)}
			</PageBody>
		</>
	);
};
