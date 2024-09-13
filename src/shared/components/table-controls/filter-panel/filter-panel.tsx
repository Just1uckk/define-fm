import React, { memo } from 'react';
import styled from 'styled-components';

import {
	FindEntityRequest,
	FindEntityResponseFilterGroup,
	FindEntityResponseFilterGroupField,
} from 'app/api/types';

import { ThemeProps } from 'app/settings/theme/theme';

import { useTranslation } from 'shared/hooks/use-translation';

import { FilterDropdown } from 'shared/components/table-controls/filter-panel/filter-dropdown';
import { FilterOption } from 'shared/components/table-controls/filter-panel/filter-option';
import { Text } from 'shared/components/text/text';

const FilterPanelWrapper = styled.div<ThemeProps>`
	flex-shrink: 0;
	width: 100%;
	max-width: 21.25rem;
	padding: 1.5rem;
	margin-left: 1.6rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const FilterPanelHeader = styled.div``;

const FilterPanelHeaderActions = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 1.5rem;
`;

const ActiveFiltersCount = styled(Text)``;

const ClearFiltersButton = styled.button`
	padding: 0;
	margin-left: 1rem;
	border: none;
	background-color: transparent;
	text-decoration: underline;
	text-underline-offset: 0.3rem;
`;

const FilterPanelTitle = styled(Text)``;

export interface FilterPanelProps {
	dataList?: any[];
	className?: string;
	filters?: FindEntityResponseFilterGroup[];
	activeFilters?: FindEntityRequest['elements'];
	onClearFilters?: () => void;
	onChange?: (
		group: FindEntityResponseFilterGroup,
		field: FindEntityResponseFilterGroupField,
	) => void;
}

const FilterPanelComponent: React.FC<FilterPanelProps> = ({
	dataList = [],
	className,
	filters = [],
	activeFilters,
	onChange,
	onClearFilters,
}) => {
	const { t, currentLang } = useTranslation();

	const isSelected = (
		group: FindEntityResponseFilterGroup,
		field: FindEntityResponseFilterGroupField,
	) => {
		return !!activeFilters?.find(
			(filter) =>
				filter.fields.includes(group.field) &&
				filter.values.includes(field.value),
		);
	};

	return (
		<FilterPanelWrapper className={className}>
			<FilterPanelHeader>
				<FilterPanelTitle>
					{t('components.table.filter_panel.title')}
				</FilterPanelTitle>
				<FilterPanelHeaderActions>
					<ActiveFiltersCount variant="body_3_primary_bold">
						{t('components.table.filter_panel.selected_items_count', {
							count: activeFilters?.length ?? 0,
						})}
					</ActiveFiltersCount>
					<ClearFiltersButton onClick={onClearFilters}>
						<Text variant="body_3_primary">Clear All</Text>
					</ClearFiltersButton>
				</FilterPanelHeaderActions>
			</FilterPanelHeader>

			{filters?.map((group, idx) => (
				<FilterDropdown
					key={group.field + idx}
					label={group.multilingual[currentLang] || group.name}
				>
					{group.values.map((field, idx) => (
						<FilterOption
							key={field.name + idx}
							label={field.multilingual[currentLang] || field.name}
							filterCount={
								// dataList.filter((data) => data[group.field] === field.value)
								// 	.length
								field.count
							}
							checked={isSelected(group, field)}
							onChange={onChange ? () => onChange(group, field) : undefined}
						/>
					))}
				</FilterDropdown>
			))}
		</FilterPanelWrapper>
	);
};

export const FilterPanel = memo(FilterPanelComponent);
