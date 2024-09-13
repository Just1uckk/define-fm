import React from 'react';
import {
	ProfileSettingsField,
	ProfileSettingsFieldLabel,
} from 'modules/auth/components/profile-settings-form/profile-settings-styles';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import { filterGroupsByRoles } from 'shared/utils/utils';

import { IAuthProvider } from 'shared/types/auth-provider';
import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { GroupBadge } from 'shared/components/group-badge/group-badge';
import { GroupBadgeList } from 'shared/components/group-badge/group-badge-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { PageBody } from 'shared/components/modal-form/page-body';
import { SectionTitle } from 'shared/components/modal-form/section-title';
import { Text } from 'shared/components/text/text';
import { UserAvatar } from 'shared/components/user-avatar/user-avatar';

export interface MainInformationProps {
	userData: IUser;
	authProviders: Record<IAuthProvider['id'], IAuthProvider>;
}

export const MainInformation: React.FC<
	React.PropsWithChildren<MainInformationProps>
> = ({ userData, authProviders, children }) => {
	const { t } = useTranslation();

	return (
		<>
			<PageBody>
				<FormGroup>
					<SectionTitle variant="body_1_primary_bold">
						{t('profile_settings_form.user_image')}
					</SectionTitle>
					<FormField grid={false}>
						<UserAvatar
							name={userData.display}
							url={getUserAvatarUrl(userData.id, userData.profileImage)}
							size="l"
						/>
					</FormField>
				</FormGroup>
				<FormGroup>
					<FormField>
						<ProfileSettingsField>
							<ProfileSettingsFieldLabel>
								{t('profile_settings_form.username')}
							</ProfileSettingsFieldLabel>
							<Text variant="body_2_primary">{userData.username}</Text>
						</ProfileSettingsField>
						<ProfileSettingsField>
							<ProfileSettingsFieldLabel>
								{t('profile_settings_form.display_name')}
							</ProfileSettingsFieldLabel>
							<Text variant="body_2_primary">{userData.display}</Text>
						</ProfileSettingsField>
					</FormField>
					<FormField>
						<ProfileSettingsField>
							<ProfileSettingsFieldLabel>
								{t('profile_settings_form.provider')}
							</ProfileSettingsFieldLabel>
							<Text variant="body_2_primary">
								{/*<ExternalTranslation*/}
								{/*	translations={*/}
								{/*		authProviders[userData.providerId]?.multilingual*/}
								{/*	}*/}
								{/*	field="name"*/}
								{/*	fallbackValue={*/}
								{/*		authProviders[userData.providerId]?.name || '-'*/}
								{/*	}*/}
								{/*/>*/}
								{authProviders[userData.providerId]?.name || '-'}
							</Text>
						</ProfileSettingsField>
					</FormField>
					<FormField>
						<ProfileSettingsField>
							<ProfileSettingsFieldLabel>
								{t('profile_settings_form.email')}
							</ProfileSettingsFieldLabel>
							<Text variant="body_2_primary">{userData.email}</Text>
						</ProfileSettingsField>
					</FormField>
				</FormGroup>
				<FormGroup>
					<SectionTitle variant="body_1_primary_bold">
						{t('profile_settings_form.groups')}
					</SectionTitle>
					<FormField>
						<GroupBadgeList>
							{filterGroupsByRoles(userData.groups).map((group) => (
								<GroupBadge
									key={group}
									icon={ICON_COLLECTION.user_group}
									label={group}
								/>
							))}
						</GroupBadgeList>
					</FormField>
				</FormGroup>
			</PageBody>
			<ModalFooter justifyContent="space-between">{children}</ModalFooter>
		</>
	);
};
