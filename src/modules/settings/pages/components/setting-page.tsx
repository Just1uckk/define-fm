import React, { useRef } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { FieldSeparator } from 'modules/settings/components/field-separator';
import { FormBody } from 'modules/settings/components/form-body';
import { FormContainer } from 'modules/settings/components/form-container';
import { FormTitle } from 'modules/settings/components/form-title';
import {
	SettingField,
	SettingFieldRef,
} from 'modules/settings/pages/components/setting-field/setting-field';

import {
	CoreConfigApi,
	UpdateConfigPropertyDto,
} from 'app/api/core-config-api/core-config-api';

import { ICoreConfig } from 'shared/types/core-config';

import { CORE_CONFIG_LIST_QUERY_KEYS } from 'shared/constants/query-keys';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';

interface SettingPageProps {
	title: string;
	fields: ICoreConfig[];
}

const SettingPage: React.FC = () => {
	const client = useQueryClient();
	const { t } = useTranslation();
	const { title, fields } = useOutletContext<SettingPageProps>();
	const refs = useRef<Record<string, SettingFieldRef>>({});

	const updateCoreConfigPropertyMutation = useMutation({
		mutationFn: async (data: UpdateConfigPropertyDto[]) => {
			const promises = data.map((payload) =>
				CoreConfigApi.updateConfigProperty(payload),
			);

			await client.refetchQueries(CORE_CONFIG_LIST_QUERY_KEYS.config_list);
			await client.refetchQueries(
				CORE_CONFIG_LIST_QUERY_KEYS.config_list_settings_page,
			);

			return Promise.all(promises);
		},
		onSuccess: () => {
			//Reset field state
			for (const fieldName in refs.current) {
				const field = refs.current[fieldName];
				const isFieldDirty = field.isDirty;

				if (isFieldDirty) {
					field.setIsDirty(false);
				}
			}
		},
	});

	const setRef = (ref) => {
		if (!ref) return;

		refs.current[ref.name] = ref;
	};

	const onSave = (e?: React.FormEvent) => {
		if (e) {
			e.preventDefault();
		}
		let isFormValid = true;

		const fields = refs.current;
		const payload: UpdateConfigPropertyDto[] = [];

		for (const fieldName in fields) {
			const field = fields[fieldName];
			const isFieldDirty = field.isDirty;
			if (!isFieldDirty) {
				continue;
			}

			const value = field.getValue();
			const isFieldValid = field.validate().isValid;
			isFormValid = isFormValid && isFieldValid;

			if (isFieldDirty) {
				payload.push({ id: field.id, value });
			}
		}

		if (isFormValid && payload.length) {
			updateCoreConfigPropertyMutation.mutate(payload);
		}
	};

	const onResetForm = () => {
		for (const fieldName in refs.current) {
			const field = refs.current[fieldName];
			const isFieldDirty = field.isDirty;

			if (isFieldDirty) {
				field.resetValue && field.resetValue();
				field.setIsDirty(false);
			}
		}
	};

	const handleUnmountField = (field: ICoreConfig) => {
		delete refs.current[field.property];
	};

	return (
		<FormContainer onSubmit={onSave}>
			<FormBody>
				<FormTitle variant="h2_primary_semibold">{title}</FormTitle>
				{fields.map((field, idx, selfFields) => (
					<React.Fragment key={field.id}>
						<SettingField
							handleSavePassword={onSave}
							ref={setRef}
							field={field}
							onUnmount={handleUnmountField}
						/>
						{idx + 1 !== selfFields.length && <FieldSeparator />}
					</React.Fragment>
				))}
			</FormBody>
			<ButtonList>
				<Button
					type="submit"
					label={t('settings.actions.save')}
					loading={updateCoreConfigPropertyMutation.isLoading}
				/>
				<Button
					label={t('settings.actions.cancel')}
					variant="primary_outlined"
					disabled={updateCoreConfigPropertyMutation.isLoading}
					onClick={onResetForm}
				/>
			</ButtonList>
		</FormContainer>
	);
};

export default SettingPage;
