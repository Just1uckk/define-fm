import React, { ComponentType, forwardRef, PropsWithRef, useRef } from 'react';
import { AriaButtonProps, useButton } from 'react-aria';
import clsx from 'clsx';
import mergeRefs from 'shared/utils/merge-refs';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Text } from 'shared/components/text/text';

const StyledButton = styled.button`
	border: none;
	background-color: transparent;
	padding: 0;
	margin: 0;
`;

const ChevronDownIcon = styled(Icon)<{ isActive: boolean } & ThemeProps>`
	margin-right: 0.6rem;

	${({ isActive, theme }) =>
		isActive &&
		css`
			color: ${theme.colors.accent};
		`}
`;

export interface MenuButtonHandlerProps
	extends AriaButtonProps,
		PropsWithRef<any> {
	className?: string;
	tag?: string | ComponentType<any>;
	isOpen?: boolean;
}

const MenuButtonHandlerRoot: React.ForwardRefRenderFunction<
	HTMLElement,
	React.PropsWithChildren<MenuButtonHandlerProps>
> = ({ className, tag, isOpen, children, ...props }, ref) => {
	const localRef = useRef<HTMLButtonElement>(null);
	const { buttonProps } = useButton(props, localRef);

	return (
		<StyledButton
			ref={mergeRefs(localRef, ref)}
			as={tag}
			className={clsx(className, { 'is-open': isOpen })}
			{...buttonProps}
		>
			<ChevronDownIcon
				isActive={!!isOpen}
				icon={
					isOpen ? ICON_COLLECTION.chevron_top : ICON_COLLECTION.chevron_down
				}
			/>
			<Text tag="span" variant="body_3_primary">
				{children}
			</Text>
		</StyledButton>
	);
};

export const MenuButtonHandler = forwardRef(MenuButtonHandlerRoot);
