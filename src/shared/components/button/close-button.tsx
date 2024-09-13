import React, { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';

const Button = styled.button<ThemeProps>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.5rem;
	height: 1.5rem;
	padding: 0;
	border-radius: 50%;
	color: ${({ theme }) => theme.text.primaryColor};
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: none;
	z-index: 1;
`;

export interface ModalCloseButtonProps {
	className?: string;
	onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
}

export const CloseButton: React.FC<ModalCloseButtonProps> = ({
	onClick,
	className,
}) => (
	<Button className={className} onClick={onClick}>
		<Icon icon={ICON_COLLECTION.cross} />
	</Button>
);
