import React, { useState } from 'react';
import styled from 'styled-components';

import { AllDispositionActionsDto } from 'app/api/disposition-action-api/disposition-action-api';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { useModalContext } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageForm } from 'shared/components/modal-form/page-form';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';
import { Toggle } from 'shared/components/toggle/toggle';

const StyledFormField = styled(FormField)`
	align-items: center;
	gap: 2rem;
`;

const SpinerContainer = styled.div`
	height: 10vh;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const StyledToggle = styled(Toggle)``;

interface ChangeDispositionActionFormProps {
	isActionsLoading: boolean;
	allDispositionActions: AllDispositionActionsDto[] | [];
	onSubmit: () => void;
}

export const ChangeDispositionActionForm: React.FC<
	ChangeDispositionActionFormProps
> = ({ onSubmit, isActionsLoading, allDispositionActions }) => {
	const modalContext = useModalContext();
	const [selectedId, setSelectedId] = useState<number>(1);

	return (
		<PageBody>
			{!isActionsLoading && allDispositionActions.length ? (
				<PageForm onSubmit={onSubmit}>
					{allDispositionActions.map(
						(element: AllDispositionActionsDto, index) => (
							<StyledFormField key={index} fieldsCount={2}>
								<StyledToggle
									checked={element.id === selectedId}
									onChange={() => {
										setSelectedId(element.id);
									}}
									justifyContent="space-between"
									label={<Text>{element.name}</Text>}
								/>
								<span />
							</StyledFormField>
						),
					)}
					<ModalFooter>
						<ButtonList>
							<Button
								label="Apply"
								type="submit"
								onClick={() => {
									modalContext.onClose();
								}}
							/>
							<Button
								variant="primary_outlined"
								type="button"
								label="Cancel"
								onClick={() => {
									modalContext.onClose();
								}}
							/>
							<Button
								type="button"
								onClick={() => {
									setSelectedId(1);
								}}
								variant="primary_outlined"
								label="Reset"
							/>
						</ButtonList>
					</ModalFooter>
				</PageForm>
			) : (
				<SpinerContainer>
					<Spinner />
				</SpinerContainer>
			)}
		</PageBody>
	);
};
