import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';

import { ModalProps } from 'shared/components/modal/modal';

type ModalPortalProps = Pick<ModalProps, 'container'>;

export const ModalPortal: React.FC<
	React.PropsWithChildren<ModalPortalProps>
> = ({ container, children }) => {
	const el = useMemo(() => {
		if (!container) return document.body;

		return container;
	}, [container]);

	if (el === 'parent') {
		return <>{children}</>;
	}

	return <>{ReactDOM.createPortal(children, el)}</>;
};
