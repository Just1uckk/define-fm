import React from 'react';
import clsx from 'clsx';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

const Wrapper = styled.button<ThemeProps>`
	position: relative;
	display: flex;
	height: 2.5rem;
	padding: 0;
	font-size: 1rem;
	line-height: 1.1875rem;

	color: ${({ theme }) => theme.colors.secondary};
	background-color: transparent;
	border: none;
	z-index: 1;

	& + & {
		margin-left: 2.6rem;
	}

	&.is-active {
		color: ${({ theme }) => theme.colors.accent};
		text-shadow: 1px 0 0 currentColor;
		pointer-events: none;
	}
`;

export interface TabProps {
	className?: string;
	isActive?: boolean;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Tab: React.FC<React.PropsWithChildren<TabProps>> = ({
	className,
	isActive,
	children,
	onClick,
}) => {
	return (
		<Wrapper
			className={clsx({ 'is-active': isActive }, className)}
			type="button"
			role="tab"
			aria-selected={isActive}
			onClick={onClick}
		>
			{children}
		</Wrapper>
	);
};
