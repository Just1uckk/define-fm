import React, { forwardRef } from 'react';
import { AriaButtonProps, useButton } from 'react-aria';
import mergeRefs from 'shared/utils/merge-refs';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

const Button = styled.button<ThemeProps>`
	position: relative;
	height: 3.1rem;
	padding-left: 1rem;
	padding-right: 2.5rem;
	color: ${({ theme }) => theme.input.color};
	text-align: left;
	background: ${({ theme }) => theme.input.bg};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	border: 1px solid ${({ theme }) => theme.input.borderColor};
	outline: none;

	&:hover {
		border-color: ${({ theme }) => theme.input.borderColor};
	}

	&:focus,
	&:focus-within,
	&[aria-expanded='true'] {
		border-color: ${({ theme }) => theme.input.borderColor};
		box-shadow: inset 0 0 0 1px ${({ theme }) => theme.input.focus.borderColor};
	}
`;

interface SelectTriggerProps extends AriaButtonProps {
	className?: string;
}

export const _SelectTrigger: React.ForwardRefRenderFunction<
	HTMLButtonElement,
	SelectTriggerProps
> = (props, ref) => {
	const localRef = React.useRef(null);
	const { buttonProps } = useButton(props, localRef);

	return (
		<Button
			ref={mergeRefs(localRef, ref)}
			className={props.className}
			{...buttonProps}
		>
			{props.children}
		</Button>
	);
};

export const SelectTrigger = forwardRef(_SelectTrigger);
