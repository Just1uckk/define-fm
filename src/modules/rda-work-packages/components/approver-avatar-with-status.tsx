import React from 'react';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IApprover } from 'shared/types/dispositions';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
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

const Status = styled.div`
	position: absolute;
	bottom: -7px;
	right: -7px;
	display: flex;
	flex-direction: column;
	align-items: center;
	transform: translateX(-50%) translateY(-50%);
	user-select: none;
`;

interface ApproverAvatarProps extends UserAvatarWithTooltipProps {
	userId: number;
	profileImage: IApprover['userProfileImage'];
}

export const ApproverAvatarWithStatus: React.FC<ApproverAvatarProps> = ({
	className,
	userId,
	userName,
	profileImage,
}) => {
	const statusIconName = ICON_COLLECTION.approver_declined;

	return (
		<Wrapper className={className}>
			<StyledUserAvatarWithTooltip
				userId={userId}
				userName={userName}
				url={getUserAvatarUrl(userId, profileImage)}
			/>

			<Status>{statusIconName && <Icon icon={statusIconName} />}</Status>
		</Wrapper>
	);
};
