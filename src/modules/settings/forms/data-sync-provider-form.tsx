import React, { useEffect, useImperativeHandle } from 'react';
import { FormState, useFieldArray, useForm } from 'react-hook-form';
import { Item } from 'react-stately';
import { yupResolver } from '@hookform/resolvers/yup';
import { keyBy } from 'lodash';
import { getMultiLangValues } from 'shared/utils/multilang-helpers';
import styled, { css, keyframes } from 'styled-components';
import * as yup from 'yup';

import { DATA_SYNC_PROVIDER_API_ERRORS } from 'app/api/data-sync-provider-api/data-sync-provider-api-error';

import { IAuthSyncSchedule } from 'shared/types/auth-provider';
import {
	IDataSyncProvider,
	IDataSyncProviderConfiguration,
	IDataSyncProviderType,
} from 'shared/types/data-sync-provider';

import { LANGUAGE_CODES } from 'shared/constants/constans';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Input } from 'shared/components/input/input';
import { InputPassword } from 'shared/components/input/input-password';
import {
	LangInput,
	LangInputList,
	LangInputListRef,
} from 'shared/components/input/lang-input';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { PageForm } from 'shared/components/modal-form/page-form';
import { SectionTitle } from 'shared/components/modal-form/section-title';
import { Select } from 'shared/components/select/select';
import { Text } from 'shared/components/text/text';
import { Toggle } from 'shared/components/toggle/toggle';

const RotateAnimation = keyframes`
	from { transform: rotate(0deg) }
	to { transform: rotate(360deg) }
`;

const StyledButton = styled(Button)<
	Pick<DataSyncProviderFormProps, 'isSyncingProvider'>
>`
	flex-grow: 0;

	.button__content-icon {
		${({ isSyncingProvider }) =>
			isSyncingProvider &&
			css`
				animation: ${RotateAnimation} linear infinite 0.8s;
			`}
	}

	.button__content-icon svg {
		width: 16px;
		height: auto;
	}
`;

const schema = yup
	.object({
		multilingual: yup.object().shape({
			name: yup.object().shape({
				en: yup
					.string()
					.trim()
					.default('')
					.when(['$currentLang'], {
						is: (currentLang: LANGUAGE_CODES) =>
							currentLang === LANGUAGE_CODES.EN,
						then: (schema) =>
							schema.required('validation_errors.field_is_required'),
					}),
				fr_CA: yup
					.string()
					.trim()
					.default('')
					.when(['$currentLang'], {
						is: (currentLang: LANGUAGE_CODES) =>
							currentLang === LANGUAGE_CODES.FR_CD,
						then: (schema) =>
							schema.required('validation_errors.field_is_required'),
					}),
			}),
			comment: yup.object().shape({
				en: yup.string().trim(),
				fr_CA: yup.string().trim(),
			}),
		}),
		destination: yup.string().trim(),
		providerTypeId: yup
			.number()
			.required('validation_errors.field_is_required'),
		isSyncEnabled: yup.boolean(),
		scheduleId: yup
			.number()
			.nullable()
			.when('isSyncEnabled', {
				is: true,
				then: (schema) =>
					schema.required('validation_errors.field_is_required'),
			}),
		configuration: yup.array().of(
			yup.object().shape({
				name: yup.string().required(),
				value: yup.string(),
			}),
		),
	})
	.defined();

export type DataSyncProviderFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

export type DataSyncProviderFormType = {
	multilingual: IDataSyncProvider['multilingual'];
	destination?: string;
	providerTypeId: number;
	isSyncEnabled: boolean;
	scheduleId: number | null;
	configuration: Array<{ name: string; value?: string }>;
};

export interface DataSyncProviderFormRef {
	isDirty: boolean;
	onSubmit: () => void;
}

export interface DataSyncProviderFormProps {
	formRef?: React.Ref<DataSyncProviderFormRef>;
	provider?: IDataSyncProvider;
	providerTypeList: IDataSyncProviderType[];
	authProviderSyncScheduleList: IAuthSyncSchedule[];
	error?: DATA_SYNC_PROVIDER_API_ERRORS;
	isSyncingProvider?: boolean;
	onSyncProvider?: () => void;
	onSubmit: (data: DataSyncProviderFormType) => void;
	children: (props: {
		formState: FormState<DataSyncProviderFormType>;
	}) => React.ReactNode;
}

export const DataSyncProviderForm: React.FC<DataSyncProviderFormProps> = ({
	formRef,
	provider,
	providerTypeList,
	authProviderSyncScheduleList,
	error,
	isSyncingProvider,
	onSyncProvider,
	onSubmit,
	children,
}) => {
	const { t, currentLang } = useTranslation();
	const submitButtonFormRef = React.useRef<HTMLButtonElement>(null);
	const nameInputsRef = React.useRef<LangInputListRef>();

	const {
		handleSubmit,
		watch,
		register,
		setValue,
		setError,
		formState,
		control,
		formState: { errors },
	} = useForm<DataSyncProviderFormType>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		context: {
			currentLang,
		},
		defaultValues: {
			multilingual: getMultiLangValues(
				provider || {},
				['name', 'comment'],
				currentLang,
			),
			destination: provider?.destination ?? '',
			isSyncEnabled: provider ? provider.scheduleId !== null : false,
			scheduleId: provider?.scheduleId ?? 0,
			providerTypeId: provider?.providerTypeId,
			configuration: getConfigList(
				providerTypeList,
				provider?.configuration,
				provider?.providerTypeId,
			) as DataSyncProviderFormData['configuration'],
		},
	});
	const configuration = useFieldArray({
		control,
		name: 'configuration',
	});

	const isSyncEnabled = watch('isSyncEnabled');
	const scheduleId = watch('scheduleId');
	const selectedProviderTypeId = watch('providerTypeId');

	useEffect(() => {
		if (error === DATA_SYNC_PROVIDER_API_ERRORS.DuplicateEntityException) {
			setError(`multilingual.name.${currentLang}`, { message: error });
		}
	}, [error]);

	useImperativeHandle(formRef, () => {
		return {
			isDirty:
				formState.isDirty && Boolean(Object.keys(formState.dirtyFields).length),
			onSubmit: () => submitButtonFormRef.current?.click(),
		};
	});

	function getConfigList(
		providerTypeList: IDataSyncProviderType[],
		providerConfigs?: IDataSyncProvider['configuration'],
		providerTypeId?: IDataSyncProvider['providerTypeId'],
	) {
		const providerType = providerTypeList.find(
			(providerType) => providerType.id === providerTypeId,
		);
		const providerConfigList = keyBy(providerConfigs, 'name');
		const initialProviderConfigList = providerType
			? providerType.configurations
			: [];
		const uniqList = new Set([
			...Object.keys(providerConfigList),
			...initialProviderConfigList,
		]);
		const list: Array<IDataSyncProviderConfiguration | { name: string }> = [];

		uniqList.forEach((fieldName) => {
			if (!providerConfigList[fieldName]) {
				list.push({ name: fieldName });

				return;
			}

			list.push({
				name: fieldName,
				value: providerConfigList[fieldName].value,
			});
		});

		return list;
	}

	const toggleSynchronization = () => {
		const newValue = !isSyncEnabled;

		setValue('isSyncEnabled', newValue, {
			shouldDirty: true,
			shouldValidate: true,
		});
		if (!newValue) {
			setValue('scheduleId', null, {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	};

	const onSelectProvider = (option: IDataSyncProviderType | null) => {
		if (!option) return;

		setValue('providerTypeId', option.id, {
			shouldDirty: true,
			shouldValidate: true,
		});

		const isInitialList = option.id === provider?.providerTypeId;
		const initialConfigList = isInitialList
			? provider?.configuration
			: undefined;
		const configList = getConfigList(
			providerTypeList,
			initialConfigList,
			option.id,
		);

		setValue('configuration', configList, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const onSelectSyncSchedule = (option: IAuthSyncSchedule | null) => {
		if (!option) return;

		setValue('scheduleId', option.id, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const selectedAuthProviderType = providerTypeList.find(
		(provider) => provider.id === selectedProviderTypeId,
	);

	const selectedAuthSyncSchedule = authProviderSyncScheduleList.find(
		(option) => option.id === scheduleId,
	);

	console.log(selectedAuthSyncSchedule);

	return (
		<PageForm onSubmit={handleSubmit(onSubmit)}>
			<button ref={submitButtonFormRef} type="submit" hidden />
			<FormGroup>
				<FormField>
					<LangInputList innerRef={nameInputsRef}>
						<LangInput
							{...register('multilingual.name.en')}
							lang={LANGUAGE_CODES.EN}
							label={t('auth_provider.provider_form.name')}
							error={
								errors.multilingual?.name?.en?.message
									? t(errors.multilingual?.name?.en?.message)
									: errors.multilingual?.name?.en?.message
							}
						/>
						<LangInput
							{...register('multilingual.name.fr_CA')}
							lang={LANGUAGE_CODES.FR_CD}
							label={t('auth_provider.provider_form.name')}
							error={
								errors.multilingual?.name?.fr_CA?.message
									? t(errors.multilingual?.name?.fr_CA?.message)
									: errors.multilingual?.name?.fr_CA?.message
							}
						/>
					</LangInputList>
				</FormField>
				<FormField>
					<Select<IDataSyncProviderType>
						label={t('general_settings.data_sync_providers.provider_form.type')}
						options={providerTypeList}
						selectedKey={selectedAuthProviderType?.id?.toString()}
						onChange={onSelectProvider}
						error={
							errors?.providerTypeId?.message
								? t(errors.providerTypeId.message)
								: errors?.providerTypeId?.message
						}
					>
						{(option) => (
							<Item key={option.id} textValue={option.name}>
								{option.name}
							</Item>
						)}
					</Select>
				</FormField>
				<FormField>
					<Input
						label={t(
							'general_settings.data_sync_providers.provider_form.destination',
						)}
						{...register('destination')}
						error={errors.destination?.message}
						fulfilled
					/>
				</FormField>
				<FormField>
					<LangInputList>
						<LangInput
							{...register('multilingual.comment.en')}
							lang={LANGUAGE_CODES.EN}
							label={t('auth_provider.provider_form.comment')}
							error={errors.multilingual?.comment?.en?.message}
						/>
						<LangInput
							{...register('multilingual.comment.fr_CA')}
							lang={LANGUAGE_CODES.FR_CD}
							label={t('auth_provider.provider_form.name')}
							error={errors.multilingual?.comment?.fr_CA?.message}
						/>
					</LangInputList>
				</FormField>
			</FormGroup>
			<FormGroup>
				<FormField grid={false}>
					<Toggle
						label={
							<Text variant="body_1_primary_bold">
								{t(
									'general_settings.data_sync_providers.provider_form.synchronize',
								)}
							</Text>
						}
						checked={Boolean(isSyncEnabled)}
						onChange={toggleSynchronization}
						justifyContent="space-between"
					/>
				</FormField>
				<FormField>
					<Select<IAuthSyncSchedule>
						label={t(
							'general_settings.data_sync_providers.provider_form.periodicity',
						)}
						options={authProviderSyncScheduleList}
						onChange={onSelectSyncSchedule}
						isDisabled={!isSyncEnabled}
						selectedKey={selectedAuthSyncSchedule?.id?.toString()}
						error={
							errors?.scheduleId?.message
								? t(errors.scheduleId.message)
								: errors?.scheduleId?.message
						}
					>
						{(option) => (
							<Item key={option.id} textValue={option.name}>
								{option.name}
							</Item>
						)}
					</Select>
					{!!provider && onSyncProvider && (
						<StyledButton
							type="button"
							label={t(
								'general_settings.data_sync_providers.provider_form.sync_now',
							)}
							variant="primary_outlined"
							icon={ICON_COLLECTION.sync}
							isSyncingProvider={isSyncingProvider}
							onClick={onSyncProvider}
							mt="0.175rem"
						/>
					)}
				</FormField>
			</FormGroup>

			{!!configuration.fields.length && (
				<FormGroup>
					<SectionTitle variant="body_1_primary_bold">
						{t('auth_provider.provider_form.configuration')}
					</SectionTitle>
					{configuration.fields.map((field, i) => (
						<FormField key={field.id}>
							{field.name.includes('password') ? (
								<InputPassword
									label={field.name}
									fulfilled
									autoComplete="none"
									{...register(`configuration.${i}.value` as const)}
									autoForward
								/>
							) : (
								<Input
									label={field.name}
									autoComplete="none"
									fulfilled
									{...register(`configuration.${i}.value` as const)}
								/>
							)}
						</FormField>
					))}
				</FormGroup>
			)}
			<ModalFooter>{children({ formState })}</ModalFooter>
		</PageForm>
	);
};
