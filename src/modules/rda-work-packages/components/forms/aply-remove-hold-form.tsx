import React from 'react';
import { Item } from 'react-stately';
import styled from 'styled-components';

import { HoldInformationDto } from 'app/api/bulk-api/bulk-api';

import { useTranslation } from 'shared/hooks/use-translation';

import { FormField } from 'shared/components/modal-form/form-field';
import { Option, Select } from 'shared/components/select/select';

const StyledFormField = styled(FormField)`
	grid-template-columns: 30% 70%;
`;

interface ApplyRemoveHoldFormInterface {
	errors?: any;
	actionOptions: Option[];
	holdInformation: HoldInformationDto[];
	isHoldInformationLoading: boolean;
	selectedHold: HoldInformationDto | undefined;
	selectedHoldAction: Option | undefined;
	handleChangeHoldAction: (data: Option | null) => void;
	handleChangeHold: (data: HoldInformationDto | null) => void;
}

export const ApplyRemoveHoldForm: React.FC<
	React.PropsWithChildren & ApplyRemoveHoldFormInterface
> = ({
	errors,
	children,
	actionOptions,
	holdInformation,
	isHoldInformationLoading,
	selectedHold,
	selectedHoldAction,
	handleChangeHold,
	handleChangeHoldAction,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<StyledFormField alignItems="center">
				<span>
					{t(
						'disposition_report.apply_remove_hold_modal.form.fields.select_action.label',
					)}
				</span>
				<Select<Option>
					error={
						errors?.holdAction?.message
							? t(errors?.holdAction?.message)
							: errors?.holdAction?.message
					}
					label={t(
						'disposition_report.apply_remove_hold_modal.form.fields.select_action.field',
					)}
					selectedKey={selectedHoldAction?.value || null}
					options={actionOptions}
					onChange={handleChangeHoldAction}
				>
					{(option) => (
						<Item key={option.value} textValue={option.label.toString()}>
							{option.value}
						</Item>
					)}
				</Select>
			</StyledFormField>
			<StyledFormField alignItems="center">
				<span>
					{' '}
					{t(
						'disposition_report.apply_remove_hold_modal.form.fields.select_hold.label',
					)}
				</span>
				<Select<HoldInformationDto>
					error={
						errors?.holdID?.message
							? t(errors?.holdID?.message)
							: errors?.holdID?.message
					}
					label={t(
						'disposition_report.apply_remove_hold_modal.form.fields.select_hold.field',
					)}
					selectedKey={selectedHold?.holdID.toString() || null}
					options={holdInformation}
					onChange={handleChangeHold}
				>
					{(option) => (
						<Item key={option.holdID} textValue={option.holdName.toString()}>
							{option.holdName}
						</Item>
					)}
				</Select>
			</StyledFormField>
			{children}
		</>
	);
};
