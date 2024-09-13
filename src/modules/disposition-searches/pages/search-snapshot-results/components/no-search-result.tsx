import React from 'react';
import styled from 'styled-components';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
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

export const NoSnapshotSearchResult: React.FC = () => {
	return (
		<Wrapper>
			<Icon icon={ICON_COLLECTION.empty_folder} />
			<NoSearchResultTitle variant="h2_primary_semibold">
				<LocalTranslation tk="disposition_search_snapshot_results.table.no_search_result.title" />
			</NoSearchResultTitle>
			<NoSearchResultText variant="body_2_primary">
				<LocalTranslation tk="disposition_search_snapshot_results.table.no_search_result.sub_title" />
			</NoSearchResultText>
		</Wrapper>
	);
};
