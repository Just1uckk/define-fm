import React, { InputHTMLAttributes } from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Text, TextProps } from 'shared/components/text/text';

const Option = styled.label`
	display: block;
	cursor: pointer;
`;

const OptionWrapper = styled.div<ThemeProps>`
	padding: 0.5rem 1rem;
`;

const StyledText = styled(Text)<TextProps>`
	color: inherit;
`;

const OptionInput = styled.input<ThemeProps>`
	position: absolute;
	clip: rect(0 0 0 0);
	width: 1px;
	height: 1px;
	margin: -1px;
`;

interface DropdownRadioOptionProps {
	name: InputHTMLAttributes<HTMLInputElement>['name'];
	value: InputHTMLAttributes<HTMLInputElement>['value'];
	checked: InputHTMLAttributes<HTMLInputElement>['checked'];
	onChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
	onClick?: InputHTMLAttributes<HTMLInputElement>['onClick'];
}

export const DropdownRadioOption: React.FC<
	React.PropsWithChildren<DropdownRadioOptionProps>
> = ({ name, value, checked, onChange, onClick, children }) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!onChange) return;

		onChange(e);
	};

	return (
		<Option>
			<OptionInput
				type="radio"
				name={name}
				value={value}
				checked={checked}
				onChange={handleChange}
				onClick={onClick}
			/>
			<OptionWrapper>
				<StyledText variant="body_3_primary">{children}</StyledText>
			</OptionWrapper>
		</Option>
	);
};
