import React, { MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import UserAvatarPlaceholder from 'shared/assets/images/placeholders/user-avatar-placeholder.jpg';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Tooltip } from 'shared/components/tooltip/tooltip';
import { UserAvatar as Avatar } from 'shared/components/user-avatar/user-avatar';

const TooltipRemove = styled(Tooltip)`
	width: max-content;
	z-index: 11;
`;

const IconRemove = styled(Icon)<ThemeProps>`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: ${({ theme }) => theme.colors.white};
	z-index: 1;
	opacity: 0;
	transition: opacity 0.3s ease;
`;

const BtnRemove = styled.button<ThemeProps>`
	position: relative;
	display: flex;
	flex-grow: 0;
	padding: 0;
	border: 0;
	box-sizing: border-box;
	border-radius: 50%;
	overflow: hidden;
	z-index: 1;
	cursor: pointer;

	&::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background-color: ${({ theme }) => theme.colors.primary};
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	&:hover:after {
		opacity: 0.7;
	}

	&:hover ${IconRemove}, &:focus-visible:after,
	&:focus-visible ${IconRemove} {
		opacity: 1;
	}

	&:focus-visible {
		outline: rgb(16, 16, 16) auto 1px;
		outline: -webkit-focus-ring-color auto 1px;
	}
`;

interface UserAvatarProps {
	url: string;
	onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const UserProfileAvatar: React.FC<UserAvatarProps> = ({
	url,
	onRemove,
}) => {
	const managePopperState = useManagePopperState({
		placement: 'right',
	});

	const onMouseEnter = () => managePopperState.toggleMenu(true);
	const onMouseLeave = () => managePopperState.toggleMenu(false);

	return (
		<>
			<BtnRemove
				ref={(ref) => managePopperState.setReferenceElement(ref)}
				type="button"
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				onClick={onRemove}
			>
				<Avatar
					url={url || UserAvatarPlaceholder}
					size="l"
					alt="user-avatar"
					border={false}
				/>
				<IconRemove icon={ICON_COLLECTION.delete} />
			</BtnRemove>

			{managePopperState.isOpen &&
				ReactDOM.createPortal(
					<TooltipRemove
						style={managePopperState.styles.popper}
						{...managePopperState.attributes.popper}
						ref={(ref) => managePopperState.setPopperElement(ref)}
						arrowRef={managePopperState.setArrowElement}
						arrowStyles={managePopperState.styles.arrow}
					>
						Remove Picture
					</TooltipRemove>,
					document.body,
				)}
		</>
	);
};
