import React from 'react';
import { LeftMenuNavbarButton } from 'app/layout/components/site-navigation/left-menu/left-menu-navbar-button';
import { useAppNavigationContext } from 'shared/context/app-navigation-context';
import styled, { css } from 'styled-components';

import { IconProps } from 'shared/components/icon/icon';
import { LocalTranslationProps } from 'shared/components/local-translation/local-translation';

const Menu = styled.nav<{ isMenuOpen: boolean }>`
	${({ isMenuOpen }) =>
		isMenuOpen &&
		css`
			& .navlink__text {
				opacity: 1;
				transform: translateX(0);
			}
		`}
`;

const MenuList = styled.ul`
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 0;
	list-style: none;
`;

export type NavbarLinkType = {
	label: LocalTranslationProps['tk'];
	path: string;
	icon?: IconProps['icon'];
	children?: Array<NavbarLinkType>;
	available?: boolean;
};

interface LeftMenuNavbarProps {
	className?: string;
	isMenuOpen: boolean;
}

export const LeftMenuNavbar: React.FC<LeftMenuNavbarProps> = ({
	className,
	isMenuOpen,
}) => {
	const { navigationLinks } = useAppNavigationContext();

	return (
		<Menu className={className} isMenuOpen={isMenuOpen}>
			<MenuList>
				{navigationLinks.map((link) => (
					<LeftMenuNavbarButton
						isMenuOpen={isMenuOpen}
						key={link.label}
						link={link}
					/>
				))}
			</MenuList>
		</Menu>
	);
};
