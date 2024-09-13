import React, { useEffect, useRef, useState } from 'react';
import { Item } from 'react-stately';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import styled from 'styled-components';

import { SearchBarProps } from 'shared/components/search-bar/search-bar';
import {
	SelectComboBox,
	SelectComboBoxProps,
} from 'shared/components/select-combobox/select-combobox';

const Wrapper = styled.div`
	position: relative;
`;

const StyledFetchLoader = styled(FetchLoader)`
	& {
		position: absolute;
		width: 98%;
		top: 2px;
		left: 50%;
		height: 2px;
		transform: translateX(-50%);

		&.active {
			background-color: ${({ theme }) =>
				theme.dropdownOption.active.backgroundColor};
		}
	}
`;

export type SelectAsyncFinderState = { search: string };

type SelectAsyncFinderProps<Option extends object> = Pick<
	SearchBarProps,
	'fulfilled'
> & {
	isGroupMapping?: boolean;
	data: Option[];
	value?: Option;
	className?: string;
	label?: string;
	error?: string;
	valueKey?: keyof Option;
	optionKey?: keyof Option;
	optionLabelKey: keyof Option;
	disabled?: boolean;
	isInitialLoading?: boolean;
	isSearchLoading?: boolean;
	menuTrigger?: SelectComboBoxProps<Option>['menuTrigger'];
	defaultInputValue?: SelectComboBoxProps<Option>['defaultInputValue'];
	onSelect: (entity: Option, state: SelectAsyncFinderState) => void;
	onSearch: (value: string) => void;
	getOptionLabel?: (option: Option) => React.ReactNode;
	getValueLabel?: (option: Option) => React.ReactNode;
};

export function SelectAsyncFinder<Option extends object>({
	data,
	isGroupMapping,
	valueKey,
	optionKey,
	optionLabelKey,
	className,
	value,
	label,
	defaultInputValue,
	error,
	fulfilled,
	isInitialLoading,
	isSearchLoading,
	disabled,
	menuTrigger,
	onSelect,
	onSearch: onSearchProp,
	getOptionLabel,
	getValueLabel,
}: React.PropsWithChildren<SelectAsyncFinderProps<Option>>) {
	const containerRef = useRef(null);
	const [search, setSearch] = useState(defaultInputValue || '');

	useEffect(() => {
		if (!value) return;
		onSelect(value, { search });

		//Don't set search value if we have a chips under the select, and we shouldn't have a value inside the select component
		if (!getValueLabel && !optionLabelKey) {
			return;
		}

		setSearch(
			getValueLabel
				? getValueLabel(value)
				: value[optionLabelKey as string | number],
		);
	}, []);

	const onSearch = (value: string) => {
		setSearch(value);
		onSearchProp(value);
	};

	const handleSelectEntity = (entity: Option | null) => {
		if (!entity) return;

		onSelect(entity, { search });

		//Don't set search value if we have a chips under the select, and we shouldn't have a value inside the select component
		if (!getValueLabel && !optionLabelKey) {
			return;
		}

		setSearch(
			getValueLabel
				? getValueLabel(entity)
				: entity[optionLabelKey as string | number],
		);
	};

	return (
		<Wrapper ref={containerRef} className={className}>
			{containerRef.current && (
				<StyledFetchLoader
					container={containerRef.current}
					active={isInitialLoading || isSearchLoading}
				/>
			)}
			<SelectComboBox<Option>
				isGroupMapping={isGroupMapping}
				items={data}
				selectedKey={
					value ? value[valueKey as string | number]?.toString() : null
				}
				menuTrigger={menuTrigger}
				inputValue={search}
				defaultInputValue={defaultInputValue}
				label={label}
				errorMessage={error}
				fulfilled={fulfilled}
				isDisabled={disabled}
				onInputChange={onSearch}
				onSelectItem={handleSelectEntity}
			>
				{(option: Option) => {
					const label = getOptionLabel
						? getOptionLabel(option)
						: option[optionLabelKey];

					return (
						<Item
							key={option[optionKey as string | number]}
							textValue={label as string}
						>
							<>{label}</>
						</Item>
					);
				}}
			</SelectComboBox>
		</Wrapper>
	);
}
