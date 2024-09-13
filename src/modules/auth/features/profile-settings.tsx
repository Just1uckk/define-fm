import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { keyBy } from 'lodash';
import { ProfileSettingsForm } from 'modules/auth/components/profile-settings-form/profile-settings';
import { EditDefaultSettingsRef } from 'modules/auth/components/profile-settings-form/profile-tabs/edit-default-settings';
import { EditMainInformationRef } from 'modules/auth/components/profile-settings-form/profile-tabs/edit-main-information';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { AuthApi, ForgotPasswordDataDto } from 'app/api/auth-api/auth-api';
import { AUTH_API_ERRORS } from 'app/api/auth-api/auth-api-error';
import { AuthProviderApi } from 'app/api/auth-provider-api/auth-provider-api';
import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import { ResponseError } from 'app/api/error-entity';
import { UpdateUserDto, UserApi } from 'app/api/user-api/user-api';
import {
	DefaultSettingsApi,
	DefaultSettingsDto,
	SendDefaultSettingsDto,
} from 'app/api/user-api/user-api-default';
import { USERS_API_ERRORS } from 'app/api/user-api/user-api-error';

import { setDefaultSettings, setUser } from 'app/store/user/user-actions';
import {
	selectDefaultSettingsData,
	selectUserData,
} from 'app/store/user/user-selectors';

import { ICoreConfig } from 'shared/types/core-config';
import { IUser } from 'shared/types/users';

import {
	PROFILE_SETTINGS,
	UNSAVED_PROFILE_SETTINGS,
} from 'shared/constants/modal-names';
import {
	AUTH_PROVIDES_QUERY_KEYS,
	CORE_CONFIG_LIST_QUERY_KEYS,
} from 'shared/constants/query-keys';

import { useManageAppTheme } from 'shared/hooks/use-manage-app-theme';

import { Modal } from 'shared/components/modal';
import { Spinner } from 'shared/components/spinner/spinner';

const REFACTOR_SETTINGS = {
	homePage: 'rda.preference.homepage',
	itemsPerPage: 'rda.preference.itemsperpage',
	noPendingTab: 'rda.preference.wsdefaulttab',
	preferredView: 'rda.preference.preferredview',
	theme: 'rda.preference.theme',
};

export const ProfileSettings: React.FC = () => {
	const setUserAction = setUser();
	const setDefaultSettingsUser = setDefaultSettings();
	const manageAppTheme = useManageAppTheme();
	const mainInformationForm = useRef<EditMainInformationRef>();
	const defaultSettingsForm = useRef<EditDefaultSettingsRef>();
	const currentUser = selectUserData() as IUser;
	const curentUserDefaultSettings = selectDefaultSettingsData();
	const modalState = useStateModalManager(PROFILE_SETTINGS);
	const unsavedModalState = useStateModalManager(UNSAVED_PROFILE_SETTINGS);

	const [isEdit, setIsEdit] = useState<boolean>(false);

	const { data: authProviders = {}, isLoading: isAuthProvidersLoading } =
		useQuery(
			AUTH_PROVIDES_QUERY_KEYS.auth_provider_list,
			AuthProviderApi.getProviderList,
			{
				select: useCallback((response) => keyBy(response, 'id'), []),
			},
		);

	const { data: providerTypes = [], isLoading: isProviderTypesLoading } =
		useQuery(
			AUTH_PROVIDES_QUERY_KEYS.auth_provider_type_list,
			AuthProviderApi.getProviderTypeList,
		);

	const localProviderId = (): number | null => {
		if (providerTypes.length) {
			const localProvider = providerTypes.find(
				(el) => el.clazz === 'com.cassiacm.core.provider.LocalProvider',
			);
			return localProvider?.id || null;
		}
		return null;
	};

	const { data: passwordSettings, isLoading: isPasswordSettingsLoading } =
		useQuery({
			queryKey: CORE_CONFIG_LIST_QUERY_KEYS.config_list,
			queryFn: CoreConfigApi.getConfigList,
			enabled:
				!isEdit && authProviders[currentUser.providerId]?.passwordMutable,
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

	const getUserDefaultSettings = useMutation<DefaultSettingsDto[]>({
		mutationFn: async () => {
			const userSettings = await DefaultSettingsApi.getDefaultUserSettings(
				currentUser.id,
			);
			setDefaultSettingsUser(userSettings);

			return userSettings;
		},
	});

	const updateUserDefaultSettingsMutation = useMutation<DefaultSettingsDto[]>({
		mutationFn: async (payload: any) => {
			if (payload.from) delete payload.from;
			if (payload.theme) {
				manageAppTheme.changeTheme(payload.theme);
			}
			const sendRequestBody: SendDefaultSettingsDto[] = [];

			for (const property in payload) {
				sendRequestBody.push({
					userId: currentUser.id,
					value: `${payload[property]}`,
					property: REFACTOR_SETTINGS[property],
				});
			}

			const updateUser = await DefaultSettingsApi.updateDefaultUserSettings(
				currentUser.id,
				sendRequestBody,
			);

			return updateUser;
		},
		onSuccess: (updatedUser: DefaultSettingsDto[]) => {
			setDefaultSettingsUser(updatedUser);
			modalState.close();
			unsavedModalState.close();
		},
	});

	const updateUserMutation = useMutation<
		IUser,
		ResponseError<USERS_API_ERRORS>,
		UpdateUserDto & { avatar?: File }
	>({
		mutationFn: async ({ avatar, ...payload }) => {
			if (avatar) {
				await UserApi.setAvatar({ file: avatar, id: payload.id });
			}
			if (avatar === null) {
				await UserApi.deleteAvatar({ id: payload.id });
			}
			const updatedUser = await UserApi.updateUser(payload);

			return updatedUser;
		},
		onSuccess: (updatedUser: IUser) => {
			setUserAction(updatedUser);
			modalState.close();
			unsavedModalState.close();
		},
	});

	const resetPassword = useMutation<
		string,
		ResponseError<AUTH_API_ERRORS>,
		ForgotPasswordDataDto
	>(AuthApi.forgotPassword);

	const onCloseProfileSettings = () => {
		const hasDirtyFields =
			(mainInformationForm.current?.formState.dirtyFields &&
				Object.keys(mainInformationForm.current?.formState.dirtyFields)
					.length) ||
			(defaultSettingsForm.current?.formState.dirtyFields &&
				Object.keys(defaultSettingsForm.current?.formState.dirtyFields).length);

		if (
			hasDirtyFields &&
			(mainInformationForm.current?.formState.isDirty ||
				defaultSettingsForm.current?.formState.isDirty)
		) {
			unsavedModalState.openModal();
			return;
		}

		modalState.close();
	};

	interface submitDto {
		avatar?: any;
		password?: string | undefined;
		langCode?: string;
		from?: string;
		preferredView?: string;
	}

	const onSubmit = (data: submitDto) => {
		if (data.from === 'main') {
			const payload = {
				id: currentUser.id,
				...data,
			};

			updateUserMutation.mutate(payload as UpdateUserDto);
		}
		if (data.from === 'default') {
			if (data.langCode) {
				const payload = {
					id: currentUser.id,
					langCode: data.langCode,
				};
				delete data['langCode'];
				updateUserMutation.mutate(payload as UpdateUserDto);
			}
			const objKeys = Object.keys(data);
			if (objKeys.length === 1 && objKeys.includes('from')) {
				modalState.close();
				unsavedModalState.close();
			} else {
				updateUserDefaultSettingsMutation.mutate(data as any);
			}
		}
	};

	const onAccept = () => {
		const payload =
			mainInformationForm.current?.getValues() ||
			defaultSettingsForm.current?.getValues();

		if (!payload) return;
		if (mainInformationForm.current?.getValues()) payload['from'] = 'main';
		if (defaultSettingsForm.current?.getValues()) {
			payload['from'] = 'default';
		}

		onSubmit(payload);
	};

	const onResetPassword = () => {
		resetPassword.mutate({ usernameOrEmail: currentUser.username });
	};

	const onRegret = () => {
		modalState.close();
		unsavedModalState.close();
	};

	const handleChangeEdit = (isEdit: boolean) => () => setIsEdit(isEdit);

	const handleAfterCloseModal = () => {
		setIsEdit(false);
	};

	const isDataLoading = isAuthProvidersLoading || isPasswordSettingsLoading;

	useEffect(() => {
		getUserDefaultSettings.mutate();
	}, [currentUser]);

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			isClosable={
				!resetPassword.isLoading ||
				!updateUserMutation.isLoading ||
				!isProviderTypesLoading
			}
			onClose={onCloseProfileSettings}
			onAfterClose={handleAfterCloseModal}
		>
			<Modal.Page>
				{isDataLoading && <Spinner />}
				{!isDataLoading && (
					<>
						<ProfileSettingsForm
							localProviderId={localProviderId()}
							defaultSettings={curentUserDefaultSettings}
							manageAppTheme={manageAppTheme}
							isEdit={isEdit}
							mainInformationForm={mainInformationForm}
							defaultSettingsForm={defaultSettingsForm}
							userData={currentUser}
							authProviders={authProviders}
							passwordSettings={passwordSettings}
							isUpdating={updateUserMutation.isLoading}
							isResettingPassword={resetPassword.isLoading}
							isPasswordReset={resetPassword.isSuccess}
							error={updateUserMutation.error?.message}
							onResetPassword={onResetPassword}
							onSubmit={onSubmit}
							onChangeEdit={handleChangeEdit}
						/>
					</>
				)}
			</Modal.Page>
			<UnsavedChangesModal
				container="parent"
				isUpdating={updateUserMutation.isLoading}
				onAccept={onAccept}
				onRegret={onRegret}
				open={unsavedModalState.open}
				onClose={unsavedModalState.close}
			/>
		</Modal.Root>
	);
};
