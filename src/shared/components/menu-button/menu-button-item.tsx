import React from 'react';
import { AriaMenuItemProps, useMenuItem } from 'react-aria';
import { TreeState } from 'react-stately';
import { Node } from '@react-types/shared';

import { DropdownItem } from 'shared/components/dropdown/dropdown-item';

interface MenuButtonItemProps<T> extends AriaMenuItemProps {
	item: Node<T>;
	state: TreeState<T>;
}

export function MenuButtonItem<T>({
	item,
	state,
	closeOnSelect,
}: MenuButtonItemProps<T>) {
	// Get props for the menu item element and child elements
	const ref = React.useRef(null);
	const { menuItemProps, isFocused } = useMenuItem<T>(
		{ key: item.key, closeOnSelect },
		state,
		ref,
	);

	return (
		<DropdownItem {...menuItemProps} ref={ref} isHighlighted={isFocused}>
			{item.rendered}
		</DropdownItem>
	);
}
