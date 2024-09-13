import React, { cloneElement, RefObject } from 'react';
import type { AriaPopoverProps } from 'react-aria';
import { DismissButton, Overlay, usePopover } from 'react-aria';
import { OverlayTriggerState } from 'react-stately';

import { useCloseOnScroll } from 'shared/hooks/use-close-on-scroll';

export interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
	popoverRef?: RefObject<Element>;
	children: React.ReactNode;
	state: OverlayTriggerState;
	closeOnScroll?: boolean;
}

export function Popover({
	children,
	state,
	closeOnScroll = true,
	...props
}: React.PropsWithChildren<PopoverProps>) {
	const ref = React.useRef(null);
	const { popoverRef = ref } = props;
	const { popoverProps, placement } = usePopover(
		{
			...props,
			popoverRef: popoverRef,
			offset: 10,
			isNonModal: true,
		},
		state,
	);

	useCloseOnScroll({
		triggerRef: props.triggerRef,
		isOpen: state.isOpen,
		onClose: closeOnScroll ? state.close : undefined,
	});

	const clonedChildren = React.isValidElement(children)
		? cloneElement<any>(children, { 'data-placement': placement })
		: children;

	return (
		<Overlay portalContainer={document.body}>
			<div
				ref={popoverRef as React.RefObject<HTMLDivElement>}
				{...popoverProps}
				style={popoverProps.style}
			>
				<DismissButton onDismiss={state.close} />
				{clonedChildren}
				<DismissButton onDismiss={state.close} />
			</div>
		</Overlay>
	);
}
