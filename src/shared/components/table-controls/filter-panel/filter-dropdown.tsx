import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Text } from 'shared/components/text/text';

const FilterDropdownWrapper = styled.div`
	&:not(:first-child) {
		margin-top: 1.5rem;
	}
`;

const FilterDropdownToggle = styled.button`
	padding: 0;
	border: none;
	background-color: transparent;
`;

const ToggleIcon = styled(Icon)<{ isOpen: boolean }>`
	position: absolute;
	top: 0.3rem;
	left: 0.3rem;

	${({ isOpen }) =>
		isOpen &&
		css`
			transform: rotate(180deg);
		`}
`;

const ToggleLabel = styled(Text)`
	position: relative;
	padding-left: 1.6rem;
	text-transform: capitalize;
`;

const FilterDropdownBody = styled.div`
	padding-top: 0.7rem;
	padding-left: 1.6rem;
`;

interface FilterDropdownProps {
	label: string;
}

export const FilterDropdown: React.FC<
	React.PropsWithChildren<FilterDropdownProps>
> = ({ label, children }) => {
	const [isOpen, setIsOpen] = useState(true);

	const toggleDropdown = () => setIsOpen((prevValue) => !prevValue);

	return (
		<FilterDropdownWrapper>
			<FilterDropdownToggle onClick={toggleDropdown}>
				<ToggleLabel variant="body_3_secondary">
					<ToggleIcon icon={ICON_COLLECTION.chevron_down} isOpen={isOpen} />
					{label}
				</ToggleLabel>
			</FilterDropdownToggle>

			{isOpen && <FilterDropdownBody>{children}</FilterDropdownBody>}
		</FilterDropdownWrapper>
	);
};
