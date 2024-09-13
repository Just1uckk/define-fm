import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { variant } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

import { tooltipVariants } from 'shared/components/tooltip/tooltip-variants';

const TooltipArrow = styled.div`
	width: 0;
	height: 0;
`;

const TooltipRoot = styled.div<ThemeProps & { variant: TooltipVariants }>`
	max-width: 21rem;
	padding: 0.5rem 0.75rem;
	font-size: 0.875rem;
	line-height: 1.0625rem;
	font-weight: 600;
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	filter: drop-shadow(0px 6px 12px rgba(0, 0, 0, var(--box-shadow-opacity, 0.15)));
	z-index: 11;

	${({ theme }) => variant({ variants: tooltipVariants(theme) })};

	&[data-popper-placement^='bottom'] ${TooltipArrow} {
		bottom: 100%;
		border-left: 3px solid transparent;
		border-right: 3px solid transparent;
		border-bottom: 3px solid ${({ theme, variant }) => theme.tooltip[variant].bg};
	}

	&[data-popper-placement^='top'] ${TooltipArrow} {
		top: 100%;
		border-left: 3px solid transparent;
		border-right: 3px solid transparent;
		border-top: 3px solid ${({ theme, variant }) => theme.tooltip[variant].bg};
	}

	&[data-popper-placement^='right'] ${TooltipArrow} {
		right: 100%;
		border-top: 3px solid transparent;
		border-bottom: 3px solid transparent;
		border-right: 3px solid ${({ theme, variant }) => theme.tooltip[variant].bg};

	&[data-popper-placement^='left'] ${TooltipArrow} {
		left: 100%;
		border-top: 3px solid transparent;
		border-bottom: 3px solid transparent;
		border-left: 3px solid ${({ theme, variant }) => theme.tooltip[variant].bg};
	}
`;

type TooltipVariants = 'primary' | 'secondary';

interface TooltipProps {
	variant?: TooltipVariants;
	children?: React.ReactNode;
	style?: React.CSSProperties;
	arrowStyles?: React.CSSProperties;
	arrowRef?: React.Ref<any>;
}

const TooltipComponent: React.ForwardRefRenderFunction<
	HTMLDivElement,
	TooltipProps
> = (
	{ variant = 'primary', arrowRef, style, arrowStyles, children, ...rest },
	ref,
) => {
	return (
		<TooltipRoot
			role="tooltip"
			ref={ref}
			variant={variant}
			style={style}
			{...rest}
		>
			{children}
			<TooltipArrow ref={arrowRef} style={arrowStyles} />
		</TooltipRoot>
	);
};

export const Tooltip = forwardRef(TooltipComponent);
