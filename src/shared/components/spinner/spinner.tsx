import React from 'react';
import clsx from 'clsx';
import styled, { keyframes } from 'styled-components';
import { compose, space, SpaceProps } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

const RotateAnimation = keyframes`
	from { transform: rotate(0deg) }
	to { transform: rotate(360deg) }
`;

const AnimatedCircle = styled.div<ThemeProps & SpaceProps>`
	position: relative;
	width: 1.5625rem;
	height: 1.5625rem;
	margin: 0 auto;
	color: ${({ theme }) => theme.colors.primary};
	border-radius: 100%;

	&::after {
		content: '';
		display: inline-block;
		position: absolute;
		top: -2px;
		left: -2px;
		width: 100%;
		height: 100%;
		border-radius: 100%;
		border-width: 2px;
		border-style: solid;
		border-color: transparent;
		border-top-color: currentColor;
		animation: ${RotateAnimation} linear infinite 0.8s;
	}

	${compose(space)}
`;

interface SpinnerProps extends SpaceProps {
	className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className, ...props }) => {
	return (
		<AnimatedCircle className={clsx('animated-circle', className)} {...props} />
	);
};
