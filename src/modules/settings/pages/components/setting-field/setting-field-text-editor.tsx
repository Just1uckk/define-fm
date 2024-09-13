import React, { useImperativeHandle, useRef, useState } from 'react';
import { SettingFieldRef } from 'modules/settings/pages/components/setting-field/setting-field';
import { validateField as validationFieldHelper } from 'modules/settings/pages/components/setting-field/validation-strategy';
import styled from 'styled-components';

import { ICoreConfig } from 'shared/types/core-config';

import { useTranslation } from 'shared/hooks/use-translation';

import { TextEditor } from 'shared/components/text-editor/text-editor';

const StyledTextEditor = styled(TextEditor)`
	.ql-editor {
		height: 16rem;
	}
`;

interface SettingFieldInputProps {
	label: string;
	field: ICoreConfig;
}

const SettingFieldTextEditorComponent: React.ForwardRefRenderFunction<
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

	const onChange = (value: string) => {
		isDirty.current = true;

		error && setError('');

		const validatedField = validateValue(value);

		!validatedField.isValid && setError(validatedField.error);

		setValue(value);
	};

	return (
		<StyledTextEditor
			label={label}
			value={value}
			onChange={onChange}
			error={error ? t(error) : error}
		/>
	);
};

export const SettingFieldTextEditor = React.forwardRef(
	SettingFieldTextEditorComponent,
);
