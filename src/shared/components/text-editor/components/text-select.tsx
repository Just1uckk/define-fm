import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';

import { DropdownContainer } from 'shared/components/dropdown/dropdown-container';
import { DropdownItem } from 'shared/components/dropdown/dropdown-item';
import { DropdownList } from 'shared/components/dropdown/dropdown-list';
import { DropdownRadioOption } from 'shared/components/dropdown/dropdown-radio-option';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Text, TextProps } from 'shared/components/text/text';
import { TextTypes } from 'shared/components/text-editor/components/toolbar';

const Wrapper = styled.button<ThemeProps>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-width: 5.6rem;
	height: 1.5rem;
	padding: 0 0.25rem;
	margin: 0;
	flex-shrink: 0;
	color: ${({ theme }) => theme.primary};
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: none;

	&:focus-visible {
		outline: rgb(16, 16, 16) auto 1px;
		outline: -webkit-focus-ring-color auto 1px;
	}
`;

const ChevronDownIcon = styled(Icon)`
	margin-left: 0.6rem;
`;

const StyledDropdownContainer = styled(DropdownContainer)`
	min-width: 6.25rem;
	z-index: 12;
`;
const OptionText = styled(Text)<TextProps>`
	&.header_1 {
		font-size: 1.25rem;
		line-height: 1.25rem;
	}
	&.header_2 {
		font-size: 1.125rem;
		line-height: 1.125rem;
	}
	&.header_3 {
		font-size: 1rem;
		line-height: 1rem;
	}
	&.paragraph {
		font-size: 0.875rem;
		line-height: 0.875rem;
	}
`;

const SELECT_OFFSET = [-8, 8] as [number, number];

const STYLED_TEXT: Record<TextTypes, string> = {
	header_1: 'header_1',
	header_2: 'header_2',
	header_3: 'header_3',
	paragraph: 'paragraph',
};

interface TextSelectProps {
	value: string;
	options: Array<{ label: string; name: string; value: string }>;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextSelect: React.FC<TextSelectProps> = ({
	value,
	options,
	onChange,
}) => {
	const managePopperState = useManagePopperState({
		offset: SELECT_OFFSET,
		placement: 'bottom-start',
	});

	const currentValue = value
		? options.find((option) => option.value === value)
		: null;

	return (
		<>
			<Wrapper
				type="button"
				onClick={() => managePopperState.toggleMenu()}
				ref={(ref) => managePopperState.setReferenceElement(ref)}
			>
				<Text tag="span" variant="body_3_primary">
					{currentValue ? currentValue.label : ''}
				</Text>
				<ChevronDownIcon icon={ICON_COLLECTION.chevron_down} />
			</Wrapper>
			{managePopperState.isOpen &&
				ReactDOM.createPortal(
					<StyledDropdownContainer
						style={managePopperState.styles.popper}
						{...managePopperState.attributes.popper}
						ref={(ref) => managePopperState.setPopperElement(ref)}
					>
						<DropdownList>
							{options.map((option) => (
								<DropdownItem key={option.value}>
									<DropdownRadioOption
										name={option.name}
										value={option.value}
										checked={value === option.value}
										onChange={onChange}
									>
										<OptionText
											as="span"
											variant="body_3_primary"
											className={STYLED_TEXT[option.value]}
										>
											{option.label}
										</OptionText>
									</DropdownRadioOption>
								</DropdownItem>
							))}
						</DropdownList>
					</StyledDropdownContainer>,
					document.body,
				)}
		</>
	);
};
