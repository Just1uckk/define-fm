import React, { useContext } from 'react';
import {
	DispositionsFilterModalForm,
	DispositionsFilterModalFormProps,
} from 'modules/rda-work-packages/components/dispositions-filter-modal-form';

import { useTranslation } from 'shared/hooks/use-translation';

import {
	Modal,
	ModalContext,
	ModalContextProps,
} from 'shared/components/modal';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';

interface DispositionFiltersModalProps {
	isLoading?: boolean;
	externalFilters?: DispositionsFilterModalFormProps['externalFilters'];
	initialActiveFilters: DispositionsFilterModalFormProps['initialActiveFilters'];
	onSave: DispositionsFilterModalFormProps['onSave'];
}

export const DispositionsFilterModal: React.FC<
	DispositionFiltersModalProps
> = ({ externalFilters, initialActiveFilters, isLoading, onSave }) => {
	const { t } = useTranslation();
	const modalContext = useContext<ModalContextProps>(ModalContext);

	return (
		<Modal.Page>
			<ModalNavbar onClose={modalContext.onClose} />
			<PageHeader>
				<HeaderTitle variant="h2_primary">
					{t('disposition.filter_modal.title')}
				</HeaderTitle>
				<Text variant="body_2_secondary">
					{t('disposition.filter_modal.description')}
				</Text>
			</PageHeader>
			<PageBody>
				{isLoading && <Spinner />}

				{!isLoading && (
					<DispositionsFilterModalForm
						externalFilters={externalFilters}
						initialActiveFilters={initialActiveFilters}
						onSave={onSave}
						onClose={modalContext.onClose}
					/>
				)}
			</PageBody>
		</Modal.Page>
	);
};
