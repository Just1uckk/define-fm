import React, { useContext } from 'react';
import {
	AuthProviderForm,
	AuthProviderFormRef,
	ProviderFormProps,
} from 'modules/settings/forms/auth-provider-form';

import { AUTH_PROVIDER_API_ERRORS } from 'app/api/auth-provider-api/auth-provider-api-error';

import {
	IAuthProvider,
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

export interface EditProviderModalProps {
	formRef?: React.Ref<AuthProviderFormRef>;
	providerName?: string;
	authProviderTypeList: IAuthProviderType[];
	authProviderSyncScheduleList: IAuthSyncSchedule[];
	error?: AUTH_PROVIDER_API_ERRORS;
	isDataLoading?: boolean;
	isUpdating?: boolean;
	provider?: IAuthProvider;
	isSyncingProvider: boolean;
	onSyncProvider: () => void;
	onSubmit: ProviderFormProps['onSubmit'];
}

export const EditAuthProviderModal: React.FC<EditProviderModalProps> = ({
	formRef,
	providerName,
	authProviderTypeList,
	authProviderSyncScheduleList,
	error,
	isDataLoading,
	isUpdating,
	provider,
	isSyncingProvider,
	onSyncProvider,
	onSubmit,
}) => {
	const { t } = useTranslation();
	const modalContext = useContext<ModalContextProps>(ModalContext);

	return (
		<>
			<ModalNavbar onClose={modalContext.onClose} />
			<PageHeader>
				<HeaderTitle variant="h2_primary_semibold">
					{t('auth_provider.edit_modal.title', { providerName })}
				</HeaderTitle>
				<Text variant="body_2_secondary">
					{t('auth_provider.edit_modal.sub_title')}
				</Text>
			</PageHeader>
			<PageBody>
				{isDataLoading && <Spinner />}
				{!isDataLoading && provider && (
					<AuthProviderForm
						formRef={formRef}
						provider={provider}
						authProviderTypeList={authProviderTypeList}
						authProviderSyncScheduleList={authProviderSyncScheduleList}
						error={error}
						isSyncingProvider={isSyncingProvider}
						onSyncProvider={onSyncProvider}
						onSubmit={onSubmit}
					>
						{({ formState }) => (
							<Button
								type="submit"
								icon={ICON_COLLECTION.chevron_right}
								label={t('auth_provider.edit_modal.actions.submit')}
								disabled={!formState.isDirty}
								loading={isUpdating}
							/>
						)}
					</AuthProviderForm>
				)}
			</PageBody>
		</>
	);
};
