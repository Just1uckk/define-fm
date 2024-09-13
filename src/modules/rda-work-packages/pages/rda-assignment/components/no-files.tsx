import React from 'react';
import styled from 'styled-components';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { Text } from 'shared/components/text/text';
import { Title, TitleProps } from 'shared/components/title/title';

const Container = styled.div`
	display: flex;
	justify-content: center;
	padding: 3rem 0;
	background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const StyledIcon = styled(Icon)`
	filter: brightness(${({ theme }) => theme.image_brightness});
`;

const ContainerText = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	max-width: 325px;
	margin-left: 1.7rem;
	margin-bottom: 1rem;
	padding-left: 1rem;
`;

const StyledTitle = styled(Title)<TitleProps>`
	margin-bottom: 0.4rem;
`;

const StyledText = styled(Text)`
	opacity: 0.7;
`;

export const NoFiles: React.FC = () => {
	return (
		<Container>
			<StyledIcon icon={ICON_COLLECTION.no_files} />
			<ContainerText>
				<StyledTitle variant="h2_primary">
					<LocalTranslation tk="disposition.table.no_files.title" />
				</StyledTitle>
				<StyledText variant="body_2_primary">
					<LocalTranslation tk="disposition.table.no_files.description" />
				</StyledText>
			</ContainerText>
		</Container>
	);
};
