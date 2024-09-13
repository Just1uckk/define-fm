import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
	MultipleTextInput,
	MultipleTextInputOption,
} from 'modules/settings/components/multiple-input';
import { SettingFieldRef } from 'modules/settings/pages/components/setting-field/setting-field';
import { validateField as validationFieldHelper } from 'modules/settings/pages/components/setting-field/validation-strategy';
import { uuid } from 'shared/utils/uuid';

import { ICoreConfig } from 'shared/types/core-config';

interface SettingFieldTextMultipleProps {
	label: string;
	field: ICoreConfig;
}

const SettingFieldTextMultipleComponent: React.ForwardRefRenderFunction<
	SettingFieldRef,
	SettingFieldTextMultipleProps
> = ({ label, field }, ref) => {
	const [selectedValue, setValue] = useState<MultipleTextInputOption[]>(
		getInitialValue(field),
	);
	const [error, setError] = useState('');
	const isDirty = useRef(false);

	useImperativeHandle(ref, () => {
		return {
			id: field.id,
			name: field.property,
			isDirty: isDirty.current,
			setIsDirty: (flag) => (isDirty.current = flag),
			validate: validateField,
			getValue: getValue,
			resetValue: resetValue,
		};
	});

	function getValue() {
		return selectedValue
			.map((option) => option.value)
			.join(field.presentation.multivalue?.delimiter);
	}

	function resetValue() {
		setValue(getInitialValue(field));
		error && setError('');
	}

	function getInitialValue(field: ICoreConfig) {
		let values: MultipleTextInputOption[] = [];

		if (!field.presentation.multivalue) return values;

		values = field.value
			.split(field.presentation.multivalue.delimiter)
			.map((value) => ({
				key: uuid(),
				value,
				isValid: true,
			}));

		return values;
	}

	function validateField() {
		error && setError('');
		const result = {
			isValid: true,
			error: '',
		};

		const {
			configType,
			presentation: { validation },
		} = field;

		const validationResult = validationFieldHelper(
			selectedValue,
			validation,
			configType,
		);

		if (!validationResult.isValid) {
			setError(validationResult.error);

			return validationResult;
		}

		const validatedFields = selectedValue.map((option) => ({
			...option,
			...validateValue(option.value),
		}));
		const isValuesValid = validatedFields.every((option) => option.isValid);

		if (!isValuesValid) {
			result.isValid = false;
			setValue(validatedFields);

			return result;
		}

		result.error && setError(result.error);

		return result;
	}

	const validateValue = (value: string | number) => {
		const {
			configType,
			presentation: { validation },
		} = field;

		const validationResult = validationFieldHelper(
			value,
			validation,
			configType,
		);

		return validationResult;
	};

	const onAddOption = () => {
		isDirty.current = true;

		setValue((prevValue) => [
			...prevValue,
			{ key: uuid(), value: '', isValid: true },
		]);
	};

	const onChangeOption = (value: string, idx: number) => {
		isDirty.current = true;
		const validatedField = validateValue(value);

		setValue((prevValue) => {
			const updatedList = [...prevValue];

			updatedList[idx].value = value;
			updatedList[idx].isValid = validatedField.isValid;
			updatedList[idx].error = validatedField.error;

			return updatedList;
		});
	};

	const onDeleteOption = (option: MultipleTextInputOption) => {
		isDirty.current = true;

		setValue((prevValue) =>
			prevValue.filter((oldOption) => oldOption.key !== option.key),
		);
	};

	useEffect(() => {
		resetValue();
	}, [field]);

	const isAvailableAddButton =
		field.presentation.multivalue?.max !== undefined
			? selectedValue.length < field.presentation.multivalue?.max
			: undefined;
	return (
		<MultipleTextInput
			inputType={field.configType}
			label={label}
			options={selectedValue}
			isAddingAvailable={isAvailableAddButton}
			error={error}
			validateNewValue={validateValue}
			onChangeOption={onChangeOption}
			onAddOption={onAddOption}
			onDeleteOption={onDeleteOption}
		/>
	);
};

export const SettingFieldTextMultiple = React.forwardRef(
	SettingFieldTextMultipleComponent,
);
