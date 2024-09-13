import React, { Key, useMemo } from 'react';
import { Item } from 'react-stately';
import styled from 'styled-components';

import { ICoreLang } from 'shared/types/core-config';

import { useTranslation } from 'shared/hooks/use-translation';

import { DropdownSimpleButton } from 'shared/components/dropdown/dropdown-simple-button';
import {
	MenuButton,
	MenuButtonProps,
} from 'shared/components/menu-button/menu-button';

import { LangMenuButton } from './lang-menu-button';

const StyledMenuButton = styled(MenuButton)<{
	fulfilled?: boolean;
}>`
	width: ${({ fulfilled }) => (fulfilled ? '12.625rem' : 'auto')};
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
	const { t } = useTranslation();

	const handleSelectOption = (key: Key) => {
		const searchId = languages.find((element: ICoreLang) => {
			if (element.id === Number(key)) {
				return true;
			}

			return false;
		});
		onChangeLang(searchId!);
	};

	const selectedLangOption = useMemo(() => {
		return languages.find((l) => l.code === currentLang);
	}, [languages, currentLang]);

	return (
		<StyledMenuButton<React.ComponentType<MenuButtonProps<ICoreLang>>>
			items={languages}
			onAction={handleSelectOption}
			closeOnSelect
			placement="top start"
			fulfilled={fulfilled}
			handler={
				<LangMenuButton
					className={className}
					fulfilled={fulfilled}
					label={
						fulfilled && selectedLangOption
							? selectedLangOption.name
							: t(`language_abbreviation.${currentLang}`)
					}
				/>
			}
		>
			{({ id, name, code }) => (
				<Item key={id} textValue={name as string}>
					<DropdownSimpleButton isActive={selectedLangOption?.code === code}>
						{name}
					</DropdownSimpleButton>
				</Item>
			)}
		</StyledMenuButton>
	);
};
