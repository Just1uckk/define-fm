import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGroupsOverview } from 'modules/users-and-groups/pages/users-and-groups-overview/use-groups-overview';
import { useUsersOverview } from 'modules/users-and-groups/pages/users-and-groups-overview/use-users-overview';

import { IGroup } from 'shared/types/group';

export type PageTabs = 'users' | 'groups';

const tabIndex: Record<PageTabs, number> = {
	users: 0,
	groups: 1,
};

export function useUsersAndGroupsOverview() {
	const [searchParams, setSearchParams] = useSearchParams({
		t: 'users',
	});
	const [currentTab, setCurrentTab] = useState<PageTabs>(
		searchParams.get('t') as PageTabs,
	);
	const [isEnabledMultipleSelect, setIsEnabledMultipleSelect] = useState(false);

	const { models: usersModels, commands: usersCommands } = useUsersOverview();
	const { models: groupsModels, commands: groupsCommands } =
		useGroupsOverview();

	const handleClickGroup = (group: IGroup) => {
		groupsCommands.handleClickRow(group);
		setCurrentTab('groups');
	};

	const handleChangeTab = (tabName: PageTabs) => () => {
		setCurrentTab(tabName);
		setSearchParams({ t: tabName }, { replace: true });
	};

	const toggleSelectingMultiRows = () => {
		setIsEnabledMultipleSelect((prevState) => {
			const newState = !prevState;

			if (!newState) {
				groupsCommands.handleCancelAllGroupSelection();
				usersCommands.handleCancelAllUserSelection();
			}

			return newState;
		});
	};

	return {
		models: {
			currentTab,
			currentTabIdx: tabIndex[currentTab],
			isEnabledMultipleSelect,
		},
		commands: {
			handleChangeTab,
			handleClickGroup,
			toggleSelectingMultiRows,
		},

		usersModels,
		usersCommands,
		groupsModels,
		groupsCommands,
	};
}
