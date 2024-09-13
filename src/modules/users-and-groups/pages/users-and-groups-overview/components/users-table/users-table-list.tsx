import React, { memo } from 'react';
import { Can } from 'casl';
import { RouteGuardActions, RouteGuardEntities } from 'casl/ability';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import {
	MoreButton,
	MoreButtonProps,
} from 'shared/components/button/more-button';
import { TableCol } from 'shared/components/table-elements/table-col';
import { TableEntity } from 'shared/components/table-elements/table-entity';
import { Text } from 'shared/components/text/text';
import { UserAvatarWithLabel } from 'shared/components/user-avatar/user-avatar-with-label';

const Row = styled(TableEntity)<ThemeProps>`
	padding: 0.75rem 0.75rem;
	cursor: pointer;
`;

const UserAvatar = styled(UserAvatarWithLabel)`
	.text-wrapper {
		margin-top: 0.3rem;
		margin-left: 1.2rem;
	}

	.sub-text {
		line-height: 1.5625rem;
	}
`;

const TableColProvider = styled(TableCol)`
	max-width: 9.375rem;
`;

const StyledMoreButton = styled(MoreButton)`
	margin-left: 1.25rem;
`;

interface UsersTableListProps {
	users?: IUser[];
	isRowSelected: (userId: IUser['id']) => boolean;
	isRowHighlighted: (userId: IUser['id']) => boolean;
	isEnabledMultipleSelect: boolean;
	getNameAuthProvider: (user: IUser) => React.ReactNode;
	getUserActions: (user: IUser) => MoreButtonProps['options'];
	onClickRow: (user: IUser) => void;
	onSelectRow: (user: IUser, e?: React.ChangeEvent<HTMLInputElement>) => void;
}

const UsersTableListComponent: React.FC<UsersTableListProps> = ({
	users,
	isEnabledMultipleSelect,
	isRowSelected,
	isRowHighlighted,
	getNameAuthProvider,
	getUserActions,
	onClickRow,
	onSelectRow,
}) => {
	const { t } = useTranslation();

	return (
		<>
			{users?.map((user) => {
				return (
					<Row
						key={user.id}
						isSelected={isRowSelected(user.id)}
						isHighlighted={isRowHighlighted(user.id)}
						isSelectable={isEnabledMultipleSelect}
						hasCheckbox
						onClick={() => onClickRow(user)}
						onSelect={(e) => onSelectRow(user, e)}
					>
						<TableCol>
							<UserAvatar
								url={getUserAvatarUrl(user.id, user.profileImage)}
								name={user.display}
								label={user.display}
								subText={user.email}
							/>
						</TableCol>
						<TableColProvider>
							<Text variant="body_4_secondary" mb="0.2rem">
								{t('users.table.columns.auth_provider')}
							</Text>
							<Text variant="body_4_primary">
								{/*<ExternalTranslation*/}
								{/*	translations={*/}
								{/*		authProviders[user.providerId]?.multilingual*/}
								{/*	}*/}
								{/*	field="name"*/}
								{/*	fallbackValue={authProviders[user.providerId]?.name ?? ''}*/}
								{/*/>*/}
								{getNameAuthProvider(user)}
							</Text>
						</TableColProvider>
						<Can I={RouteGuardActions.manage} a={RouteGuardEntities.User}>
							<TableCol>
								<StyledMoreButton options={getUserActions(user)} />
							</TableCol>
						</Can>
					</Row>
				);
			})}
		</>
	);
};

UsersTableListComponent.displayName = 'UsersTableList';

export const UsersTableList = memo(UsersTableListComponent);
