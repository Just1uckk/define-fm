import React from 'react';
import styled from 'styled-components';

import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { Text } from 'shared/components/text/text';

const Container = styled.div`
	flex-shrink: 0;
	width: 100%;
	max-width: 21.25rem;
	padding: 1.5rem;
	padding-top: 1.2rem;
	margin-left: 0.7rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const PanelTop = styled.div``;

const PanelTitle = styled(Text)`
	display: flex;
	align-items: center;
`;

const PanelBottom = styled.div`
	margin-top: 0.55rem;
`;

const StatList = styled.ul`
	margin: 0;
	padding: 0;
	list-style: none;
`;

const StatItem = styled.li`
	position: relative;
	display: flex;
	justify-content: space-between;
	margin: 0;
	padding: 0.81rem 0;

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

	&:not(:first-child) {
		margin-top: 0.4rem;
	}
`;

const StatName = styled(Text)`
	margin: 0;
	margin-right: 1rem;
	padding: 0;
`;

const StatCount = styled(Text)`
	margin: 0;
	padding: 0;
`;

interface UserGroupsStatsPanelProps {
	usersCount: number;
	groupsCount: number;
}

export const UserGroupsStatsPanel: React.FC<UserGroupsStatsPanelProps> = ({
	usersCount,
	groupsCount,
}) => {
	return (
		<Container>
			<PanelTop>
				<PanelTitle>
					<LocalTranslation tk="users_and_groups.total_stats.title" />
				</PanelTitle>
			</PanelTop>
			<PanelBottom>
				<StatList>
					<StatItem>
						<StatName variant="body_3_primary">
							<LocalTranslation tk="users_and_groups.total_stats.users" />
						</StatName>
						<StatCount variant="body_4_secondary">{usersCount}</StatCount>
					</StatItem>
					<StatItem>
						<StatName variant="body_3_primary">
							<LocalTranslation tk="users_and_groups.total_stats.groups" />
						</StatName>
						<StatCount variant="body_4_secondary">{groupsCount}</StatCount>
					</StatItem>
				</StatList>
			</PanelBottom>
		</Container>
	);
};
