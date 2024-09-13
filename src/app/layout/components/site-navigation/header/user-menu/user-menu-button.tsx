import React, { forwardRef, PropsWithRef, useRef } from 'react';
import { AriaButtonProps, useButton } from 'react-aria';
import mergeRefs from 'shared/utils/merge-refs';
import styled, { css } from 'styled-components';

import { IUser } from 'shared/types/users';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Text } from 'shared/components/text/text';
import { UserAvatar } from 'shared/components/user-avatar/user-avatar';

const Wrapper = styled.button`
	position: relative;
	display: flex;
	align-items: center;
	max-width: 16.25rem;
	cursor: pointer;
	user-select: none;
	border: none;
	border-radius: ${({ theme }) => theme.borderRadius.base};
	background-color: transparent;
	overflow: hidden;
`;

const UserMenuLeft = styled.div`
	margin-right: 0.75rem;
`;

const UserMenuRight = styled.div`
	position: relative;
	padding-right: 1.75rem;
`;

const UserInfo = styled.div`
	display: flex;
	flex-direction: column;
`;
const UserName = styled.div``;

const ToggleMenu = styled.div`
	position: absolute;
	top: 50%;
	right: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1rem;
	height: 1rem;
	margin: 0;
	padding: 0;
	background: transparent;
	border: none;
	color: ${({ theme }) => theme.colors.accent};
	transform: translateY(-50%);
`;

const ToggleMenuIcon = styled(Icon)<{ isActive: boolean }>`
	${({ isActive }) =>
		isActive &&
		css`
			transform: rotate(180deg);
			color: ${({ theme }) => theme.colors.accent};
		`}
`;

export interface MenuButtonHandlerProps
	extends AriaButtonProps,
		PropsWithRef<any> {
	className?: string;
	username?: IUser['username'];
	userAvatar?: string;
	isOpen: boolean;
}

const _UserMenuButton: React.ForwardRefRenderFunction<
	HTMLElement,
	React.PropsWithChildren<MenuButtonHandlerProps>
> = ({ className, userAvatar, username, isOpen, ...props }, ref) => {
	const localRef = useRef<HTMLButtonElement>(null);
	const { buttonProps } = useButton(props, localRef);
	return (
		<Wrapper
			ref={mergeRefs(ref, localRef)}
			className={className}
			{...buttonProps}
		>
			<UserMenuLeft>
				<UserAvatar url={userAvatar} name={username} />
			</UserMenuLeft>
			<UserMenuRight>
				<UserInfo>
					<UserName>
						<Text tag="span" variant="body_3_primary_semibold">
							{username}
						</Text>
					</UserName>
				</UserInfo>
				<ToggleMenu>
					<ToggleMenuIcon
						icon={ICON_COLLECTION.chevron_down}
						isActive={isOpen}
					/>
				</ToggleMenu>
			</UserMenuRight>
		</Wrapper>
	);
};

export const UserMenuButton = forwardRef(_UserMenuButton);
