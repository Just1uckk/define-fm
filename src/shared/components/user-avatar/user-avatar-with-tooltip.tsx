import React from 'react';
import ReactDOM from 'react-dom';

import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';

import { Tooltip } from 'shared/components/tooltip/tooltip';
import {
	UserAvatar,
	UserAvatarProps,
} from 'shared/components/user-avatar/user-avatar';

export interface UserAvatarWithTooltipProps extends UserAvatarProps {
	disable?: boolean;
	userName: string;
	isTooltipDisabled?: boolean;
}

const TOOLTIP_OFFSET = [0, 5] as [number, number];

export const UserAvatarWithTooltip: React.FC<UserAvatarWithTooltipProps> = ({
	disable,
	userName,
	isTooltipDisabled,
	...props
}) => {
	const managePopperState = useManagePopperState({
		offset: TOOLTIP_OFFSET,
	});

	const onMouseEnter = () => managePopperState.toggleMenu(true);
	const onMouseLeave = () => managePopperState.toggleMenu(false);

	return (
		<>
			<UserAvatar
				disable={disable}
				ref={(ref) => managePopperState.setReferenceElement(ref)}
				onMouseEnter={!isTooltipDisabled ? onMouseEnter : undefined}
				onMouseLeave={!isTooltipDisabled ? onMouseLeave : undefined}
				name={userName}
				{...props}
			/>
			{managePopperState.isOpen &&
				ReactDOM.createPortal(
					<Tooltip
						ref={(ref) => managePopperState.setPopperElement(ref)}
						style={managePopperState.styles.popper}
						{...managePopperState.attributes.popper}
						arrowRef={managePopperState.setArrowElement}
						arrowStyles={managePopperState.styles.arrow}
					>
						{userName}
					</Tooltip>,
					document.body,
				)}
		</>
	);
};
