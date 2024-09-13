import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import {
	DataSyncProviderFormRef,
	DataSyncProviderFormType,
} from 'modules/settings/forms/data-sync-provider-form';
import { CreateDataSyncProviderModal } from 'modules/settings/modals/create-data-sync-provider-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { AuthProviderApi } from 'app/api/auth-provider-api/auth-provider-api';
import {
	CreateDataSyncProviderDto,
	DataSyncProviderApi,
} from 'app/api/data-sync-provider-api/data-sync-provider-api';
import { DATA_SYNC_PROVIDER_API_ERRORS } from 'app/api/data-sync-provider-api/data-sync-provider-api-error';
import { IValidationApiError } from 'app/api/types';

import { IDataSyncProvider } from 'shared/types/data-sync-provider';

import { DATA_SYNC_MODAL_NAMES } from 'shared/constants/modal-names';
import {
	AUTH_PROVIDES_QUERY_KEYS,
	DATA_SYNC_PROVIDES_QUERY_KEYS,
} from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

interface CreateDataSyncProviderProps {
	onCreated: (provider: IDataSyncProvider) => Promise<unknown>;
}

export const CreateDataSyncProvider: React.FC<CreateDataSyncProviderProps> = ({
	onCreated,
}) => {
	const queryClient = useQueryClient();
	const modalState = useStateModalManager(
		DATA_SYNC_MODAL_NAMES.CREATE_DATA_SYNC_PROVIDER,
	);
	const unsavedModalState = useStateModalManager(
		DATA_SYNC_MODAL_NAMES.UNSAVED_CHANGES_CREATE_DATA_SYNC_PROVIDER,
	);

	const formRef = React.useRef<DataSyncProviderFormRef>();

	const {
		data: dataSyncProviderList = [],
		isLoading: isProviderTypeListLoading,
	} = useQuery(
		DATA_SYNC_PROVIDES_QUERY_KEYS.data_sync_provider_type_list,
		DataSyncProviderApi.getDataSyncProviderTypes,
		{
			enabled: modalState.open,
		},
	);

	const {
		data: authProviderSyncScheduleList = [],
		isLoading: isProviderSyncScheduleLoading,
	} = useQuery(
		AUTH_PROVIDES_QUERY_KEYS.auth_sync_schedule_list,
		AuthProviderApi.getSyncScheduleList,
		{
			enabled: modalState.open,
		},
	);

	const createProviderMutation = useMutation<
		void,
		IValidationApiError<DATA_SYNC_PROVIDER_API_ERRORS>,
		CreateDataSyncProviderDto
	>({
		mutationFn: async (payload) => {
			const provider = await DataSyncProviderApi.createOne(payload);
			await onCreated(provider);
		},
		onSuccess: () => {
			queryClient.refetchQueries(AUTH_PROVIDES_QUERY_KEYS.auth_provider_list);
			modalState.close();
		},
	});

	const onSubmitForm = (data: DataSyncProviderFormType) => {
		const payload = {
			...data,
		};

		createProviderMutation.mutate(payload);
	};

	const onAfterClose = () => {
		createProviderMutation.reset();
	};

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

	const isDataLoading =
		isProviderTypeListLoading || isProviderSyncScheduleLoading;

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			onAfterClose={onAfterClose}
			onClose={handleCloseModal}
		>
			<Modal.Page>
				<CreateDataSyncProviderModal
					formRef={formRef as React.Ref<DataSyncProviderFormRef>}
					error={createProviderMutation.error?.message}
					isSubmitting={createProviderMutation.isLoading}
					isDataLoading={isDataLoading}
					providerTypeList={dataSyncProviderList}
					authProviderSyncScheduleList={authProviderSyncScheduleList}
					onSubmit={onSubmitForm}
				/>
			</Modal.Page>

			<UnsavedChangesModal
				container="parent"
				isUpdating={createProviderMutation.isLoading}
				onAccept={onAccept}
				onRegret={onRegret}
				open={unsavedModalState.open}
				onClose={unsavedModalState.close}
			/>
		</Modal.Root>
	);
};
