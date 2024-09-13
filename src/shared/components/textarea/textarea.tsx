import React, { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import mergeRefs from 'shared/utils/merge-refs';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Text } from 'shared/components/text/text';

const InputLabel = styled.div<ThemeProps>`
	position: absolute;
	top: 1px;
	left: 1px;
	right: 1px;
	padding-top: 1rem;
	padding-left: 1rem;
	padding-right: 1rem;
	font-size: 1rem;
	text-align: left;
	color: ${({ theme }) => theme.colors.grey.style_2};
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border-top-left-radius: ${({ theme }) => theme.borderRadius.secondary};
	border-top-right-radius: ${({ theme }) => theme.borderRadius.secondary};
	transition: font-size 0.3s, line-height 0.3s, padding 0.3s ease;
	cursor: text;
	user-select: none;
	pointer-events: none;
`;

const StyledInput = styled.textarea<
	ThemeProps & { resize?: TextareaProps['resize'] }
>`
	height: 112px;
	margin-top: auto;
	padding-top: 1rem;
	padding-left: 1rem;
	padding-right: 1rem;
	font-size: 1rem;
	line-height: 1.1875rem;
	color: ${({ theme }) => theme.input.color};
	background: ${({ theme }) => theme.input.bg};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	border: 1px solid ${({ theme }) => theme.input.borderColor};
	resize: ${({ resize }) => resize};
	outline: none;
	white-space: pre-wrap;

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

	&:focus + ${InputLabel}, &.has-value + ${InputLabel} {
		padding-top: 0.3rem;
		font-size: 0.6875rem;
		line-height: 0.875rem;
	}

	&:not(:focus).has-error {
		border-color: ${({ theme }) => theme.colors.error};
	}
`;

const Wrapper = styled.label<ThemeProps & Pick<TextareaProps, 'fulfilled'>>`
	position: relative;
	display: inline-flex;
	flex-direction: column;

	${({ fulfilled }) =>
		fulfilled &&
		css`
			width: 100%;
		`};

	&.has-label ${StyledInput} {
		padding-top: 1.6rem;
	}
`;

const StyledError = styled(Text)<ThemeProps>`
	padding: 0 1rem;
	margin-top: 0.25rem;
	text-align: left;
`;

const StyledHelpText = styled(Text)<ThemeProps>`
	padding: 0 1rem;
	margin-top: 0.25rem;
`;

interface TextareaProps {
	className?: string;
	name?: InputHTMLAttributes<HTMLTextAreaElement>['name'];
	label?: string;
	value?: InputHTMLAttributes<HTMLTextAreaElement>['value'];
	disabled?: InputHTMLAttributes<HTMLTextAreaElement>['disabled'];
	readonly?: InputHTMLAttributes<HTMLTextAreaElement>['readOnly'];
	resize?: 'vertical' | 'horizontal' | 'auto' | 'none';
	error?: string;
	helpText?: string;
	fulfilled?: boolean;
	placeholder?: InputHTMLAttributes<HTMLTextAreaElement>['placeholder'];
	onChange?: InputHTMLAttributes<HTMLTextAreaElement>['onChange'];
	onFocus?: InputHTMLAttributes<HTMLTextAreaElement>['onFocus'];
	onBlur?: InputHTMLAttributes<HTMLTextAreaElement>['onBlur'];
}

const TextareaComponent: React.ForwardRefRenderFunction<
	HTMLTextAreaElement,
	TextareaProps
> = (
	{
		className,
		name,
		label,
		value,
		placeholder,
		resize = 'none',
		error,
		helpText,
		fulfilled,
		disabled,
		readonly,
		onChange,
		onFocus,
		onBlur,
	},
	ref,
) => {
	const localRef = React.useRef<HTMLTextAreaElement>();

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		onChange && onChange(e);
	};

	return (
		<Wrapper className={clsx(className, { 'has-label': !!label })} fulfilled>
			<StyledInput
				ref={mergeRefs(localRef, ref)}
				className={clsx({
					'has-error': !!error,
					'has-value': !!value || !!localRef.current?.value,
				})}
				name={name}
				value={value}
				placeholder={placeholder}
				disabled={disabled}
				readOnly={readonly}
				resize={resize}
				onChange={handleChange}
				onFocus={onFocus}
				onBlur={onBlur}
			/>
			{label && <InputLabel>{label}</InputLabel>}
			{helpText && !error && (
				<StyledHelpText variant="help_text">{helpText}</StyledHelpText>
			)}
			{error && <StyledError variant="body_6_error">{error}</StyledError>}
		</Wrapper>
	);
};

export const Textarea = forwardRef(TextareaComponent);
