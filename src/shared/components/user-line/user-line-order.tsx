import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import clsx from 'clsx';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IUser } from 'shared/types/users';

import { APPROVER_STATES } from 'shared/constants/constans';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { Text } from 'shared/components/text/text';
import { UserAvatarWithLabel } from 'shared/components/user-avatar/user-avatar-with-label';

const DragIcon = styled(Icon)`
	width: 1rem;
`;

const Order = styled(Text)`
	margin-left: 1rem;
`;

const Container = styled.div<ThemeProps>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.25rem 1rem;
	border: ${({ theme }) => theme.border.base};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	background-color: ${({ theme }) => theme.colors.background.secondary};
	transition: box-shadow 0.3s ease;

	& + & {
		margin-top: 0.75rem;
	}

	&.is-completed {
		background: #f8fafd;
	}

	&.is-completed,
	&.is-active {
		${DragIcon} {
			opacity: 0.3;
		}
	}

	&.is-dragging {
		box-shadow: 0 12px 32px rgba(0, 0, 0, var(--box-shadow-opacity, 0.15));
	}
`;

const ContainerLeft = styled.div`
	display: flex;
	align-items: center;
	flex-shrink: 0;
	margin-right: 1rem;
`;

const ContainerCenter = styled.div`
	flex-grow: 1;
`;

const ContainerRight = styled.div`
	margin-left: 1rem;
`;

interface UserLineOrderProps {
	dragDisabled?: boolean;
	index: number;
	userId: number;
	order: number;
	username: string;
	userImage: IUser['profileImage'];
	state: APPROVER_STATES;
	onClose?: () => void;
}

export const UserLineOrder: React.FC<UserLineOrderProps> = ({
	index,
	dragDisabled = false,
	userId,
	username,
	userImage,
	order,
	state,
	onClose,
}) => {
	const isCompletedState = state === APPROVER_STATES.COMPLETE;
	const isActiveState = state === APPROVER_STATES.ACTIVE;
	const isWaitingState = state === APPROVER_STATES.WAITING;

	return (
		<Draggable
			key={userId}
			index={index}
			draggableId={String(userId)}
			isDragDisabled={dragDisabled ? dragDisabled : !isWaitingState}
			shouldRespectForcePress
		>
			{(provided, snapshot) => {
				if (snapshot.isDragging && provided.draggableProps.style) {
					//This is a hack to prevent offsetting the element when element is dragging
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					provided.draggableProps.style.left = undefined;
				}

				return (
					<Container
						ref={provided.innerRef}
						className={clsx('approver-item', {
							'is-dragging': snapshot.isDragging,
							'is-active': isActiveState,
							'is-completed': isCompletedState,
						})}
						{...provided.dragHandleProps}
						{...provided.draggableProps}
					>
						{order && (
							<ContainerLeft>
								<DragIcon icon={ICON_COLLECTION.order_dots_vertical} />
								<Order variant="body_3_primary_bold">{order}</Order>
							</ContainerLeft>
						)}
						<ContainerCenter>
							<UserAvatarWithLabel
								url={getUserAvatarUrl(userId, userImage)}
								name={username}
								label={username}
							/>
						</ContainerCenter>
						{isWaitingState && (
							<ContainerRight>
								<IconButton icon={ICON_COLLECTION.cross} onPress={onClose} />
							</ContainerRight>
						)}
					</Container>
				);
			}}
		</Draggable>
	);
};
