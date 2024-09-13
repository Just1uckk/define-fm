import React, { Key, useMemo } from 'react';
import { Item } from 'react-stately';
import styled from 'styled-components';

import { useTranslation } from 'shared/hooks/use-translation';

import { DropdownSimpleButton } from 'shared/components/dropdown/dropdown-simple-button';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { MenuButton } from 'shared/components/menu-button/menu-button';
import { MenuButtonHandler } from 'shared/components/menu-button/menu-button-handler';
import { TableControlWrapperCss } from 'shared/components/table-controls/control-wrapper';

const StyledMenuButtonHandler = styled(MenuButtonHandler)`
	${TableControlWrapperCss};
`;

const StyledDropdownSimpleButton = styled(DropdownSimpleButton)`
	display: flex;
	justify-content: space-between;
`;

const SortIcon = styled(Icon)`
	margin-left: 1.25rem;
	color: currentColor;
`;

export type SortOption = { label: string; value: string };

interface SortByButtonProps {
	className?: string;
	sortBy: SortOption['value'];
	options: ReadonlyArray<SortOption>;
	onSelect: (value: SortOption['value']) => void;
	onOptionLabel?: (option: SortOption, idx: number) => React.ReactNode;
	onSelectedOptionLabel?: (option: SortOption) => React.ReactNode;
}

export const SortByButton: React.FC<SortByButtonProps> = ({
	className,
	sortBy,
	options,
	onSelect,
	onOptionLabel,
	onSelectedOptionLabel,
}) => {
	const { t } = useTranslation();

	const getIconName = (option: SortOption) => {
		if (sortBy === option.value) return ICON_COLLECTION.arrow_up;
		if (sortBy === `-${option.value}`) return ICON_COLLECTION.arrow_down;

		return '';
	};

	const handleSelectOption = (key: Key) => {
		onSelect(key as string);
	};

	const currentValue = useMemo(
		() =>
			sortBy
				? options.find(
						(option) =>
							option.value === sortBy || `-${option.value}` === sortBy,
				  )
				: null,
		[options, sortBy],
	);

	return (
		<MenuButton<SortOption>
			closeOnSelect={true}
			onAction={handleSelectOption}
			handler={
				<StyledMenuButtonHandler className={className}>
					{currentValue
						? `${t('components.table.sort_by')}: ${
								onSelectedOptionLabel
									? onSelectedOptionLabel(currentValue)
									: currentValue.label
						  }`
						: t('components.table.sort_by')}
				</StyledMenuButtonHandler>
			}
			items={options}
		>
			{(option) => {
				const sortIconName = getIconName(option);
				const idx = options.findIndex((_) => _.label === option.label);
				const label = onOptionLabel ? onOptionLabel(option, idx) : option.label;

				return (
					<Item key={option.value} textValue={label as string}>
						<StyledDropdownSimpleButton>
							{label}
							{!!sortIconName && <SortIcon icon={sortIconName} />}
						</StyledDropdownSimpleButton>
					</Item>
				);
			}}
		</MenuButton>
	);
};
