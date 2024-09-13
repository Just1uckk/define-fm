import React, { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { useModalManager } from 'shared/context/modal-manager';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { USERS_MODAL_NAMES } from 'shared/constants/constans';

import { Avatar } from 'shared/components/avatar/avatar';

const Wrapper = styled.div<ThemeProps & { border: boolean; disable?: boolean }>`
	display: inline-flex;
	flex-shrink: 0;
	padding: 0;
	border-radius: 50%;
	overflow: hidden;
	user-select: none;
	cursor: ${(props) => (props.disable ? 'not-allowed !important' : 'cursor')};

	${({ border }) =>
		border &&
		css`
			border: 2px solid ${({ theme }) => theme.colors.white};
		`}
`;

const StyledImage = styled(Avatar)`
	object-fit: cover;
`;

const SIZES = {
	s: '2rem',
	m: '2.5rem',
	l: '4rem',
};

export interface UserAvatarProps {
	disable?: boolean;
	className?: string;
	url?: string;
	userId?: number | null;
	name?: string;
	alt?: string;
	border?: boolean;
	size?: 's' | 'm' | 'l';
	onMouseEnter?: InputHTMLAttributes<HTMLElement>['onMouseEnter'];
	onMouseLeave?: InputHTMLAttributes<HTMLElement>['onMouseLeave'];
}

const UserAvatarComponent: React.ForwardRefRenderFunction<
	HTMLDivElement,
	UserAvatarProps
> = (
	{
		url,
		disable,
		userId,
		name,
		className,
		border = true,
		size = 'm',
		onMouseEnter,
		onMouseLeave,
	},
	ref,
) => {
	const modalManager = useModalManager();

	const onClickAvatar = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();
		if (userId === undefined) return;
		if (disable) return;
		modalManager.open(USERS_MODAL_NAMES.PROFILE_USER, userId);
	};

	const isUserId = userId !== undefined && userId !== null;

	return (
		<Wrapper
			disable={disable}
			as={isUserId ? 'button' : 'div'}
			ref={ref}
			className={clsx(className, { [size]: !!size })}
			border={border}
			onClick={isUserId ? onClickAvatar : undefined}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<StyledImage
				src={url}
				name={name}
				size={SIZES[size]}
				round="50%"
				alt={name}
			/>
		</Wrapper>
	);
};

export const UserAvatar = forwardRef(UserAvatarComponent);
