import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { Item } from 'react-stately';
import { yupResolver } from '@hookform/resolvers/yup';
import passwordGenerator from 'generate-password-browser';
import { find, keyBy, map } from 'lodash';
import { GROUP_GLOBAL_EVENTS } from 'shared/utils/event-bus';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import { filterGroupsByRoles } from 'shared/utils/utils';
import { validatePassword } from 'shared/utils/validation-password';
import styled from 'styled-components';
import * as yup from 'yup';

import { AuthProviderApi } from 'app/api/auth-provider-api/auth-provider-api';
import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import { FindGroupsDto, GroupApi } from 'app/api/groups-api/group-api';
import { USERS_API_ERRORS } from 'app/api/user-api/user-api-error';

import { ThemeProps } from 'app/settings/theme/theme';

import { IAuthProvider } from 'shared/types/auth-provider';
import { ICoreConfig } from 'shared/types/core-config';
import { IGroup } from 'shared/types/group';
import {
	IUser,
	PasswordSettings,
	ValidationPasswordErrors,
} from 'shared/types/users';

import { APP_ROLES } from 'shared/constants/constans';
import {
	AUTH_PROVIDES_QUERY_KEYS,
	CORE_CONFIG_LIST_QUERY_KEYS,
} from 'shared/constants/query-keys';

import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { useImageCropper } from 'shared/hooks/use-image-cropper';
import { useTranslation } from 'shared/hooks/use-translation';

import {
	Dropzone,
	DropzoneErrors,
	FileInvalidDropzone,
} from 'shared/components/dropzone/dropzone';
import { GroupBadge } from 'shared/components/group-badge/group-badge';
import { GroupBadgeList } from 'shared/components/group-badge/group-badge-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Input } from 'shared/components/input/input';
import { InputPassword } from 'shared/components/input/input-password';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FieldToggle } from 'shared/components/modal-form/field-toggle';
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageForm } from 'shared/components/modal-form/page-form';
import { SectionTitle } from 'shared/components/modal-form/section-title';
import { PasswordRequirements } from 'shared/components/password-requirements/password-requirements';
import { Select } from 'shared/components/select/select';
import {
	SelectAsyncFinder,
	SelectAsyncFinderState,
} from 'shared/components/select/select-async-finder';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';

import { UserProfileAvatar } from './user-profile-avatar';

const WrapBadges = styled(GroupBadgeList)`
	display: flex;
	flex-wrap: wrap;
`;

const WrapGenPass = styled.div`
	display: flex;
	align-items: center;
	margin-top: 0.25rem;
`;

const BtnGenPass = styled.button<ThemeProps>`
	padding: 0;
	border: 0;
	margin-left: auto;
	background-color: transparent;
	font-size: 0.875rem;
	line-height: 1.125rem;
	color: ${({ theme }) => theme.colors.accent};
`;
const emailRegex = new RegExp(
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
);

const schema = yup
	.object({
		avatar: yup.mixed(),
		enabled: yup.boolean(),
		username: yup
			.string()
			.trim()
			.when(['$isUserFromExternalService'], {
				is: (isUserFromExternalService: boolean) => !isUserFromExternalService,
				then: (schema) =>
					schema.required('validation_errors.field_is_required'),
			}),
		display: yup
			.string()
			.trim()
			.when(['$isUserFromExternalService'], {
				is: (isUserFromExternalService: boolean) => !isUserFromExternalService,
				then: (schema) =>
					schema.required('validation_errors.field_is_required'),
			}),
		email: yup
			.string()
			.email('validation_errors.invalid_email')
			.matches(emailRegex, 'validation_errors.invalid_email')
			.when(['$isUserFromExternalService'], {
				is: (isUserFromExternalService: boolean) => !isUserFromExternalService,
				then: (schema) =>
					schema.required('validation_errors.field_is_required'),
			}),
		password: yup
			.string()
			.when(
				[
					'$isEditMode',
					'$authProviders',
					'$isUserFromExternalService',
					'providerId',
				],
				{
					is: (
						isEditMode: boolean,
						authProviders: IAuthProvider[],
						isUserFromExternalService: boolean,
						providerId: number,
					) => {
						return !(isEditMode || !authProviders[providerId]?.passwordMutable);
					},
					then: (schema) =>
						schema.test({
							name: 'password-regx',
							test: function (value, { createError }) {
								const errors: ValidationPasswordErrors = validatePassword(
									value || '',
									this.options?.context?.passwordSettings as PasswordSettings,
								);

								if (errors.hasValue) {
									return createError({
										message: errors,
									});
								}

								if (Object.keys(errors).length) {
									return createError({ message: errors });
								}

								return true;
							},
						}),
					otherwise: (schema) => schema,
				},
			),
		providerId: yup.number().required('validation_errors.field_is_required'),
		groups: yup
			.array(yup.string().required('Groups must be string'))
			.required('validation_errors.field_is_required'),
	})
	.defined();

export type UserFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

export interface UserProfileFormRef {
	isDirty: boolean;
	onSubmit: () => void;
}

export interface UserProfileProps {
	isEditMode?: boolean;
	user?: IUser;
	error?: USERS_API_ERRORS;
	onSubmit: (
		data: UserFormData,
		dirtyFields?: Record<string, boolean[] | boolean | undefined>,
	) => void;
	children: React.ReactNode;
}

const UserProfileFormComponent: React.ForwardRefRenderFunction<
	UserProfileFormRef,
	UserProfileProps
> = ({ isEditMode, user, error, onSubmit, children }, ref) => {
	const { t } = useTranslation();
	const submitButtonFormRef = useRef<HTMLButtonElement | null>(null);

	const { data: passwordSettings, isLoading: isPasswordSettingsLoading } =
		useQuery({
			queryKey: CORE_CONFIG_LIST_QUERY_KEYS.config_list,
			queryFn: CoreConfigApi.getConfigList,
			enabled: !isEditMode,
			select: useCallback((data: ICoreConfig[]) => {
				const groupedList = keyBy(data, 'property');

				return {
					max: groupedList['core.password.length.maximum'],
					min: groupedList['core.password.length.minimum'],
					shouldContainDigit: groupedList['core.password.requires.digit'],
					shouldContainLower: groupedList['core.password.requires.lower'],
					shouldContainUpper: groupedList['core.password.requires.upper'],
					shouldContainSymbol: groupedList['core.password.requires.symbol'],
				};
			}, []),
		});

	const { data: authProvidersData = {}, isLoading: isAuthProvidersLoading } =
		useQuery(
			AUTH_PROVIDES_QUERY_KEYS.auth_provider_list,
			AuthProviderApi.getProviderList,
			{
				select: useCallback((response) => keyBy(response, 'id'), []),
			},
		);

	const {
		data: groupsData,
		searchData: searchGroups,
		refetchData: refetchGroups,
		isSearching: isSearchingGroups,
	} = useFilterRequest<IGroup[], undefined, FindGroupsDto>({
		requestKey: GROUP_GLOBAL_EVENTS.findGroups,
		request: (params) => {
			return GroupApi.findGroups(getFindGroupsParams(params));
		},
		searchRequest: (params) => {
			return GroupApi.findGroups(params);
		},
	});
	const groupList = groupsData?.results ?? [];

	const {
		handleSubmit,
		register,
		watch,
		setValue,
		setError,
		formState,
		formState: { errors, dirtyFields },
	} = useForm<UserFormData>({
		mode: 'onTouched',
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		context: {
			isEditMode: isEditMode,
			authProviders: authProvidersData,
			passwordSettings,
			isUserFromExternalService:
				user && authProvidersData[user.providerId]?.syncable,
		},
		defaultValues: {
			enabled: user?.enabled ?? true,
			username: user?.username,
			display: user?.display,
			email: user?.email,
			groups: user?.groups,
			avatar: user ? getUserAvatarUrl(user.id, user.profileImage) : undefined,
		},
	});
	const enabledValue = watch('enabled');
	const passwordValue = watch('password');
	const selectedGroups = watch('groups');
	const selectedProviderId = watch('providerId');
	const avatar = watch('avatar');
	const validationPasswordErrors = useMemo(
		() =>
			validatePassword(
				passwordValue || '',
				passwordSettings as PasswordSettings,
			),
		[passwordValue, passwordSettings],
	);

	useImperativeHandle(ref, () => {
		return {
			isDirty:
				formState.isDirty && Boolean(Object.keys(formState.dirtyFields).length),
			onSubmit: () => submitButtonFormRef.current?.click(),
		};
	});

	useEffect(() => {
		if (!user && authProvidersData) {
			const providerId = getDefaultAuthProviderId();
			providerId && setValue('providerId', providerId);
			return;
		}

		if (user) {
			setValue('providerId', user.providerId);
		}
	}, [authProvidersData, user]);

	useEffect(() => {
		if (!error) return;

		if (error === USERS_API_ERRORS.DuplicateEntityException) {
			setError('username', {
				message: t('users.user_form.validation_errors.duplicate'),
			});
		}
	}, [error]);

	function getFindGroupsParams(params) {
		const { groups = selectedGroups } = params;

		const parsedParams: FindGroupsDto = {
			orderBy: 'name',
			elements: [
				{
					fields: ['appGroup'],
					modifier: 'equal',
					values: [true],
				},
			],
			page: 1,
			pageSize: params.pageSize,
			signal: params.signal,
		};

		if (params.search?.trim().length) {
			parsedParams.elements.push({
				fields: ['name'],
				modifier: 'contain',
				values: [params.search],
			});
		}

		if (groups) {
			parsedParams.elements.push({
				fields: ['name'],
				modifier: 'equal',
				values: groups,
				include: false,
			});
		}

		return parsedParams;
	}

	function getDefaultAuthProviderId() {
		return find(
			authProvidersData,
			(provider) => provider.typeName === 'Local Provider',
		)?.id;
	}

	const handleSubmitForm = (data: UserFormData) => {
		const parsedData = { ...data };

		if (
			'password' in dirtyFields &&
			!authProvidersData[selectedProviderId].passwordMutable
		) {
			delete parsedData.password;
		}

		onSubmit(parsedData, dirtyFields);
	};

	const onUploadAvatar = ([file]: File[]) => {
		setValue('avatar', file, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const onUploadAvatarError = ([invalidFile]: FileInvalidDropzone[]) => {
		if (invalidFile.erorrs.includes(DropzoneErrors.MAX_SIZE)) {
			setError('avatar', {
				message: t('components.dropzone.validation_errors.max_size', {
					size: '10MB',
				}),
			});
			return;
		}
		if (invalidFile.erorrs.includes(DropzoneErrors.TYPE)) {
			setError('avatar', {
				message: t('components.dropzone.validation_errors.not_allowed_type', {
					allowedTypes: '(jpeg, jpg, png)',
				}),
			});
			return;
		}
		setError('avatar', { message: invalidFile.erorrs[0] });
	};

	const onRemoveAvatar = () => {
		setValue('avatar', null, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const toggleEnabled = () =>
		setValue('enabled', !enabledValue, {
			shouldValidate: true,
			shouldDirty: true,
		});

	const onSelectGroup = (group: IGroup, state: SelectAsyncFinderState) => {
		const newList = [...(selectedGroups || []), group.name];

		setValue('groups', newList, { shouldValidate: true, shouldDirty: true });

		refetchGroups({ groups: newList, search: state.search });
	};

	const onDeleteGroup = (group: string) => {
		const newList = selectedGroups.filter(
			(selectedGroup) => selectedGroup !== group,
		);

		setValue('groups', newList, { shouldValidate: true, shouldDirty: true });
		refetchGroups({ groups: newList });
	};

	const onSelectAuthProvider = (provider: IAuthProvider | null) => {
		if (!provider) return;

		setValue('providerId', provider.id, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const onGeneratePassword = () => {
		const password = passwordGenerator.generate({
			length: Number(passwordSettings?.min.value),
			numbers: passwordSettings?.shouldContainDigit.value === 'true',
			symbols: passwordSettings?.shouldContainSymbol.value === 'true',
			lowercase: passwordSettings?.shouldContainLower.value === 'true',
			uppercase: passwordSettings?.shouldContainUpper.value === 'true',
			strict: true,
		});

		setValue('password', password, { shouldValidate: true, shouldDirty: true });
	};

	const toggleSystemAdmin = () => {
		if (selectedGroups?.includes(APP_ROLES.GLOBAL_ADMIN)) {
			const newList = selectedGroups.filter(
				(group) => group !== APP_ROLES.GLOBAL_ADMIN,
			);
			setValue('groups', newList, { shouldDirty: true });
			return;
		}

		setValue('groups', [...selectedGroups, APP_ROLES.GLOBAL_ADMIN], {
			shouldDirty: true,
		});
	};

	const authProviderOptions = useMemo(() => {
		return map(authProvidersData, (provider) => provider);
	}, [authProvidersData]);
	console.log(authProviderOptions);

	const selectedAuthProvider: IAuthProvider | null = useMemo(() => {
		return authProvidersData[selectedProviderId] ?? null;
	}, [selectedProviderId, authProvidersData]);

	const isUserFromExternalService =
		user && authProvidersData[user.providerId]?.syncable;

	const passwordError = errors?.password?.message as unknown as
		| undefined
		| ValidationPasswordErrors;
	const passwordErrorMessage = passwordError?.hasValue
		? t(passwordError.hasValue)
		: undefined;

	if (isAuthProvidersLoading || isPasswordSettingsLoading) {
		return (
			<PageBody>
				<Spinner />
			</PageBody>
		);
	}

	return (
		<>
			<PageBody>
				<PageForm onSubmit={handleSubmit(handleSubmitForm)}>
					<button ref={submitButtonFormRef} type="submit" hidden />
					<FormGroup>
						<FormField grid={false}>
							<FieldToggle
								label={
									<Text>
										{enabledValue
											? t('users.user_form.enabled')
											: t('users.user_form.enabled')}
									</Text>
								}
								onChange={toggleEnabled}
								checked={enabledValue}
								justifyContent="space-between"
							/>
						</FormField>
					</FormGroup>
					<FormGroup>
						<SectionTitle variant="body_1_primary_bold">
							{t('users.user_form.user_image')}
						</SectionTitle>
						<FormField grid={false}>
							{avatar ? (
								<UserProfileAvatar
									url={
										typeof avatar === 'string'
											? avatar
											: URL.createObjectURL(avatar)
									}
									onRemove={onRemoveAvatar}
								/>
							) : (
								<Dropzone
									useCropper={useImageCropper}
									accept={['image/jpeg', 'image/jpg', 'image/png']}
									maxSize={10000000}
									multiple={false}
									errorMessage={
										errors?.avatar?.message
											? t(errors.avatar.message as unknown as string)
											: (errors?.avatar?.message as string)
									}
									onChange={onUploadAvatar}
									onError={onUploadAvatarError}
								/>
							)}
						</FormField>
					</FormGroup>
					<FormGroup>
						<FormField>
							<Input
								{...register('username')}
								label={t('users.user_form.username')}
								readonly={isUserFromExternalService}
								error={
									errors?.username?.message
										? t(errors?.username?.message)
										: errors?.username?.message
								}
								fulfilled
							/>
							<Input
								{...register('display')}
								label={t('users.user_form.display_name')}
								readonly={isUserFromExternalService}
								error={
									errors?.display?.message
										? t(errors?.display?.message)
										: errors?.display?.message
								}
								fulfilled
							/>
						</FormField>
						<FormField>
							<Select<IAuthProvider>
								options={authProviderOptions}
								selectedKey={selectedAuthProvider?.id?.toString()}
								label={t('users.user_form.provider')}
								readonly={isUserFromExternalService || !isEditMode}
								isDisabled={isUserFromExternalService || !isEditMode}
								onChange={onSelectAuthProvider}
								// onGetSelectedOptionLabel={(option) => (
								// 	<ExternalTranslation
								// 		translations={option.multilingual}
								// 		field="name"
								// 		fallbackValue={option.label}
								// 	/>
								// )}
								// onGetOptionLabel={(option) => (
								// 	<ExternalTranslation
								// 		translations={option.multilingual}
								// 		field="name"
								// 		fallbackValue={option.label}
								// 	/>
								// )}
								error={
									errors?.providerId?.message
										? t(errors?.providerId?.message)
										: errors?.providerId?.message
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
								type="email"
								{...register('email')}
								label={t('users.user_form.email')}
								readonly={isUserFromExternalService}
								error={
									errors?.email?.message
										? t(errors?.email?.message)
										: errors?.email?.message
								}
								fulfilled
							/>
						</FormField>
						{!isEditMode &&
							authProvidersData[selectedProviderId]?.passwordMutable && (
								<>
									<FormField grid={false}>
										<InputPassword
											{...register('password')}
											label={t('users.user_form.user_password')}
											value={passwordValue}
											fulfilled
											isInvalid={
												!!errors?.password?.message &&
												!!Object.keys(errors?.password?.message).length
											}
											error={passwordErrorMessage}
											autoComplete="new-password"
											onCreateError={({ error }) => (
												<WrapGenPass>
													{error}
													<BtnGenPass
														type="button"
														onClick={onGeneratePassword}
													>
														{t('users.user_form.generate_random_password')}
													</BtnGenPass>
												</WrapGenPass>
											)}
										/>
									</FormField>
									<PasswordRequirements
										errors={validationPasswordErrors}
										passwordSettings={passwordSettings as PasswordSettings}
									/>
								</>
							)}
					</FormGroup>
					<FormGroup>
						<SectionTitle variant="body_1_primary_bold">
							{t('users.user_form.groups')}
						</SectionTitle>
						{!isUserFromExternalService && (
							<FormField>
								<SelectAsyncFinder<IGroup>
									label={t('users.user_form.choose_group')}
									data={groupList}
									optionKey="id"
									optionLabelKey="name"
									isSearchLoading={isSearchingGroups}
									onSelect={onSelectGroup}
									onSearch={(value) =>
										searchGroups(() => getFindGroupsParams({ search: value }))
									}
									error={
										errors?.groups
											? // eslint-disable-next-line
											  // @ts-ignore
											  t(errors.groups?.[0]?.message || errors.groups?.message)
											: // eslint-disable-next-line
											  // @ts-ignore
											  errors.groups?.[0]?.message || errors.groups?.message
									}
								/>
							</FormField>
						)}
						<WrapBadges>
							{filterGroupsByRoles(selectedGroups).map((group) => (
								<GroupBadge
									key={group}
									icon={ICON_COLLECTION.user_group}
									label={group}
									onClose={
										isUserFromExternalService
											? undefined
											: () => onDeleteGroup(group)
									}
								/>
							))}
						</WrapBadges>
					</FormGroup>
					<FormGroup>
						<FieldToggle
							label={<Text>{t('users.user_form.global_admin')}</Text>}
							checked={selectedGroups?.includes(APP_ROLES.GLOBAL_ADMIN)}
							onChange={toggleSystemAdmin}
							justifyContent="space-between"
						/>
					</FormGroup>
					<ModalFooter justifyContent="space-between">{children}</ModalFooter>
				</PageForm>
			</PageBody>
		</>
	);
};
export const UserProfile = forwardRef(UserProfileFormComponent);
