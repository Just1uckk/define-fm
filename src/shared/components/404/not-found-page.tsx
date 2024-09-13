import React from 'react';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { DASHBOARD_ROUTES } from 'shared/constants/routes';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';

const NotFoundPageGlobalStyles = createGlobalStyle`
	#page-breadcrumbs {
		display: none;
	}
`;

const Container = styled.div`
	display: flex;
	align-items: center;
	flex-direction: column;
	padding-top: 5.5rem;
	height: 100%;
`;

const StyledIcon = styled(Icon)`
	max-width: 40.6875rem;

	svg {
		width: 100%;
		height: auto;
	}
`;

const StyledTitle = styled(Title)`
	margin-top: 3.125rem;
`;

const HomeLink = styled(Link)<ThemeProps>`
	margin-top: 0.75rem;
	color: ${({ theme }) => theme.colors.accent};
	text-decoration: none;
	border-bottom: 1px solid ${({ theme }) => theme.colors.accent};

	& * {
		color: ${({ theme }) => theme.colors.accent};
	}
`;

export const NotFoundPage: React.FC = () => {
	return (
		<>
			<NotFoundPageGlobalStyles />
			<Container>
				<StyledIcon icon={ICON_COLLECTION.not_found} />

				<StyledTitle variant="h1_primary_bold">
					<LocalTranslation tk="not_found.title" />
				</StyledTitle>
				<HomeLink to={DASHBOARD_ROUTES.MAIN.path}>
					<Text variant="body_2_primary">
						<LocalTranslation tk="not_found.back_to_home_button" />
					</Text>
				</HomeLink>
			</Container>
		</>
	);
};
