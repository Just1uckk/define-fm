import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Item } from 'react-stately';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';

import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import { GroupApi } from 'app/api/groups-api/group-api';
import { FindUsersDto, UserApi } from 'app/api/user-api/user-api';

import { IUser } from 'shared/types/users';

import { WORK_PACKAGE_FILES_KEYS } from 'shared/constants/query-keys';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { useTranslation } from 'shared/hooks/use-translation';

import { UserOption } from 'shared/components/dropdown/user-option';
import { PopoverProps } from 'shared/components/menu-button/popover';
import {
	SearchInput,
	SearchInputProps,
} from 'shared/components/search-bar/search-input';
import { SelectComboBox } from 'shared/components/select-combobox/select-combobox';

interface UserSearchInputProps
	extends Pick<SearchInputProps, 'fulfilled' | 'autoFocus'> {
	reassign?: boolean;
	exceptions?: number[];
	unsavedIsOpen?: boolean;
	label?: string;
	approvers?: boolean;
	error?: string;
	selectedUsers: IUser['id'][];
	closeOnScroll?: PopoverProps['closeOnScroll'];
	onSelectUser: (user: IUser) => void;
}

export enum IWorkPackageConfigInput {
	AllowReassign = 'rda.ApproverReassign.AllowReassign',
	AllowReasignCertified = 'rda.ApproverReassign.CertifiedApproversGroup',
}

export const UserSearchInput: React.FC<UserSearchInputProps> = ({
	label,
	exceptions,
	error,
	unsavedIsOpen,
	approvers,
	reassign,
	selectedUsers,
	fulfilled,
	autoFocus,
	closeOnScroll,
	onSelectUser,
}) => {
	const { t } = useTranslation();

	const [search, setSearch] = useState('');

	const { isLoading: isWorkPackageConfigsLoading } = useQuery(
		WORK_PACKAGE_FILES_KEYS.configs,
		{
			queryFn: CoreConfigApi.getConfigList,
			onSuccess(configList) {
				if (reassign) {
					const allowReassign = configList.find((config) => {
						if (config.property === IWorkPackageConfigInput.AllowReassign) {
							return true;
						}
						return false;
					});
					const allowReassignCertified = configList.find((config) => {
						if (
							config.property === IWorkPackageConfigInput.AllowReasignCertified
						) {
							return true;
						}
						return false;
					});
					if (
						allowReassign?.value &&
						allowReassignCertified?.value &&
						reassign
					) {
						getGroupById.mutate(Number(allowReassignCertified.value));
					}
				}
			},
		},
	);

	const getGroupById = useMutation({
		mutationFn: async (id: number) => {
			const group = await GroupApi.getGroupById({ id });
			return group.name;
		},
	});

	const {
		data: usersData,
		refetchData: refetchUsers,
		searchData: searchUsers,
		isInitialLoading: isLoadingUsers,
		isRefetching: isRefetchingUsers,
		isSearching: isSearchingUsers,
	} = useFilterRequest<IUser[], Partial<{ search: string }>, FindUsersDto>({
		searchFuncDependencies: [selectedUsers],
		request: (params) => {
			return UserApi.findUsers(getFindUsersParams(params));
		},
		searchRequest: (params) => {
			return UserApi.findUsers(params);
		},
	});

	const userList = useMemo(() => {
		if (usersData?.results) {
			const users = usersData.results;
			if (exceptions) {
				const usersWithoutExceptions = users.filter(
					(item) => !exceptions.includes(item.id),
				);

				return usersWithoutExceptions;
			}
			return users;
		}
		return [];
	}, [usersData, getGroupById, exceptions]);

	useEffectAfterMount(() => {
		refetchUsers({}, { silently: false });
	}, [selectedUsers.length]);

	function getFindUsersParams(params) {
		const combinedParams = {
			search,
			selectedUsers,
			...params,
		};

		const resultedParams: FindUsersDto = {
			orderBy: combinedParams.orderBy,
			elements: [],
			filters: false,
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.search?.trim().length) {
			resultedParams.elements.push({
				fields: ['username', 'email', 'display'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		if (combinedParams.selectedUsers.length) {
			resultedParams.elements.push({
				fields: ['id'],
				modifier: 'equal',
				values: combinedParams.selectedUsers,
				include: false,
			});
		}

		return resultedParams;
	}

	const handleSelectItem = (user: IUser | null) => {
		if (!user) return;

		onSelectUser(user);
	};

	const handleChangeInput = (value: string) => {
		setSearch(value);
		searchUsers(() => getFindUsersParams({ search: value }));
	};

	return (
		<SelectComboBox<IUser>
			unsavedIsOpen={unsavedIsOpen}
			items={userList}
			selectedKey={null}
			inputValue={search}
			placeholder={label ? label : t('components.search_users.placeholder')}
			fulfilled={fulfilled}
			autoFocus={autoFocus}
			errorMessage={error}
			closeOnScroll={closeOnScroll}
			menuTrigger="focus"
			approvers={approvers}
			onInputChange={handleChangeInput}
			onSelectItem={handleSelectItem}
			input={(props) => (
				<SearchInput
					ref={props.inputRef}
					isLoading={
						isLoadingUsers ||
						isSearchingUsers ||
						isRefetchingUsers ||
						isWorkPackageConfigsLoading ||
						getGroupById.isLoading
					}
					{...props}
				/>
			)}
		>
			{(user) => (
				<Item key={user.id} textValue={user.display}>
					<UserOption
						url={getUserAvatarUrl(user.id, user.profileImage)}
						label={user.display}
						name={user.display}
						subText={user.email}
					/>
				</Item>
			)}
		</SelectComboBox>
	);
};
