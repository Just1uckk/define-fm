import React from 'react';
import { DISPOSITION_CARD_VIEW_TYPES } from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/disposition-card/disposition-card';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { TableControlWrapper } from 'shared/components/table-controls/control-wrapper';

const Wrapper = styled(TableControlWrapper)`
	padding: 0.2rem 0.4rem;
`;

const StyledIcon = styled(Icon)`
	color: currentColor;
`;

const ChangeViewButton = styled.button<ThemeProps & { isActive: boolean }>`
	display: inline-flex;
	align-items: center;
	padding: 0.6rem;
	color: ${({ theme }) => theme.colors.secondary};
	border: none;
	background-color: transparent;
	${({ isActive }) =>
		isActive &&
		css`
			color: ${({ theme }) => theme.colors.accent};
		`}

	& + & {
		margin-left: 0.6rem;
	}
`;

interface ViewTableToggleProps {
	active: DISPOSITION_CARD_VIEW_TYPES;
	onChange: (view: DISPOSITION_CARD_VIEW_TYPES) => void;
}

export const ViewTableToggle: React.FC<ViewTableToggleProps> = ({
	active,
	onChange,
}) => {
	return (
		<Wrapper>
			<ChangeViewButton
				isActive={active === DISPOSITION_CARD_VIEW_TYPES.ROW}
				onClick={() => onChange(DISPOSITION_CARD_VIEW_TYPES.ROW)}
			>
				<StyledIcon icon={ICON_COLLECTION.navigation} />
			</ChangeViewButton>
			<ChangeViewButton
				isActive={active === DISPOSITION_CARD_VIEW_TYPES.CARD}
				onClick={() => onChange(DISPOSITION_CARD_VIEW_TYPES.CARD)}
			>
				<StyledIcon icon={ICON_COLLECTION.dashboard} />
			</ChangeViewButton>
		</Wrapper>
	);
};
