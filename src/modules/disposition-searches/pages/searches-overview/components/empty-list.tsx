import React from 'react';
import styled from 'styled-components';

import { useTranslation } from 'shared/hooks/use-translation';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 5.7rem;
`;

const NoSearchResultTitle = styled(Title)`
	margin-top: 2rem;
`;

const NoSearchResultText = styled(Text)`
	max-width: 14.0625rem;
	margin-top: 0.75rem;
	text-align: center;
`;

export const EmptyList: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Wrapper>
			<Icon icon={ICON_COLLECTION.empty_folder} />
			<NoSearchResultTitle variant="h2_primary_semibold">
				{t('disposition_searches.table.no_results.title')}
			</NoSearchResultTitle>
			<NoSearchResultText variant="body_2_primary">
				{t('disposition_searches.table.no_results.desc')}
			</NoSearchResultText>
		</Wrapper>
	);
};
