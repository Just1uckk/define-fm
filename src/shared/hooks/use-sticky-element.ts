import { useEffect, useRef, useState } from 'react';

const DEFAULT_OFFSET = [30, 0] as [number, number];

const DEFAULT_PARAMS = {
	offset: DEFAULT_OFFSET,
};

interface UseStickyElementParams {
	offset: [number, number];
}

export function useStickyElement(
	params: UseStickyElementParams = DEFAULT_PARAMS,
) {
	const {
		offset: [offsetTop, offsetBottom],
	} = params;

	const [element, setElement] = useState<HTMLElement | null | undefined>(null);
	const [containerElement, setContainerElement] = useState<
		HTMLElement | null | undefined
	>(null);
	const elementWidth = useRef<number>();

	useEffect(() => {
		if (!element) return;
		if (!containerElement) return;

		calculatePosition(element, containerElement);

		const handleScroll = () => {
			if (!element) return;
			if (!containerElement) return;

			calculatePosition(element, containerElement);
		};

		document.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			document.removeEventListener('scroll', handleScroll);
		};
	}, [element, containerElement, offsetTop, offsetBottom]);

	function calculatePosition(el, boundersEl) {
		if (!el) return;
		if (!boundersEl) return;

		const elRect = el.getBoundingClientRect();
		const boundersElRect = boundersEl.getBoundingClientRect();

		if (!elementWidth.current) {
			elementWidth.current = elRect.width;
		}

		if (boundersElRect.top >= offsetTop) {
			el.removeAttribute('style');
			elementWidth.current = undefined;

			return;
		}

		el.setAttribute(
			'style',
			`position: fixed; top: ${30}px; width: ${elementWidth.current}px`,
		);
	}

	return {
		setElement,
		setContainerElement,
	};
}
