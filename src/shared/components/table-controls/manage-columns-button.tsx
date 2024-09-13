import React from 'react';
import styled from 'styled-components';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
import { Text } from 'shared/components/text/text';

const Wrapper = styled(TableControlWrapper)`
	border: none;
`;

const StyledIcon = styled(Icon)`
	margin-right: 0.5rem;
`;

interface ManageColumnsButtonProps {
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ManageColumnsButton: React.FC<ManageColumnsButtonProps> = ({
	onClick,
}) => {
	return (
		<Wrapper as="button" onClick={onClick}>
			<StyledIcon icon={ICON_COLLECTION.manage_columns} />
			<Text tag="span" variant="body_3_primary">
				<LocalTranslation tk="components.manage_columns.button" />
			</Text>
		</Wrapper>
	);
};
