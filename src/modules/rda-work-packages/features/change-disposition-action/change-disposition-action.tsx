import React from 'react';
import { ChangeDispositionActionForm } from 'modules/rda-work-packages/components/change-disposition-action-form/change-disposition-action';
import { useStateModalManager } from 'shared/context/modal-manager';

import { AllDispositionActionsDto } from 'app/api/disposition-action-api/disposition-action-api';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';

import { Modal } from 'shared/components/modal';

interface ChangeDispositionActionProps {
	isActionsLoading: boolean;
	allDispositionActions: AllDispositionActionsDto[] | [];
}

export const ChangeDispositionAction: React.FC<
	ChangeDispositionActionProps
> = ({ allDispositionActions, isActionsLoading }) => {
	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.CHANGE_DISPOSITION_ACTION,
	);

	const handleSubmitForm = () => {
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
			<Modal.Page header={'Set the Disposition Action'}>
				<ChangeDispositionActionForm
					isActionsLoading={isActionsLoading}
					allDispositionActions={allDispositionActions}
					onSubmit={handleSubmitForm}
				/>
			</Modal.Page>
		</Modal.Root>
	);
};
