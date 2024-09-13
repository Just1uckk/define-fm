import React from 'react';
import { DispositionsFilterModalFormProps } from 'modules/rda-work-packages/components/dispositions-filter-modal-form';
import { DispositionsFilterModal } from 'modules/rda-work-packages/modals/dispositions-filter-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';

import { Modal } from 'shared/components/modal';

interface UseDispositionsFilterModalParams {
	externalFilters?: DispositionsFilterModalFormProps['externalFilters'];
	initialActiveFilters: DispositionsFilterModalFormProps['initialActiveFilters'];
	onSave: DispositionsFilterModalFormProps['onSave'];
}

export function WorkPackageOverviewFilterModal(
	params: UseDispositionsFilterModalParams,
) {
	const { externalFilters, initialActiveFilters, onSave } = params;

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.DISPOSITIONS_FILTER_MODAL,
	);

	const handleSave = (filters) => {
		onSave(filters);
		modalState.close();
	};

	return (
		<Modal.Root
			open={modalState.open}
			hasClose={false}
			fulfilled
			onClose={modalState.close}
		>
			<DispositionsFilterModal
				externalFilters={externalFilters}
				initialActiveFilters={initialActiveFilters}
				onSave={handleSave}
			/>
		</Modal.Root>
	);
}
