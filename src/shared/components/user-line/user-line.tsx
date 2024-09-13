import React from 'react';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IUser } from 'shared/types/users';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { UserAvatarWithLabel } from 'shared/components/user-avatar/user-avatar-with-label';

const Container = styled.div<ThemeProps>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.25rem 1rem;
	border: ${({ theme }) => theme.border.base};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	transition: box-shadow 0.3s ease;

	& + & {
		margin-top: 0.75rem;
	}

	&.is-dragging {
		box-shadow: 0 12px 32px rgba(0, 0, 0, var(--box-shadow-opacity, 0.15));
	}
`;

const ContainerCenter = styled.div`
	flex-grow: 1;
`;

const ContainerRight = styled.div`
	margin-left: 1rem;
`;

interface UserLineProps {
	hideClose?: boolean;
	userId: IUser['id'];
	profileImage: IUser['profileImage'];
	username: IUser['username'];
	onClose?: () => void;
}

export const UserLine: React.FC<UserLineProps> = ({
	hideClose,
	userId,
	username,
	profileImage,
	onClose,
}) => {
	return (
		<Container>
			<ContainerCenter>
				<UserAvatarWithLabel
					userId={userId}
					name={username}
					url={getUserAvatarUrl(userId, profileImage)}
					label={username}
				/>
			</ContainerCenter>
			<ContainerRight>
				{!hideClose && (
					<IconButton icon={ICON_COLLECTION.cross} onPress={onClose} />
				)}
			</ContainerRight>
		</Container>
	);
};
