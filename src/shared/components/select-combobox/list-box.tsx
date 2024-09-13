import React, { useEffect } from 'react';
import { AriaGridListItemOptions, useListBox, useOption } from 'react-aria';
import type { ListState } from 'react-stately';
import type { AriaListBoxOptions } from '@react-aria/listbox';
import styled from 'styled-components';

import { useTranslation } from 'shared/hooks/use-translation';

import { DropdownContainer } from 'shared/components/dropdown/dropdown-container';
import { DropdownItem } from 'shared/components/dropdown/dropdown-item';
import { DropdownList } from 'shared/components/dropdown/dropdown-list';
import { DropdownSimpleButton } from 'shared/components/dropdown/dropdown-simple-button';
import { Text } from 'shared/components/text/text';

const StyledDropdownContainer = styled(DropdownContainer)`
	width: 100vw;
`;

const NoResultText = styled(Text)`
	margin: 0.5rem;
	text-align: center;
`;

interface ListBoxProps<T> extends AriaListBoxOptions<T> {
	listBoxRef?: React.RefObject<HTMLUListElement>;
	state: ListState<T>;
	triggerId?: string;
}

export function ListBox<T>({
	triggerId,
	...props
}: React.PropsWithChildren<ListBoxProps<T>>) {
	const { t } = useTranslation();

	const containerRef = React.useRef<HTMLDivElement>(null);
	const ref = React.useRef<HTMLUListElement>(null);
	const { listBoxRef = ref, state } = props;
	const { listBoxProps } = useListBox<T>(props, state, listBoxRef);

	useEffect(() => {
		if (!triggerId || !containerRef.current) {
			return;
		}

		const trigger = document.getElementById(triggerId);

		containerRef.current.style.maxWidth =
			trigger?.getBoundingClientRect().width + 'px';
	}, [triggerId, containerRef.current]);

	return (
		<StyledDropdownContainer ref={containerRef}>
			<DropdownList ref={listBoxRef} {...listBoxProps}>
				{!state.collection.size ? (
					<NoResultText variant="body_3_secondary" m="0 auto">
						{t('components.select.empty_list')}
					</NoResultText>
				) : (
					[...state.collection].map((item) => (
						<Option key={item.key} item={item} state={state} />
					))
				)}
			</DropdownList>
		</StyledDropdownContainer>
	);
}

interface OptionProps<T> {
	state: ListState<T>;
	item: AriaGridListItemOptions['node'];
}

function Option<T>({ item, state }: OptionProps<T>) {
	const ref = React.useRef(null);
	const { optionProps, isSelected, isDisabled, isFocused } = useOption(
		{ key: item.key },
		state,
		ref,
	);

	return (
		<DropdownItem
			{...optionProps}
			ref={ref}
			isHighlighted={isSelected || isFocused}
		>
			<DropdownSimpleButton disabled={isDisabled}>
				{item.rendered}
			</DropdownSimpleButton>
		</DropdownItem>
	);
}
