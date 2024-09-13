import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IApprover } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { APPROVER_STATES } from 'shared/constants/constans';

import { UserAvatarList } from 'shared/components/user-avatar-list/user-avatar-list';

import { ApproverAvatar } from '../approver-avatar/approver-avatar';

const Container = styled.div`
	display: flex;
	align-items: center;
	margin-top: 1.5rem;
	margin-left: -0.2rem;
	margin-right: -0.2rem;
`;

const ContainerLeft = styled.div``;
const ContainerMiddle = styled.div`
	flex-grow: 1;
	padding: 0 1.2rem;
`;
const ContainerRight = styled.div``;

const Arrow = styled.div`
	position: relative;
	width: 100%;
`;

const ArrowShaft = styled.div<ThemeProps>`
	height: 1px;
	background-color: ${({ theme }) => theme.colors.secondary};
	width: 100%;

	&::after,
	&::before {
		content: '';
		display: block;
		height: 1px;
		position: absolute;
		top: 0;
		right: 0;
		width: 5px;
		background-color: ${({ theme }) => theme.colors.secondary};
	}

	&::before {
		transform-origin: top right;
		transform: rotate(40deg);
	}
	&::after {
		transform-origin: bottom right;
		transform: rotate(-40deg);
	}
`;

interface UsersSectionProps {
	creatorId: number;
	creatorName: string;
	creatorProfileImage: number;
	approvers: IApprover[];
	currentUser: IUser;
}

export const UsersSection: React.FC<UsersSectionProps> = ({
	creatorId,
	creatorName,
	creatorProfileImage,
	approvers,
	currentUser,
}) => {
	return (
		<Container>
			<ContainerLeft>
				<ApproverAvatar
					isCurrentUser={creatorId === currentUser.id}
					userId={creatorId}
					profileImage={creatorProfileImage}
					userName={creatorName}
				/>
			</ContainerLeft>
			<ContainerMiddle>
				<Arrow>
					<ArrowShaft />
				</Arrow>
			</ContainerMiddle>
			<ContainerRight>
				<UserAvatarList limit={0}>
					{approvers.map((approver) => (
						<ApproverAvatar
							key={approver.approverId}
							userId={approver.userId}
							userName={approver.userDisplayName}
							profileImage={approver.userProfileImage}
							isHidden={approver.state === APPROVER_STATES.COMPLETE}
							isActive={approver.state === APPROVER_STATES.ACTIVE}
							isCurrentUser={approver.userId === currentUser.id}
						/>
					))}
				</UserAvatarList>
			</ContainerRight>
		</Container>
	);
};
