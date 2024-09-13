import React from 'react';
import clsx from 'clsx';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IApprover } from 'shared/types/dispositions';

import { APPROVAL_STATES } from 'shared/constants/constans';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Text } from 'shared/components/text/text';
import {
	UserAvatarWithTooltip,
	UserAvatarWithTooltipProps,
} from 'shared/components/user-avatar/user-avatar-with-tooltip';

const Wrapper = styled.div`
	position: relative;
	display: inline-block;
`;

const StyledUserAvatarWithTooltip = styled(UserAvatarWithTooltip)<ThemeProps>`
	position: relative;

	&.is-active {
		border-color: ${({ theme }) => theme.colors.accent};
	}
	&.is-hidden {
		opacity: 0.3;
	}

	&::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7));
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	${({ userId }) =>
		userId &&
		css`
			&:hover {
				&.is-hidden {
					opacity: 1;
				}

				&::after {
					opacity: 1;
				}
			}
		`}
`;

const CurrentUserIndicator = styled.div`
	position: absolute;
	top: 100%;
	left: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	transform: translateX(-50%) translateY(10px);
	user-select: none;
`;

const ApprovalStatus = styled(Icon)`
	position: absolute;
	bottom: 0;
	right: 0;
`;

const APPROVER_ICON_STATE = {
	[APPROVAL_STATES.APPROVED]: ICON_COLLECTION.approver_approved,
	[APPROVAL_STATES.REJECTED]: ICON_COLLECTION.approver_declined,
};

interface ApproverAvatarProps extends UserAvatarWithTooltipProps {
	disable?: boolean;
	userId?: number | null;
	profileImage?: IApprover['userProfileImage'];
	isCurrentUser?: boolean;
	isActive?: boolean;
	isHidden?: boolean;
	approvalState?: APPROVAL_STATES;
}

export const ApproverAvatar: React.FC<ApproverAvatarProps> = ({
	disable,
	userId,
	userName,
	profileImage,
	isActive,
	isCurrentUser,
	isHidden,
	approvalState,
}) => {
	return (
		<Wrapper>
			<StyledUserAvatarWithTooltip
				disable={disable}
				className={clsx({ 'is-active': isActive, 'is-hidden': isHidden })}
				userId={isCurrentUser ? undefined : userId}
				userName={userName}
				url={
					userId && profileImage
						? getUserAvatarUrl(userId, profileImage)
						: undefined
				}
				isTooltipDisabled={isCurrentUser}
			/>

			{isCurrentUser && (
				<CurrentUserIndicator>
					<Icon icon={ICON_COLLECTION.triangle_top} />
					<Text variant="body_4_primary" mt="0.4rem">
						You
					</Text>
				</CurrentUserIndicator>
			)}
			{approvalState && (
				<ApprovalStatus icon={APPROVER_ICON_STATE[approvalState]} />
			)}
		</Wrapper>
	);
};
