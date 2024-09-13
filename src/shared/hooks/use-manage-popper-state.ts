import { useEffect, useState } from 'react';
import { usePopper } from 'react-popper';
import { Placement } from '@popperjs/core/lib/enums';

export interface UseManagePopperStateProps {
	open?: boolean;
	placement?: Placement;
	keepOpen?: boolean;
	fallbackPlacements?: Placement[];
	offset?: [number, number];
}

export function useManagePopperState(params: UseManagePopperStateProps = {}) {
	const {
		placement = 'top',
		offset = [0, 10],
		fallbackPlacements,
		keepOpen,
		open,
	} = params;

	const [isOpen, setIsOpen] = useState(!!keepOpen);
	const [referenceElement, setReferenceElement] = useState<
		HTMLElement | null | undefined
	>(null);
	const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
	const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);

	const { styles, attributes, update } = usePopper(
		referenceElement,
		popperElement,
		{
			placement: placement,
			modifiers: [
				{ name: 'preventOverflow' },
				{ name: 'arrow', options: { element: arrowElement } },
				{
					name: 'offset',
					options: {
						offset,
					},
				},
				{
					name: 'flip',
					options: {
						fallbackPlacements: fallbackPlacements,
					},
				},
			],
		},
	);

	useEffect(() => {
		if (keepOpen) return;

		const listener = (event) => {
			// Do nothing if clicking ref's element or descendent elements
			if (!referenceElement || referenceElement.contains(event.target)) {
				return;
			}
			if (!popperElement || popperElement.contains(event.target)) {
				return;
			}
			setIsOpen(false);
		};
		document.addEventListener('mousedown', listener);
		document.addEventListener('touchstart', listener);
		return () => {
			document.removeEventListener('mousedown', listener);
			document.removeEventListener('touchstart', listener);
		};
	}, [keepOpen, referenceElement, popperElement]);

	useEffect(() => {
		if (open === undefined) return;
		setIsOpen(open);
	}, [open]);

	const toggleMenu = (flag?: boolean) => {
		if (flag === undefined || flag === null) {
			setIsOpen((prevValue) => !prevValue);
			return;
		}

		setIsOpen(flag);
	};

	return {
		isOpen,
		referenceElement,
		popperElement,
		toggleMenu,
		styles,
		attributes,
		setPopperElement,
		setReferenceElement,
		setArrowElement,
		update,
	};
}
