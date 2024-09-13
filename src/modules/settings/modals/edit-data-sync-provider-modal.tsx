import React, { useContext } from 'react';
import {
	DataSyncProviderForm,
	DataSyncProviderFormProps,
	DataSyncProviderFormRef,
} from 'modules/settings/forms/data-sync-provider-form';

import { DATA_SYNC_PROVIDER_API_ERRORS } from 'app/api/data-sync-provider-api/data-sync-provider-api-error';

import { IAuthSyncSchedule } from 'shared/types/auth-provider';
import {
	IDataSyncProvider,
	IDataSyncProviderType,
} from 'shared/types/data-sync-provider';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalContext, ModalContextProps } from 'shared/components/modal';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';

export interface EditDataSyncProviderModalProps {
	formRef: React.Ref<DataSyncProviderFormRef>;
	provider?: IDataSyncProvider;
	error?: DATA_SYNC_PROVIDER_API_ERRORS;
	isSyncingProvider: boolean;
	isSubmitting: boolean;
	isDataLoading: boolean;
	providerTypeList: IDataSyncProviderType[];
	authProviderSyncScheduleList: IAuthSyncSchedule[];
	onSyncProvider: DataSyncProviderFormProps['onSyncProvider'];
	onSubmit: DataSyncProviderFormProps['onSubmit'];
}

export const EditDataSyncProviderModal: React.FC<
	EditDataSyncProviderModalProps
> = ({
	formRef,
	provider,
	isSyncingProvider,
	error,
	isSubmitting,
	isDataLoading,
	providerTypeList,
	authProviderSyncScheduleList,
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
					{t('general_settings.data_sync_providers.edit_modal.title', {
						name: provider?.name,
					})}
				</HeaderTitle>
				<Text variant="body_2_secondary">
					{t('general_settings.data_sync_providers.edit_modal.sub_title')}
				</Text>
			</PageHeader>
			<PageBody>
				{isDataLoading && <Spinner />}
				{!isDataLoading && provider && (
					<DataSyncProviderForm
						formRef={formRef}
						provider={provider}
						providerTypeList={providerTypeList}
						authProviderSyncScheduleList={authProviderSyncScheduleList}
						error={error}
						isSyncingProvider={isSyncingProvider}
						onSyncProvider={onSyncProvider}
						onSubmit={onSubmit}
					>
						{({ formState: { isDirty } }) => (
							<ButtonList>
								<Button
									type="submit"
									icon={ICON_COLLECTION.chevron_right}
									label={t(
										'general_settings.data_sync_providers.edit_modal.actions.submit',
									)}
									loading={isSubmitting}
									disabled={!isDirty}
								/>
								<Button
									variant="primary_outlined"
									label={t(
										'general_settings.data_sync_providers.edit_modal.actions.cancel',
									)}
									disabled={isSubmitting}
									onClick={modalContext.onClose}
								/>
							</ButtonList>
						)}
					</DataSyncProviderForm>
				)}
			</PageBody>
		</>
	);
};
