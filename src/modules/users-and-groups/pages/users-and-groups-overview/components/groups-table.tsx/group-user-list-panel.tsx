import React from 'react';
import styled from 'styled-components';

import { IUser } from 'shared/types/users';

import { CloseButton } from 'shared/components/button/close-button';
import { CountBadge } from 'shared/components/count-badge/count-badge';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';
import { UserAvatarWithLabel } from 'shared/components/user-avatar/user-avatar-with-label';

const Container = styled.div`
	flex-shrink: 0;
	width: 100%;
	max-width: 21.25rem;
	padding: 1.5rem;
	padding-left: 1rem;
	padding-right: 1rem;
	margin-bottom: 1.5rem;
	margin-left: 0.7rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const PanelTop = styled.div`
	display: flex;
	justify-content: space-between;
	padding-left: 0.55rem;
	padding-right: 0.4rem;
	margin-bottom: 1.4rem;
`;

const PanelTitle = styled(Text)`
	display: flex;
	align-items: center;
`;

const PanelBottom = styled.div`
	padding-left: 0.55rem;
	padding-right: 0.55rem;
	margin-left: -0.55rem;
	margin-right: -0.55rem;
	min-height: 50px;
	max-height: 468px;
	overflow-y: auto;
`;

const UserList = styled.ul`
	margin: 0;
	padding: 0;
	list-style: none;
`;

const UserItem = styled.li`
	padding: 0.2rem 0.7rem;

	&:not(:first-child) {
		margin-top: 0.72rem;
	}
`;

const StyledCountBadge = styled(CountBadge)`
	margin-left: 0.3rem;
	color: ${({ theme }) => theme.tabs.tabCounterActive.color};
	background-color: ${({ theme }) =>
		theme.tabs.tabCounterActive.backgroundColor};
`;

interface GroupUserListPanelProps {
	isLoadingData?: boolean;
	groupName: string;
	users: IUser[];
	onClosePanel: () => void;
}

export const GroupUserListPanel: React.FC<GroupUserListPanelProps> = ({
	isLoadingData,
	groupName,
	users,
	onClosePanel,
}) => {
	return (
		<Container>
			<PanelTop>
				<PanelTitle variant="body_1_primary_bold">
					{groupName} <StyledCountBadge>{users.length}</StyledCountBadge>
				</PanelTitle>
				<CloseButton onClick={onClosePanel} />
			</PanelTop>
			<PanelBottom>
				{isLoadingData && <Spinner mt="1rem" />}
				{!isLoadingData && (
					<UserList>
						{users.map((user) => (
							<UserItem key={user.id}>
								<UserAvatarWithLabel
									name={user.display}
									label={user.display}
									userId={user.id}
								/>
							</UserItem>
						))}
					</UserList>
				)}
			</PanelBottom>
		</Container>
	);
};
