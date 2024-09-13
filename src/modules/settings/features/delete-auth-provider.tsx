import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { ConfirmAuthProviderDeletingModal } from 'modules/settings/modals/confirm-auth-provider-deleting-modal';
import { useStateModalManager } from 'shared/context/modal-manager';
import styled from 'styled-components';

import { AuthProviderApi } from 'app/api/auth-provider-api/auth-provider-api';

import { IAuthProvider } from 'shared/types/auth-provider';

import { AUTH_PROVIDER_MODAL_NAMES } from 'shared/constants/modal-names';
import { AUTH_PROVIDES_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

const StyledModal = styled(Modal.Root)`
	.modal_content_wrapper {
		max-width: 25rem;
	}
`;

interface DeleteAuthProviderProps {
	onSuccess: () => Promise<unknown>;
}

export const DeleteAuthProvider: React.FC<DeleteAuthProviderProps> = ({
	onSuccess,
}) => {
	const queryClient = useQueryClient();

	const [providers, setProviders] = useState<IAuthProvider[]>([]);

	const modalState = useStateModalManager(
		AUTH_PROVIDER_MODAL_NAMES.DELETE_PROVIDER,
		{
			onBeforeOpen: (providers: IAuthProvider[]) => {
				setProviders(providers);
			},
		},
	);

	const deleteProvidersMutation = useMutation({
		mutationFn: async () => {
			const promises = providers.map(({ id }) =>
				AuthProviderApi.deleteProvider({ id: id }),
			);

			await Promise.all(promises);
			await onSuccess();
			modalState.close();
		},
		onSuccess: () => {
			queryClient.refetchQueries(AUTH_PROVIDES_QUERY_KEYS.auth_provider_list);
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
				<ConfirmAuthProviderDeletingModal
					providers={providers}
					isLoading={deleteProvidersMutation.isLoading}
					onAccept={handleConfirm}
					onRegret={modalState.close}
				/>
			</Modal.Page>
		</StyledModal>
	);
};
