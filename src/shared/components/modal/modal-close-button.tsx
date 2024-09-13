import React, { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';

const StyledIcon = styled(Icon)`
	color: currentColor;
`;

const CloseButton = styled.button<ThemeProps>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.5rem;
	height: 1.5rem;
	padding: 0;
	border-radius: 50%;
	color: ${({ theme }) => theme.colors.primary};
	background-color: ${({ theme }) => theme.colors.borderColorPrimary};
	border: none;
	z-index: 1;
	transition: color 0.3s ease;

	&:hover {
		color: ${({ theme }) => theme.colors.accent};
	}
`;

export interface ModalCloseButtonProps {
	className?: string;
	onClose?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
}

export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
	onClose,
	className,
}) => (
	<CloseButton className={className} onClick={onClose}>
		<StyledIcon icon={ICON_COLLECTION.cross} />
	</CloseButton>
);
