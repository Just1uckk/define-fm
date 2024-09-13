import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION, IconProps } from 'shared/components/icon/icon';
import {
	IconButton,
	IconButtonProps,
} from 'shared/components/icon-button/icon-button';
import { Text } from 'shared/components/text/text';

const Badge = styled.div<ThemeProps>`
	position: relative;
	background-color: ${({ theme }) => theme.badgeGroup.bg};
	padding: 0.5rem 0.75rem;
	display: inline-flex;
	align-items: center;
	margin-top: 0.375rem;
	margin-right: 0.375rem;
`;

const BadgeText = styled(Text)<ThemeProps>`
	color: ${({ theme }) => theme.badgeGroup.color};
`;

const BadgeIcon = styled(Icon)<ThemeProps>`
	margin-right: 0.75rem;
	color: ${({ theme }) => theme.badgeGroup.color};

	svg {
		width: 0.9375rem;
	}
`;

const BadgeClose = styled(IconButton)`
	margin-left: 0.625rem;
	width: 1.25rem;
	height: 1.25rem;
`;

interface GroupBadgeProps {
	icon?: IconProps['icon'];
	label?: string;
	onClose?: IconButtonProps['onPress'];
}

export const GroupBadge: React.FC<GroupBadgeProps> = ({
	icon,
	label,
	onClose,
}) => {
	return (
		<Badge>
			{icon && <BadgeIcon icon={icon} />}
			<BadgeText variant="body_2_primary">{label}</BadgeText>
			{onClose && <BadgeClose icon={ICON_COLLECTION.cross} onPress={onClose} />}
		</Badge>
	);
};
