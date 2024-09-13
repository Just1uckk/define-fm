import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SearchFormDataTypes } from 'modules/disposition-searches/components/search-form';
import styled from 'styled-components';

import { AllDispositionActionsDto } from 'app/api/disposition-action-api/disposition-action-api';

import { FormField } from 'shared/components/modal-form/form-field';
import { Text } from 'shared/components/text/text';
import { Toggle } from 'shared/components/toggle/toggle';

const SectionName = styled(Text)`
	margin-bottom: 1rem;
`;

const StyledFormField = styled(FormField)`
	align-items: center;
	gap: 2rem;
`;

const StyledToggle = styled(Toggle)``;

interface SearchFormAction {
	dispositionsData: AllDispositionActionsDto[] | [];
}

export const SearchFormActionSettings: React.FC<SearchFormAction> = ({
	dispositionsData,
}) => {
	const { setValue, watch } = useFormContext<SearchFormDataTypes>();
	const selectedAction = watch('actionSettings.action');

	return (
		<>
			<SectionName variant="body_2_primary_semibold">
				Disposition Action:
			</SectionName>
			{dispositionsData.length &&
				dispositionsData.map((element: AllDispositionActionsDto, index) => (
					<StyledFormField key={index} fieldsCount={2}>
						<StyledToggle
							checked={selectedAction === element.id}
							onChange={() => {
								setValue('actionSettings.action', element.id, {
									shouldDirty: true,
									shouldValidate: true,
								});
							}}
							justifyContent="space-between"
							label={<Text>{element.name}</Text>}
						/>
						<span />
					</StyledFormField>
				))}
			{/* <Select label="New Status Value" options={[]} onChange={() => false}>
					{() => <Item>placeholder</Item>}
				</Select> */}
		</>
	);
};
