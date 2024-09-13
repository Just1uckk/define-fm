import React from 'react';
import { FormField } from 'modules/settings/components/form-field';
import styled from 'styled-components';

import { useTranslation } from 'shared/hooks/use-translation';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	IconButton,
	IconButtonProps,
} from 'shared/components/icon-button/icon-button';
import { Input } from 'shared/components/input/input';
import { Text } from 'shared/components/text/text';

const Wrapper = styled(FormField)``;

const StyledInput = styled(Input)`
	width: 100%;
`;

const Row = styled.div`
	display: flex;
	width: 100%;

	& + & {
		margin-top: 0.75rem;
	}
`;

const StyledIconButton = styled(IconButton)`
	width: 3.1875rem;
	height: 3.1875rem;
	margin-left: 0.5rem;
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: initial;
`;

export type MultipleTextInputOption = {
	[key: string]: any;
	key: string;
	value: string | number;
	isValid: boolean;
	error?: string;
};

interface MultipleTextInputProps {
	className?: string;
	label?: string;
	inputType: string;
	isAddingAvailable?: boolean;
	error?: string;
	options: MultipleTextInputOption[];
	validateNewValue: (value: string) => { isValid: boolean; error: string };
	onChangeOption: (value: string, idx: number) => void;
	onAddOption: IconButtonProps['onPress'];
	onDeleteOption: (MultipleTextInputOption) => void;
}

const AddGroupMappingWrapper = styled.div`
	position: relative;
	width: calc(100% - 3.65rem);
`;

const AddGroupMappingButton = styled(IconButton)`
	position: relative;
	margin: 0 auto;
	color: ${({ theme }) => theme.colors.accent};
	background-color: ${({ theme }) => theme.colors.blue.secondary_inverted};
	z-index: 1;
`;

const AddGroupMappingLine = styled.div`
	position: absolute;
	left: 0;
	right: 0;
	top: 50%;
	height: 3px;
	background-color: ${({ theme }) => theme.colors.borderColorPrimary};
	transform: translateY(-50%);
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
`;

export const MultipleTextInput: React.FC<MultipleTextInputProps> = ({
	className,
	label,
	inputType,
	isAddingAvailable,
	options,
	onChangeOption,
	onAddOption,
	onDeleteOption,
}) => {
	const { t } = useTranslation();

	return (
		<Wrapper className={className} data-search-field-name={label}>
			<Text variant="body_4_secondary" ml="1rem" mb="0.2rem">
				{label}
			</Text>

			{options.map((option, idx) => (
				<Row key={option.key}>
					<StyledInput
						type={inputType}
						placeholder="Value"
						value={String(option.value)}
						error={option.error ? t(option.error) : option.error}
						onChange={(e) => onChangeOption(e.target.value, idx)}
						fulfilled
					/>
					<StyledIconButton
						icon={ICON_COLLECTION.substract}
						onPress={() => onDeleteOption(option)}
					/>
				</Row>
			))}
			{isAddingAvailable && (
				<AddGroupMappingWrapper>
					<AddGroupMappingButton
						icon={ICON_COLLECTION.add}
						onPress={onAddOption}
					/>
					<AddGroupMappingLine />
				</AddGroupMappingWrapper>
			)}
		</Wrapper>
	);
};
