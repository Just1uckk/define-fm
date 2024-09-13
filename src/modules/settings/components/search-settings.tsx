import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';
import { useTranslation } from 'shared/hooks/use-translation';

import { DropdownContainer } from 'shared/components/dropdown/dropdown-container';
import { DropdownItem } from 'shared/components/dropdown/dropdown-item';
import { DropdownList } from 'shared/components/dropdown/dropdown-list';
import { DropdownSimpleButton } from 'shared/components/dropdown/dropdown-simple-button';
import {
	SearchBar,
	SearchBarProps,
} from 'shared/components/search-bar/search-bar';
import { Text } from 'shared/components/text/text';

const Wrapper = styled.div`
	position: relative;
	margin-bottom: 1.5rem;
`;

const StyledDropdownContainer = styled(DropdownContainer)`
	width: 100%;
	padding: 0.8rem 0.5rem;
`;

const StyledDropdownSimpleButton = styled(DropdownSimpleButton)<ThemeProps>`
	word-break: break-word;

	&:hover {
		background-color: ${({ theme }) => theme.colors.blue.secondary_inverted};
	}

	& .match-search-result {
		text-shadow: 1px 0 0 currentColor;
	}
`;

const StyledDropdownList = styled(DropdownList)`
	max-height: 11rem;
	overflow-y: auto;
`;

export type SearchSettingsOption = {
	key: string;
	link: string;
	anchor: string;
	fieldName: string;
	pageName: string;
};

interface SearchSettingsBarProps extends Pick<SearchBarProps, 'fulfilled'> {
	options: SearchSettingsOption[];
}

export const SearchSettingsBar: React.FC<SearchSettingsBarProps> = ({
	options,
	fulfilled,
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const managePopperState = useManagePopperState({ placement: 'bottom' });

	const [search, setSearch] = useState('');
	const fuse = useRef(
		new Fuse<SearchSettingsOption>([], {
			keys: ['fieldName'],
			threshold: 0.2,
			distance: 70,
		}),
	);

	useEffect(() => {
		fuse.current.setCollection(options);
	}, [options]);

	const onSearch = async (value: string) => {
		setSearch(value);
	};

	const searchResult = useMemo(() => fuse.current.search(search), [search]);

	const onFocus = () => {
		managePopperState.toggleMenu(true);
	};

	const onClear = () => setSearch('');

	const onSelectOption = (option: SearchSettingsOption) => {
		navigate(option.link);
		managePopperState.toggleMenu(false);

		setTimeout(() => {
			const fieldElement = document.querySelector(
				`[data-search-field-name="${option.anchor}"]`,
			) as HTMLDivElement;
			if (!fieldElement) return;
			document
				.querySelector('.setting-option-highlighted')
				?.classList.remove('setting-option-highlighted');
			fieldElement.scrollIntoView({ behavior: 'smooth' });

			fieldElement.classList.add('setting-option-highlighted');

			setTimeout(() => {
				fieldElement.classList.remove('setting-option-highlighted');
			}, 3000);
		}, 0);
	};

	const createHighlightedLetter = (search: string, text: string) => {
		return text.replace(
			new RegExp(search, 'gi'),
			(str) => `<span class="match-search-result">${str}</span>`,
		);
	};

	return (
		<Wrapper>
			<SearchBar
				ref={(ref) => managePopperState.setReferenceElement(ref)}
				placeholder={t('settings.search_for_settings')}
				value={search}
				onChange={onSearch}
				onFocus={onFocus}
				onClear={onClear}
				fulfilled={fulfilled}
			/>

			{!!search.trim().length &&
				!!searchResult.length &&
				managePopperState.isOpen && (
					<StyledDropdownContainer
						ref={(ref) => managePopperState.setPopperElement(ref)}
						style={managePopperState.styles.popper}
						{...managePopperState.attributes.popper}
					>
						<StyledDropdownList>
							{searchResult.map((option) => (
								<DropdownItem key={option.item.fieldName}>
									<StyledDropdownSimpleButton
										onClick={() => onSelectOption(option.item)}
									>
										<Text variant="body_3_primary">
											<span
												dangerouslySetInnerHTML={{
													__html: createHighlightedLetter(
														search,
														option.item.fieldName,
													),
												}}
											/>
										</Text>
										<Text variant="body_4_secondary">
											{option.item.pageName}
										</Text>
									</StyledDropdownSimpleButton>
								</DropdownItem>
							))}
						</StyledDropdownList>
					</StyledDropdownContainer>
				)}
		</Wrapper>
	);
};
