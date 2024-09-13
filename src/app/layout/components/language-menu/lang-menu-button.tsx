import React, { forwardRef, PropsWithRef, useRef } from 'react';
import { AriaButtonProps, useButton } from 'react-aria';
import mergeRefs from 'shared/utils/merge-refs';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';

const ChevronIcon = styled(Icon)<ThemeProps>`
	margin-left: 1.2rem;
	color: ${({ theme }) => theme.langButton.iconColor};

	width: 0.5rem;
	height: 0.5rem;

	svg {
		width: 100%;
		height: auto;
	}
`;

const SelectedLang = styled.span`
	flex-grow: 1;
	flex-shrink: 0;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.colors.secondary};
	text-overflow: ellipsis;
	white-space: nowrap;
	text-align: left;
	overflow: hidden;
`;

const Button = styled.button<
	ThemeProps & { isActive: boolean; fulfilled: boolean }
>`
	position: relative;
	display: flex;
	align-items: center;
	padding: ${({ fulfilled }) => (fulfilled ? '0.7rem' : '0.7rem 0.4rem')};
	max-width: 14.5rem;
	min-width: 2.8125rem;
	min-height: 2.8125rem;
	border: none;
	border-radius: ${({ theme }) => theme.borderRadius.base};
	background-color: transparent;
	overflow: hidden;

	${({ isActive }) =>
		isActive &&
		css`
			background-color: ${({ theme }) => theme.langButton.active.bg};

			& ${ChevronIcon} {
				color: ${({ theme }) => theme.langButton.active.iconColor};
			}
		`}

	& ${SelectedLang} {
		text-align: ${({ fulfilled }) => (fulfilled ? 'initial' : 'center')};
	}
`;

export interface MenuButtonHandlerProps
	extends AriaButtonProps,
		PropsWithRef<any> {
	className?: string;
	label?: React.ReactNode;
	fulfilled: boolean;
	isOpen: boolean;
	isMenuOpen?: boolean;
}

const _LangMenuButton: React.ForwardRefRenderFunction<
	HTMLElement,
	React.PropsWithChildren<MenuButtonHandlerProps>
> = (
	{ className, fulfilled, languages, isOpen, isAppMenuOpen, label, ...props },
	ref,
) => {
	const localRef = useRef<HTMLButtonElement>(null);
	const { buttonProps } = useButton(props, localRef);

	return (
		<Button
			ref={mergeRefs(ref, localRef)}
			className={className}
			isActive={isOpen}
			fulfilled={fulfilled}
			{...buttonProps}
		>
			<SelectedLang className="language-menu__button-label">
				{label}
			</SelectedLang>
			{fulfilled && (
				<ChevronIcon
					icon={
						isOpen ? ICON_COLLECTION.chevron_top : ICON_COLLECTION.chevron_down
					}
				/>
			)}
		</Button>
	);
};

export const LangMenuButton = forwardRef(_LangMenuButton);
