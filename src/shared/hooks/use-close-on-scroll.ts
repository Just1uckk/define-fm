import { RefObject, useEffect } from 'react';

interface CloseOnScrollOptions {
	triggerRef: RefObject<Element>;
	isOpen?: boolean;
	onClose?: () => void | null;
}

/** this hook is copied from useOverlayPosition in @react-aria
 * as temporary solution as useOverlayPosition hooks doesn't handle it.
 * If library handle it, it can be deleted
 */
export function useCloseOnScroll(opts: CloseOnScrollOptions) {
	const { triggerRef, isOpen, onClose } = opts;

	useEffect(() => {
		if (!isOpen || onClose === null) {
			return;
		}

		const onScroll = (e: Event) => {
			// Ignore if scrolling an scrollable region outside the trigger's tree.
			const target = e.target;
			// window is not a Node and doesn't have contain, but window contains everything
			if (
				!triggerRef.current ||
				(target instanceof Node && !target.contains(triggerRef.current))
			) {
				return;
			}

			const onCloseHandler = onClose;
			if (onCloseHandler) {
				onCloseHandler();
			}
		};

		window.addEventListener('scroll', onScroll, true);
		return () => {
			window.removeEventListener('scroll', onScroll, true);
		};
	}, [isOpen, onClose, triggerRef]);
}
