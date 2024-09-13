import React from 'react';
import { getDaysInMonth } from 'date-fns';
import styled from 'styled-components';

import { UserParamsInterface } from 'shared/types/dashboard';

import { Text } from 'shared/components/text/text';
import { UserAvatarWithLabel } from 'shared/components/user-avatar/user-avatar-with-label';

const Item = styled.li`
	display: flex;
	align-items: flex-start;
	gap: 20px;
`;

const ItemLeft = styled.div`
	display: flex;
`;

const ItemRight = styled.div`
	display: flex;
	margin-top: -2px;
`;

const Count = styled(Text)<any>`
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 24px;
	height: 24px;
	margin-top: 0.55rem;
	background-color: ${(props) =>
		props.self
			? props.theme.colors.accent
			: props.theme.colors.background.primary};
	border-radius: 50%;
`;

interface UserItemInterface {
	userInfo: UserParamsInterface;
	count: number;
	self?: boolean;
	avgTime?: boolean;
}

export const UserItem: React.FC<UserItemInterface> = ({
	userInfo,
	count,
	self = false,
	avgTime = false,
}) => {
	const calculateAvg = (count: number) => {
		return (getDaysInMonth(new Date()) / count).toFixed(1);
	};
	return (
		<Item>
			<ItemLeft>
				<Count self={self} variant="body_3_primary_semibold">
					{count + 1}
				</Count>
			</ItemLeft>
			<ItemRight>
				<UserAvatarWithLabel
					self={self}
					name={userInfo.display}
					label={userInfo.display}
					subText={
						avgTime
							? `${calculateAvg(userInfo.count)} days avg`
							: `${userInfo.count} files processed`
					}
				/>
			</ItemRight>
		</Item>
	);
};
