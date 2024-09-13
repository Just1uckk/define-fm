import React, { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import { useStateModalManager } from 'shared/context/modal-manager';
import { filterAuthProviderTypeByInstance } from 'shared/utils/filter-auth-provider-type';

import {
	AuthProviderApi,
	CreateAuthProviderDto,
} from 'app/api/auth-provider-api/auth-provider-api';

import { AUTH_PROVIDER_MODAL_NAMES } from 'shared/constants/modal-names';
import { AUTH_PROVIDES_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

import {
	AuthProviderFormData,
	AuthProviderFormRef,
} from '../forms/auth-provider-form';
import { CreateAuthProviderModal } from '../modals/create-auth-provider-modal';

interface CreateProviderProps {
	onCreated: () => Promise<unknown>;
}

export const CreateAuthProvider: React.FC<CreateProviderProps> = ({
	onCreated,
}) => {
	const queryClient = useQueryClient();
	const modalState = useStateModalManager(
		AUTH_PROVIDER_MODAL_NAMES.CREATE_AUTH_PROVIDER,
	);
	const unsavedModalState = useStateModalManager(
		AUTH_PROVIDER_MODAL_NAMES.UNSAVED_CHANGES_CREATE_AUTH_PROVIDER,
	);

	const formRef = React.useRef<AuthProviderFormRef>();

	const {
		data: authProviderTypeList = [],
		isLoading: isProviderTypeListLoading,
	} = useQuery(
		AUTH_PROVIDES_QUERY_KEYS.auth_provider_type_list,
		AuthProviderApi.getProviderTypeList,
		{
			enabled: modalState.open,
			select: useCallback((list) => filterAuthProviderTypeByInstance(list), []),
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

	const createProviderMutation = useMutation({
		mutationFn: async (payload: CreateAuthProviderDto) => {
			await AuthProviderApi.createProvider(payload);
			await onCreated();
		},
		onSuccess: () => {
			queryClient.refetchQueries(AUTH_PROVIDES_QUERY_KEYS.auth_provider_list);
			modalState.close();
		},
	});

	const onAfterClose = () => {
		createProviderMutation.reset();
	};

	const onSubmitForm = (data: AuthProviderFormData) => {
		const payload = {
			...data,
		};
		createProviderMutation.mutate(payload);
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
				<CreateAuthProviderModal
					formRef={formRef as React.Ref<AuthProviderFormRef>}
					isSubmitting={createProviderMutation.isLoading}
					isDataLoading={isDataLoading}
					authProviderTypeList={authProviderTypeList}
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
