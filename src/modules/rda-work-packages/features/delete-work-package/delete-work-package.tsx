import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { ConfirmDispositionDeletingModal } from 'modules/rda-work-packages/modals/confirm-disposition-deleting-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { DispositionsApi } from 'app/api/dispositions-api/dispositions-api';

import { IWorkPackage } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { DISPOSITIONS_QUERY_KEYS } from 'shared/constants/query-keys';

interface UseDeleteDispositionParams {
	onDeleted?: () => Promise<unknown>;
}

export function DeleteWorkPackageModal({
	onDeleted,
}: UseDeleteDispositionParams = {}) {
	const queryClient = useQueryClient();
	const [dispositions, setDispositions] = useState<IWorkPackage[]>([]);

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.USE_DELETE_RDA,
		{
			onBeforeOpen: (dispositions: IWorkPackage[]) => {
				setDispositions(dispositions);
			},
		},
	);

	const deleteDispositionMutation = useMutation({
		mutationFn: async (payload: number[]) => {
			const promises = payload.map((id) =>
				DispositionsApi.deleteWorkPackage({ id: id }),
			);

			await Promise.all(promises);

			await queryClient.refetchQueries(
				DISPOSITIONS_QUERY_KEYS.disposition_status_counts,
			);
			if (onDeleted) {
				await onDeleted();
			}
		},
		onSuccess: () => {
			modalState.close();
		},
	});

	const onConfirm = () => {
		if (!dispositions.length) return;

		const ids = dispositions.map(({ id }) => id);

		deleteDispositionMutation.mutate(ids);
	};

	return (
		<ConfirmDispositionDeletingModal
			dispositions={dispositions}
			isLoading={deleteDispositionMutation.isLoading}
			onAccept={onConfirm}
			onRegret={modalState.close}
			open={modalState.open}
		/>
	);
}
