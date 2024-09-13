import React, { Suspense, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { getScrollableRootElement } from 'shared/utils/scroll-helpers';
import styled, { css } from 'styled-components';
import { compose, maxWidth, MaxWidthProps } from 'styled-system';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';

import { ModalContext } from 'shared/components/modal/index';
import { ModalContent } from 'shared/components/modal/modal-content';
import { ModalPortal } from 'shared/components/modal/modal-portal';
import {
	ModalOverlay,
	ModalWrapper,
} from 'shared/components/modal/modal-wrapper';
import { Spinner } from 'shared/components/spinner/spinner';

const StyledModalContent = styled(ModalContent)``;

const ModalContentWrapper = styled.div<
	Pick<ModalProps, 'fulfilled' | 'maxWidth'>
>`
	position: relative;
	max-width: 27.75rem;
	transition-duration: 0.2s;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-property: transform, opacity;
	z-index: 1;

	${({ fulfilled }) =>
		fulfilled &&
		css`
			width: 100%;
		`};

	&[data-placement='right'],
	&[data-placement='left'] {
		position: fixed;
		top: 0;
		max-width: 37.5rem;
		height: 100%;
	}

	&[data-placement='left'] {
		left: 0;
		transform: translate3d(-100%, 0, 0);
	}
	&[data-placement='right'] {
		right: 0;
		transform: translate3d(100%, 0, 0);
	}

	&[data-placement='right'] {
		& > ${StyledModalContent} {
			border-radius: 0;

			& .modal__body-content {
				padding: 2.5rem;
				padding-bottom: 0;
			}
		}
	}

	&[data-placement='center'] {
		opacity: 0;

		& > ${StyledModalContent} {
			border-radius: 0.625rem;

			& .modal__header {
				padding-top: 1.6rem;
				padding-bottom: 1.6rem;
				padding-left: 2rem;
				padding-right: 4rem;
			}

			& .page-body {
				margin-top: 0;
			}

			& .modal__body-content {
				padding: 1.5rem;
				padding-top: 0;
				padding-bottom: 0;
			}

			& .page-footer {
				padding-top: 1.5rem;
				padding-bottom: 1.5rem;
			}
		}
	}

	${compose(maxWidth)}
`;

export interface ModalProps {
	className?: string;
	container?: Element | 'parent';
	placement?: 'center' | 'right';
	name?: string;
	open?: boolean;
	locked?: boolean;
	onClose?: (modalName?: string) => void;
	onAfterClose?: (modalName?: string) => void;
	isClosable?: boolean;
	hasClose?: boolean;
	options?: Record<any, any>;
	fulfilled?: boolean;
	maxWidth?: MaxWidthProps['maxWidth'];
}

export const ModalRoot: React.FC<React.PropsWithChildren<ModalProps>> = ({
	className,
	container,
	name,
	open,
	placement = 'right',
	fulfilled,
	isClosable = true,
	onClose,
	onAfterClose,
	hasClose,
	maxWidth,
	children,
}) => {
	const modalWrapperRef = useRef() as React.MutableRefObject<HTMLDivElement>;
	const modalContentRef = useRef() as React.MutableRefObject<HTMLDivElement>;
	const prevSavedActiveElement = useRef<HTMLElement>();
	const isContainerAlreadyLocked = useRef<boolean>();

	const handleClose = () => {
		if (!isClosable) return;

		onClose && onClose(name);
	};

	useEffect(() => {
		return () => {
			const containerEl = getContainer();
			if (!containerEl) return;

			if (isContainerAlreadyLocked.current) return;

			containerEl.classList.remove('is-scroll-locked');
			containerEl.style.paddingRight = '';
		};
	}, []);

	useEffect(() => {
		const containerEl = getContainer();
		if (!containerEl) return;

		isContainerAlreadyLocked.current =
			containerEl.classList.contains('is-scroll-locked');

		if (open) {
			let scrollBarWidth =
				window.innerWidth - document.documentElement.clientWidth;

			if (containerEl !== document.body) {
				scrollBarWidth = containerEl.offsetWidth - containerEl.clientWidth;
			}

			containerEl.classList.add('is-scroll-locked');
			containerEl.style.paddingRight = scrollBarWidth + 'px';
		}

		return () => {
			if (open) {
				if (isContainerAlreadyLocked.current) return;

				containerEl.classList.remove('is-scroll-locked');
				containerEl.style.paddingRight = '';
			}
		};
	}, [open]);

	//Save element for focusing on element after modal closing;
	useEffectAfterMount(() => {
		if (open) {
			prevSavedActiveElement.current = document.activeElement as HTMLElement;
			modalContentRef.current?.focus();
		}

		return () => {
			prevSavedActiveElement.current?.focus();
		};
	}, [open]);

	//Close modal by Escape button
	useEffectAfterMount(() => {
		const handler = (e: KeyboardEvent) => {
			if (
				e.key === 'Escape' &&
				document.activeElement === modalContentRef.current
			) {
				onClose && onClose(name);
			}
		};

		open && document.addEventListener('keyup', handler);

		return () => document.removeEventListener('keyup', handler);
	}, [open, onClose]);

	function getContainer() {
		let containerEl = getScrollableRootElement();

		if (container === 'parent') {
			containerEl = modalWrapperRef.current?.parentElement ?? containerEl;
		}

		if (container && container !== 'parent') {
			containerEl = container as HTMLElement;
		}

		return containerEl;
	}

	return (
		<CSSTransition
			in={open}
			timeout={300}
			mountOnEnter
			unmountOnExit
			onExited={onAfterClose}
		>
			<ModalPortal container={container}>
				<ModalWrapper
					ref={modalWrapperRef}
					data-placement={placement}
					className={className}
				>
					<ModalOverlay className="modal_overlay" onClick={handleClose} />
					<ModalContentWrapper
						className="modal_content_wrapper"
						role="dialog"
						data-placement={placement}
						fulfilled={fulfilled}
						tabIndex={-1}
						maxWidth={maxWidth}
					>
						<StyledModalContent
							ref={modalContentRef}
							onClose={handleClose}
							hasClose={hasClose}
						>
							<ModalContext.Provider value={{ onClose: handleClose }}>
								<Suspense fallback={<Spinner />}>{children}</Suspense>
							</ModalContext.Provider>
						</StyledModalContent>
					</ModalContentWrapper>
				</ModalWrapper>
			</ModalPortal>
		</CSSTransition>
	);
};
