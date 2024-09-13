import React, { useContext } from 'react';

import { ModalRoot } from 'shared/components/modal/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { ModalPage } from 'shared/components/modal/modal-page';

export interface ModalContextProps {
	onClose: () => void;
}
export const ModalContext = React.createContext<ModalContextProps>({
	onClose: () => false,
});

export const useModalContext = () =>
	useContext<ModalContextProps>(ModalContext);

export const Modal = {
	Root: ModalRoot,
	Page: ModalPage,
	Footer: ModalFooter,
};

export type { ModalProps } from 'shared/components/modal/modal';
