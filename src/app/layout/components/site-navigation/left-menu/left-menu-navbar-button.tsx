import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';
import { NavbarLinkType } from 'app/layout/components/site-navigation/left-menu/left-menu-navbar';
import { MenuItemCurveLine } from 'app/layout/components/site-navigation/left-menu/menu-item-curve-line';
import { MenuItemVerticalLine } from 'app/layout/components/site-navigation/left-menu/menu-item-vertical-line';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';

import { DropdownContainer } from 'shared/components/dropdown/dropdown-container';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { BaseTooltip } from 'shared/components/tooltip/base-tooltip';

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

const MenuItem = styled.li`
	position: relative;

	&:not(:last-child) {
		margin-bottom: 0.5rem;
	}
`;

const NestedMenuItem = styled.li`
	position: relative;
`;

const MenuItemText = styled.span`
	opacity: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	transform: translateX(-20px);
	transition: opacity 0.4s, transform 0.4s ease;
`;

const StyledNavLink = styled(NavLink)<ThemeProps>`
	position: relative;
	display: inline-flex;
	align-items: center;
	width: 100%;
	min-width: 3rem;
	height: 3rem;
	padding: 0 1rem;
	font-size: 0.875rem;
	text-decoration: none;
	font-weight: 700;
	color: ${({ theme }) => theme.app_navigator.nav_link.color};
	background: ${({ theme }) => theme.app_navigator.nav_link.background};

	border-radius: ${({ theme }) => theme.borderRadius.base};
	overflow: hidden;
	transition: background 0.25s, color 0.25s ease;

	&:visited {
		color: ${({ theme }) => theme.app_navigator.nav_link.color};
	}

	&:hover,
	&.active {
		color: ${({ theme }) => theme.app_navigator.active_nav_link.color};
		background: ${({ theme }) =>
			theme.app_navigator.active_nav_link.background};
	}
`;

const NestedNavLink = styled(StyledNavLink)`
	height: 2.85rem;
	background-color: transparent;

	&.active {
		background-color: transparent;
	}
`;

const StyledIcon = styled(Icon)`
	flex-shrink: 0;
	width: 2.75rem;
	margin-left: -0.77rem;
	color: currentColor;
`;

const ToggleIcon = styled(Icon)`
	position: absolute;
	top: 50%;
	right: 0.7rem;
	color: currentColor;
	transform: translateY(-50%);
`;

const PopUpMenuContainer = styled(DropdownContainer)`
	z-index: 11;
`;

export const LeftMenuNavbarButton: React.FC<{
	link: NavbarLinkType;
	isMenuOpen: boolean;
}> = ({ link, isMenuOpen }) => {
	const [isMenuExpanded, setIsMenuExpanded] = useState(false);
	const managePopperState = useManagePopperState({
		placement: 'bottom-start',
		offset: [0, 4],
	});

	useEffectAfterMount(() => {
		if (!isMenuOpen && managePopperState?.isOpen) {
			managePopperState?.toggleMenu(false);
		}
	}, [isMenuOpen]);

	const onClickLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (!link.children) return;

		e.preventDefault();
		if (isMenuOpen) {
			setIsMenuExpanded((prevValue) => !prevValue);
			return;
		}
		managePopperState?.toggleMenu();
	};

	const onClickNestedLink = () => {
		if (isMenuOpen) return;

		managePopperState?.toggleMenu();
	};

	const nestedMenu = link.children ? (
		<NestedMenuList>
			<MenuItemVerticalLine />
			{link.children.map((link) => (
				<NestedMenuItem key={link.label}>
					<MenuItemCurveLine />
					<NestedNavLink to={link.path} onClick={onClickNestedLink}>
						<MenuItemText className="navlink__text">
							<LocalTranslation tk={link.label} />
						</MenuItemText>
					</NestedNavLink>
				</NestedMenuItem>
			))}
		</NestedMenuList>
	) : null;

	return (
		<>
			<MenuItem ref={(ref) => managePopperState?.setReferenceElement(ref)}>
				<BaseTooltip
					text={<LocalTranslation tk={link.label} />}
					placement="right"
					blocked={isMenuOpen}
					target={
						<StyledNavLink to={link.path} onClick={onClickLink}>
							{link.icon && <StyledIcon icon={link.icon} />}
							<MenuItemText className="navlink__text">
								<LocalTranslation tk={link.label} />
							</MenuItemText>
							{isMenuOpen && link.children && (
								<ToggleIcon
									icon={
										isMenuExpanded
											? ICON_COLLECTION.chevron_down
											: ICON_COLLECTION.chevron_right
									}
								/>
							)}
						</StyledNavLink>
					}
				/>
				{isMenuOpen && isMenuExpanded && nestedMenu}
			</MenuItem>
			{!isMenuOpen &&
				managePopperState?.isOpen &&
				ReactDOM.createPortal(
					<PopUpMenuContainer
						ref={(ref) => managePopperState?.setPopperElement(ref)}
						style={managePopperState?.styles.popper}
						{...managePopperState?.attributes.popper}
						p="0"
						pr="0.5rem"
					>
						{nestedMenu}
					</PopUpMenuContainer>,
					document.body,
				)}
		</>
	);
};
