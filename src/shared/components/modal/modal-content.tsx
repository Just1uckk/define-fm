import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { ModalCloseButton } from 'shared/components/modal/modal-close-button';

export const ModalContentWrapper = styled.div<ThemeProps>`
	position: relative;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	max-height: 100vh;
	box-shadow: 0px 3px 10px rgb(0, 0, 0, var(--box-shadow-opacity, 0.15));
	background-color: ${({ theme }) => theme.colors.background.secondary};
	overflow: hidden;
`;

const StyledModalCloseButton = styled(ModalCloseButton)`
	position: absolute;
	top: 1.8rem;
	right: 2rem;
`;

export interface ModalContentProps {
	className?: string;
	onClose?: () => void;
	hasClose?: boolean;
	children?: React.ReactNode;
}

const ModalContentComponent: React.ForwardRefRenderFunction<
	HTMLDivElement,
	ModalContentProps
> = ({ className, onClose, hasClose = true, children }, ref) => {
	return (
		<ModalContentWrapper ref={ref} className={className} tabIndex={0}>
			{hasClose && (
				<StyledModalCloseButton
					className="modal-layer__close-btn"
					onClose={onClose}
				/>
			)}
			{children}
		</ModalContentWrapper>
	);
};

export const ModalContent = React.forwardRef(ModalContentComponent);
