import React, { useContext, useState } from 'react';
import {
	EditDefaultSettings,
	EditDefaultSettingsRef,
	ProfileDefaultSettingsFormData,
} from 'modules/auth/components/profile-settings-form/profile-tabs/edit-default-settings';
import {
	EditMainInformation,
	EditMainInformationRef,
	ProfileMainSettingsFormData,
} from 'modules/auth/components/profile-settings-form/profile-tabs/edit-main-information';
import { MainInformation } from 'modules/auth/components/profile-settings-form/profile-tabs/main-information';
import styled from 'styled-components';

import { DefaultSettingsDto } from 'app/api/user-api/user-api-default';
import { USERS_API_ERRORS } from 'app/api/user-api/user-api-error';

import { IAuthProvider } from 'shared/types/auth-provider';
import { IUser, PasswordSettings } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalContext, ModalContextProps } from 'shared/components/modal';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Tab } from 'shared/components/tabs/tab';
import { TabList } from 'shared/components/tabs/tab-list';

const StyledTabList = styled(TabList)`
	margin-top: 1.5rem;

	& > * {
		flex: 1 1 auto;
		justify-content: center;
	}
`;

export type ProfileSettingsTabs = 'main_information' | 'default_settings';

const tabIndex: Record<ProfileSettingsTabs, number> = {
	main_information: 0,
	default_settings: 1,
};

export interface ProfileSettingsProps {
	mainInformationForm: React.MutableRefObject<
		EditMainInformationRef | undefined
	>;
	defaultSettingsForm: React.MutableRefObject<
		EditDefaultSettingsRef | undefined
	>;
	localProviderId: number | null;
	defaultSettings: DefaultSettingsDto[];
	isEdit: boolean;
	isUpdating: boolean;
	isPasswordReset: boolean;
	isResettingPassword: boolean;
	error?: USERS_API_ERRORS;
	userData: IUser;
	passwordSettings?: PasswordSettings;
	authProviders: Record<IAuthProvider['id'], IAuthProvider>;
	manageAppTheme: any;
	onResetPassword?: () => void;
	onSubmit: (
		data: ProfileMainSettingsFormData | ProfileDefaultSettingsFormData,
	) => void;
	onChangeEdit: (isEdit: boolean) => () => void;
}

export const ProfileSettingsForm: React.FC<ProfileSettingsProps> = ({
	isEdit,
	localProviderId,
	mainInformationForm,
	defaultSettingsForm,
	defaultSettings,
	manageAppTheme,
	userData,
	authProviders,
	passwordSettings,
	isUpdating,
	isPasswordReset,
	isResettingPassword,
	error,
	onResetPassword,
	onChangeEdit,
	onSubmit,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);
	const { t } = useTranslation();
	const [currentTab, setCurrentTab] =
		useState<ProfileSettingsTabs>('main_information');

	const onChangeTab = (tab: ProfileSettingsTabs) => () => setCurrentTab(tab);

	return (
		<>
			{isEdit && <ModalNavbar onClose={modalContext.onClose} />}
			<PageHeader>
				<HeaderTitle variant="h2_primary_semibold">
					{isEdit
						? t('profile_settings_modal.edit_title')
						: t('profile_settings_modal.title')}
				</HeaderTitle>
			</PageHeader>
			<>
				<>
					<StyledTabList value={tabIndex[currentTab]}>
						<Tab onClick={onChangeTab('main_information')}>
							{t('profile_settings_modal.tabs.main_information')}
						</Tab>
						<Tab onClick={onChangeTab('default_settings')}>
							{t('profile_settings_modal.tabs.default_settings')}
						</Tab>
					</StyledTabList>
					{currentTab === 'main_information' && (
						<>
							{!isEdit && (
								<MainInformation
									authProviders={authProviders}
									userData={userData}
								>
									<Button
										label={t('profile_settings_modal.actions.close')}
										onClick={modalContext.onClose}
									/>
									<Button
										variant="primary_outlined"
										label={t('profile_settings_modal.actions.edit')}
										icon={ICON_COLLECTION.edit}
										onClick={onChangeEdit(true)}
									/>
								</MainInformation>
							)}
							{isEdit && (
								<EditMainInformation
									ref={
										mainInformationForm as
											| React.Ref<EditMainInformationRef>
											| undefined
									}
									authProviders={authProviders}
									passwordSettings={passwordSettings}
									error={error}
									userData={userData}
									onSubmit={onSubmit}
								>
									<Button
										type="submit"
										label={t('profile_settings_modal.actions.save')}
										icon={ICON_COLLECTION.chevron_right}
										loading={isUpdating}
										disabled={isResettingPassword}
									/>
									{/* {!isPasswordReset &&
										userData.providerId === localProviderId && (
											<Button
												type="button"
												variant="primary_outlined"
												icon={ICON_COLLECTION.arrow_round}
												label={t(
													'profile_settings_modal.actions.reset_password',
												)}
												onClick={onResetPassword}
												loading={isResettingPassword}
											/>
										)} */}
									{isPasswordReset &&
										userData.providerId === localProviderId && (
											<Button
												type="button"
												variant="success_outlined"
												icon={ICON_COLLECTION.check}
												label={t(
													'profile_settings_modal.actions.password_reset',
												)}
											/>
										)}
								</EditMainInformation>
							)}
						</>
					)}

					{currentTab === 'default_settings' && (
						<>
							<EditDefaultSettings
								defaultSettings={defaultSettings}
								manageAppTheme={manageAppTheme}
								ref={defaultSettingsForm as React.Ref<EditDefaultSettingsRef>}
								userData={userData}
								onSubmit={onSubmit}
							>
								<Button
									type="button"
									label={t('profile_settings_modal.actions.close')}
									onClick={modalContext.onClose}
								/>
								<Button
									label={t('profile_settings_modal.actions.save')}
									icon={ICON_COLLECTION.chevron_right}
									loading={isUpdating}
									disabled={isResettingPassword}
								/>
							</EditDefaultSettings>
						</>
					)}
				</>
			</>
		</>
	);
};
