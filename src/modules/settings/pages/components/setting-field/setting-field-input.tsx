import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { SettingFieldRef } from 'modules/settings/pages/components/setting-field/setting-field';
import { validateField as validationFieldHelper } from 'modules/settings/pages/components/setting-field/validation-strategy';

import { ICoreConfig } from 'shared/types/core-config';

import { useTranslation } from 'shared/hooks/use-translation';

import { Input } from 'shared/components/input/input';

interface SettingFieldInputProps {
	label: string;
	field: ICoreConfig;
	isPassword: boolean;
	handleSavePassword: () => void;
}

const SettingFieldInputComponent: React.ForwardRefRenderFunction<
	SettingFieldRef,
	SettingFieldInputProps
> = ({ label, field, isPassword, handleSavePassword }, ref) => {
	const { t } = useTranslation();

	const [value, setValue] = useState(getInitialValue(field));
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
		return field.configType === 'Number' ? parseFloat(value) : value;
	}

	function resetValue() {
		setValue(getInitialValue(field));
		error && setError('');
	}

	function getInitialValue(field: ICoreConfig) {
		return field.value || '';
	}

	function validateField() {
		error && setError('');

		const validatedValue = validateValue(value);

		validatedValue.error && setError(validatedValue.error);

		return validatedValue;
	}

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		isDirty.current = true;
		error && setError('');
		const valueTarget = e.target.value;

		const validatedField = validateValue(valueTarget);

		if (!validatedField.isValid) {
			if (
				field.property === 'core.password.length.maximum' &&
				validatedField.error !== 'validation_errors.field_is_invalid'
			) {
				setError('validation_errors.max_then_min');
			} else if (
				field.property === 'core.password.length.minimum' &&
				validatedField.error !== 'validation_errors.field_is_invalid'
			) {
				setError('validation_errors.min_then_max');
			} else {
				setError(validatedField.error);
			}
		} else {
			setValue(valueTarget);
		}
	};

	useEffect(() => {
		if (isPassword) {
			handleSavePassword();
		}
	}, [value]);

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

	const fieldValidation = field.presentation.validation;
	return (
		<Input
			type={field.configType}
			label={label}
			value={value}
			error={error ? t(error) : error}
			onChange={onChange}
			minLength={fieldValidation.min}
			maxLength={fieldValidation.max}
			fulfilled
		/>
	);
};

export const SettingFieldInput = React.forwardRef(SettingFieldInputComponent);
