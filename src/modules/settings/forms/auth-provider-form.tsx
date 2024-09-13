import React, { useEffect, useImperativeHandle, useMemo } from 'react';
import { FormState, useFieldArray, useForm } from 'react-hook-form';
import { Item } from 'react-stately';
import { yupResolver } from '@hookform/resolvers/yup';
import { keyBy, map } from 'lodash';
import { GroupSelect } from 'modules/settings/components/group-select';
import { getMultiLangValues } from 'shared/utils/multilang-helpers';
import styled, { css, keyframes } from 'styled-components';
import * as yup from 'yup';

import { AUTH_PROVIDER_API_ERRORS } from 'app/api/auth-provider-api/auth-provider-api-error';

import {
	IAuthProvider,
	IAuthProviderConfig,
	IAuthProviderType,
	IAuthSyncSchedule,
} from 'shared/types/auth-provider';
import { IGroup } from 'shared/types/group';

import { LANGUAGE_CODES } from 'shared/constants/constans';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
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
import { Option, Select } from 'shared/components/select/select';
import { Text } from 'shared/components/text/text';
import { Toggle } from 'shared/components/toggle/toggle';

const RotateAnimation = keyframes`
	from { transform: rotate(0deg) }
	to { transform: rotate(360deg) }
`;

const StyledButton = styled(Button)<
	Pick<ProviderFormProps, 'isSyncingProvider'>
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

const FieldRow = styled(FormField)`
	display: flex;
	justify-content: space-between;
`;

const MappingInputsWrapper = styled.div`
	display: flex;
	align-items: flex-start;
	flex-direction: row;
	width: calc(100% - 5rem);
	margin-right: 0;
`;

const GroupInput = styled(Input)`
	width: 45%;
`;

const StyledGroupSelect = styled(GroupSelect)`
	width: 45%;
`;

const MappingSeparatorIcon = styled(Icon)`
	margin: 0 0.875rem;
	margin-top: 1.25rem;
`;

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

const StyledIconButton = styled(IconButton)`
	& {
		flex-grow: 0;
	}
	width: 3.1875rem;
	height: 3.1875rem;
	margin-left: 0.5rem;
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
`;

const CREATE_USERS_OPTIONS: Option[] = [
	{
		key: '0',
		value: 0,
		label: 'On First Login',
	},
	{
		key: '1',
		value: 1,
		label: 'Manually',
	},
];

enum PROVIDER_CLASS {
	PROVIDER_LOCAL = 'com.cassiacm.core.provider.LocalProvider',
}

const schema = yup
	.object({
		multilingual: yup.object().shape({
			name: yup.object().shape({
				en: yup
					.string()
					.trim()
					.when(['$currentLang'], {
						is: (currentLang: LANGUAGE_CODES) =>
							currentLang === LANGUAGE_CODES.EN,
						then: (schema) =>
							schema.required('validation_errors.field_is_required'),
					}),
				fr_CA: yup
					.string()
					.trim()
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
		type: yup.number().required('validation_errors.field_is_required'),
		createOn: yup.number(),
		isSyncEnabled: yup.boolean(),
		synchronizeOn: yup
			.number()
			.when(['isSyncEnabled', 'type', '$authProviderTypeList'], {
				is: (
					isSyncEnabled,
					selectedTypeId: IAuthProviderType['id'],
					authProviderTypeList: ProviderFormProps['authProviderTypeList'],
				) => {
					const authProviderType = authProviderTypeList.find(
						(providerType) => providerType.id === selectedTypeId,
					);

					if (!authProviderType?.syncable) {
						return false;
					}

					if (!isSyncEnabled) {
						return false;
					}

					return true;
				},
				then: (schema) =>
					schema.required('validation_errors.field_is_required'),
			}),
		configs: yup.array().of(
			yup.object().shape({
				configKey: yup.string(),
				configValue: yup.string(),
			}),
		),
		mappings: yup.array().of(
			yup.object().shape({
				groupNameExternal: yup
					.string()
					.required('validation_errors.field_is_required'),
				value: yup.lazy((value: string | IGroup) => {
					const parsedValue = typeof value === 'string' ? value.trim() : value;

					if (!parsedValue) {
						return yup.mixed().required('validation_errors.field_is_required');
					}

					switch (typeof parsedValue) {
						case 'object':
							return yup.object();
						case 'string':
							return yup.string();
						default:
							return yup.string();
					}
				}),
			}),
		),
	})
	.defined();

type AuthProviderFormDataLocal = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

type AuthProviderFormTypes = {
	multilingual: IAuthProvider['multilingual'];
	isSyncEnabled?: boolean;
	synchronizeOn: number | null;
	createOn: number;
	type: number;
	configs: Array<{ configKey: string; configValue?: string | null }>;
	mappings: Array<{ groupNameExternal: string; value?: IGroup | string }>;
};

export type AuthProviderFormData = Omit<
	AuthProviderFormDataLocal,
	'mappings'
> & {
	mappings?: Record<string, string>;
};

export interface AuthProviderFormRef {
	isDirty: boolean;
	onSubmit: () => void;
}

export interface ProviderFormProps {
	formRef?: React.Ref<AuthProviderFormRef>;
	provider?: IAuthProvider;
	authProviderTypeList: IAuthProviderType[];
	authProviderSyncScheduleList: IAuthSyncSchedule[];
	error?: AUTH_PROVIDER_API_ERRORS;
	isSyncingProvider?: boolean;
	onSyncProvider?: () => void;
	onSubmit: (data: AuthProviderFormData) => void;
	children: (props: {
		formState: FormState<AuthProviderFormTypes>;
	}) => React.ReactNode;
}

export const AuthProviderForm: React.FC<ProviderFormProps> = ({
	formRef,
	provider,
	authProviderTypeList,
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
		formState: { errors, dirtyFields },
	} = useForm<AuthProviderFormTypes>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		context: {
			authProviderTypeList,
			currentLang,
		},
		defaultValues: {
			multilingual: getMultiLangValues(
				provider || {},
				['name', 'comment'],
				currentLang,
			),
			isSyncEnabled: Boolean(provider?.synchronizeOn),
			synchronizeOn: provider
				? authProviderSyncScheduleList.find(
						(option) => option.id === provider?.synchronizeOn,
				  )?.id
				: undefined,
			type: provider?.type,
			createOn: provider?.createOn ?? (CREATE_USERS_OPTIONS[0].value as number),
			configs: getConfigList(
				provider?.configs,
				provider?.type,
			) as AuthProviderFormData['configs'],
			mappings: getParsedMappings(provider?.mappings),
		},
	});
	const configs = useFieldArray({
		control,
		name: 'configs',
	});
	const mappings = useFieldArray({
		control,
		name: 'mappings',
	});

	const isSyncEnabled = watch('isSyncEnabled');
	const synchronizeOn = watch('synchronizeOn');
	const createOn = watch('createOn');
	const selectedProviderTypeId = watch('type');

	useEffect(() => {
		if (error === AUTH_PROVIDER_API_ERRORS.DuplicateEntityException) {
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

	function getParsedMappings(mappings?: IAuthProvider['mappings']) {
		if (!mappings) {
			return [];
		}

		const list = map(mappings, (value, key) => ({
			groupNameExternal: key || '',
			value,
		}));

		return list;
	}

	function getConfigList(
		providerConfigs?: IAuthProvider['configs'],
		providerTypeId?: IAuthProvider['type'],
	) {
		const providerType = authProviderTypeList.find(
			(providerType) => providerType.id === providerTypeId,
		);
		const providerConfigList = keyBy(providerConfigs, 'configKey');
		const initialProviderConfigList = providerType?.configurations ?? [];
		const uniqList = new Set([
			...Object.keys(providerConfigList),
			...initialProviderConfigList,
		]);
		const list: Array<IAuthProviderConfig | { configKey: string }> = [];

		uniqList.forEach((configKey) => {
			if (!providerConfigList[configKey]) {
				list.push({ configKey });

				return;
			}

			list.push({
				configKey: configKey,
				configValue: providerConfigList[configKey].configValue ?? '',
			});
		});

		return list;
	}

	const toggleSynchronization = (value: boolean) => {
		setValue('isSyncEnabled', value, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const onSelectCreateOn = (option: Option | null) => {
		if (!option) return;

		setValue('createOn', option.value as number, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const onRemoveGroupMapping = (index: number) => {
		mappings.remove(index);
	};

	const onAddGroupMapping = () => {
		const newMap = {
			groupNameExternal: '',
			value: undefined,
		};

		mappings.append(newMap, { shouldFocus: false });
	};

	const onSelectServiceGroup = (value: IGroup, index: number) => {
		const oldFieldValue = mappings.fields[index];

		const updatedField = { ...oldFieldValue };
		updatedField.value = value.name;
		mappings.update(index, updatedField);
	};

	const onInvalidForm = () => {
		setTimeout(() => {
			nameInputsRef.current?.expandIfHasError();
		}, 0);
	};

	const onSubmitForm = ({ mappings, ...data }: AuthProviderFormTypes) => {
		const payload = { ...data } as AuthProviderFormData;
		if (!payload.isSyncEnabled) {
			payload.synchronizeOn = 0;
		}
		delete payload.isSyncEnabled;

		if (dirtyFields.mappings) {
			const parsedMappings: Record<string, string> = {};

			mappings?.forEach((mapping) => {
				const value =
					typeof mapping.value === 'string'
						? mapping.value
						: mapping.value?.name ?? '';

				parsedMappings[mapping.groupNameExternal as string] = value;
			});

			payload.mappings = parsedMappings;
		}

		onSubmit(payload);
	};

	const onSelectAuthProvider = (option: IAuthProviderType | null) => {
		if (!option) return;

		setValue('type', option.id, {
			shouldDirty: true,
			shouldValidate: true,
		});

		const isInitialList = option.id === provider?.type;
		const initialConfigList = isInitialList ? provider?.configs : undefined;
		const configList = getConfigList(initialConfigList, option.id);

		setValue('configs', configList, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const onSelectSyncSchedule = (option: IAuthSyncSchedule | null) => {
		if (!option) return;

		setValue('synchronizeOn', option.id, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const selectedAuthProviderType = useMemo(
		() =>
			authProviderTypeList.find(
				(provider) => provider.id === selectedProviderTypeId,
			),
		[authProviderTypeList, selectedProviderTypeId],
	);

	const selectedAuthSyncSchedule = useMemo(
		() =>
			authProviderSyncScheduleList.find(
				(option) => option.id === synchronizeOn,
			),
		[authProviderSyncScheduleList, synchronizeOn],
	);

	const isEditMode = !!provider;
	const isProviderSyncable = isEditMode
		? provider.syncable
		: selectedAuthProviderType?.syncable;

	const RIGHT_CREATE_USERS_OPTIONS: Option[] = useMemo(() => {
		if (selectedAuthProviderType?.clazz === PROVIDER_CLASS.PROVIDER_LOCAL) {
			return CREATE_USERS_OPTIONS.filter((element) => element.value === 1);
		}
		return CREATE_USERS_OPTIONS;
	}, [selectedAuthProviderType, CREATE_USERS_OPTIONS]);

	return (
		<PageForm onSubmit={handleSubmit(onSubmitForm, onInvalidForm)}>
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
					<Select<IAuthProviderType>
						label={t('auth_provider.provider_form.type')}
						options={authProviderTypeList}
						selectedKey={selectedAuthProviderType?.id?.toString()}
						onChange={onSelectAuthProvider}
						error={
							errors?.type?.message
								? t(errors?.type?.message)
								: errors?.type?.message
						}
						isDisabled={isEditMode}
					>
						{(option) => (
							<Item key={option.id} textValue={option.name}>
								{option.name}
							</Item>
						)}
					</Select>
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
				<FormField>
					<Select<Option>
						label={t('auth_provider.provider_form.create_users')}
						options={RIGHT_CREATE_USERS_OPTIONS}
						onChange={onSelectCreateOn}
						selectedKey={
							RIGHT_CREATE_USERS_OPTIONS.find(
								(option) => option.value === createOn,
							)?.value?.toString() ??
							RIGHT_CREATE_USERS_OPTIONS[0].value.toString()
						}
						error={
							errors?.createOn?.message
								? t(errors?.createOn?.message)
								: errors?.createOn?.message
						}
					>
						{(option) => (
							<Item key={option.value} textValue={String(option.label)}>
								{option.label}
							</Item>
						)}
					</Select>
				</FormField>
			</FormGroup>
			{isProviderSyncable && (
				<FormGroup>
					<FormField grid={false}>
						<Toggle
							label={
								<Text variant="body_1_primary_bold">
									{t('auth_provider.provider_form.synchronize')}
								</Text>
							}
							checked={isSyncEnabled}
							onChange={toggleSynchronization}
							justifyContent="space-between"
						/>
					</FormField>
					<FormField>
						<Select<IAuthSyncSchedule>
							label={t('auth_provider.provider_form.periodicity')}
							options={authProviderSyncScheduleList}
							onChange={onSelectSyncSchedule}
							isDisabled={!isSyncEnabled}
							selectedKey={selectedAuthSyncSchedule?.id.toString()}
							error={
								errors?.synchronizeOn?.message
									? t(errors?.synchronizeOn?.message)
									: errors?.synchronizeOn?.message
							}
						>
							{(option) => (
								<Item key={option.id} textValue={option.name}>
									{option.name}
								</Item>
							)}
						</Select>
						{onSyncProvider && (
							<StyledButton
								type="button"
								label={t('auth_provider.provider_form.sync_now')}
								variant="primary_outlined"
								icon={ICON_COLLECTION.sync}
								isSyncingProvider={isSyncingProvider}
								onClick={onSyncProvider}
								mt="0.175rem"
							/>
						)}
					</FormField>
				</FormGroup>
			)}
			{!!configs.fields.length && (
				<FormGroup>
					<SectionTitle variant="body_1_primary_bold">
						{t('auth_provider.provider_form.configuration')}
					</SectionTitle>
					{configs.fields.map((field, i) => (
						<FormField key={field.id}>
							{field.configKey?.includes('password') ? (
								<InputPassword
									autoForward
									label={t(`auth_provider.provider_form.${field.configKey}`)}
									{...register(`configs.${i}.configValue` as const)}
									autoComplete="new-password"
									fulfilled
								/>
							) : (
								<Input
									label={t(`auth_provider.provider_form.${field.configKey}`)}
									{...register(`configs.${i}.configValue` as const)}
									fulfilled
								/>
							)}
						</FormField>
					))}
				</FormGroup>
			)}

			{selectedAuthProviderType && !selectedAuthProviderType.singleton && (
				<FormGroup>
					<SectionTitle variant="body_1_primary_bold">
						{t('auth_provider.provider_form.group_mapping')}
					</SectionTitle>
					{mappings.fields?.map((field, i) => (
						<FieldRow key={field.id}>
							<MappingInputsWrapper>
								<GroupInput
									label={
										selectedAuthProviderType
											? t(
													'auth_provider.provider_form.provider_type_group_name.filled',
													{
														providerTypeName: selectedAuthProviderType.name,
													},
											  )
											: t(
													'auth_provider.provider_form.provider_type_group_name.empty',
											  )
									}
									error={
										errors?.mappings?.[i]?.groupNameExternal?.message
											? t(
													errors?.mappings?.[i]?.groupNameExternal
														?.message as string,
											  )
											: errors?.mappings?.[i]?.groupNameExternal?.message
									}
									fulfilled
									{...register(`mappings.${i}.groupNameExternal` as const)}
								/>
								<MappingSeparatorIcon icon={ICON_COLLECTION.arrow_fit} />
								<StyledGroupSelect
									isGroupMapping
									label={t('auth_provider.provider_form.cassia_group')}
									value={field.value as unknown as IGroup | undefined}
									defaultInputValue={
										typeof field.value === 'string' ? field.value : undefined
									}
									error={
										errors?.mappings?.[i]?.value?.message
											? t(errors?.mappings?.[i]?.value?.message as string)
											: errors?.mappings?.[i]?.value?.message
									}
									onSelect={(value) => {
										console.log('32');
										if (value.id) onSelectServiceGroup(value, i);
									}}
								/>
							</MappingInputsWrapper>

							<StyledIconButton
								icon={ICON_COLLECTION.substract}
								onPress={() => onRemoveGroupMapping(i)}
							/>
						</FieldRow>
					))}
					<AddGroupMappingWrapper>
						<AddGroupMappingButton
							icon={ICON_COLLECTION.add}
							onPress={onAddGroupMapping}
						/>
						<AddGroupMappingLine />
					</AddGroupMappingWrapper>
				</FormGroup>
			)}

			<ModalFooter>{children({ formState })}</ModalFooter>
		</PageForm>
	);
};
