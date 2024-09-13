import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import {
	DataSyncProviderFormRef,
	DataSyncProviderFormType,
} from 'modules/settings/forms/data-sync-provider-form';
import { EditDataSyncProviderModal } from 'modules/settings/modals/edit-data-sync-provider-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { AuthProviderApi } from 'app/api/auth-provider-api/auth-provider-api';
import {
	DataSyncProviderApi,
	UpdateDataSyncProviderDto,
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

interface EditDataSyncProviderProps {
	onUpdated: (provider: IDataSyncProvider) => Promise<unknown>;
}

export const UpdateDataSyncProvider: React.FC<EditDataSyncProviderProps> = ({
	onUpdated,
}) => {
	const queryClient = useQueryClient();

	const formRef = React.useRef<DataSyncProviderFormRef>();

	const [editableProvider, setEditableProvider] =
		useState<IDataSyncProvider | null>(null);

	const unsavedModalState = useStateModalManager(
		DATA_SYNC_MODAL_NAMES.UNSAVED_CHANGES_UPDATE_DATA_SYNC_PROVIDER,
	);
	const modalState = useStateModalManager(
		DATA_SYNC_MODAL_NAMES.UPDATE_DATA_SYNC_PROVIDER,
		{
			onBeforeOpen: (provider: IDataSyncProvider) => {
				setEditableProvider(provider);
			},
		},
	);

	const { data: provider, isLoading: isProviderLoading } = useQuery({
		queryKey: DATA_SYNC_PROVIDES_QUERY_KEYS.provider(
			editableProvider?.id as number,
		),
		queryFn: () =>
			DataSyncProviderApi.getOne({ id: editableProvider?.id as number }),
		enabled: !!editableProvider,
	});

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

	const updateProviderMutation = useMutation<
		IDataSyncProvider,
		IValidationApiError<DATA_SYNC_PROVIDER_API_ERRORS>,
		UpdateDataSyncProviderDto
	>({
		mutationFn: async (payload) => {
			const provider = await DataSyncProviderApi.updateOne(payload);

			await onUpdated(provider);

			return provider;
		},
		onSuccess: (provider) => {
			queryClient.refetchQueries(AUTH_PROVIDES_QUERY_KEYS.auth_provider_list);
			queryClient.setQueryData(
				DATA_SYNC_PROVIDES_QUERY_KEYS.provider(provider.id),
				provider,
			);
			modalState.close();
		},
	});

	const onAfterClose = () => {
		updateProviderMutation.reset();
		setEditableProvider(null);
	};

	const syncProviderMutation = useMutation(DataSyncProviderApi.syncProvider);

	const onSubmitForm = (data: DataSyncProviderFormType) => {
		if (!editableProvider) return;

		const { isSyncEnabled, ...payload } = data;

		updateProviderMutation.mutate({ id: editableProvider.id, ...payload });
	};

	const onSyncProvider = () => {
		if (!editableProvider) return '';

		syncProviderMutation.mutate({ id: editableProvider.id });
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
		isProviderLoading ||
		isProviderTypeListLoading ||
		isProviderSyncScheduleLoading;

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			onAfterClose={onAfterClose}
			onClose={handleCloseModal}
		>
			<Modal.Page>
				<EditDataSyncProviderModal
					formRef={formRef as React.Ref<DataSyncProviderFormRef>}
					provider={provider}
					error={updateProviderMutation.error?.message}
					isSyncingProvider={syncProviderMutation.isLoading}
					isSubmitting={updateProviderMutation.isLoading}
					isDataLoading={isDataLoading}
					providerTypeList={dataSyncProviderList}
					authProviderSyncScheduleList={authProviderSyncScheduleList}
					onSyncProvider={onSyncProvider}
					onSubmit={onSubmitForm}
				/>
			</Modal.Page>

			<UnsavedChangesModal
				container="parent"
				isUpdating={updateProviderMutation.isLoading}
				onAccept={onAccept}
				onRegret={onRegret}
				open={unsavedModalState.open}
				onClose={unsavedModalState.close}
			/>
		</Modal.Root>
	);
};
