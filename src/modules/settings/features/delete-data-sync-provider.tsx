import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useStateModalManager } from 'shared/context/modal-manager';
import { ToastService } from 'shared/services/toast';
import styled from 'styled-components';

import { DataSyncProviderApi } from 'app/api/data-sync-provider-api/data-sync-provider-api';

import { IDataSyncProvider } from 'shared/types/data-sync-provider';

import { DATA_SYNC_MODAL_NAMES } from 'shared/constants/modal-names';
import { DATA_SYNC_PROVIDES_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

import { ConfirmDataSyncProviderDeletingModal } from '../modals/confirm-data-sync-provider-deleting-modal';

const StyledModal = styled(Modal.Root)`
	.modal_content_wrapper {
		max-width: 25rem;
	}
`;

interface DeleteAuthProviderProps {
	onSuccess: () => Promise<unknown>;
}

export const DeleteDataSyncProvider: React.FC<DeleteAuthProviderProps> = ({
	onSuccess,
}) => {
	const queryClient = useQueryClient();

	const [providers, setProviders] = useState<IDataSyncProvider[]>([]);

	const modalState = useStateModalManager(
		DATA_SYNC_MODAL_NAMES.DELETE_PROVIDER,
		{
			onBeforeOpen: (providers: IDataSyncProvider[]) => {
				setProviders(providers);
			},
		},
	);

	const deleteProvidersMutation = useMutation({
		mutationFn: async () => {
			const promises = providers.map(({ id }) =>
				DataSyncProviderApi.deleteOne({ id }),
			);

			await Promise.all(promises);
			await onSuccess();
			modalState.close();
		},
		onSuccess: () => {
			queryClient.refetchQueries(DATA_SYNC_PROVIDES_QUERY_KEYS.provider_list);
		},
		onError: (e: any) => {
			const error = 'Cannot delete. Dependencies found.';
			if (e.message === error) {
				const dispositions: string[] = [];
				e.response.data.data.forEach((element) =>
					dispositions.push(element.name),
				);
				ToastService.showError({
					text:
						'Data sync provider cant be deleted as it is being used: ' +
						dispositions.join(', '),
				});
			}
			modalState.close();
		},
	});

	const handleConfirm = () => {
		deleteProvidersMutation.mutate();
	};

	const handleAfterClose = () => {
		setProviders([]);
	};

	return (
		<StyledModal
			placement="center"
			fulfilled
			hasClose={false}
			isClosable={deleteProvidersMutation.isLoading}
			open={modalState.open}
			onAfterClose={handleAfterClose}
			onClose={modalState.close}
		>
			<Modal.Page>
				<ConfirmDataSyncProviderDeletingModal
					providers={providers}
					isLoading={deleteProvidersMutation.isLoading}
					onAccept={handleConfirm}
					onRegret={modalState.close}
				/>
			</Modal.Page>
		</StyledModal>
	);
};
