import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { ConfirmSearchDeletingModal } from 'modules/disposition-searches/modals/confirm-deleting-search-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { DispositionSearcheApi } from 'app/api/disposition-searches-api/disposition-searche-api';
import { DeleteDispositionDto } from 'app/api/dispositions-api/dispositions-api';

import { IDispositionSearch } from 'shared/types/disposition-search';

import { DISPOSITION_SEARCH_MODAL_NAMES } from 'shared/constants/modal-names';

interface DeleteDispositionSearchProps {
	onDeleted?: () => Promise<unknown>;
}

export const DeleteDispositionSearch: React.FC<
	DeleteDispositionSearchProps
> = ({ onDeleted }) => {
	const [entities, setEntities] = useState<Array<IDispositionSearch>>([]);

	const modalState = useStateModalManager(
		DISPOSITION_SEARCH_MODAL_NAMES.DELETE_SEARCH,
		{
			onBeforeOpen: (entities: IDispositionSearch[]) => {
				setEntities(entities);
			},
		},
	);

	const deleteDispositionSearchesMutation = useMutation({
		mutationFn: async (ids: DeleteDispositionDto['id'][]) => {
			const promises = ids.map((id) => DispositionSearcheApi.deleteOne({ id }));

			await Promise.all(promises);
			if (onDeleted) {
				await onDeleted();
			}
		},
		onSuccess: () => {
			modalState.close();
		},
	});

	const onConfirm = () => {
		if (!entities.length) return;

		const ids = entities.map(({ id }) => id);
		deleteDispositionSearchesMutation.mutate(ids);
	};

	return (
		<ConfirmSearchDeletingModal
			entities={entities}
			isLoading={deleteDispositionSearchesMutation.isLoading}
			onAccept={onConfirm}
			onRegret={modalState.close}
			open={modalState.open}
			onClose={modalState.close}
		/>
	);
};
