import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import {
	AuthProviderApi,
	UpdateAuthProviderDto,
} from 'app/api/auth-provider-api/auth-provider-api';

import { IAuthProvider } from 'shared/types/auth-provider';

import { AUTH_PROVIDER_MODAL_NAMES } from 'shared/constants/modal-names';
import { AUTH_PROVIDES_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

import {
	AuthProviderFormData,
	AuthProviderFormRef,
} from '../forms/auth-provider-form';
import { EditAuthProviderModal } from '../modals/edit-auth-provider-modal';

interface UpdateProviderProps {
	onUpdated: () => Promise<unknown>;
}

export const UpdateAuthProvider: React.FC<UpdateProviderProps> = ({
	onUpdated,
}) => {
	const queryClient = useQueryClient();
	const formRef = React.useRef<AuthProviderFormRef>();
	const [editableProvider, setEditableProvider] =
		useState<IAuthProvider | null>(null);

	const unsavedModalState = useStateModalManager(
		AUTH_PROVIDER_MODAL_NAMES.UNSAVED_CHANGES_EDIT_AUTH_PROVIDER,
	);
	const modalState = useStateModalManager(
		AUTH_PROVIDER_MODAL_NAMES.EDIT_AUTH_PROVIDER,
		{
			onBeforeOpen: (provider: IAuthProvider) => {
				setEditableProvider(provider);
			},
		},
	);

	const updateProviderMutation = useMutation({
		mutationFn: async (payload: UpdateAuthProviderDto) => {
			const provider = await AuthProviderApi.updateProvider(payload);
			await onUpdated();

			return provider;
		},
		onSuccess: (provider) => {
			queryClient.refetchQueries(AUTH_PROVIDES_QUERY_KEYS.auth_provider_list);
			queryClient.setQueryData(
				[AUTH_PROVIDES_QUERY_KEYS.provider, provider.id],
				provider,
			);

			modalState.close();
		},
	});

	const syncProviderMutation = useMutation({
		mutationFn: AuthProviderApi.syncProvider,
	});

	const { data: authProviderData, isLoading: isAuthProviderLoading } = useQuery(
		{
			queryKey: [AUTH_PROVIDES_QUERY_KEYS.provider, editableProvider?.id],
			queryFn: () =>
				AuthProviderApi.getProviderById({ id: editableProvider?.id as number }),
			enabled: !!editableProvider,
		},
	);
	const {
		data: authProviderTypeList = [],
		isLoading: isProviderTypeListLoading,
	} = useQuery(
		AUTH_PROVIDES_QUERY_KEYS.auth_provider_type_list,
		AuthProviderApi.getProviderTypeList,
	);
	const {
		data: authProviderSyncScheduleList = [],
		isLoading: isProviderSyncScheduleLoading,
	} = useQuery(
		AUTH_PROVIDES_QUERY_KEYS.auth_sync_schedule_list,
		AuthProviderApi.getSyncScheduleList,
	);

	const onAfterClose = () => {
		updateProviderMutation.reset();
		setEditableProvider(null);
	};

	const onUpdateProvider = (data: AuthProviderFormData) => {
		if (!editableProvider) return;

		const payload = {
			id: editableProvider.id,
			...data,
		};

		updateProviderMutation.mutate(payload);
	};

	const onSyncProvider = () => {
		if (!editableProvider) return;

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
		isAuthProviderLoading ||
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
				<EditAuthProviderModal
					formRef={formRef as React.Ref<AuthProviderFormRef>}
					providerName={editableProvider?.name}
					provider={authProviderData}
					authProviderSyncScheduleList={authProviderSyncScheduleList}
					authProviderTypeList={authProviderTypeList}
					isDataLoading={isDataLoading}
					isUpdating={updateProviderMutation.isLoading}
					isSyncingProvider={syncProviderMutation.isLoading}
					onSyncProvider={onSyncProvider}
					onSubmit={onUpdateProvider}
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
