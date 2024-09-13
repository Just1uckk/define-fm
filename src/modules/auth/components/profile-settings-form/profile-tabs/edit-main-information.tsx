import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { FormState, useForm, UseFormGetValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import passwordGenerator from 'generate-password-browser';
import { map } from 'lodash';
import { UserProfileAvatar } from 'modules/users-and-groups/pages/users-and-groups-overview/components/user-profile/user-profile-avatar';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import { filterGroupsByRoles } from 'shared/utils/utils';
import { validatePassword } from 'shared/utils/validation-password';
import styled from 'styled-components';
import * as yup from 'yup';

import { USERS_API_ERRORS } from 'app/api/user-api/user-api-error';

import { ThemeProps } from 'app/settings/theme/theme';

import { IAuthProvider } from 'shared/types/auth-provider';
import {
	IUser,
	PasswordSettings,
	ValidationPasswordErrors,
} from 'shared/types/users';

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
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageForm } from 'shared/components/modal-form/page-form';
import { SectionTitle } from 'shared/components/modal-form/section-title';
import { PasswordRequirements } from 'shared/components/password-requirements/password-requirements';

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

const schema = yup
	.object({
		avatar: yup.mixed().nullable(),
		password: yup.string().when(['$authProvider'], {
			is: (authProvider: IAuthProvider) => {
				return authProvider?.passwordMutable;
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
		}),
	})
	.defined();

export type ProfileMainSettingsFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

export interface EditMainInformationRef {
	formState: FormState<ProfileMainSettingsFormData>;
	getValues: UseFormGetValues<ProfileMainSettingsFormData>;
}

export interface MainInformationProps {
	userData: IUser;
	authProviders: Record<IAuthProvider['id'], IAuthProvider>;
	passwordSettings?: PasswordSettings;
	error?: USERS_API_ERRORS;
	onSubmit: (data: ProfileMainSettingsFormData) => void;
	children: React.ReactNode;
}

const EditMainInformationComponent: React.ForwardRefRenderFunction<
	EditMainInformationRef,
	MainInformationProps
> = (
	{ userData, authProviders, passwordSettings, error, onSubmit, children },
	ref,
) => {
	const { t } = useTranslation();

	const {
		handleSubmit,
		register,
		watch,
		setValue,
		setError,
		formState,
		formState: { errors, dirtyFields },
		getValues,
	} = useForm<ProfileMainSettingsFormData>({
		mode: 'onTouched',
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		context: {
			authProvider: authProviders[userData.providerId],
			passwordSettings: passwordSettings,
		},
		defaultValues: {
			avatar: getUserAvatarUrl(userData.id, userData.profileImage),
		},
	});
	const avatar = watch('avatar');
	const passwordValue = watch('password');

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
			formState,
			getValues,
		};
	});

	const onSubmitForm = (data: ProfileMainSettingsFormData) => {
		const parsedData = {} as ProfileMainSettingsFormData;

		for (const fieldName in dirtyFields) {
			parsedData[fieldName] = data[fieldName];
		}

		if (
			'password' in dirtyFields &&
			!authProviders[userData.providerId].passwordMutable
		) {
			delete parsedData.password;
		}
		parsedData['from'] = 'main';

		onSubmit(parsedData);
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

	const authProviderOptions = useMemo(() => {
		return map(authProviders, (provider) => ({
			key: provider.id,
			value: provider.id,
			label: provider.name,
			multilingual: provider.multilingual,
		}));
	}, [authProviders]);

	const selectedProviderOption = authProviderOptions.find(
		(provider) => provider.value === userData.providerId,
	);

	const passwordError = errors?.password?.message as unknown as
		| undefined
		| ValidationPasswordErrors;
	const passwordErrorMessage = passwordError?.hasValue
		? t(passwordError.hasValue)
		: undefined;

	return (
		<PageForm onSubmit={handleSubmit(onSubmitForm)}>
			<PageBody>
				<FormGroup>
					<SectionTitle variant="body_1_primary_bold">
						{t('profile_settings_form.user_image')}
					</SectionTitle>
					<FormField grid={false}>
						{avatar ? (
							<UserProfileAvatar
								url={
									typeof avatar === 'string'
										? avatar
										: URL.createObjectURL(avatar as Blob | MediaSource)
								}
								onRemove={onRemoveAvatar}
							/>
						) : (
							<Dropzone
								useCropper={useImageCropper}
								accept={['image/jpeg', 'image/jpg', 'image/png']}
								maxSize={10000000}
								multiple={false}
								errorMessage={errors.avatar?.message as string}
								onChange={onUploadAvatar}
								onError={onUploadAvatarError}
							/>
						)}
					</FormField>
				</FormGroup>
				<FormGroup>
					<FormField>
						<Input
							label={t('profile_settings_form.username')}
							value={userData.username}
							fulfilled
							readonly
						/>
						<Input
							value={userData.display}
							label={t('profile_settings_form.display_name')}
							fulfilled
							readonly
						/>
					</FormField>
					<FormField>
						<Input
							label={t('profile_settings_form.provider')}
							value={selectedProviderOption?.label}
							fulfilled
							readonly
						/>
					</FormField>
					<FormField>
						<Input
							type="email"
							label={t('profile_settings_form.email')}
							value={userData.email}
							fulfilled
							readonly
						/>
					</FormField>
					{authProviders[userData.providerId].passwordMutable && (
						<>
							<FormField grid={false}>
								<InputPassword
									{...register('password')}
									autoForward
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
											<BtnGenPass type="button" onClick={onGeneratePassword}>
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
						{t('profile_settings_form.groups')}
					</SectionTitle>
					<FormField>
						<WrapBadges>
							{filterGroupsByRoles(userData.groups).map((group) => (
								<GroupBadge
									key={group}
									icon={ICON_COLLECTION.user_group}
									label={group}
								/>
							))}
						</WrapBadges>
					</FormField>
				</FormGroup>
			</PageBody>
			<ModalFooter justifyContent="space-between">{children}</ModalFooter>
		</PageForm>
	);
};

export const EditMainInformation = forwardRef(EditMainInformationComponent);
