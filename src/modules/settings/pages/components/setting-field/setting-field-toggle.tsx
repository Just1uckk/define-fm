import React, { useImperativeHandle, useRef, useState } from 'react';
import { SettingFieldRef } from 'modules/settings/pages/components/setting-field/setting-field';

import { ICoreConfig } from 'shared/types/core-config';

import { Text } from 'shared/components/text/text';
import { Toggle } from 'shared/components/toggle/toggle';

interface SettingFieldInputProps {
	label: string;
	field: ICoreConfig;
}

const SettingFieldToggleComponent: React.ForwardRefRenderFunction<
	SettingFieldRef,
	SettingFieldInputProps
> = ({ label, field }, ref) => {
	const [checked, setChecked] = useState(getInitialValue(field));
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
		if (!field.presentation.values.values) {
			return checked;
		}

		return checked
			? field.presentation.values.values[0]?.[field.presentation.values.value]
			: field.presentation.values.values[1]?.[field.presentation.values.value];
	}

	function resetValue() {
		setChecked(getInitialValue(field));
	}

	function getInitialValue(field: ICoreConfig) {
		return (
			field.value ===
				field.presentation?.values?.values?.[0]?.[
					field.presentation.values.value
				] ?? false
		);
	}

	function validateField() {
		return {
			isValid: true,
			error: '',
		};
	}

	const onChange = () => {
		isDirty.current = true;

		setChecked((prevValue) => !prevValue);
	};

	return (
		<Toggle
			label={<Text variant="body_1_primary">{label}</Text>}
			onChange={onChange}
			checked={checked}
			justifyContent="space-between"
		/>
	);
};

export const SettingFieldToggle = React.forwardRef(SettingFieldToggleComponent);
