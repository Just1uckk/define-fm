import React, { useState } from 'react';
import { Item } from 'react-stately';
import styled from 'styled-components';

import {
	GetUpdatePhysicalObject,
	PhysicalObject,
} from 'app/api/bulk-api/bulk-api';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { Checkbox } from 'shared/components/checkbox/checkbox';
import { Input } from 'shared/components/input/input';
import { InputDate } from 'shared/components/input/input-date';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { Select } from 'shared/components/select/select';
import { Text } from 'shared/components/text/text';

const StyledFormField = styled(FormField)`
	align-items: center;
	grid-template-columns: 25% 40% 35%;
`;

interface UpdatePhysicalObjectMetadataFormInterface {
	isLoadingApplyButton: boolean;
	errors: any;
	listOptions: GetUpdatePhysicalObject | undefined;
	selectedCurrentLocation: PhysicalObject | undefined;
	selectedHomeLocation: PhysicalObject | undefined;
	selectedFromDate: Date | null;
	selectedToDate: Date | null;
	selectedOffsiteStorageId: number | null;
	selectedTemporaryId: number | null;
	handleChange: (data: any) => void;
	handleCancelButton: () => void;
	handleResetButton: () => void;
}

export const UpdatePhysicalObjectMetadataForm: React.FC<
	UpdatePhysicalObjectMetadataFormInterface
> = ({
	isLoadingApplyButton,
	errors,
	listOptions,
	selectedCurrentLocation,
	selectedHomeLocation,
	selectedFromDate,
	selectedToDate,
	selectedOffsiteStorageId,
	selectedTemporaryId,
	handleChange,
	handleCancelButton,
	handleResetButton,
}) => {
	const [removeFromDate, setRemoveFromDate] = useState<boolean>(false);
	const [removeToDate, setRemoveToDate] = useState<boolean>(false);
	const [removeOffisteStorage, setRemoveOffisteStorage] =
		useState<boolean>(false);
	const [removeTemporaryId, setRemoveTemporaryId] = useState<boolean>(false);
	const { t } = useTranslation();

	const handleReset = () => {
		setRemoveFromDate(false);
		setRemoveToDate(false);
		setRemoveOffisteStorage(false);
		setRemoveTemporaryId(false);
		handleResetButton();
	};

	return (
		<>
			<StyledFormField>
				<Text variant="body_3_secondary">Home Location:</Text>
				<Select<PhysicalObject>
					error={
						errors?.homeLocation?.message
							? t(errors?.homeLocation?.message)
							: errors?.homeLocation?.message
					}
					label="Select Location"
					options={listOptions?.locationCodes || []}
					onChange={(data) => {
						handleChange({ homeLocation: data?.location });
					}}
					selectedKey={selectedHomeLocation?.location || null}
				>
					{(option) => (
						<Item key={option.location} textValue={option.location.toString()}>
							{option.description}
						</Item>
					)}
				</Select>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">Current Location:</Text>
				<Select<PhysicalObject>
					error={
						errors?.currentLocation?.message
							? t(errors?.currentLocation?.message)
							: errors?.currentLocation?.message
					}
					label="Select Location"
					options={listOptions?.locationCodes || []}
					onChange={(data) => {
						handleChange({ currentLocation: data?.location });
					}}
					selectedKey={selectedCurrentLocation?.location || null}
				>
					{(option) => (
						<Item key={option.location} textValue={option.location.toString()}>
							{option.description}
						</Item>
					)}
				</Select>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">From Date:</Text>
				<InputDate
					error={
						errors?.fromDate?.message
							? t(errors?.fromDate?.message)
							: errors?.fromDate?.message
					}
					date={selectedFromDate || undefined}
					onChange={(data) => {
						handleChange({ fromDate: data.date });
					}}
					disabled={removeFromDate}
				/>
				<Checkbox
					checked={removeFromDate}
					onChange={() => {
						if (!removeFromDate) {
							handleChange({ fromDate: null });
							setRemoveFromDate(!removeFromDate);
						} else {
							setRemoveFromDate(!removeFromDate);
						}
					}}
					label="Remove From Date"
				/>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">To Date:</Text>
				<InputDate
					error={
						errors?.toDate?.message
							? t(errors?.toDate?.message)
							: errors?.toDate?.message
					}
					date={selectedToDate ? selectedToDate : undefined}
					onChange={(data) => {
						handleChange({ toDate: data.date });
					}}
					disabled={removeToDate}
				/>
				<Checkbox
					checked={removeToDate}
					onChange={() => {
						if (!removeToDate) {
							handleChange({ toDate: null });
							setRemoveToDate(!removeToDate);
						} else {
							setRemoveToDate(!removeToDate);
						}
					}}
					label="Remove To Date"
				/>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">Offsite Storage ID:</Text>
				<Input
					error={
						errors?.offsiteStorageId?.message
							? t(errors?.offsiteStorageId?.message)
							: errors?.offsiteStorageId?.message
					}
					value={selectedOffsiteStorageId ? `${selectedOffsiteStorageId}` : ''}
					onChange={(data) => {
						handleChange({ offsiteStorageId: data.target.value });
					}}
					disabled={removeOffisteStorage}
					type="number"
				/>
				<Checkbox
					checked={removeOffisteStorage}
					onChange={() => {
						if (!removeOffisteStorage) {
							handleChange({ offsiteStorageId: null });
							setRemoveOffisteStorage(!removeOffisteStorage);
						} else {
							setRemoveOffisteStorage(!removeOffisteStorage);
						}
					}}
					label="Remove Offsite Storage ID"
				/>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">Temporary ID:</Text>
				<Input
					error={
						errors?.temporaryId?.message
							? t(errors?.temporaryId?.message)
							: errors?.temporaryId?.message
					}
					value={selectedTemporaryId ? `${selectedTemporaryId}` : ''}
					onChange={(data) => {
						handleChange({ temporaryId: data.target.value });
					}}
					disabled={removeTemporaryId}
					type="number"
				/>
				<Checkbox
					checked={removeTemporaryId}
					onChange={() => {
						if (!removeTemporaryId) {
							handleChange({ temporaryId: null });
							setRemoveTemporaryId(!removeTemporaryId);
						} else {
							setRemoveTemporaryId(!removeTemporaryId);
						}
					}}
					label="Remove Temporary ID"
				/>
			</StyledFormField>

			<ModalFooter>
				<ButtonList justifyContent="center">
					<Button
						loading={isLoadingApplyButton}
						type="submit"
						label={'Apply'}
					/>
					<Button
						type="button"
						variant="primary_outlined"
						label={'Cancel'}
						onClick={handleCancelButton}
					/>
					<Button
						type="button"
						variant="primary_outlined"
						label={'Reset'}
						onClick={handleReset}
					/>
				</ButtonList>
			</ModalFooter>
		</>
	);
};
