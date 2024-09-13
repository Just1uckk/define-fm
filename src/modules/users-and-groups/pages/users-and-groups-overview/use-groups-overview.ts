import { useCallback, useMemo, useReducer, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
	getInitialStateRequestGroupsParamsReducer,
	requestGroupsParamsReducer,
	RequestGroupsParamsReducerStateType,
} from 'modules/users-and-groups/pages/users-and-groups-overview/request-params-reducer';
import { useModalManager } from 'shared/context/modal-manager';
import { GROUP_GLOBAL_EVENTS } from 'shared/utils/event-bus';

import {
	FindGroupsDto,
	GroupApi,
	UpdateGroupDto,
} from 'app/api/groups-api/group-api';

import { IGroup } from 'shared/types/group';

import { GROUPS_MODAL_NAMES } from 'shared/constants/constans';
import { GROUPS_QUERY_KEYS } from 'shared/constants/query-keys';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { useEvent } from 'shared/hooks/useEvent';

import { SortOption } from 'shared/components/table-controls/sort-button';

const SORT_OPTIONS = [
	{ label: 'groups.groups_table.sort_by.name', value: 'name' },
	{ label: 'groups.groups_table.sort_by.added_by', value: 'createdByDisplay' },
	{ label: 'groups.groups_table.sort_by.added_date', value: 'createdOn' },
] as const;

export function useGroupsOverview() {
	const queryClient = useQueryClient();
	const modalManager = useModalManager();

	const [selectedGroup, setSelectedGroup] = useState<IGroup | null>(null);
	const [tableGroupsParams, dispatchTableGroupsParams] = useReducer(
		requestGroupsParamsReducer,
		getInitialStateRequestGroupsParamsReducer(),
	);
	const [selectedGroups, setSelectedGroups] = useState<
		Map<IGroup['id'], IGroup>
	>(new Map());

	const updateGroupsMutation = useMutation({
		mutationFn: async (payloads: UpdateGroupDto[]) => {
			const promises = payloads.map((payload) => GroupApi.updateGroup(payload));

			await Promise.all(promises);

			await refetchGroups();
			setSelectedGroups(new Map());
		},
	});

	const updateGroupMutation = useMutation(
		async (payload: UpdateGroupDto) => {
			await GroupApi.updateGroup(payload);
			await refetchGroups();
		},
		{
			onSuccess: async (res, payload) => {
				await queryClient.refetchQueries(GROUPS_QUERY_KEYS.group(payload.id));
			},
		},
	);

	const { data: groupsCount } = useQuery(
		GROUPS_QUERY_KEYS.groups_count,
		GroupApi.getGroupsCount,
	);

	const {
		data: usersBySelectedGroup = [],
		isLoading: isLoadingUsersBySelectedGroup,
	} = useQuery(
		[GROUPS_QUERY_KEYS.group_users, selectedGroup?.id],
		() =>
			GroupApi.getGroupUsersByName({ name: (selectedGroup as IGroup).name }),
		{
			enabled: !!selectedGroup?.name,
		},
	);

	const {
		data: groupsData,
		refetchData: refetchGroups,
		searchData: searchGroups,
		isInitialLoading: isLoadingGroups,
		isRefetching: isRefetchingGroups,
		isSearching: isSearchingGroups,
	} = useFilterRequest<
		IGroup[],
		Partial<RequestGroupsParamsReducerStateType>,
		FindGroupsDto
	>({
		requestKey: GROUP_GLOBAL_EVENTS.findGroups,
		request: (params) => {
			return GroupApi.findGroups(getFindGroupsParams(params));
		},
		searchRequest: (params) => {
			return GroupApi.findGroups(params);
		},
	});
	const groupList = groupsData?.results ?? [];

	useEffectAfterMount(() => {
		refetchGroups(undefined, { silently: false });
	}, [
		tableGroupsParams.orderBy,
		tableGroupsParams.page,
		tableGroupsParams.pageSize,
	]);
	useEffectAfterMount(() => {
		searchGroups(() => getFindGroupsParams(tableGroupsParams));
	}, [tableGroupsParams.search]);

	function getFindGroupsParams(params) {
		const combinedParams = {
			...tableGroupsParams,
			...params,
		};

		const parsedParams: FindGroupsDto = {
			orderBy: combinedParams.orderBy,
			elements: [
				{
					fields: ['appGroup'],
					modifier: 'equal',
					values: [true],
				},
			],
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.search.trim().length) {
			parsedParams.elements.push({
				fields: ['name'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		return parsedParams;
	}

	const toggleDisablingGroup = (group: IGroup) => {
		updateGroupMutation.mutate({ id: group.id, enabled: !group.enabled });
	};

	const handleEnableSelectedGroups = () => {
		const payloads: { id: number; enabled: boolean }[] = [];
		selectedGroups.forEach(({ id }) => payloads.push({ id, enabled: true }));

		updateGroupsMutation.mutate(payloads);
	};

	const handleDisableSelectedGroups = () => {
		const payloads: { id: number; enabled: boolean }[] = [];
		selectedGroups.forEach(({ id }) => payloads.push({ id, enabled: false }));

		updateGroupsMutation.mutate(payloads);
	};

	const handleCreateGroup = () => {
		modalManager.open(GROUPS_MODAL_NAMES.CREATE_GROUP);
	};

	const handleEditGroup = (group: IGroup) => {
		modalManager.open(GROUPS_MODAL_NAMES.EDIT_GROUP, group);
	};

	const handleDeleteGroup = (group: IGroup) => {
		modalManager
			.open(GROUPS_MODAL_NAMES.DELETE_GROUP, [group])
			.then(() => setSelectedGroups(new Map()));
	};

	const handleSearchGroups = (value: string) => {
		dispatchTableGroupsParams({
			type: 'search',
			payload: value,
		});
	};

	const handleClearSearchGroups = () => {
		dispatchTableGroupsParams({
			type: 'search',
			payload: '',
		});
	};

	const handleSortGroups = (value: SortOption['value']) => {
		dispatchTableGroupsParams({
			type: 'orderBy',
			payload: value,
		});
	};

	const handleChangePageSize = (size: number) => {
		dispatchTableGroupsParams({
			type: 'pageSize',
			payload: { pageSize: size },
		});
	};

	const handleChangePage = (page: number) => {
		dispatchTableGroupsParams({
			type: 'page',
			payload: { page: page + 1 },
		});
	};

	const handleSelectAllGroups = () => {
		const list: Map<IGroup['id'], IGroup> = new Map();
		groupList.forEach((group) => list.set(group.id, group));

		setSelectedGroups(list);
	};

	const handleCancelAllGroupSelection = () => setSelectedGroups(new Map());

	const handleDeleteSelectedGroups = () => {
		modalManager
			.open(
				GROUPS_MODAL_NAMES.DELETE_GROUP,
				Array.from(selectedGroups.values()),
			)
			.then(() => setSelectedGroups(new Map()));
	};

	const handleCloseUsersPanel = () => {
		setSelectedGroup(null);
	};

	const handleClickRow = useEvent((group: IGroup) => {
		setSelectedGroup(group);
	});

	const handleSelectRow = useEvent((group: IGroup) => {
		const isAlreadySelected = selectedGroups.has(group.id);

		if (isAlreadySelected) {
			setSelectedGroups((prevValue) => {
				const newState = new Map(prevValue);
				newState.delete(group.id);

				return newState;
			});
			return;
		}

		setSelectedGroups((prevValue) => {
			const newState = new Map(prevValue);
			newState.set(group.id, group);

			return newState;
		});
	});

	const isGroupSelected = useCallback(
		(id: number) => selectedGroups.has(id),
		[selectedGroups],
	);

	const isSelectedGroupsEnabled = useMemo(() => {
		return Array.from(selectedGroups.values()).every((group) => {
			return group.enabled === true;
		});
	}, [selectedGroups, groupList]);

	const isSelectedGroupsDisabled = useMemo(() => {
		return Array.from(selectedGroups.values()).every((group) => {
			return group.enabled === false;
		});
	}, [selectedGroups, groupList]);

	const totalGroupsCount = groupsCount?.total ?? 0;

	return {
		models: {
			SORT_OPTIONS,
			tableGroupsParams,
			groupList,
			groupsData,
			totalGroupsCount,
			selectedGroup,
			selectedGroups,
			usersBySelectedGroup,
			isLoadingUsersBySelectedGroup,
			isLoadingUpdatingSelectedGroups: updateGroupsMutation.isLoading,
			isSearchingGroups,
			isLoadingGroups,
			isRefetchingGroups,
			isSelectedGroupsEnabled,
			isSelectedGroupsDisabled,
		},
		commands: {
			refetchGroups,
			isGroupSelected,
			handleSearchGroups,
			handleClearSearchGroups,
			handleSortGroups,
			handleChangePage,
			handleChangePageSize,
			handleCreateGroup,
			handleEditGroup,
			handleDeleteGroup,
			toggleDisablingGroup,
			handleSelectAllGroups,
			handleCancelAllGroupSelection,
			handleDeleteSelectedGroups,
			handleEnableSelectedGroups,
			handleDisableSelectedGroups,
			handleSelectRow,
			handleClickRow,
			handleCloseUsersPanel,
		},
	};
}
