import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { DASHBOARD_ROUTES } from 'shared/constants/routes';

import {
	Breadcrumb,
	BreadcrumbContainer,
} from 'shared/components/breadcrumbs/breadcrumb';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';

const Container = styled.div`
	display: flex;
	align-items: center;
`;

const List = styled.ul`
	display: flex;
	padding: 0;
	padding-top: 0.3rem;
	margin: 0;
	list-style: none;
`;

const HomeIcon = styled(Icon)<ThemeProps>`
	width: 1.5rem;
	height: 1.5rem;
	margin-right: 0.5rem;
	padding: 0.35rem;
	color: ${({ theme }) => theme.colors.accent};
	background-color: ${({ theme }) => theme.colors.blue.secondary_inverted};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
`;

export const BREADCRUMB_CONTAINER = 'BREADCRUMB_CONTAINER';

const HomeLink: React.FC = () => {
	return (
		<>
			<HomeIcon icon={ICON_COLLECTION.home} />{' '}
			<LocalTranslation tk="breadcrumbs.home" />
		</>
	);
};

export const Breadcrumbs: React.FC = () => {
	return (
		<Container id="page-breadcrumbs">
			<List>
				<Breadcrumb
					path={DASHBOARD_ROUTES.MAIN.path}
					breadcrumb={<HomeLink />}
					isPortalContainer={false}
					isLast={false}
				/>
				<BreadcrumbContainer id={BREADCRUMB_CONTAINER} />
			</List>
		</Container>
	);
};
