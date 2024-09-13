import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IGroup } from 'shared/types/group';

import { Button } from 'shared/components/button/button';
import { CloseButton } from 'shared/components/button/close-button';
import { CountBadge } from 'shared/components/count-badge/count-badge';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';

const Container = styled.div`
	flex-shrink: 0;
	width: 100%;
	max-width: 21.25rem;
	padding: 1.5rem;
	margin-left: 2rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const PanelTop = styled.div`
	display: flex;
	justify-content: space-between;
`;

const PanelTopLeft = styled.div`
	margin-right: 1rem;
`;

const PanelTitle = styled(Text)`
	display: flex;
	align-items: center;
`;

const StyledCountBadge = styled(CountBadge)`
	margin-left: 0.7rem;
	color: ${({ theme }) => theme.tabs.tabCounterActive.color};
	background-color: ${({ theme }) =>
		theme.tabs.tabCounterActive.backgroundColor};
`;

const PanelBottom = styled.div`
	margin-top: 0.6rem;
`;

const GroupButton = styled(Button)<ThemeProps>`
	position: relative;
	width: 100%;
	padding-left: 0;
	padding-right: 0;

	&::after {
		content: '';
		position: absolute;
		top: calc(100% + 2px);
		left: 0;
		width: 100%;
		height: 1px;
		background-color: ${({ theme }) => theme.groupButton.borderColor};
		opacity: 0.3;
	}

	& + & {
		margin-left: 0;
		margin-top: 0.3rem;
	}

	.button__content {
		flex-grow: 1;
		justify-content: space-between;
	}

	.button__content-label {
		flex-grow: 1;
	}

	svg {
		width: 0.75rem;
		height: 0.75rem;
	}
`;

const GroupNameText = styled(Text)`
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 0.8125rem;
`;

interface UserGroupPanelProps {
	isLoadingData?: boolean;
	username: string;
	groups?: IGroup[];
	onClickGroup: (IGroup) => void;
	onClosePanel?: () => void;
}

export const UserGroupPanel: React.FC<UserGroupPanelProps> = ({
	isLoadingData,
	username,
	groups = [],
	onClickGroup,
	onClosePanel,
}) => {
	return (
		<Container>
			<PanelTop>
				<PanelTopLeft>
					<PanelTitle variant="body_1_primary_semibold">
						Groups <StyledCountBadge>{groups?.length}</StyledCountBadge>
					</PanelTitle>
					<Text variant="body_4_secondary" mt="0.6rem">
						{username}
					</Text>
				</PanelTopLeft>

				<CloseButton onClick={onClosePanel} />
			</PanelTop>
			<PanelBottom>
				{isLoadingData && <Spinner />}

				{!isLoadingData &&
					groups.map((group) => (
						<GroupButton
							key={group.id}
							variant="primary_ghost"
							icon={ICON_COLLECTION.chevron_right}
							iconPlace="right"
							label={
								<GroupNameText variant="body_4_primary_semibold">
									{group.name}
								</GroupNameText>
							}
							onClick={() => onClickGroup(group)}
						/>
					))}
			</PanelBottom>
		</Container>
	);
};
