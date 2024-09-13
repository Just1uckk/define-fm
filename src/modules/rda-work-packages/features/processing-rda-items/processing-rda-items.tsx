import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { ConfirmProcessingRdaItemsModal } from 'modules/rda-work-packages/modals/confirm-processing-rda-items';
import { useStateModalManager } from 'shared/context/modal-manager';

import { DispositionActionApi } from 'app/api/disposition-action-api/disposition-action-api';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';

import { Modal } from 'shared/components/modal';

interface ModalStateDto {
	id: number | null;
	select: string[] | [];
}

export function ProcessingRdaItems({ handleClearSelected }: any) {
	const [count, setCount] = useState<number | null>(null);
	const [data, setData] = useState<string[] | []>([]);
	const [workPackageId, setWorkPackageId] = useState<number | null>(null);
	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.PROCESSING_RDA_ITEMS,
		{
			onBeforeOpen: (params: ModalStateDto) => {
				setCount(params.select?.length || null);
				setData(params.select || []);
				setWorkPackageId(params.id || null);
			},
		},
	);

	const processAllItems = useMutation<string>({
		mutationFn: async () => {
			const data = await DispositionActionApi.processAllActions({
				id: workPackageId!,
			});

			return data;
		},
		onSuccess: () => {
			handleClearSelected();
			modalState.close();
		},
	});

	const processSelectedItems = useMutation<string>({
		mutationFn: async () => {
			const sendData = await DispositionActionApi.processSelectedActions(data);

			return sendData;
		},
		onSuccess: () => {
			handleClearSelected();
			modalState.close();
		},
	});

	const handleAcceptProcessing = () => {
		if (!data.length && workPackageId) {
			processAllItems.mutate();
		}
		processSelectedItems.mutate();

		return false;
	};

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={modalState.close}
			placement="center"
		>
			<Modal.Page>
				<ConfirmProcessingRdaItemsModal
					count={count}
					isLoading={
						processAllItems.isLoading || processSelectedItems.isLoading
					}
					onAccept={handleAcceptProcessing}
				/>
			</Modal.Page>
		</Modal.Root>
	);
}
