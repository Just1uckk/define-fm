import { useCallback, useMemo, useReducer, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
	getInitialStateRequestUsersParamsReducer,
	requestUsersParamsReducer,
	RequestUsersParamsReducerStateType,
} from 'modules/users-and-groups/pages/users-and-groups-overview/request-params-reducer';
import { useModalManager } from 'shared/context/modal-manager';

import { AuthProviderApi } from 'app/api/auth-provider-api/auth-provider-api';
import { GroupApi } from 'app/api/groups-api/group-api';
import {
	FindEntityResponseFilterGroup,
	FindEntityResponseFilterGroupField,
} from 'app/api/types';
import {
	FindUsersDto,
	UpdateUserDto,
	UserApi,
} from 'app/api/user-api/user-api';

import { IAuthProvider } from 'shared/types/auth-provider';
import { IUser } from 'shared/types/users';

import { USERS_MODAL_NAMES } from 'shared/constants/constans';
import {
	AUTH_PROVIDES_QUERY_KEYS,
	USERS_QUERY_KEYS,
} from 'shared/constants/query-keys';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { useEvent } from 'shared/hooks/useEvent';

import { SortOption } from 'shared/components/table-controls/sort-button';

const SORT_OPTIONS = [
	{ label: 'users.table.sort_by.name', value: 'username' },
	{ label: 'users.table.sort_by.display_name', value: 'display' },
	{ label: 'users.table.sort_by.added_date', value: 'createDate' },
] as const;

export function useUsersOverview() {
	const modalManager = useModalManager();

	const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
	const [selectedUsers, setSelectedUsers] = useState<Map<IUser['id'], IUser>>(
		new Map(),
	);
	const [tableUsersParams, dispatchTableUsersParams] = useReducer(
		requestUsersParamsReducer,
		getInitialStateRequestUsersParamsReducer(),
	);

	const {
		data: groupsWhereIsSelectedUser = [],
		isLoading: isLoadingGroupsWhereIsSelectedUser,
	} = useQuery(
		`user-groups-${selectedUser?.username}`,
		() =>
			GroupApi.findGroups({
				page: 1,
				pageSize: 999,
				elements: [
					{
						fields: ['name'],
						modifier: 'equal',
						values: selectedUser?.groups as string[],
					},
					{
						fields: ['appGroup'],
						modifier: 'equal',
						values: [true],
					},
				],
				filters: false,
			}).then((res) => res.results),
		{
			enabled: !!selectedUser,
		},
	);

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

	const { data: usersCount = [] } = useQuery(
		USERS_QUERY_KEYS.users_count,
		UserApi.getUsersCount,
	);

	const {
		data: usersData,
		refetchData: refetchUsers,
		searchData: searchUsers,
		isInitialLoading: isLoadingUsers,
		isRefetching: isRefetchingUsers,
		isSearching: isSearchingUsers,
	} = useFilterRequest<
		IUser[],
		Partial<RequestUsersParamsReducerStateType>,
		FindUsersDto
	>({
		request: (params) => {
			return UserApi.findUsers(getFindUsersParams(params));
		},
		searchRequest: (params) => {
			return UserApi.findUsers(params);
		},
	});
	const userList = usersData?.results ?? [];
	const userCount = usersData?.stats.objects ?? 0;

	useEffectAfterMount(() => {
		refetchUsers(undefined, { silently: false });
	}, [
		tableUsersParams.orderBy,
		tableUsersParams.page,
		tableUsersParams.pageSize,
		tableUsersParams.elements,
	]);
	useEffectAfterMount(() => {
		searchUsers(() => getFindUsersParams(tableUsersParams));
	}, [tableUsersParams.search]);

	function getFindUsersParams(params) {
		const combinedParams = {
			...tableUsersParams,
			...params,
		};

		const resultedParams: FindUsersDto = {
			orderBy: combinedParams.orderBy,
			elements: [],
			filters: true,
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.search.trim().length) {
			resultedParams.elements.push({
				fields: ['username', 'email', 'display'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		if (combinedParams.elements) {
			resultedParams.elements = [
				...resultedParams.elements,
				...combinedParams.elements,
			];
		}

		return resultedParams;
	}

	const refetchList = async () => {
		await refetchUsers(getFindUsersParams(tableUsersParams));
	};

	const updateUserMutation = useMutation(async (payload: UpdateUserDto) => {
		await UserApi.updateUser(payload);
		await refetchUsers();
	});

	const updateUsersMutation = useMutation({
		mutationFn: async (payloads: UpdateUserDto[]) => {
			const promises = payloads.map((payload) => UserApi.updateUser(payload));

			await Promise.all(promises);

			await refetchUsers();
			setSelectedUsers(new Map());
		},
	});

	const handleSelectAllUsers = () => {
		const list = new Map();
		userList.forEach((user) => list.set(user.id, user));

		setSelectedUsers(list);
	};

	const handleCancelAllUserSelection = () => setSelectedUsers(new Map());

	const handleClickRow = useEvent((user: IUser) => {
		setSelectedUser(user);
	});

	const handleSelectRow = useEvent((user: IUser) => {
		const isAlreadySelected = selectedUsers.has(user.id);

		if (isAlreadySelected) {
			setSelectedUsers((prevValue) => {
				const newState = new Map(prevValue);
				newState.delete(user.id);

				return newState;
			});
			return;
		}

		setSelectedUsers((prevValue) => {
			const newState = new Map(prevValue);
			newState.set(user.id, user);

			return newState;
		});
	});

	const handleCloseGroupsPanel = () => {
		setSelectedUser(null);
	};

	const handleCreateUser = () => {
		modalManager.open(USERS_MODAL_NAMES.CREATE_USER);
	};

	const handleEditUser = useEvent((id: number) => {
		modalManager.open(USERS_MODAL_NAMES.EDIT_USER, id);
	});

	const handleDeleteUser = useEvent((user: IUser) => {
		modalManager
			.open(USERS_MODAL_NAMES.DELETE_USER, [user])
			.then(() => setSelectedUsers(new Map()));
	});

	const toggleDisablingUser = useEvent((user: IUser) => {
		updateUserMutation.mutate({ id: user.id, enabled: !user.enabled });
	});

	const handleDeleteSelectedUsers = () => {
		modalManager
			.open(USERS_MODAL_NAMES.DELETE_USER, Array.from(selectedUsers.values()))
			.then(() => setSelectedUsers(new Map()));
	};

	const handleEnableSelectedUsers = () => {
		const payloads: { id: number; enabled: boolean }[] = [];

		selectedUsers.forEach((user) => {
			payloads.push({
				id: user.id,
				enabled: true,
			});
		});

		updateUsersMutation.mutate(payloads);
	};

	const handleDisableSelectedUsers = () => {
		const payloads: { id: number; enabled: boolean }[] = [];

		selectedUsers.forEach((user) => {
			payloads.push({
				id: user.id,
				enabled: false,
			});
		});

		updateUsersMutation.mutate(payloads);
	};

	const handleSortUsers = (value: SortOption['value']) => {
		dispatchTableUsersParams({ type: 'orderBy', payload: value });
	};

	const handleSearchUsers = (value: string) => {
		dispatchTableUsersParams({ type: 'search', payload: value });
	};

	const handleClearSearchUsers = () => {
		dispatchTableUsersParams({ type: 'search', payload: '' });
	};

	const handleChangePageSize = (size: number) => {
		dispatchTableUsersParams({
			type: 'pageSize',
			payload: { pageSize: size },
		});
	};

	const handleChangePage = (page: number) => {
		dispatchTableUsersParams({
			type: 'page',
			payload: { page: page + 1 },
		});
	};

	const handleChangeFilter = (
		group: FindEntityResponseFilterGroup,
		field: FindEntityResponseFilterGroupField,
	) => {
		dispatchTableUsersParams({
			type: 'filterOption',
			payload: { group, field },
		});
	};

	const handleClearFilters = () => {
		dispatchTableUsersParams({
			type: 'clearFilters',
		});
	};

	const isSelectedUsersEnabled = useMemo(() => {
		return Array.from(selectedUsers.values()).every((user) => {
			return user.enabled === true;
		});
	}, [selectedUsers, userList]);

	const isSelectedUsersDisabled = useMemo(() => {
		return Array.from(selectedUsers.values()).every((user) => {
			return user.enabled === false;
		});
	}, [selectedUsers, userList]);

	const totalUsersCount = useMemo(() => {
		return usersCount.reduce((current, next) => current + next.total, 0);
	}, [usersCount]);

	const isSelectedSyncable = useMemo(() => {
		let state = false;
		if (selectedUsers && authProviders)
			selectedUsers.forEach((selectedUser) => {
				const findedAuth: IAuthProvider | any = Object.values(
					authProviders,
				).find(
					(provider: IAuthProvider | any) =>
						provider.id === selectedUser.providerId,
				);
				if (findedAuth && findedAuth.syncable) {
					state = true;
				}
			});
		return state;
	}, [selectedUsers, authProviders]);

	return {
		models: {
			SORT_OPTIONS,
			authProviders,
			providerTypes,
			groupsWhereIsSelectedUser,
			userList,
			userCount,
			usersData,
			totalUsersCount,
			selectedUser,
			selectedUsers,
			tableUsersParams,
			isLoadingUsers,
			isRefetchingUsers,
			isSearchingUsers,
			isAuthProvidersLoading,
			isProviderTypesLoading,
			isLoadingGroupsWhereIsSelectedUser,
			isSelectedSyncable,
			isSelectedUsersUpdating: updateUsersMutation.isLoading,
			isSelectedUsersEnabled,
			isSelectedUsersDisabled,
		},
		commands: {
			refetchList,
			handleSortUsers,
			handleSearchUsers,
			handleClearSearchUsers,
			handleChangeFilter,
			handleClearFilters,
			handleChangePage,
			handleChangePageSize,
			handleClickRow,
			handleSelectRow,
			handleSelectAllUsers,
			handleCancelAllUserSelection,
			handleEditUser,
			handleDeleteUser,
			toggleDisablingUser,
			handleCreateUser,
			handleEnableSelectedUsers,
			handleDisableSelectedUsers,
			handleDeleteSelectedUsers,
			handleCloseGroupsPanel,
		},
	};
}
