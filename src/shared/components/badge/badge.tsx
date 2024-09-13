import React from 'react';
import styled from 'styled-components';
import { variant } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

import { badgeVariants } from 'shared/components/badge/badge-variants';

const BadgeRoot = styled.div<ThemeProps & { variant: BadgeVariants }>`
	display: inline-block;
	padding: 0.15rem 0.35rem;
	font-size: 0.75rem;
	line-height: 0.875rem;
	border-radius: 0.125rem;
	text-transform: capitalize;
	border: 1px solid transparent;

	filter: ${({ theme }) => theme.badge.filter};

	& + & {
		margin-left: 0.5rem;
	}

	${({ theme }) => variant({ variants: badgeVariants(theme) })};
`;

type BadgeVariants = 'blue' | 'red' | 'grey' | 'grey_white' | 'green';

interface BadgeProps {
	variant?: BadgeVariants;
}

export const Badge: React.FC<React.PropsWithChildren<BadgeProps>> = ({
	variant = 'blue',
	children,
}) => {
	return <BadgeRoot variant={variant}>{children}</BadgeRoot>;
};
