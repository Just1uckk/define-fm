import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { UserMenu } from 'app/layout/components/site-navigation/header/user-menu/user-menu';
import { ProfileSettings } from 'modules/auth/features/profile-settings';
import { TABLE_TOTAL } from 'modules/rda-work-packages/pages/rda-work-packages-overview/use-rda-work-packages-overview';
import { useModalManager } from 'shared/context/modal-manager';
import { LocalStorageService } from 'shared/services/local-storage-service';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import styled from 'styled-components';

import { AuthApi } from 'app/api/auth-api/auth-api';

import { resetAuthState } from 'app/store/auth/auth-actions';
import { setDefaultSettings, setUser } from 'app/store/user/user-actions';
import { selectUserData } from 'app/store/user/user-selectors';

import { IUser } from 'shared/types/users';

import { PROFILE_SETTINGS } from 'shared/constants/modal-names';

import { Breadcrumbs } from 'shared/components/breadcrumbs/breadcrumbs';

const Container = styled.header<Pick<HeaderProps, 'isLeftMenuOpen'>>`
	position: relative;
	display: flex;
	justify-content: space-between;
	width: 100%;
	padding: 1.8rem 1.5rem;
	background-color: ${({ theme }) => theme.header.background};
	z-index: 11;
	transition: padding 0.3s ease;
`;

const HeaderLeft = styled.div`
	padding: 0.2rem 0;
`;

const HeaderRight = styled.div``;

interface HeaderProps {
	isLeftMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isLeftMenuOpen }) => {
	const client = useQueryClient();
	const modalManager = useModalManager();
	const userData = selectUserData() as IUser;
	const resetAuthStateAction = resetAuthState();
	const setUserAction = setUser();
	const setDefaultSettingsUser = setDefaultSettings();

	const logoutMutation = useMutation({
		mutationFn: AuthApi.logout,
		onSuccess: async () => {
			LocalStorageService.remove('token');
			LocalStorageService.remove('table-settings');
			LocalStorageService.remove('color-mode');
			LocalStorageService.remove('lang');
			LocalStorageService.remove('itemsPerPage');
			MemoryManagingTableSettings.removeSavedSettings(TABLE_TOTAL);
			setDefaultSettingsUser([]);
			resetAuthStateAction();
			setUserAction(null);
			await client.clear();
		},
	});

	const onOpenSettings = () => {
		modalManager.open(PROFILE_SETTINGS);
	};

	const onLogOut = async () => {
		logoutMutation.mutate();
	};

	if (!userData) return null;

	return (
		<>
			<ProfileSettings />

			<Container id="page-header" isLeftMenuOpen={isLeftMenuOpen}>
				<HeaderLeft>
					<Breadcrumbs />
				</HeaderLeft>
				<HeaderRight>
					<UserMenu
						username={userData.display}
						userAvatar={getUserAvatarUrl(userData.id, userData.profileImage)}
						isLogOuting={logoutMutation.isLoading}
						onLogOut={onLogOut}
						onOpenSettings={onOpenSettings}
					/>
				</HeaderRight>
			</Container>
		</>
	);
};
