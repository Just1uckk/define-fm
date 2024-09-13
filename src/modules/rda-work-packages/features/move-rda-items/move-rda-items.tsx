import React from 'react';
import { MoveItemsForm } from 'modules/rda-work-packages/components/forms/move-items-form';
import { useStateModalManager } from 'shared/context/modal-manager';
import styled from 'styled-components';

import { IWorkPackage } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';

import { Modal } from 'shared/components/modal';

const StyledModal = styled(Modal.Root)`
	.modal_content_wrapper {
		max-width: 800px;
	}
`;

interface MoveRdaItemsInterface {
	workPackage: IWorkPackage | undefined;
	selectedItems: any;
}

export function MoveRdaItems({
	workPackage,
	selectedItems,
}: MoveRdaItemsInterface) {
	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.MOVE_RDA_ITEMS,
	);

	return (
		<StyledModal
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={modalState.close}
			placement="center"
		>
			<Modal.Page header="Move">
				<MoveItemsForm
					closeModal={() => {
						modalState.close();
					}}
					selectedItems={selectedItems}
					workPackage={workPackage}
				/>
			</Modal.Page>
		</StyledModal>
	);
}
