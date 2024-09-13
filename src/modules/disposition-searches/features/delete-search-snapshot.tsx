import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { ConfirmSearchSnapshotDeletingModal } from 'modules/disposition-searches/modals/confirm-deleting-search-snapshot-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import {
	DeleteDispositionSearchSnapshotDto,
	DispositionSearcheApi,
} from 'app/api/disposition-searches-api/disposition-searche-api';

import { IDispositionSearchSnapshot } from 'shared/types/disposition-search';

import { DISPOSITION_SEARCH_MODAL_NAMES } from 'shared/constants/modal-names';

interface DeleteDispositionSearchProps {
	onDeleted?: () => Promise<unknown>;
}

export const DeleteDispositionSearchSnapshot: React.FC<
	DeleteDispositionSearchProps
> = ({ onDeleted }) => {
	const [entities, setEntities] = useState<IDispositionSearchSnapshot[]>([]);

	const modalState = useStateModalManager(
		DISPOSITION_SEARCH_MODAL_NAMES.DELETE_SEARCH_SNAPSHOT,
		{
			onBeforeOpen: (entities: IDispositionSearchSnapshot[]) => {
				setEntities(entities);
			},
		},
	);

	const deleteSnapshots = useMutation({
		mutationFn: async (ids: DeleteDispositionSearchSnapshotDto['id'][]) => {
			const promises = ids.map((id) =>
				DispositionSearcheApi.deleteSearchSnapshot({ id }),
			);

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
		deleteSnapshots.mutate(ids);
	};

	return (
		<ConfirmSearchSnapshotDeletingModal
			snapshots={entities}
			isLoading={deleteSnapshots.isLoading}
			onAccept={onConfirm}
			onRegret={modalState.close}
			open={modalState.open}
			onClose={modalState.close}
		/>
	);
};
