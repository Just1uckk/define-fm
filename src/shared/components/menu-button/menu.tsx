import React, { forwardRef } from 'react';
import type { AriaMenuProps } from 'react-aria';
import { AriaMenuItemProps, useMenu } from 'react-aria';
import { useTreeState } from 'react-stately';
import mergeRefs from 'shared/utils/merge-refs';
import styled from 'styled-components';

import { DropdownContainer } from 'shared/components/dropdown/dropdown-container';
import { DropdownList } from 'shared/components/dropdown/dropdown-list';
import { MenuButtonItem } from 'shared/components/menu-button/menu-button-item';

const StyledDropdownContainer = styled(DropdownContainer)`
	position: relative;
	min-width: 8.25rem;
	z-index: 2;
`;

type MenuProps<T extends object> = AriaMenuProps<T> & {
	className?: string;
	closeOnSelect?: AriaMenuItemProps['closeOnSelect'];
};

function _Menu<T extends object>(
	{
		className,
		items,
		children,
		disabledKeys,
		closeOnSelect,
		...props
	}: MenuProps<T>,
	ref: React.Ref<HTMLDivElement>,
) {
	// Create menu state based on the incoming props
	const state = useTreeState<T>({
		items,
		children,
		selectionMode: 'single',
		disabledKeys,
	});

	// Get props for the menu element
	const localRef = React.useRef(null);
	const { menuProps } = useMenu(props, state, localRef);

	return (
		<StyledDropdownContainer
			className={className}
			{...menuProps}
			ref={mergeRefs(localRef, ref)}
		>
			<DropdownList>
				{[...state.collection].map((item) =>
					item.type === 'section' ? null : (
						<MenuButtonItem
							key={item.key}
							item={item}
							state={state}
							closeOnSelect={closeOnSelect}
						/>
					),
				)}
			</DropdownList>
		</StyledDropdownContainer>
	);
}

export const Menu = forwardRef(_Menu) as <T extends object>(
	props: MenuProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof _Menu>;
