import React from 'react';
import styled from 'styled-components';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { Text } from 'shared/components/text/text';

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 5.7rem;
`;

const NoSearchResultText = styled(Text)`
	max-width: 14.0625rem;
	margin-top: 2rem;
	text-align: center;
`;

export const NoSnapshotResult: React.FC = () => {
	return (
		<Wrapper>
			<Icon icon={ICON_COLLECTION.empty_folder} />
			<NoSearchResultText variant="body_2_primary">
				<LocalTranslation tk="disposition_search_snapshot_results.table.no_result" />
			</NoSearchResultText>
		</Wrapper>
	);
};
