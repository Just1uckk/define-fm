import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

import { UserParamsInterface } from 'shared/types/dashboard';
import { IUser } from 'shared/types/users';

import { UserItem } from './user-item';

const List = styled.ul`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin: 0;
	padding: 0;
`;

const DotsContainer = styled.div`
	display: flex;
	justify-content: center;
`;

const Dot = styled.div`
	height: 4px;
	width: 4px;
	border-radius: 2px;
	background-color: ${(props) => props.theme.colors.primary};
	margin-right: 2px;
`;

interface UserListInterface {
	userList?: UserParamsInterface[];
	currentUser?: IUser;
	avgTime?: boolean;
}

export const UserList: React.FC<UserListInterface> = ({
	userList,
	currentUser,
	avgTime,
}) => {
	const [selfIndex, setSelfIndex] = useState(0);
	const filteredUserList: UserParamsInterface[] = useMemo(() => {
		if (currentUser && userList) {
			const selfIndex = userList.findIndex(
				(element) => element.id === currentUser.id,
			);
			if (selfIndex !== -1 && selfIndex > 5) {
				const arrayWithSelfUser = userList.filter((id, idx) => idx < 5);
				arrayWithSelfUser.push(userList[selfIndex]);
				setSelfIndex(selfIndex);
				return arrayWithSelfUser;
			}
			return userList.filter((id, idx) => idx < 5);
		}
		return userList || [];
	}, [userList, currentUser]);

	return (
		<List>
			{userList &&
				!currentUser &&
				userList.map((element, index) => (
					<UserItem
						avgTime={avgTime}
						key={element.id}
						userInfo={element}
						count={index}
					/>
				))}

			{filteredUserList.length < 6 &&
				currentUser &&
				filteredUserList.map((element, index) => {
					if (currentUser && currentUser.id === element.id) {
						return (
							<UserItem
								avgTime={avgTime}
								key={element.id}
								userInfo={element}
								count={index}
								self
							/>
						);
					}
					return (
						<UserItem
							avgTime={avgTime}
							key={element.id}
							userInfo={element}
							count={index}
						/>
					);
				})}

			{filteredUserList.length === 6 &&
				currentUser &&
				filteredUserList.map((element, index) => {
					if (currentUser && currentUser.id === element.id) {
						return (
							<>
								<DotsContainer>
									<Dot />
									<Dot />
									<Dot />
								</DotsContainer>
								<UserItem
									avgTime={avgTime}
									key={element.id}
									userInfo={element}
									count={selfIndex}
									self
								/>
							</>
						);
					}
					return (
						<UserItem
							avgTime={avgTime}
							key={element.id}
							userInfo={element}
							count={index}
						/>
					);
				})}
		</List>
	);
};
