import React, { useContext } from 'react';
import {
	DataSyncProviderForm,
	DataSyncProviderFormProps,
	DataSyncProviderFormRef,
} from 'modules/settings/forms/data-sync-provider-form';

import { DATA_SYNC_PROVIDER_API_ERRORS } from 'app/api/data-sync-provider-api/data-sync-provider-api-error';

import { IAuthSyncSchedule } from 'shared/types/auth-provider';
import { IDataSyncProviderType } from 'shared/types/data-sync-provider';

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

export interface CreateDataSyncProviderModalProps {
	formRef: React.Ref<DataSyncProviderFormRef>;
	error?: DATA_SYNC_PROVIDER_API_ERRORS;
	isSubmitting: boolean;
	isDataLoading: boolean;
	providerTypeList: IDataSyncProviderType[];
	authProviderSyncScheduleList: IAuthSyncSchedule[];
	onSubmit: DataSyncProviderFormProps['onSubmit'];
}

export const CreateDataSyncProviderModal: React.FC<
	CreateDataSyncProviderModalProps
> = ({
	formRef,
	error,
	isSubmitting,
	isDataLoading,
	providerTypeList,
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
					{t('general_settings.data_sync_providers.create_modal.title')}
				</HeaderTitle>
				<Text variant="body_2_secondary">
					{t('general_settings.data_sync_providers.create_modal.sub_title')}
				</Text>
			</PageHeader>
			<PageBody>
				{isDataLoading && <Spinner />}
				{!isDataLoading && (
					<DataSyncProviderForm
						formRef={formRef}
						error={error}
						providerTypeList={providerTypeList}
						authProviderSyncScheduleList={authProviderSyncScheduleList}
						onSubmit={onSubmit}
					>
						{({ formState: { isDirty } }) => (
							<Button
								type="submit"
								icon={ICON_COLLECTION.chevron_right}
								label={t(
									'general_settings.data_sync_providers.create_modal.actions.submit',
								)}
								loading={isSubmitting}
								disabled={!isDirty}
							/>
						)}
					</DataSyncProviderForm>
				)}
			</PageBody>
		</>
	);
};
