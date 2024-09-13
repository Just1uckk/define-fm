import React, { InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

const activeStyles = css`
	background-color: ${({ theme }) =>
		theme.dropdownOption.active.backgroundColor};

	color: ${({ theme }) => theme.dropdownOption.active.color};
	text-shadow: 1px 0 0 currentColor;
`;

const Container = styled.button<ThemeProps & { isActive?: boolean }>`
	width: 100%;
	padding: 0.5rem 1rem;
	text-align: left;
	text-shadow: inherit;
	font-size: 0.875rem;
	line-height: 1.0625rem;
	font-weight: 400;
	color: inherit;
	border: none;
	background-color: transparent;
	border-radius: 0.5rem;

	${({ isActive }) => isActive && activeStyles}
`;

interface DropdownSimpleButtonProps {
	className?: InputHTMLAttributes<HTMLButtonElement>['className'];
	disabled?: InputHTMLAttributes<HTMLButtonElement>['disabled'];
	tabIndex?: InputHTMLAttributes<HTMLButtonElement>['tabIndex'];
	isActive?: boolean;
	onClick?: InputHTMLAttributes<HTMLButtonElement>['onClick'];
}

export const DropdownSimpleButton: React.FC<
	React.PropsWithChildren<DropdownSimpleButtonProps>
> = ({ className, disabled, tabIndex, isActive, onClick, children }) => {
	return (
		<Container
			type="button"
			className={className}
			isActive={isActive}
			disabled={disabled}
			onClick={onClick}
			tabIndex={tabIndex}
		>
			{children}
		</Container>
	);
};
