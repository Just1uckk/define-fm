import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	UserAvatarWithLabel,
	UserAvatarWithLabelProps,
} from 'shared/components/user-avatar/user-avatar-with-label';

const Wrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const StyledUserAvatarWithLabel = styled(UserAvatarWithLabel)<ThemeProps>`
	.sub-text {
		margin-top: 0.4rem;
		color: ${({ theme }) => theme.colors.secondary};
	}
`;

const StyledIcon = styled(Icon)`
	svg {
		width: 0.75rem;
		height: 0.75rem;
	}
`;

type UserOptionProps = UserAvatarWithLabelProps;

export const UserOption: React.FC<UserOptionProps> = ({
	url,
	label,
	name,
	subText,
}) => {
	return (
		<Wrapper>
			<StyledUserAvatarWithLabel
				url={url}
				name={name}
				label={label}
				subText={subText}
			/>
			<StyledIcon icon={ICON_COLLECTION.add} />
		</Wrapper>
	);
};
