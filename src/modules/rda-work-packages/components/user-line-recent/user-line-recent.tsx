import React from 'react';
import styled from 'styled-components';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	IconButton,
	IconButtonProps,
} from 'shared/components/icon-button/icon-button';
import {
	UserAvatarWithLabel,
	UserAvatarWithLabelProps,
} from 'shared/components/user-avatar/user-avatar-with-label';

const Container = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	max-width: 13.75rem;
	padding: 0.5rem 1rem;
	margin-top: 1rem;
	border: ${({ theme }) => theme.border.base};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};

	& + & {
		margin-left: 0.75rem;
	}
`;

const ContainerLeft = styled.div``;

const ContainerRight = styled.div``;

const AddButton = styled(IconButton)`
	width: 0.75rem;
	height: 0.75rem;
	margin-left: 1.5rem;
`;

interface UserLineRecentProps extends UserAvatarWithLabelProps {
	onAdd: IconButtonProps['onPress'];
}

export const UserLineRecent: React.FC<UserLineRecentProps> = ({
	url,
	label,
	onAdd,
}) => {
	return (
		<Container>
			<ContainerLeft>
				<UserAvatarWithLabel size="s" url={url} label={label} />
			</ContainerLeft>
			<ContainerRight>
				<AddButton icon={ICON_COLLECTION.add} onPress={onAdd} />
			</ContainerRight>
		</Container>
	);
};
