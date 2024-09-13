import React from 'react';
import styled from 'styled-components';

import { Button, ButtonProps } from 'shared/components/button/button';

const StyledButton = styled(Button)<DropdownButtonProps>`
	& {
		width: 100%;
		height: 2.125rem;
		padding: 0.3rem 0.8rem;
		font-size: 0.875rem;
		line-height: 1.125rem;
		font-weight: 400;

		&.loading {
			& .button__content {
				opacity: 0.4;
			}
		}

		&:hover {
			background-color: ${({ theme }) =>
				theme.dropdownOption.active.backgroundColor};
			color: ${({ theme }) => theme.dropdownOption.active.color};
			text-shadow: 1px 0 0 currentColor;
		}

		& .button__spinner {
			width: 1.2rem;
			height: 1.2rem;
		}
	}
`;

export type DropdownButtonProps = ButtonProps;

export const DropdownButton: React.FC<DropdownButtonProps> = (props) => {
	return <StyledButton {...props} />;
};
