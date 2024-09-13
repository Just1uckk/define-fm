import React, { ChangeEvent } from 'react';
import { uuid } from 'shared/utils/uuid';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

const ToggleText = styled.label`
	font-size: 0.875rem;
	color: ${({ theme }) => theme.radioButtons.textColor};

	&:hover {
		cursor: pointer;
	}
`;

const ToggleTextRight = styled(ToggleText)`
	padding-left: 0.75rem;
`;

const ToggleTextLeft = styled(ToggleText)`
	padding-right: 0.75rem;
`;

const ToggleControl = styled.label<ThemeProps>`
	position: relative;
	display: block;
	width: 1rem;
	height: 1rem;
	padding: 1px;
	border-radius: 50%;
	border: 1px solid ${({ theme }) => theme.radioButtons.borderColor};
	background: ${({ theme }) => theme.radioButtons.bg};
	transition: background-color 0.3s ease-in;
	transition-delay: 0.1s;

	&:hover {
		cursor: pointer;
	}

	&:before {
		content: '';
		position: absolute;
		left: 1px;
		top: 50%;
		display: block;
		height: 0.75rem;
		width: 0.75rem;
		border-radius: 50%;
		background-color: ${({ theme }) => theme.radioButtons.color};
		transition: 0.3s cubic-bezier(0.54, 1.7, 0.5, 1);
		transform: translateY(-50%);
		opacity: 0;
		z-index: 10;
	}
`;

const ToggleTrack = styled.span`
	display: flex;
	align-items: center;
	height: 100%;
`;

const ToggleWrap = styled.label<ThemeProps>`
	display: flex;
	align-items: center;

	input {
		display: none;
	}

	input:checked ~ ${ToggleControl}:before {
		opacity: 1;
	}
`;

interface RadioButtonProps {
	id?: string;
	name?: string;
	value?: string;
	label?: string;
	checked?: boolean;
	labelPlace?: 'left' | 'right';
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
	label,
	name,
	value,
	id = uuid(),
	checked,
	labelPlace = 'right',
	onChange,
}) => {
	return (
		<ToggleWrap>
			{label && labelPlace === 'left' && (
				<ToggleTextLeft
					className="toggle__text-label toggle__text-label--left"
					htmlFor={id}
				>
					{label}
				</ToggleTextLeft>
			)}

			<input
				id={id}
				type="radio"
				name={name}
				value={value}
				checked={checked}
				onChange={onChange}
			/>

			<ToggleControl htmlFor={id}>
				<ToggleTrack />
			</ToggleControl>

			{label && labelPlace === 'right' && (
				<ToggleTextRight
					className="toggle__text-label toggle__text-label--right"
					htmlFor={id}
				>
					{label}
				</ToggleTextRight>
			)}
		</ToggleWrap>
	);
};
