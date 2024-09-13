import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

const RootCountBadge = styled.span<ThemeProps>`
	display: inline-block;
	padding: 0.155rem 0.473rem;
	margin-left: 0.4rem;
	font-size: 0.6875rem;
	line-height: 1rem;
	font-weight: 600;
	border-radius: ${({ theme }) => theme.borderRadius.base};
	color: ${({ theme }) => theme.tabs.tabCounter.color};
	background-color: ${({ theme }) => theme.tabs.tabCounter.backgroundColor};
`;

interface CountBadgeProps {
	className?: string;
}

export const CountBadge: React.FC<React.PropsWithChildren<CountBadgeProps>> = ({
	className,
	children,
}) => {
	return <RootCountBadge className={className}>{children}</RootCountBadge>;
};
