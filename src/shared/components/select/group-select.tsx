import React, { useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { GROUP_GLOBAL_EVENTS } from 'shared/utils/event-bus';
import styled, { css } from 'styled-components';

import { FindGroupsDto, GroupApi } from 'app/api/groups-api/group-api';

import { ThemeProps } from 'app/settings/theme/theme';

import { IGroup } from 'shared/types/group';

import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';
import { useTranslation } from 'shared/hooks/use-translation';

import { DropdownContainer } from 'shared/components/dropdown/dropdown-container';
import { DropdownItem } from 'shared/components/dropdown/dropdown-item';
import { DropdownList } from 'shared/components/dropdown/dropdown-list';
import { DropdownSimpleButton } from 'shared/components/dropdown/dropdown-simple-button';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	SearchBar,
	SearchBarProps,
} from 'shared/components/search-bar/search-bar';
import { Text } from 'shared/components/text/text';

const Wrapper = styled.div`
	position: relative;
`;

const InputLabel = styled.label`
	position: absolute;
	top: 50%;
	left: 0;
	right: 0;
	padding-left: 1rem;
	padding-right: 2rem;
	font-size: 1rem;
	color: ${({ theme }) => theme.colors.grey.style_2};
	text-overflow: ellipsis;
	white-space: nowrap;
	transform: translateY(-50%);
	transition: font-size 0.3s, line-height 0.3s, top 0.3s ease;
	cursor: text;
	user-select: none;
	pointer-events: none;
	overflow: hidden;
`;

const CloseIcon = styled(Icon)<{ isOpen: boolean }>`
	position: absolute;
	top: 50%;
	right: 1rem;
	transform: translateY(-50%);

	${({ isOpen }) =>
		isOpen &&
		css`
			color: ${({ theme }) => theme.colors.accent};
		`}
`;

const SelectButton = styled.button<ThemeProps>`
	position: relative;
	width: 100%;
	height: 3.1rem;
	padding-left: 1rem;
	padding-right: 2.5rem;
	color: ${({ theme }) => theme.input.color};
	text-align: left;
	background: ${({ theme }) => theme.input.bg};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	border: 1px solid ${({ theme }) => theme.input.borderColor};
	outline: none;

	&:hover {
		border-color: ${({ theme }) => theme.input.borderColor};
	}

	&:focus,
	&:focus-within,
	&[aria-expanded='true'] {
		border-color: ${({ theme }) => theme.input.borderColor};
		box-shadow: inset 0 0 0 1px ${({ theme }) => theme.input.focus.borderColor};
	}

	&:disabled {
		background-color: ${({ theme }) => theme.input.disabled.bg};

		& ${CloseIcon} {
			color: ${({ theme }) => theme.colors.secondary};
		}
	}

	&.has-label {
		padding-top: 1.2rem;
	}

	&.has-value ${InputLabel} {
		top: 30%;
		font-size: 0.6875rem;
		line-height: 0.875rem;
	}

	&.has-error {
		border-color: ${({ theme }) => theme.colors.error};
		&:not(:focus, :focus-within):hover {
			border-color: ${({ theme }) => theme.colors.error};
		}
	}
`;

const SelectValue = styled.span`
	display: inline-block;
	max-width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const StyledDropdownContainer = styled(DropdownContainer)`
	width: 100%;
	padding: 0.8rem 0.5rem;
`;

const StyledDropdownList = styled(DropdownList)`
	max-height: 12.5rem;
	padding: 0.5rem;
	margin: 0 -0.5rem;
	overflow-y: auto;
`;

const StyledDropdownItem = styled(DropdownItem)`
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
`;

const StyledDropdownSimpleButton = styled(DropdownSimpleButton)`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const StyledSearchBar = styled(SearchBar)`
	&.is-focused input {
		border-color: ${({ theme }) => theme.input.focus.borderColor};
	}

	input {
		width: 100%;
	}
`;

const StyledError = styled(Text)`
	padding: 0 1rem;
	margin-top: 0.25rem;
`;

interface GroupSelectProps
	extends Pick<SearchBarProps, 'fulfilled' | 'autoFocus'> {
	className?: string;
	label?: string;
	error?: string;
	value?: IGroup;
	defaultValue?: unknown;
	selectedGroups?: IGroup['id'][];
	filterBy?: (group) => boolean;
	putRequestFilter?: (filters: FindGroupsDto) => FindGroupsDto;
	onSelect: (group: IGroup) => void;
}

export const GroupSelect: React.FC<GroupSelectProps> = ({
	className,
	value,
	defaultValue,
	label,
	error,
	fulfilled,
	filterBy,
	putRequestFilter,
	onSelect,
}) => {
	const { t } = useTranslation();
	const managePopperState = useManagePopperState({ placement: 'bottom' });
	const timeout = useRef<NodeJS.Timeout>();

	const [isFocused, setIsFocused] = useState(false);
	const [search, setSearch] = useState('');

	const {
		data: groupsData,
		searchData: searchGroups,
		isInitialLoading: isLoadingGroups,
		isSearching: isSearchingGroups,
	} = useFilterRequest<IGroup[], undefined, FindGroupsDto>({
		requestKey: GROUP_GLOBAL_EVENTS.findGroups,
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
			pageSize: params.pageSize,
			signal: params.signal,
		};

		if (params.search?.trim().length) {
			parsedParams.elements.push({
				fields: ['name'],
				modifier: 'contain',
				values: [params.search],
			});
		}

		return putRequestFilter ? putRequestFilter(parsedParams) : parsedParams;
	}

	const onSearch = async (value: string) => {
		setSearch(value);
		searchGroups(() => getFindGroupsParams({ search: value }));
	};

	const handleSelectGroup = (group: IGroup) => {
		onSelect(group);
		managePopperState.toggleMenu(false);
	};

	const onFocus = () => {
		clearTimeout(timeout.current as NodeJS.Timeout);
		setIsFocused(true);
	};

	const onBlur = () => {
		clearTimeout(timeout.current as NodeJS.Timeout);
		timeout.current = setTimeout(() => {
			setIsFocused(false);
		}, 100);
	};

	const filteredList = useMemo(() => {
		if (filterBy) {
			return list.filter((group) => filterBy(group));
		}

		return list;
	}, [list, filterBy]);

	const isValue = !!value || !!defaultValue;
	const isOpen = managePopperState.isOpen;

	const resultList = (
		<StyledDropdownList className="result-list">
			{filteredList.map((group) => (
				<StyledDropdownItem key={group.id} isActive={group.id === value?.id}>
					<StyledDropdownSimpleButton onClick={() => handleSelectGroup(group)}>
						{group.name}
					</StyledDropdownSimpleButton>
				</StyledDropdownItem>
			))}
		</StyledDropdownList>
	);

	return (
		<Wrapper className={className}>
			<SelectButton
				type="button"
				ref={(ref) => managePopperState.setReferenceElement(ref)}
				className={clsx({
					'has-label': !!label,
					'has-error': !!error,
					'has-value': isValue,
				})}
				onClick={() => managePopperState.toggleMenu()}
			>
				{isValue && (
					<SelectValue>
						<>
							{value && value.name}
							{defaultValue}
						</>
					</SelectValue>
				)}
				{label && <InputLabel>{label}</InputLabel>}

				<CloseIcon
					icon={
						isOpen ? ICON_COLLECTION.chevron_top : ICON_COLLECTION.chevron_down
					}
					isOpen={isOpen}
				/>
			</SelectButton>

			{!isLoadingGroups && isOpen && (
				<StyledDropdownContainer
					ref={(ref) => managePopperState.setPopperElement(ref)}
					style={managePopperState.styles.popper}
					{...managePopperState.attributes.popper}
				>
					<StyledSearchBar
						className={clsx({
							'is-focused': isFocused,
						})}
						placeholder={
							label ? label : t('components.search_users.placeholder')
						}
						value={search}
						isLoading={isSearchingGroups || isLoadingGroups}
						onChange={onSearch}
						onFocus={onFocus}
						onBlur={onBlur}
						fulfilled={fulfilled}
						autoFocus
					/>

					{resultList}
				</StyledDropdownContainer>
			)}
			{error && <StyledError variant="body_6_error">{error}</StyledError>}
		</Wrapper>
	);
};
