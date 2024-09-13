import React from 'react';
import styled from 'styled-components';

import { Icon, IconProps } from 'shared/components/icon/icon';

const StyledIcon = styled(Icon)`
	color: ${({ theme }) => theme.textEditor.toolbarItem.color};
`;

const Wrapper = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.5rem;
	height: 1.5rem;
	padding: 0;
	border: 0;
	border-radius: 0.25rem;
	background-color: transparent;
	color: ${({ theme }) => theme.textEditor.toolbarItem.color};

	&.ql-active {
		background: ${({ theme }) => theme.textEditor.toolbarItem.active.bg};

		${StyledIcon} {
			color: ${({ theme }) => theme.textEditor.toolbarItem.active.color};
		}
	}

	&:focus-visible {
		outline: rgb(16, 16, 16) auto 1px;
		outline: -webkit-focus-ring-color auto 1px;
	}
`;

interface ButtonProps {
	className?: string;
	value?: string;
	icon?: IconProps['icon'];
}

export const Button: React.FC<ButtonProps> = ({ icon, value, className }) => (
	<Wrapper className={className} value={value} type="button">
		{icon && <StyledIcon icon={icon} />}
	</Wrapper>
);
