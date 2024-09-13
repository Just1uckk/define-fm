import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';
import styled from 'styled-components';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';
import { Text } from 'shared/components/text/text';

const Wrapper = styled(TableControlWrapper)`
	border: none;
`;

const FilterIcon = styled(Icon)`
	margin-right: 0.5rem;
`;

interface FilterButtonProps {
	isActive: boolean;
	onClick: HTMLAttributes<HTMLButtonElement>['onClick'];
}

export const FilterButton: React.FC<FilterButtonProps> = ({
	isActive,
	onClick,
}) => {
	return (
		<Wrapper
			as="button"
			className={clsx({ 'is-active': isActive })}
			onClick={onClick}
		>
			<FilterIcon icon={ICON_COLLECTION.filter} />
			<Text tag="span" variant="body_3_primary">
				<LocalTranslation tk="components.filter_button.button" />
			</Text>
		</Wrapper>
	);
};
