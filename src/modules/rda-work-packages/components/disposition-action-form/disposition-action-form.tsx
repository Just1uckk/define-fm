import React from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';

import { AllDispositionActionsDto } from 'app/api/disposition-action-api/disposition-action-api';

import { useTranslation } from 'shared/hooks/use-translation';

import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageForm } from 'shared/components/modal-form/page-form';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Text } from 'shared/components/text/text';
import { Toggle } from 'shared/components/toggle/toggle';

import { RdaSettingsFormDataTypes } from '../change-settings-rda-form/change-settings-rda-form';
import { CreateRdaFormDataTypes } from '../create-rda-form/create-rda-form';

const StyledFormField = styled(FormField)`
	align-items: center;
	gap: 2rem;
`;

const StyledToggle = styled(Toggle)``;

interface DispositionActionFormProps {
	allDispositionActions: AllDispositionActionsDto[] | [];
	onSubmit: () => void;
}

export const DispositionActionForm: React.FC<
	React.PropsWithChildren<DispositionActionFormProps>
> = ({ onSubmit, allDispositionActions, children }) => {
	const { t } = useTranslation();
	const { setValue, watch, handleSubmit } = useFormContext<
		CreateRdaFormDataTypes | RdaSettingsFormDataTypes
	>();
	const selectedAction = watch('dispositionAction');

	return (
		<>
			<PageHeader>
				<HeaderTitle variant="h2_primary_semibold">
					{t('dispositions.create_modal.disposition_action.title')}
				</HeaderTitle>
			</PageHeader>

			<PageBody>
				<PageForm onSubmit={handleSubmit(onSubmit)}>
					{allDispositionActions.length &&
						allDispositionActions.map(
							(element: AllDispositionActionsDto, index) => (
								<StyledFormField key={index} fieldsCount={2}>
									<StyledToggle
										checked={selectedAction === element.id}
										onChange={() => {
											setValue('dispositionAction', element.id, {
												shouldDirty: true,
												shouldValidate: true,
											});
										}}
										justifyContent="space-between"
										label={<Text>{element.name}</Text>}
									/>
									<span />
								</StyledFormField>
							),
						)}
					<ModalFooter justifyContent="space-between">{children}</ModalFooter>
				</PageForm>
			</PageBody>
		</>
	);
};
