import React, { useState } from 'react';
import { Item } from 'react-stately';
import styled from 'styled-components';

import {
	GetUpdateRecordsManagementDto,
	MetadataAccessionInterfase,
	MetadataEssentialInterfase,
	MetadataRsiInterfase,
	MetadataStatuslInterfase,
	MetadataStorageInterfase,
} from 'app/api/bulk-api/bulk-api';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { Checkbox } from 'shared/components/checkbox/checkbox';
import { InputDate } from 'shared/components/input/input-date';
import { useModalContext } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { Option, Select } from 'shared/components/select/select';
import { Text } from 'shared/components/text/text';

const StyledFormField = styled(FormField)`
	align-items: center;
	grid-template-columns: 25% 50% 25%;
`;

interface UpdateRecordsManagementMetadataFormInterface {
	isLoadingApplyButton: boolean;
	errors?: any;
	officialOptions: Option[];
	listOfOptions: GetUpdateRecordsManagementDto;
	isLoading: boolean;
	selectedRsi: MetadataRsiInterfase | undefined;
	selectedStatus: MetadataStatuslInterfase | undefined;
	selectedEssential: MetadataEssentialInterfase | undefined;
	selectedStorage: MetadataStorageInterfase | undefined;
	selectedOfficial: Option | undefined;
	selectedAccession: MetadataAccessionInterfase | undefined;
	selectedRecordDate: Date | undefined;
	selectedStatusDate: Date | undefined;
	handleChange: (data: any) => void;
	handleCancelButton: () => void;
	handleResetButton: () => void;
}

export const UpdateRecordsManagementMetadataForm: React.FC<
	UpdateRecordsManagementMetadataFormInterface
> = ({
	isLoadingApplyButton,
	errors,
	officialOptions,
	listOfOptions,
	isLoading,
	selectedRsi,
	selectedStatus,
	selectedEssential,
	selectedStorage,
	selectedOfficial,
	selectedAccession,
	selectedRecordDate,
	selectedStatusDate,
	handleChange,
	handleCancelButton,
	handleResetButton,
}) => {
	const contextModal = useModalContext();
	const { t } = useTranslation();

	const [rsi, setRsi] = useState<boolean>(false);

	const handleReset = () => {
		setRsi(false);
		handleResetButton();
	};

	return (
		<>
			<StyledFormField>
				<Text variant="body_3_secondary">RSI:</Text>
				<Select
					isDisabled={rsi}
					error={
						errors?.rsi?.message
							? t(errors?.rsi?.message)
							: errors?.rsi?.message
					}
					label="Select RSI"
					selectedKey={selectedRsi?.rsi || null}
					options={listOfOptions.rmrsi}
					onChange={handleChange}
				>
					{(option) => (
						<Item key={option.rsi} textValue={option.rsi.toString()}>
							{option.description ? option.description : option.rsi}
						</Item>
					)}
				</Select>
				<Checkbox
					label="Remove RSI"
					checked={rsi}
					onChange={() => {
						if (!rsi) {
							handleChange({ rsi: null });
							setRsi(!rsi);
						} else {
							setRsi(!rsi);
						}
					}}
				/>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">Record Date:</Text>
				<InputDate
					date={selectedRecordDate}
					error={
						errors?.recordDate?.message
							? t(errors?.recordDate?.message)
							: errors?.recordDate?.message
					}
					onChange={(date) => {
						handleChange({
							recordDate: date.date,
							dateString: date.dateString,
						});
					}}
				/>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">Status:</Text>
				<Select
					error={
						errors?.status?.message
							? t(errors?.status?.message)
							: errors?.status?.message
					}
					label="Select Status"
					selectedKey={selectedStatus?.status || null}
					options={listOfOptions.rmStatusCode}
					onChange={handleChange}
				>
					{(option) => (
						<Item key={option.status} textValue={option.status.toString()}>
							{option.description ? option.description : option.status}
						</Item>
					)}
				</Select>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">Status Date:</Text>
				<InputDate
					date={selectedStatusDate}
					error={
						errors?.statusDate?.message
							? t(errors?.statusDate?.message)
							: errors?.statusDate?.message
					}
					onChange={(date) => {
						handleChange({
							statusDate: date.date,
							dateString: date.dateString,
						});
					}}
				/>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">Essential:</Text>
				<Select
					error={
						errors?.essential?.message
							? t(errors?.essential?.message)
							: errors?.essential?.message
					}
					label="Select Essential"
					selectedKey={selectedEssential?.essential || null}
					options={listOfOptions.rmEssCode}
					onChange={handleChange}
				>
					{(option) => (
						<Item
							key={option.essential}
							textValue={option.essential.toString()}
						>
							{option.description ? option.description : option.essential}
						</Item>
					)}
				</Select>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">Storage Medium:</Text>
				<Select
					error={
						errors?.storage?.message
							? t(errors?.storage?.message)
							: errors?.storage?.message
					}
					label="Select Storage Medium"
					selectedKey={selectedStorage?.storage || null}
					options={listOfOptions.rmStorage}
					onChange={handleChange}
				>
					{(option) => (
						<Item key={option.storage} textValue={option.storage.toString()}>
							{option.description ? option.description : option.storage}
						</Item>
					)}
				</Select>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">Official:</Text>
				<Select<Option>
					error={
						errors?.official?.message
							? t(errors?.official?.message)
							: errors?.official?.message
					}
					label="Select Action"
					selectedKey={selectedOfficial?.value || null}
					options={officialOptions}
					onChange={handleChange}
				>
					{(option) => (
						<Item key={option.value} textValue={option.label.toString()}>
							{option.value}
						</Item>
					)}
				</Select>
			</StyledFormField>
			<StyledFormField>
				<Text variant="body_3_secondary">Accession:</Text>
				<Select
					error={
						errors?.accession?.message
							? t(errors?.accession?.message)
							: errors?.accession?.message
					}
					label="Select Accession"
					selectedKey={selectedAccession?.accession || null}
					options={listOfOptions.rmAccession}
					onChange={handleChange}
				>
					{(option) => (
						<Item
							key={option.accession}
							textValue={option.accession.toString()}
						>
							{option.description ? option.description : option.accession}
						</Item>
					)}
				</Select>
			</StyledFormField>
			<ModalFooter>
				<ButtonList justifyContent="center">
					<Button
						type="submit"
						label={'Apply'}
						loading={isLoadingApplyButton}
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
