import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

export const BreadcrumbPortal: React.FC<
	React.PropsWithChildren<{ container: string }>
> = ({ container, children }) => {
	const [containerEl, setContainerEl] = useState<HTMLElement>();

	useEffect(() => {
		if (!container) return;

		const placeEl = document.getElementById(container);
		let interval;

		if (!placeEl) {
			interval = setInterval(() => {
				const placeEl = document.getElementById(container);
				if (placeEl) {
					setContainerEl(placeEl);
					clearTimeout(interval);
					return;
				}
			}, 1000);
		}

		setContainerEl(placeEl as HTMLElement);

		return () => clearTimeout(interval);
	}, [container]);

	if (!containerEl) return null;

	return ReactDOM.createPortal(children, containerEl);
};
