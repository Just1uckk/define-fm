import React, { AllHTMLAttributes, forwardRef, HTMLAttributes } from 'react';
import {
	AriaSwitchProps,
	useFocusRing,
	useSwitch,
	VisuallyHidden,
} from 'react-aria';
import { useToggleState } from 'react-stately';
import clsx from 'clsx';
import mergeRefs from 'shared/utils/merge-refs';
import styled from 'styled-components';
import { compose, justifyContent, JustifyContentProps } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

import { Text } from 'shared/components/text/text';

const ToggleText = styled.div<ThemeProps>`
	font-size: 0.875rem;
	line-height: 1.0625rem;
	color: ${({ theme }) => theme.text.primaryColor};
	padding-right: 0.75rem;
`;

const ToggleSubText = styled(Text)`
	width: 100%;
`;

const ToggleControl = styled.div<ThemeProps>`
	position: relative;
	flex-shrink: 0;
	width: 1.6875rem;
	height: 1rem;
	padding: 1px;
	border-radius: 6.25rem;
	background: ${({ theme }) => theme.toggle.bg_off};
	transition: background-color 0.3s ease-in;

	&:before {
		content: '';
		position: absolute;
		left: 1px;
		top: 50%;
		display: block;
		height: 0.875rem;
		width: 0.875rem;
		border-radius: 50%;
		background-color: ${({ theme }) => theme.colors.white};
		box-shadow: ${({ theme }) => theme.shadow.base};
		transition: left 0.3s cubic-bezier(0.54, 1.7, 0.5, 1);
		transform: translateY(-50%);
	}
`;

const ToggleTrack = styled.span`
	display: flex;
	align-items: center;
	height: 100%;
`;

const ToggleWrap = styled.label<ThemeProps & JustifyContentProps>`
	display: flex;
	align-items: center;
	cursor: pointer;
	&&& {
		flex-direction: row;
	}

	&.is-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	${compose(justifyContent)}

	&.is-active ${ToggleControl}:before, input:checked ~ ${ToggleControl}:before {
		left: 0.75rem;
	}

	&.is-active ${ToggleControl}, input:checked ~ ${ToggleControl} {
		background: ${({ theme }) => theme.colors.accent};
	}

	input:focus-visible ~ ${ToggleControl}, &.is-focus-visible ${ToggleControl} {
		outline: rgb(16, 16, 16) auto 1px;
		outline: -webkit-focus-ring-color auto 1px;
		outline-offset: 3px;
	}
`;

interface ToggleProps extends JustifyContentProps {
	id?: HTMLAttributes<HTMLInputElement>['id'];
	name?: AllHTMLAttributes<HTMLInputElement>['name'];
	disabled?: AllHTMLAttributes<HTMLInputElement>['disabled'];
	label?: React.ReactNode;
	subText?: React.ReactNode;
	className?: string;
	checked?: boolean;
	isReadOnly?: AriaSwitchProps['isReadOnly'];
	onChange?: AriaSwitchProps['onChange'];
	onBlur?: AriaSwitchProps['onBlur'];
}

export const ToggleComponent: React.ForwardRefRenderFunction<
	HTMLInputElement,
	ToggleProps
> = (
	{
		className,
		name,
		checked,
		disabled,
		label,
		subText,
		justifyContent,
		isReadOnly,
		onChange,
		onBlur,
	},
	ref,
) => {
	const state = useToggleState({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		name,
		isSelected: checked,
		isDisabled: disabled,
		isReadOnly: isReadOnly,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		children: label,
		onChange,
		onBlur,
	});
	const localRef = React.useRef(null);
	const { inputProps } = useSwitch(
		{
			name,
			isDisabled: disabled,
			isReadOnly: isReadOnly,
			children: label,
			onChange,
			onBlur,
		},
		state,
		localRef,
	);
	const { isFocusVisible, focusProps } = useFocusRing();

	return (
		<ToggleWrap
			className={clsx(className, {
				'is-disabled': disabled,
				'is-active': state.isSelected,
				'is-focus-visible': isFocusVisible,
			})}
			justifyContent={justifyContent}
		>
			{label && <ToggleText className="toggle__text-label">{label}</ToggleText>}

			<VisuallyHidden>
				<input
					ref={mergeRefs(ref, localRef)}
					name={name}
					onBlur={onBlur}
					{...inputProps}
					{...focusProps}
				/>
			</VisuallyHidden>

			<ToggleControl>
				<ToggleTrack />
			</ToggleControl>
			{subText && (
				<ToggleSubText variant="body_6_secondary">{subText}</ToggleSubText>
			)}
		</ToggleWrap>
	);
};

export const Toggle = forwardRef(ToggleComponent);
