import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageMenu } from 'app/layout/components/language-menu/language-menu';
import { LeftMenuNavbar } from 'app/layout/components/site-navigation/left-menu/left-menu-navbar';
import { ThemeMenu } from 'app/layout/components/theme-menu/theme-menu';
import LogoImg from 'shared/assets/images/logo.svg';
import { ScrollStyles } from 'shared/reusable-styles';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { ICoreLang } from 'shared/types/core-config';

import { THEME_TYPES } from 'shared/constants/constans';
import { DASHBOARD_ROUTES } from 'shared/constants/routes';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Image } from 'shared/components/image/image';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { Text } from 'shared/components/text/text';

const LogoWrapper = styled(Link)`
	display: inline-block;
	max-width: 3rem;
	margin-bottom: 1.4rem;
	transition: margin-left 0.3s ease;
`;

const Logo = styled(Image)``;

const StyledLeftMenuNavbar = styled(LeftMenuNavbar)`
	transition: padding-left 0.3s ease;
`;

const StyledLeftMenuLanguage = styled(LanguageMenu)`
	margin-top: auto;
	transition: padding-left 0.3s ease;
`;

const ToggleMenuButton = styled.button<ThemeProps>`
	display: flex;
	align-items: center;
	flex-grow: 1;
	padding: 0;
	margin-top: auto;
	margin-left: 0.9rem;
	color: ${({ theme }) => theme.colors.secondary};
	background-color: transparent;
	border: none;
	cursor: pointer;
	transition: margin-left 0.3s ease;

	&:hover {
		color: ${({ theme }) => theme.colors.accent};
	}
`;

const ToggleMenuButtonText = styled(Text)`
	margin-left: 0.8rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: currentColor;
	opacity: 0;
	transform: translateX(-15px);
	transition: color 0.3s, opacity 0.4s, transform 0.4s ease;
`;

const ToggleMenuButtonIcon = styled(Icon)`
	color: currentColor;
	border-radius: 50%;
	background-color: ${({ theme }) => theme.colors.borderColorPrimary};
	transition: transform 0.3s ease;

	svg {
		padding: 0.45rem;
		width: 1.5rem;
		height: 1.5rem;

		path {
			transition: fill 0.3s ease;
		}
	}
`;

const LeftMenuContainer = styled.div<{ isOpen: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	width: 4rem;
	padding: 1.5rem 0.42rem;
	padding-bottom: 1.2rem;
	background-color: ${({ theme }) => theme.app_navigator.background};
	transition: width 0.3s ease;
	z-index: 11;
	overflow-y: auto;
	overflow-x: hidden;
	${ScrollStyles}

	${({ isOpen }) =>
		isOpen &&
		css`
			width: 16rem;

			${LogoWrapper} {
				margin-left: 1.45rem;
			}

			${StyledLeftMenuNavbar} {
				padding-left: 0.55rem;
				padding-right: 0.55rem;
			}

			${ToggleMenuButton} {
				margin-left: 1.5rem;
			}

			${ToggleMenuButtonText} {
				opacity: 1;
				transform: translateX(0);
			}

			${ToggleMenuButton} svg {
				transform: rotate(180deg);
			}
		`};
`;

const LeftMenuContainerTop = styled.div`
	display: flex;
	flex-direction: column;
	min-width: 0;
`;

const LeftMenuContainerMiddle = styled.div`
	display: flex;
	align-items: flex-start;
	height: 56px;
	flex-grow: 56;
	padding-top: 2rem;
	padding-bottom: 2.8rem;
	min-width: 0;
`;

const LeftMenuContainerBottom = styled.div`
	display: flex;
	flex-direction: column;
	margin-top: auto;
`;

interface LeftMenuProps {
	isOpen: boolean;
	onChange: () => void;
	languages: ICoreLang[];
	currentLang: ICoreLang['code'];
	userTheme: THEME_TYPES;
	onChangeLang: (lang: ICoreLang) => void;
	onChangeTheme: (themeType: THEME_TYPES) => void;
}

export const LeftMenu: React.FC<LeftMenuProps> = ({
	isOpen,
	languages,
	userTheme,
	currentLang,
	onChangeLang,
	onChangeTheme,
	onChange,
}) => {
	const handleChangeTheme = (theme: THEME_TYPES) => {
		onChangeTheme(theme);
	};

	return (
		<LeftMenuContainer isOpen={isOpen}>
			<LeftMenuContainerTop>
				<LogoWrapper to={DASHBOARD_ROUTES.MAIN.path}>
					<Logo src={LogoImg} alt="cassia" />
				</LogoWrapper>

				<StyledLeftMenuNavbar isMenuOpen={isOpen} />
			</LeftMenuContainerTop>

			<LeftMenuContainerMiddle>
				<ToggleMenuButton onClick={onChange}>
					<ToggleMenuButtonIcon icon={ICON_COLLECTION.chevron_right} />
					<ToggleMenuButtonText variant="body_3_secondary">
						<LocalTranslation tk="site_navigation_menu.actions.toggle_menu" />
					</ToggleMenuButtonText>
				</ToggleMenuButton>
			</LeftMenuContainerMiddle>

			<LeftMenuContainerBottom>
				<ThemeMenu
					fulfilled={isOpen}
					currentTheme={userTheme}
					onChangeTheme={handleChangeTheme}
				/>

				<StyledLeftMenuLanguage
					currentLang={currentLang}
					languages={languages}
					onChangeLang={onChangeLang}
					fulfilled={isOpen}
				/>
			</LeftMenuContainerBottom>
		</LeftMenuContainer>
	);
};
