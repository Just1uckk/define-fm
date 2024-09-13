import React from 'react';
import clsx from 'clsx';
import { useModalManager } from 'shared/context/modal-manager';
import styled from 'styled-components';

import { USERS_MODAL_NAMES } from 'shared/constants/constans';

import { Text } from 'shared/components/text/text';
import {
	UserAvatar,
	UserAvatarProps,
} from 'shared/components/user-avatar/user-avatar';

const Label = styled(Text)`
	display: flex;
	align-items: center;
`;

const TextWrapper = styled.div`
	margin-left: 0.7rem;
`;

const SelfSpan = styled.div`
	background-color: ${(props) => props.theme.colors.accent};
	border-radius: 8px;
	padding: 0px 4px;
	font-size: 11px;
	margin-right: 5px;
`;

const Wrapper = styled.div<{ size: UserAvatarProps['size'] }>`
	display: flex;
	align-items: center;
	width: 100%;
	padding: 0;
	text-align: left;
	border: none;
	background-color: transparent;

	&.s ${TextWrapper} {
		margin-left: 0.5rem;
	}

	&.l ${TextWrapper} {
		margin-left: 0.75rem;
	}
`;

export interface UserAvatarWithLabelProps extends UserAvatarProps {
	label: React.ReactNode;
	subText?: React.ReactNode;
	self?: boolean;
}

export const UserAvatarWithLabel: React.FC<UserAvatarWithLabelProps> = ({
	self = false,
	className,
	url,
	userId,
	name,
	label,
	subText,
	size = 'm',
	border,
}) => {
	const modalManager = useModalManager();

	const onOpenUserProfile = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		if (userId === undefined) return;

		modalManager.open(USERS_MODAL_NAMES.PROFILE_USER, userId);
	};

	const isSubTextString = subText && typeof subText === 'string';

	return (
		<Wrapper
			as={userId !== undefined ? 'button' : 'div'}
			type={userId !== undefined ? 'button' : undefined}
			className={clsx(className, { [size]: !!size })}
			size={size}
			onClick={userId === undefined ? undefined : onOpenUserProfile}
		>
			<UserAvatar url={url} size={size} name={name} border={border} />
			<TextWrapper className="text-wrapper">
				{typeof label === 'string' ? (
					<Label variant="body_3_primary_bold" className="label">
						{self && <SelfSpan>You</SelfSpan>}
						{label}
					</Label>
				) : (
					label
				)}

				{isSubTextString ? (
					<Label variant="body_4_primary" className="sub-text">
						{subText}
					</Label>
				) : (
					subText
				)}
			</TextWrapper>
		</Wrapper>
	);
};
