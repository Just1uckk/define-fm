import React, { useCallback, useState } from 'react';
import { useQuery } from 'react-query';
import { EditUser } from 'modules/users-and-groups/features/users/edit-user';
import { ProfileUserModal } from 'modules/users-and-groups/pages/users-and-groups-overview/modals/profile-user-modal';
import {
	useModalManager,
	useStateModalManager,
} from 'shared/context/modal-manager';

import { AuthProviderApi } from 'app/api/auth-provider-api/auth-provider-api';
import { UserApi } from 'app/api/user-api/user-api';

import { IUser } from 'shared/types/users';

import { USERS_MODAL_NAMES } from 'shared/constants/constans';
import {
	AUTH_PROVIDES_QUERY_KEYS,
	USERS_QUERY_KEYS,
} from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

export const ViewProfileUser: React.FC = () => {
	const modalManager = useModalManager();
	const [userId, setUserId] = useState<number | null>(null);

	const modalState = useStateModalManager(USERS_MODAL_NAMES.PROFILE_USER, {
		onBeforeOpen: (userId: IUser['id']) => {
			setUserId(userId);
		},
	});

	const { data: authProviders = {}, isLoading: isAuthProvidersLoading } =
		useQuery(
			AUTH_PROVIDES_QUERY_KEYS.auth_provider_list,
			AuthProviderApi.getProviderList,
			{
				select: useCallback((response) => {
					const list = {};

					response.forEach((provider) => {
						list[provider.id] = provider;
					});

					return list;
				}, []),
			},
		);
	const { data: providerTypes = [], isLoading: isProviderTypesLoading } =
		useQuery(
			AUTH_PROVIDES_QUERY_KEYS.auth_provider_type_list,
			AuthProviderApi.getProviderTypeList,
		);
	const { data: userData, isLoading: isUserDataLoading } = useQuery({
		queryKey: [USERS_QUERY_KEYS.user, userId!],
		queryFn: () => UserApi.getUserById({ id: userId! }),
		enabled: userId !== null,
	});

	const onEditUser = () => {
		if (userId === null) return;

		modalState.close();
		modalManager.open(USERS_MODAL_NAMES.EDIT_USER_FROM_PROFILE, userId);
	};

	return (
		<>
			<EditUser
				providerTypes={providerTypes}
				modalName={USERS_MODAL_NAMES.EDIT_USER_FROM_PROFILE}
			/>
			<Modal.Root
				open={modalState.open}
				fulfilled
				hasClose={false}
				onClose={modalState.close}
			>
				<Modal.Page>
					<ProfileUserModal
						user={userData}
						authProviders={authProviders}
						isDataLoading={
							isUserDataLoading ||
							isAuthProvidersLoading ||
							isProviderTypesLoading
						}
						onEditUser={onEditUser}
						onClose={modalState.close}
					/>
				</Modal.Page>
			</Modal.Root>
		</>
	);
};
