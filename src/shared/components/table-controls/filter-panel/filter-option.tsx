import React from 'react';
import { isImage } from 'shared/utils/utils';
import styled from 'styled-components';

import { Checkbox, CheckboxProps } from 'shared/components/checkbox/checkbox';
import { Image } from 'shared/components/image/image';

const FilterOptionWrap = styled.div`
	&:not(:first-child) {
		margin-top: 0.875rem;
	}
`;

const FilterOptionLabelWrap = styled.div`
	position: relative;
	display: flex;
	align-items: flex-start;
`;

const FilterOptionLabel = styled.span`
	margin-top: 0.15rem;
	text-transform: capitalize;
`;

const StyledCheckbox = styled(Checkbox)`
	input:checked ~ label ${FilterOptionLabel} {
		text-shadow: 1px 0 0 currentColor;
	}
`;

const ImageValue = styled(Image)`
	width: 24px;
`;

const FilterOptionCounter = styled.div`
	flex-shrink: 0;
	padding: 0.155rem 0.473rem;
	margin-left: 0.4rem;
	font-size: 0.6875rem;
	line-height: 1rem;
	font-weight: 600;
	border-radius: ${({ theme }) => theme.borderRadius.base};
	color: ${({ theme }) => theme.tabs.tabCounter.color};
	background-color: ${({ theme }) => theme.tabs.tabCounter.backgroundColor};
`;

interface FilterOptionProps extends CheckboxProps {
	filterCount: number | string;
	label: string;
}

export const FilterOption: React.FC<FilterOptionProps> = ({
	label,
	filterCount,
	checked,
	...props
}) => {
	return (
		<FilterOptionWrap>
			<StyledCheckbox
				{...props}
				checked={checked}
				label={
					<FilterOptionLabelWrap>
						<FilterOptionLabel>
							{isImage(label) ? <ImageValue src={label} alt={label} /> : label}
						</FilterOptionLabel>
						<FilterOptionCounter>{filterCount}</FilterOptionCounter>
					</FilterOptionLabelWrap>
				}
			/>
		</FilterOptionWrap>
	);
};
