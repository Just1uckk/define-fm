import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { ICoreLang } from 'shared/types/core-config';

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

const SelectedLang = styled.span`
	flex-grow: 1;
	flex-shrink: 0;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.colors.secondary};
	text-overflow: ellipsis;
	white-space: nowrap;
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

const StyledDropdownContainer = styled(DropdownContainer)<{
	fulfilled: boolean;
}>`
	width: ${({ fulfilled }) => (fulfilled ? '12.625rem' : 'auto')};
	z-index: 11;
`;

const DropdownOptionContent = styled(DropdownSimpleButton)`
	display: flex;
	align-items: center;
`;

interface LanguageMenuProps {
	className?: string;
	fulfilled: boolean;
	languages: ICoreLang[];
	currentLang: ICoreLang['code'];
	onChangeLang: (lang: ICoreLang) => void;
}

export const LanguageMenu: React.FC<LanguageMenuProps> = ({
	className,
	fulfilled,
	languages,
	currentLang,
	onChangeLang,
}) => {
	const managePopperState = useManagePopperState({
		placement: 'top-start',
		offset: [0, 4],
	});

	const filteredLanguages = useMemo(() => {
		return languages.filter((l) => l.enabled);
	}, [languages]);

	const selectedLangOption = useMemo(() => {
		return languages.find((l) => l.code === currentLang);
	}, [languages, currentLang]);

	const handleSelectOption = (lang: ICoreLang) => {
		onChangeLang(lang);
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
				<SelectedLang>
					{fulfilled && selectedLangOption ? (
						selectedLangOption.name
					) : (
						<LocalTranslation tk={`language_abbreviation.${currentLang}`} />
					)}
				</SelectedLang>
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
							{filteredLanguages.map((lang) => (
								<DropdownItem
									key={lang.id}
									isActive={lang.code === currentLang}
								>
									<DropdownOptionContent
										onClick={() => handleSelectOption(lang)}
									>
										{lang.name}
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
