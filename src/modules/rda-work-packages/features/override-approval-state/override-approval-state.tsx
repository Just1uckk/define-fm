import React, { useState } from 'react';
import { OverrideApprovalStateForm } from 'modules/rda-work-packages/components/forms/override-approval-state-form';
import { useStateModalManager } from 'shared/context/modal-manager';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';

import { Modal } from 'shared/components/modal';

type ItemsState = 'approved' | 'rejected';

interface OverrideApprovalState {
	selectedItems: any;
	handleClearSelected: () => void;
	refetchRdaItems: () => void;
}

export function OverrideApprovalState({
	selectedItems,
	refetchRdaItems,
	handleClearSelected,
}: OverrideApprovalState) {
	const [state, setState] = useState<ItemsState>('approved');

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.OVERRIDE_APPROVAL_STATE,
		{
			onBeforeOpen: (state: ItemsState) => {
				setState(state);
			},
		},
	);

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={() => {
				modalState.close();
			}}
			placement="center"
		>
			<Modal.Page
				header={state === 'approved' ? 'Reject & Extend' : 'Override'}
			>
				<OverrideApprovalStateForm
					handleClearSelected={handleClearSelected}
					state={state}
					selectedItems={selectedItems}
					refetchRdaItems={refetchRdaItems}
					onClose={() => {
						modalState.close();
					}}
				/>
			</Modal.Page>
		</Modal.Root>
	);
}
