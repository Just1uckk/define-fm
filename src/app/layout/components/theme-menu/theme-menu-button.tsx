import React, { forwardRef, PropsWithRef, useRef } from 'react';
import { AriaButtonProps, useButton } from 'react-aria';
import mergeRefs from 'shared/utils/merge-refs';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { THEME_TYPES } from 'shared/constants/constans';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';

import { THEME_MENU_OPTIONS } from './theme-menu';

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

const SelectedTheme = styled.span`
	flex-grow: 1;
	flex-shrink: 0;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.colors.secondary};
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;

const SelectedThemeTextWrapper = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
`;

const SelectedThemeText = styled.span``;

const ThemeIcon = styled(Icon)`
	color: currentColor;
`;

const Button = styled.button<
	ThemeProps & { isActive: boolean; fulfilled?: boolean }
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

	& ${SelectedTheme} {
		text-align: ${({ fulfilled }) => (fulfilled ? 'initial' : 'center')};
	}
`;

export interface MenuButtonHandlerProps
	extends AriaButtonProps,
		PropsWithRef<any> {
	className?: string;
	label?: React.ReactNode;
	currentTheme?: THEME_TYPES;
	fulfilled: boolean;
	isOpen: boolean;
	isMenuOpen?: boolean;
}

const _ThemeMenuButton: React.ForwardRefRenderFunction<
	HTMLElement,
	React.PropsWithChildren<MenuButtonHandlerProps>
> = (
	{
		className,
		fulfilled,
		languages,
		currentTheme,
		isOpen,
		isAppMenuOpen,
		label,
		...props
	},
	ref,
) => {
	const localRef = useRef<HTMLButtonElement>(null);
	const { buttonProps } = useButton(props, localRef);

	return (
		<Button
			ref={mergeRefs(localRef, ref)}
			className={className}
			isActive={isOpen}
			fulfilled={fulfilled}
			{...buttonProps}
		>
			<SelectedTheme>
				{currentTheme && (
					<SelectedThemeTextWrapper>
						<ThemeIcon icon={THEME_MENU_OPTIONS[currentTheme].icon} />

						{fulfilled && (
							<SelectedThemeText>
								<LocalTranslation tk={`app_theme.${currentTheme}`} />
							</SelectedThemeText>
						)}
					</SelectedThemeTextWrapper>
				)}
			</SelectedTheme>
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

export const ThemeMenuButton = forwardRef(_ThemeMenuButton);
