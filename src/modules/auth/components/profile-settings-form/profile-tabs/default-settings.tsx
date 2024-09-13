import React, { useMemo } from 'react';
import {
	ProfileSettingsField,
	ProfileSettingsFieldLabel,
} from 'modules/auth/components/profile-settings-form/profile-settings-styles';

import { DefaultSettingsDto } from 'app/api/user-api/user-api-default';

import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { PageBody } from 'shared/components/modal-form/page-body';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';

import {
	DEFAULT_SETTINGS_LIST,
	findDefaultOption,
	TABLE_PREFERRED_VIEW,
	TABLE_THEME,
} from './edit-default-settings';

interface DefaultSettingsProps {
	userData: IUser;
	defaultSettings: DefaultSettingsDto[];
}

export const DefaultSettings: React.FC<
	React.PropsWithChildren<DefaultSettingsProps>
> = ({ userData, children, defaultSettings }) => {
	const { t } = useTranslation();

	const preferredView = useMemo(() => {
		const currentValue = TABLE_PREFERRED_VIEW.find(
			(preferredViewState) =>
				preferredViewState.value ===
				findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.PREFERRED_VIEW)
					?.value,
		);
		return currentValue!.label;
	}, [defaultSettings]);

	const theme = useMemo(() => {
		const currentValue = TABLE_THEME.find(
			(themeState) =>
				themeState.value ===
				findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.THEME)?.value,
		);
		return currentValue!.label;
	}, [defaultSettings]);

	return (
		<>
			<PageBody>
				{defaultSettings && userData ? (
					<FormGroup>
						<FormField>
							<ProfileSettingsField>
								<ProfileSettingsFieldLabel>
									{t('profile_settings_form.default_lang')}
								</ProfileSettingsFieldLabel>
								<Text variant="body_2_primary">
									<LocalTranslation tk={`languages.${userData.langCode}`} />
								</Text>
							</ProfileSettingsField>
						</FormField>
						<FormField>
							<ProfileSettingsField>
								<ProfileSettingsFieldLabel>
									{t('profile_settings_form.default_number_items_per_page')}
								</ProfileSettingsFieldLabel>
								<Text variant="body_2_primary">
									{
										findDefaultOption(
											defaultSettings,
											DEFAULT_SETTINGS_LIST.ITEMS_PER_PAGE,
										)?.value
									}
								</Text>
							</ProfileSettingsField>
						</FormField>
						<FormField>
							<ProfileSettingsField>
								<ProfileSettingsFieldLabel>
									{t('profile_settings_form.default_homepage')}
								</ProfileSettingsFieldLabel>
								<Text variant="body_2_primary">
									{
										findDefaultOption(
											defaultSettings,
											DEFAULT_SETTINGS_LIST.HOME_PAGE,
										)?.value
									}
								</Text>
							</ProfileSettingsField>
						</FormField>
						<FormField>
							<ProfileSettingsField>
								<ProfileSettingsFieldLabel>
									{t('profile_settings_form.default_tab_no_pending_items')}
								</ProfileSettingsFieldLabel>
								<Text variant="body_2_primary">
									{findDefaultOption(
										defaultSettings,
										DEFAULT_SETTINGS_LIST.DEFAULT_TAB,
									)?.value
										? findDefaultOption(
												defaultSettings,
												DEFAULT_SETTINGS_LIST.DEFAULT_TAB,
										  )?.value
										: '-'}
								</Text>
							</ProfileSettingsField>
						</FormField>
						<FormField>
							<ProfileSettingsField>
								<ProfileSettingsFieldLabel>
									{t('profile_settings_form.preferred_view')}
								</ProfileSettingsFieldLabel>
								<Text variant="body_2_primary">{preferredView}</Text>
							</ProfileSettingsField>
						</FormField>
						<FormField>
							<ProfileSettingsField>
								<ProfileSettingsFieldLabel>
									{t('profile_settings_form.theme')}
								</ProfileSettingsFieldLabel>
								<Text variant="body_2_primary">{theme}</Text>
							</ProfileSettingsField>
						</FormField>
					</FormGroup>
				) : (
					<Spinner />
				)}
			</PageBody>
			<ModalFooter justifyContent="space-between">{children}</ModalFooter>
		</>
	);
};
