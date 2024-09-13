import React, {
	forwardRef,
	InputHTMLAttributes,
	useEffect,
	useState,
} from 'react';
import { AriaTextFieldOptions, useTextField } from 'react-aria';
import clsx from 'clsx';
import mergeRefs from 'shared/utils/merge-refs';
import { copyToClipboard } from 'shared/utils/utils';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { Text } from 'shared/components/text/text';
import { Tooltip } from 'shared/components/tooltip/tooltip';

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

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
`;

const StyledError = styled(Text)<ThemeProps>`
	padding: 0 1rem;
	margin-top: 0.25rem;
`;

const StyledHelpText = styled(Text)<ThemeProps>`
	padding: 0 1rem;
	margin-top: 0.25rem;
`;

const InputRoot = styled.div<ThemeProps & Pick<InputProps, 'fulfilled'>>`
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

export const InputIconButton = styled(IconButton)`
	position: absolute;
	top: 50%;
	right: 0.5rem;
	transform: translateY(-50%);

	&:not(:disabled) {
		cursor: pointer;
	}
`;

const CopiedTooltipIcon = styled(Icon)`
	margin-right: 0.8rem;
	color: currentColor;

	svg {
		width: 1rem;
		height: 1rem;
	}
`;

const CopiedTooltipText = styled.div`
	display: flex;
	align-items: center;
	font-weight: 700;
`;

export interface InputProps {
	className?: string;
	type?: InputHTMLAttributes<HTMLInputElement>['type'];
	value?: AriaTextFieldOptions<'input'>['value'];
	name?: InputHTMLAttributes<HTMLInputElement>['name'];
	disabled?: InputHTMLAttributes<HTMLInputElement>['disabled'];
	label?: React.ReactNode;
	successCopyText?: string;
	icon?: React.ReactNode;
	iconLeft?: React.ReactNode;
	iconRight?: React.ReactNode;
	autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete'];
	autoFocus?: InputHTMLAttributes<HTMLInputElement>['autoFocus'];
	placeholder?: InputHTMLAttributes<HTMLInputElement>['placeholder'];
	readonly?: InputHTMLAttributes<HTMLInputElement>['readOnly'];
	minLength?: AriaTextFieldOptions<'input'>['minLength'];
	maxLength?: AriaTextFieldOptions<'input'>['maxLength'];
	fulfilled?: boolean;
	isInvalid?: boolean;
	error?: string;
	isCopyable?: boolean;
	onCreateError?: (e: { error: React.ReactNode }) => React.ReactNode;
	helpText?: React.ReactNode;
	tabIndex?: InputHTMLAttributes<HTMLInputElement>['tabIndex'];
	onClick?: InputHTMLAttributes<HTMLInputElement>['onClick'];
	onChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
	onBlur?: AriaTextFieldOptions<'input'>['onBlur'];
	onFocus?: AriaTextFieldOptions<'input'>['onFocus'];
}

const InputComponent: React.ForwardRefRenderFunction<
	HTMLInputElement,
	InputProps
> = (
	{
		type = 'text',
		className,
		value,
		label,
		successCopyText,
		icon,
		iconLeft,
		iconRight,
		isInvalid,
		error,
		helpText,
		disabled,
		readonly,
		fulfilled,
		isCopyable,
		tabIndex,
		onCreateError,
		onClick,
		onChange,
		...props
	},
	ref,
) => {
	const localRef = React.useRef<HTMLInputElement>(null);
	const managePopperState = useManagePopperState({
		placement: 'bottom-end',
		offset: [10, 0],
	});

	const [rootValue, setRootValue] = useState(value || '');

	const { inputProps, labelProps, errorMessageProps, descriptionProps } =
		useTextField(
			{
				type,
				value: rootValue,
				isReadOnly: type === 'date' ? true : readonly,
				isDisabled: disabled,
				label,
				onInput: onChange,
				onChange: (value) => setRootValue(value),
				validationState: error || isInvalid ? 'invalid' : 'valid',
				...props,
			},
			localRef,
		);

	useEffect(() => {
		if (value === undefined) return;
		setRootValue(value);
	}, [value]);

	useEffect(() => {
		const value = localRef.current?.value;
		if (!value) return;

		setRootValue(value);
	}, [localRef.current]);

	const onCopy = async () => {
		await copyToClipboard(String(value));
		managePopperState.toggleMenu(true);
		setTimeout(() => {
			managePopperState.toggleMenu(false);
		}, 2000);
	};

	const hasIcon = !!icon || isCopyable;

	return (
		<>
			{isCopyable && managePopperState.isOpen && (
				<Tooltip
					ref={(ref) => managePopperState.setPopperElement(ref)}
					style={managePopperState.styles.popper}
					{...managePopperState.attributes.popper}
				>
					<CopiedTooltipText>
						<CopiedTooltipIcon icon={ICON_COLLECTION.check} /> {successCopyText}
					</CopiedTooltipText>
				</Tooltip>
			)}

			<Wrapper className={className}>
				<InputRoot
					className={clsx({
						'has-label': !!label,
						'icon-left': hasIcon || !!iconLeft,
						'icon-right': !!iconRight,
					})}
					fulfilled={fulfilled}
				>
					<StyledInput
						ref={mergeRefs(localRef, ref, (ref) =>
							managePopperState.setReferenceElement(ref),
						)}
						className={clsx('input', {
							'has-error': !!error || isInvalid,
							'has-value': !!rootValue || inputProps.value,
						})}
						onClick={onClick}
						tabIndex={tabIndex}
						{...inputProps}
					/>
					{label && (
						<InputLabel className="input__label" {...labelProps}>
							{label}
						</InputLabel>
					)}
					{icon}
					{iconLeft}
					{iconRight}
					{isCopyable && (
						<InputIconButton icon={ICON_COLLECTION.copy} onPress={onCopy} />
					)}
				</InputRoot>
				{helpText && !error && (
					<StyledHelpText variant="help_text" {...descriptionProps}>
						{helpText}
					</StyledHelpText>
				)}
				{error && !onCreateError && (
					<StyledError variant="body_6_error" {...errorMessageProps}>
						{error}
					</StyledError>
				)}
				{onCreateError &&
					onCreateError({
						error: error && (
							<StyledError variant="body_6_error" {...errorMessageProps}>
								{error}
							</StyledError>
						),
					})}
			</Wrapper>
		</>
	);
};

export const Input = forwardRef(InputComponent);
