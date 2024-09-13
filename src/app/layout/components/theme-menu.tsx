import React from 'react';
import ReactDOM from 'react-dom';
import { map } from 'lodash';
import { LocalStorageService } from 'shared/services/local-storage-service';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { THEME_TYPES } from 'shared/constants/constans';

import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';

import { DropdownContainer } from 'shared/components/dropdown/dropdown-container';
import { DropdownItem } from 'shared/components/dropdown/dropdown-item';
import { DropdownList } from 'shared/components/dropdown/dropdown-list';
import { DropdownSimpleButton } from 'shared/components/dropdown/dropdown-simple-button';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';

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

const StyledDropdownContainer = styled(DropdownContainer)<{
	fulfilled?: boolean;
}>`
	width: ${({ fulfilled }) => (fulfilled ? '12.625rem' : 'auto')};
	z-index: 11;
`;

const DropdownOptionContent = styled(DropdownSimpleButton)`
	display: flex;
	gap: 0.5rem;
	align-items: center;
`;

const ThemeIcon = styled(Icon)`
	color: currentColor;
`;

const OPTIONS = {
	dark: {
		type: THEME_TYPES.DARK,
		label: 'Dark',
		icon: ICON_COLLECTION.dark,
	},
	system: {
		type: THEME_TYPES.SYSTEM,
		label: 'System',
		icon: ICON_COLLECTION.system_theme,
	},
	light: {
		type: THEME_TYPES.LIGHT,
		label: 'Light',
		icon: ICON_COLLECTION.light,
	},
};

interface LanguageMenuProps {
	className?: string;
	fulfilled?: boolean;
	currentTheme?: THEME_TYPES;
	onChangeTheme: (theme: THEME_TYPES) => void;
}

export const ThemeMenu: React.FC<LanguageMenuProps> = ({
	className,
	fulfilled,
	currentTheme,
	onChangeTheme,
}) => {
	const managePopperState = useManagePopperState({
		placement: 'top-start',
		offset: [0, 4],
	});

	const handleSelectOption = (theme: THEME_TYPES) => {
		onChangeTheme(theme);

		managePopperState.toggleMenu(false);
	};

	return (
		<>
			<Button
				ref={(ref) => managePopperState.setReferenceElement(ref)}
				className={className}
				onClick={() => managePopperState.toggleMenu()}
				isActive={managePopperState.isOpen}
				fulfilled={fulfilled}
			>
				<SelectedTheme>
					{currentTheme && (
						<SelectedThemeTextWrapper>
							<ThemeIcon icon={OPTIONS[currentTheme].icon} />

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
							managePopperState.isOpen
								? ICON_COLLECTION.chevron_top
								: ICON_COLLECTION.chevron_down
						}
					/>
				)}
			</Button>

			{managePopperState.isOpen &&
				ReactDOM.createPortal(
					<StyledDropdownContainer
						ref={(ref) => managePopperState.setPopperElement(ref)}
						className="language-menu-dropdown"
						style={managePopperState.styles.popper}
						{...managePopperState.attributes.popper}
						fulfilled={fulfilled}
					>
						<DropdownList>
							{map(OPTIONS, (theme) => (
								<DropdownItem
									key={theme.type}
									isActive={theme.type === currentTheme}
								>
									<DropdownOptionContent
										onClick={() => handleSelectOption(theme.type)}
									>
										<ThemeIcon icon={theme.icon} />
										{theme.label}
									</DropdownOptionContent>
								</DropdownItem>
							))}
						</DropdownList>
					</StyledDropdownContainer>,
					document.body,
				)}
		</>
	);
};
