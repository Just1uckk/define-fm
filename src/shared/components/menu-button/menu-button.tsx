import React, { ReactElement } from 'react';
import {
	AriaMenuItemProps,
	AriaMenuProps,
	AriaPopoverProps,
	useMenuTrigger,
} from 'react-aria';
import { MenuTriggerProps, useMenuTriggerState } from 'react-stately';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import { Popover } from 'shared/components/menu-button/popover';

import { Menu } from './menu';

const StyledMenu = styled(Menu<any>)`
	opacity: 0;
	transform: scale(0);
	transition-property: opacity, transform;
	transition-duration: 0.3s;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

	&[data-placement='top'] {
		transform-origin: bottom;
	}

	&[data-placement='bottom'] {
		transform-origin: top;
	}

	&[data-placement='left'] {
		transform-origin: right;
	}

	&[data-placement='right'] {
		transform-origin: left;
	}

	&.enter-active {
		opacity: 1;
		transform: scale(1);
	}
	&.enter-done {
		opacity: 1;
		transform: scale(1);
	}
	&.exit {
		transition-delay: 0s, 0.03s;
	}
`;

const PopoverAnimation = styled(Popover)`
	width: 200px;
`;

export interface MenuButtonProps<T> extends AriaMenuProps<T>, MenuTriggerProps {
	className?: string;
	placement?: AriaPopoverProps['placement'];
	handler: ReactElement<MenuButtonProps<T>, any>;
	closeOnSelect?: AriaMenuItemProps['closeOnSelect'];
}

export function MenuButton<T extends object>({
	className,
	placement,
	handler,
	children,
	closeOnSelect,
	...props
}: MenuButtonProps<T>) {
	const state = useMenuTriggerState(props);
	const ref = React.useRef<Element>(null);
	const refDropdown = React.useRef<HTMLDivElement>(null);
	const { menuTriggerProps, menuProps } = useMenuTrigger<T>(
		{
			trigger: 'press',
			type: 'menu',
		},
		state,
		ref,
	);

	const trigger =
		handler && React.isValidElement(handler)
			? React.cloneElement(handler as React.ReactElement<any, any>, {
					isOpen: state.isOpen,
					ref: ref,
					...menuTriggerProps,
			  })
			: null;

	return (
		<>
			{trigger}
			<CSSTransition
				nodeRef={refDropdown}
				in={state.isOpen}
				timeout={100}
				mountOnEnter
				unmountOnExit
			>
				<PopoverAnimation state={state} triggerRef={ref} placement={placement}>
					<StyledMenu
						className={className}
						disabledKeys={props.disabledKeys}
						ref={refDropdown}
						{...menuProps}
						onSelectionChange={props.onSelectionChange}
						onAction={props.onAction}
						items={props.items}
						closeOnSelect={closeOnSelect}
					>
						{children}
					</StyledMenu>
				</PopoverAnimation>
			</CSSTransition>
		</>
	);
}
