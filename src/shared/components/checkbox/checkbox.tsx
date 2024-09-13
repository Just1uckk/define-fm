import React, { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';

const Text = styled.span`
	font-size: 0.875rem;
	color: ${({ theme }) => theme.radioButtons.textColor};
	padding-left: 0.75rem;

	&:hover {
		cursor: pointer;
	}
`;

const Control = styled.div<ThemeProps>`
	position: relative;
	display: block;
	flex-shrink: 0;
	width: 1rem;
	height: 1rem;
	padding: 1px;
	border-radius: 0.25rem;
	border: 1px solid ${({ theme }) => theme.checkbox.borderColor};
	background: ${({ theme }) => theme.checkbox.bg};
	transition: background-color 0.3s ease-in;
	transition-delay: 0.1s;

	&:hover {
		cursor: pointer;
	}

	&:before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		display: block;
		width: calc(100% + 2px);
		height: calc(100% + 2px);
		border-radius: 0.25rem;
		background-color: ${({ theme }) => theme.checkbox.color};
		opacity: 0;
		transform: translate(-50%, -50%);
		transition: opacity 0.3s cubic-bezier(0.54, 1.7, 0.5, 1);
		z-index: 1;
	}
`;

const Track = styled.span`
	display: flex;
	align-items: center;
	height: 100%;
`;

const StyledIcon = styled(Icon)<ThemeProps>`
	position: absolute;
	top: 50%;
	left: 50%;
	color: ${({ theme }) => theme.colors.white};
	transform: translate(-50%, -50%);
	opacity: 0;
	transition: opacity 0.3s cubic-bezier(0.54, 1.7, 0.5, 1);
	z-index: 2;
`;

const Wrapper = styled.label<ThemeProps>`
	display: flex;
	align-items: center;

	&.disabled ${Control} {
		cursor: not-allowed;
		opacity: 0.6;
	}

	input {
		position: absolute;
		clip: rect(0 0 0 0);
		width: 1px;
		height: 1px;
		margin: -1px;
	}

	input:checked ~ ${Control} ${StyledIcon} {
		opacity: 1;
	}

	input:checked ~ ${Control}:before {
		opacity: 1;
	}

	input:focus-visible ~ ${Control} {
		outline: rgb(16, 16, 16) auto 1px;
		outline: -webkit-focus-ring-color auto 1px;
		outline-offset: 0.2rem;
	}
`;

const Label = styled(Text)`
	word-break: break-all;
`;

export interface CheckboxProps {
	className?: string;
	name?: string;
	indeterminate?: boolean;
	label?: React.ReactNode;
	checked?: boolean;
	disabled?: InputHTMLAttributes<HTMLInputElement>['disabled'];
	onChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
	onClick?: InputHTMLAttributes<HTMLLabelElement>['onClick'];
}

export const Checkbox: React.FC<CheckboxProps> = ({
	className,
	label,
	name,
	indeterminate,
	checked,
	disabled,
	onChange,
	onClick,
}) => {
	return (
		<Wrapper
			className={clsx(className, { disabled: disabled })}
			onClick={onClick}
		>
			<input
				type="checkbox"
				name={name}
				checked={checked}
				disabled={disabled}
				onChange={onChange}
			/>

			<Control>
				<Track />
				{indeterminate && <StyledIcon icon={ICON_COLLECTION.horizontal_line} />}
				{!indeterminate && <StyledIcon icon={ICON_COLLECTION.check} />}
			</Control>

			{label && <Label className="toggle__text-label">{label}</Label>}
		</Wrapper>
	);
};
