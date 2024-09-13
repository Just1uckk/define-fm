import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';

const NavBar = styled.nav`
	position: sticky;
	top: 0;
`;

const NavBarList = styled.ul`
	margin: 0;
	margin-top: -0.8rem;
	margin-bottom: -0.8rem;
	padding: 0;
	list-style: none;
`;

const NavBarItem = styled.li``;

const StyledNavLink = styled(NavLink)<ThemeProps>`
	--visited-link-color: ${({ theme }) => theme.colors.secondary};

	display: flex;
	align-items: center;
	width: 100%;
	padding: 0.8rem 0;
	font-size: 0.875rem;
	line-height: 1.0625rem;
	text-decoration: none;
	color: ${({ theme }) => theme.colors.secondary};
	background-color: transparent;
	border: none;

	&.active {
		color: ${({ theme }) => theme.colors.primary};
		text-shadow: 1px 0 0 currentColor;
	}
`;

const NestedMenuList = styled.ul`
	position: relative;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 0;
	padding-left: 1.5rem;
	margin-top: 0.3rem;
	list-style: none;
`;

const NestedNavLink = styled(StyledNavLink)`
	position: relative;
	padding-right: 2rem;
`;

const ToggleIcon = styled(Icon)`
	position: absolute;
	top: 50%;
	right: 0.7rem;
	color: currentColor;
	transform: translateY(-50%);
`;

export type SettingNavLink = {
	key: string;
	to: string;
	label: React.ReactNode;
	value: string;
	children?: SettingNavLink[];
};

interface SettingsMenuProps {
	links: SettingNavLink[];
}

const DropdownLink: React.FC<{ link: SettingNavLink }> = ({ link }) => {
	const [isMenuExpanded, setIsMenuExpanded] = useState(false);

	const toggleMenu = () => {
		setIsMenuExpanded((prevValue) => !prevValue);
	};

	return (
		<>
			<NestedNavLink as="button" onClick={toggleMenu}>
				{link.label}
				<ToggleIcon
					icon={
						isMenuExpanded
							? ICON_COLLECTION.chevron_down
							: ICON_COLLECTION.chevron_right
					}
				/>
			</NestedNavLink>

			{isMenuExpanded && (
				<NestedMenuList>
					{link.children?.map((link) => (
						<StyledNavLink key={link.to} to={link.to}>
							{link.label}
						</StyledNavLink>
					))}
				</NestedMenuList>
			)}
		</>
	);
};

export const SettingsMenu: React.FC<
	React.PropsWithChildren<SettingsMenuProps>
> = ({ links, children }) => {
	return (
		<NavBar>
			{children}
			<NavBarList>
				{links.map((link) => (
					<NavBarItem key={link.to}>
						{!link.children && (
							<StyledNavLink to={link.to}>{link.label}</StyledNavLink>
						)}
						{link.children && <DropdownLink link={link} />}
					</NavBarItem>
				))}
			</NavBarList>
		</NavBar>
	);
};
