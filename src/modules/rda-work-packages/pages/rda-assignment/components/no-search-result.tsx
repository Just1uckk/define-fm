import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { Text } from 'shared/components/text/text';
import { Title, TitleProps } from 'shared/components/title/title';

const Container = styled.div<ThemeProps>`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 4.9rem;
	padding-bottom: 4.9rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const ContainerText = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	max-width: 362px;
	margin-top: 1.9rem;
	text-align: center;
`;

const StyledTitle = styled(Title)<TitleProps>`
	margin-bottom: 0.4rem;
`;

const StyledText = styled(Text)`
	opacity: 0.7;
`;

export const NoFilesSearchResult: React.FC = () => {
	return (
		<Container>
			<Icon icon={ICON_COLLECTION.no_file_search_result} />
			<ContainerText>
				<StyledTitle variant="h2_primary">
					<LocalTranslation tk="disposition.table.no_search_results.title" />
				</StyledTitle>
				<StyledText variant="body_2_primary">
					<LocalTranslation tk="disposition.table.no_search_results.description" />
				</StyledText>
			</ContainerText>
		</Container>
	);
};
