import React from 'react';

import { FindGroupsDto, GroupApi } from 'app/api/groups-api/group-api';

import { IGroup } from 'shared/types/group';

import { useFilterRequest } from 'shared/hooks/use-filter-request';

import { SelectAsyncFinder } from 'shared/components/select/select-async-finder';

interface GroupSelectProps {
	isGroupMapping?: boolean;
	className?: string;
	label?: string;
	error?: string;
	value?: IGroup;
	defaultInputValue?: string;
	onSelect: (group: IGroup) => void;
}

export const GroupSelect: React.FC<GroupSelectProps> = ({
	className,
	isGroupMapping,
	value,
	defaultInputValue,
	label,
	error,
	onSelect,
}) => {
	const {
		data: groupsData,
		searchData: searchGroups,
		isInitialLoading: isLoadingGroups,
		isSearching: isSearchingGroups,
	} = useFilterRequest<IGroup[], undefined, FindGroupsDto>({
		request: (params) => {
			return GroupApi.findGroups(getFindGroupsParams(params));
		},
		searchRequest: (params) => {
			return GroupApi.findGroups(params);
		},
	});
	const list = groupsData?.results ?? [];

	function getFindGroupsParams(params) {
		const parsedParams: FindGroupsDto = {
			orderBy: 'name',
			elements: [
				{
					fields: ['appGroup'],
					modifier: 'equal',
					values: [true],
				},
			],
			page: 1,
			pageSize: 9999,
			signal: params.signal,
		};

		if (params.search?.trim().length) {
			parsedParams.elements.push({
				fields: ['name'],
				modifier: 'contain',
				values: [params.search],
			});
		}

		return parsedParams;
	}

	const onSearch = async (value: string) => {
		searchGroups(() => getFindGroupsParams({ search: value }));
	};

	const handleSelectGroup = (group: IGroup) => {
		onSelect(group);
	};

	return (
		<SelectAsyncFinder<IGroup>
			isGroupMapping={isGroupMapping}
			className={className}
			label={label}
			data={list}
			value={value}
			valueKey="id"
			optionKey="id"
			optionLabelKey="name"
			menuTrigger="focus"
			defaultInputValue={defaultInputValue}
			isSearchLoading={isSearchingGroups || isLoadingGroups}
			onSelect={handleSelectGroup}
			onSearch={onSearch}
			error={error}
		/>
	);
};
