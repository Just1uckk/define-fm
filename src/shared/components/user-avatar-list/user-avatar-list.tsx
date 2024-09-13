import React, { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { UserAvatarMore } from 'shared/components/user-avatar/user-avatar-more';

const StyledIcon = styled(Icon)`
	color: currentColor;
	transition: transform 0.2s ease;
`;

const List = styled.div`
	display: flex;
	& > * {
		&:not(:first-child) {
			margin-left: -0.5rem;
		}
	}
`;

const DashSvg = styled.svg`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	transform: rotate(8deg);

	circle {
		stroke: ${({ theme }) => theme.colors.primary};
		transition: stroke 0.3s ease;
	}
`;

const AddButton = styled.button<ThemeProps>`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	padding: 0;
	color: ${({ theme }) => theme.colors.primary};
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: none;
	border-radius: 50%;
	outline-offset: 0.15rem;
	transition: color 0.3s ease;

	&:hover {
		color: ${({ theme }) => theme.colors.accent};

		& ${DashSvg} circle {
			stroke: ${({ theme }) => theme.colors.accent};
		}

		& ${StyledIcon} {
			transform: scale(0.92);
		}
	}
`;

interface UserAvatarListProps {
	className?: string;
	hasAdd?: boolean;
	limit?: number;
	onAdd?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
}

export const UserAvatarList: React.FC<
	React.PropsWithChildren<UserAvatarListProps>
> = ({ className, hasAdd, limit = 3, onAdd, children }) => {
	const hasExtraChildren =
		Array.isArray(children) && limit > 0 && children.length > limit;

	const list = hasExtraChildren ? children.slice(0, limit) : children;
	const countMoreUsers = hasExtraChildren ? children.length - limit : 0;

	return (
		<List className={className}>
			{list}
			{hasExtraChildren && <UserAvatarMore count={countMoreUsers} />}
			{hasAdd && (
				<AddButton onClick={onAdd}>
					<DashSvg viewBox="0 0 100 100">
						<circle
							cx="50"
							cy="50"
							r="48"
							strokeDasharray="14, 16"
							fill="transparent"
							strokeWidth="5"
						/>
					</DashSvg>
					<StyledIcon icon={ICON_COLLECTION.add} />
				</AddButton>
			)}
		</List>
	);
};
