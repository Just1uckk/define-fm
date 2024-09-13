import React, { useEffect } from 'react';
import { FormField } from 'modules/settings/components/form-field';
import { SettingFieldButton } from 'modules/settings/pages/components/setting-field/setting-field-button';
import { SettingFieldInput } from 'modules/settings/pages/components/setting-field/setting-field-input';
import { SettingFieldSelect } from 'modules/settings/pages/components/setting-field/setting-field-select';
import { SettingFieldTextEditor } from 'modules/settings/pages/components/setting-field/setting-field-text-editor';
import { SettingFieldTextMultiple } from 'modules/settings/pages/components/setting-field/setting-field-text-multiple';
import { SettingFieldTextarea } from 'modules/settings/pages/components/setting-field/setting-field-textarea';
import { SettingFieldToggle } from 'modules/settings/pages/components/setting-field/setting-field-toggle';

import { ICoreConfig } from 'shared/types/core-config';

import { useTranslation } from 'shared/hooks/use-translation';

export interface SettingFieldRef {
	id: number;
	name: string;
	isDirty: boolean;
	setIsDirty: (flag: boolean) => void;
	validate: () => { isValid: boolean; error: string };
	getValue: () => any;
	resetValue?: () => any;
}

interface SettingFieldProps {
	field: ICoreConfig;
	onUnmount: (field: ICoreConfig) => void;
	handleSavePassword: () => void;
}

export const SettingFieldComponent: React.ForwardRefRenderFunction<
	SettingFieldRef,
	SettingFieldProps
> = ({ field, onUnmount, handleSavePassword }, ref) => {
	const { t } = useTranslation();

	useEffect(() => {
		return () => {
			onUnmount(field);
		};
	}, []);

	const label =
		t(`setting_fields`, { returnObjects: true })[field.property] ||
		field.property;

	return (
		<FormField data-search-field-name={field.property}>
			{field.presentation.presentation === 'textinput' &&
				!field.presentation.multivalue && (
					<SettingFieldInput
						ref={ref}
						field={field}
						label={label}
						isPassword={
							field.property === 'core.password.length.maximum' ||
							field.property === 'core.password.length.minimum'
						}
						handleSavePassword={handleSavePassword}
					/>
				)}

			{field.presentation.presentation === 'textinput' &&
				field.presentation.multivalue && (
					<SettingFieldTextMultiple ref={ref} field={field} label={label} />
				)}

			{field.presentation.presentation === 'textarea' && (
				<SettingFieldTextarea ref={ref} field={field} label={label} />
			)}

			{field.presentation.presentation === 'wysiwyg' && (
				<SettingFieldTextEditor ref={ref} field={field} label={label} />
			)}

			{field.presentation.presentation === 'toggle' && (
				<SettingFieldToggle ref={ref} field={field} label={label} />
			)}

			{field.presentation.presentation === 'dropdown' && (
				<SettingFieldSelect ref={ref} field={field} label={label} />
			)}

			{field.presentation.presentation === 'button' && (
				<SettingFieldButton field={field} label={label} />
			)}
		</FormField>
	);
};

export const SettingField = React.forwardRef(SettingFieldComponent);
