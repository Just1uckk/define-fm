import React from 'react';
import { Can } from 'casl';
import { RouteGuardActions, RouteGuardEntities } from 'casl/ability';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import { filterGroupsByRoles } from 'shared/utils/utils';
import styled from 'styled-components';

import { IAuthProvider } from 'shared/types/auth-provider';
import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ExternalTranslation } from 'shared/components/external-translation';
import { GroupBadge } from 'shared/components/group-badge/group-badge';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Input } from 'shared/components/input/input';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { SectionTitle } from 'shared/components/modal-form/section-title';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';
import { UserAvatarWithLabel } from 'shared/components/user-avatar/user-avatar-with-label';

const WrapBadges = styled.div`
	margin-top: 0.75rem;
	display: flex;
	flex-wrap: wrap;

	& > * {
		margin-bottom: 0.75rem;
	}

	& > *:not(:last-child) {
		margin-right: 0.8rem;
	}
`;

interface ModalProfileUserProps {
	user?: IUser;
	authProviders: Record<IAuthProvider['id'], IAuthProvider>;
	isDataLoading?: boolean;
	onEditUser: () => void;
	onClose: () => void;
}

export const ProfileUserModal: React.FC<ModalProfileUserProps> = ({
	user,
	authProviders,
	isDataLoading,
	onEditUser,
	onClose,
}) => {
	const { t } = useTranslation();

	const modalFooter = (
		<ModalFooter id="popper" justifyContent="space-between">
			<Button
				icon={ICON_COLLECTION.cross}
				label={t('users.profile_user_modal.actions.close')}
				onClick={onClose}
			/>
			<Can I={RouteGuardActions.update} a={RouteGuardEntities.User}>
				<Button
					variant="primary_outlined"
					icon={ICON_COLLECTION.edit}
					label={t('users.profile_user_modal.actions.submit')}
					disabled={isDataLoading || !user}
					onClick={onEditUser}
				/>
			</Can>
		</ModalFooter>
	);

	if (isDataLoading || !user) {
		return (
			<>
				<PageBody>
					<Spinner />
				</PageBody>
				{modalFooter}
			</>
		);
	}

	return (
		<>
			<PageHeader>
				<UserAvatarWithLabel
					name={user.display}
					url={getUserAvatarUrl(user.id, user.profileImage)}
					size="l"
					border={false}
					label={
						<HeaderTitle variant="h2_primary_semibold">
							{user.display}
						</HeaderTitle>
					}
					subText={<Text variant="body_2_secondary">{user.email}</Text>}
				/>
			</PageHeader>
			<PageBody>
				<FormGroup>
					<FormField>
						<ExternalTranslation
							translations={authProviders[user.providerId]?.multilingual}
							field="name"
							fallbackValue={authProviders[user.providerId]?.name || '-'}
						>
							{({ translation }) => (
								<Input
									label={t('users.profile_user_modal.provider')}
									value={String(translation)}
									readonly
									fulfilled
								/>
							)}
						</ExternalTranslation>
					</FormField>
					<FormField>
						<Input
							label={t('users.profile_user_modal.email')}
							value={user.email}
							isCopyable
							successCopyText={t('users.profile_user_modal.success_copy_text')}
							readonly
							fulfilled
						/>
					</FormField>
				</FormGroup>
				<FormGroup>
					<SectionTitle variant="body_1_primary_bold">
						{t('users.profile_user_modal.groups')}
					</SectionTitle>
					<WrapBadges>
						{filterGroupsByRoles(user.groups).map((group) => (
							<GroupBadge
								key={group}
								label={group}
								icon={ICON_COLLECTION.user_group}
							/>
						))}
					</WrapBadges>
				</FormGroup>
			</PageBody>
			{modalFooter}
		</>
	);
};
