import React from 'react';
import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';

const Item = styled.li`
	display: flex;
	align-items: center;
`;

const ItemWrapper = styled.span``;

const ItemBodyCss = css<ThemeProps>`
	display: flex;
	align-items: center;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.colors.secondary};
	text-decoration: none;

	&.active {
		cursor: default;
	}

	&:visited {
		color: ${({ theme }) => theme.colors.secondary};
	}
`;

const ItemText = styled.span`
	${ItemBodyCss}
`;

const ItemLink = styled(NavLink)`
	${ItemBodyCss}
`;

const BreadcrumbSeparator = styled(Icon)<ThemeProps>`
	color: ${({ theme }) => theme.colors.secondary};
	margin: 0 1rem;

	svg {
		width: 0.625rem;
		height: 0.625rem;
	}
`;

export const BreadcrumbContainer: React.FC<
	React.PropsWithChildren<{ id?: string }>
> = ({ id, children }) => {
	return <Item id={id}>{children}</Item>;
};

export const Breadcrumb: React.FC<{
	breadcrumb: React.ReactNode;
	path?: string;
	isLast?: boolean;
	containerId?: string;
	isPortalContainer?: boolean;
}> = ({ path, breadcrumb, isLast }) => {
	return (
		<>
			<ItemWrapper>
				{path ? (
					<ItemLink to={path} end>
						{breadcrumb}
					</ItemLink>
				) : (
					<ItemText>{breadcrumb}</ItemText>
				)}
			</ItemWrapper>
			{!isLast && <BreadcrumbSeparator icon={ICON_COLLECTION.chevron_right} />}
		</>
	);
};
