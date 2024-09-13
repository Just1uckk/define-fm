import React, { DOMAttributes, forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

const InputLabel = styled.label`
	position: absolute;
	top: 50%;
	left: 0;
	right: 0;
	padding-left: 1rem;
	padding-right: 1rem;
	font-size: 1rem;
	color: ${({ theme }) => theme.colors.grey.style_2};
	transform: translateY(-50%);
	transition: font-size 0.3s, line-height 0.3s, top 0.3s ease;
	cursor: text;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	user-select: none;
	pointer-events: none;
`;

const StyledInput = styled.input<ThemeProps>`
	height: 3.128rem;
	margin-top: auto;
	padding-left: 1rem;
	padding-right: 1rem;
	font-size: 1rem;
	line-height: 1.1875rem;
	color: ${({ theme }) => theme.input.color};
	background: ${({ theme }) => theme.input.bg};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	border: 1px solid ${({ theme }) => theme.input.borderColor};
	outline: none;

	&::-ms-reveal {
		display: none;
	}

	&::placeholder {
		color: ${({ theme }) => theme.colors.grey.style_2};
		opacity: 0.8;
	}

	&:disabled {
		background-color: ${({ theme }) => theme.input.disabled.bg};
		cursor: not-allowed;
	}

	&:disabled + ${InputLabel} {
		cursor: not-allowed;
	}

	&:focus {
		border-color: ${({ theme }) => theme.input.focus.borderColor};
	}

	&.has-value + ${InputLabel}, &:-webkit-autofill + ${InputLabel} {
		top: 30%;
		font-size: 0.6875rem;
		line-height: 0.875rem;
	}

	${({ readOnly }) =>
		!readOnly &&
		css`
			&:focus + ${InputLabel} {
				top: 30%;
				font-size: 0.6875rem;
				line-height: 0.875rem;
			}
		`}

	&:not(:focus).has-error {
		border-color: ${({ theme }) => theme.colors.error};
	}
`;

const InputRoot = styled.div<ThemeProps & Pick<BaseInputProps, 'fulfilled'>>`
	position: relative;
	display: inline-flex;
	flex-direction: column;
	flex-grow: 1;

	${({ fulfilled }) =>
		fulfilled &&
		css`
			width: 100%;
		`};

	&.has-label ${StyledInput} {
		padding-top: 1.1rem;
	}

	&.icon-left ${StyledInput} {
		padding-right: 2.8rem;
	}
	&.icon-right ${StyledInput} {
		padding-right: 2.8rem;
	}
`;

export interface BaseInputProps extends HTMLAttributes<HTMLInputElement> {
	className?: string;
	value?: string | number | readonly string[];
	label?: React.ReactNode;
	icon?: React.ReactNode;
	iconLeft?: React.ReactNode;
	iconRight?: React.ReactNode;
	fulfilled?: boolean;
	isInvalid?: boolean;
	error?: React.ReactNode;
	labelProps?: DOMAttributes<HTMLLabelElement>;
}

const _BaseInput: React.ForwardRefRenderFunction<
	HTMLInputElement,
	BaseInputProps
> = (
	{
		className,
		error,
		isInvalid,
		value,
		label,
		icon,
		iconLeft,
		iconRight,
		fulfilled,
		labelProps,
		...props
	},
	ref,
) => {
	return (
		<InputRoot
			className={clsx(className, {
				'has-label': !!label,
				'icon-left': !!icon || !!iconLeft,
				'icon-right': !!iconRight,
			})}
			fulfilled={fulfilled}
		>
			<StyledInput
				ref={ref}
				className={clsx('input', {
					'has-error': !!error || isInvalid,
					'has-value': !!value,
				})}
				value={value}
				{...props}
			/>
			{label && (
				<InputLabel className="input__label" {...labelProps}>
					{label}
				</InputLabel>
			)}
			{icon}
			{iconLeft}
			{iconRight}
		</InputRoot>
	);
};

export const BaseInput = forwardRef(_BaseInput);
