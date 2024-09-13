import React, { useImperativeHandle, useRef, useState } from 'react';
import { SettingFieldRef } from 'modules/settings/pages/components/setting-field/setting-field';
import { validateField as validationFieldHelper } from 'modules/settings/pages/components/setting-field/validation-strategy';

import { ICoreConfig } from 'shared/types/core-config';

import { useTranslation } from 'shared/hooks/use-translation';

import { Textarea } from 'shared/components/textarea/textarea';

interface SettingFieldInputProps {
	label: string;
	field: ICoreConfig;
}

const SettingFieldTextareaComponent: React.ForwardRefRenderFunction<
	SettingFieldRef,
	SettingFieldInputProps
> = ({ label, field }, ref) => {
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
		return value;
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

	const validateValue = (value: string) => {
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

	const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		isDirty.current = true;

		error && setError('');
		const value = e.target.value;

		const validatedField = validateValue(value);

		!validatedField.isValid && setError(validatedField.error);

		setValue(value);
	};

	return (
		<Textarea
			label={label}
			value={value}
			error={error ? t(error) : error}
			onChange={onChange}
			fulfilled
			resize="vertical"
		/>
	);
};

export const SettingFieldTextarea = React.forwardRef(
	SettingFieldTextareaComponent,
);
