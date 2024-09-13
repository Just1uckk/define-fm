import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { ForceApproverModal as ForceApproverModalContent } from 'modules/rda-work-packages/modals/force-approver-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { DispositionsApi } from 'app/api/dispositions-api/dispositions-api';

import { IWorkPackage } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { DISPOSITIONS_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

interface ForceApprover {
	onSuccess?: () => Promise<unknown>;
}

export function ForceApproverModal(params: ForceApprover = {}) {
	const { onSuccess } = params;

	const queryClient = useQueryClient();
	const [list, setList] = useState<IWorkPackage[]>([]);

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.FORCE_APPROVER,
		{
			onBeforeOpen: (dispositions: IWorkPackage[]) => {
				setList(dispositions);
			},
		},
	);

	const forceDispositionMutation = useMutation({
		mutationFn: async () => {
			const ids = list.map(({ id }) => id);

			await DispositionsApi.forceDispositions({ rdaIdsToForce: ids });

			await Promise.all([
				queryClient.refetchQueries([
					DISPOSITIONS_QUERY_KEYS.disposition_status_counts,
				]),
				queryClient.invalidateQueries(
					ids.map((id) => DISPOSITIONS_QUERY_KEYS.approvers(Number(id))),
				),
				queryClient.invalidateQueries(
					ids.map((id) => DISPOSITIONS_QUERY_KEYS.disposition(id)),
				),
			]);
			onSuccess && (await onSuccess());

			modalState.close();
		},
	});

	const onSubmit = () => {
		forceDispositionMutation.mutate();
	};

	return (
		<Modal.Root
			placement="center"
			fulfilled
			open={modalState.open}
			onClose={modalState.close}
			hasClose={false}
			isClosable={!forceDispositionMutation.isLoading}
			maxWidth="32.9rem"
		>
			<ForceApproverModalContent
				dispositions={list}
				onAccept={onSubmit}
				isLoading={forceDispositionMutation.isLoading}
			/>
		</Modal.Root>
	);
}
